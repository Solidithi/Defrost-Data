import { ethers } from "ethers";
import { prismaClient, logger, ethersProvider } from "../../singletons";
import { selectedChain } from "../../config";
import { normalizeAddress } from "../../utils";
import axios, { AxiosError } from "axios";

export async function snapshotPlatformMetrics(): Promise<void> {
	try {
		const blockNumber = await ethersProvider.getBlockNumber();
		const block = await ethersProvider.getBlock(blockNumber);
		const timestamp = block.timestamp;

		const totalProjects = await prismaClient.project.count();
		logger.debug("Total Projects: ", totalProjects);

		const totalLaunchpools = await prismaClient.launchpool.count();
		logger.debug("Total Launchpools: ", totalLaunchpools);

		const totalUniqueUsers = await prismaClient.user.count();
		logger.debug("Total Unique Users: ", totalUniqueUsers);

		// Aggregate total amount of tokens distributed launchpools
		const resultTokensDistributed = await prismaClient.$queryRaw`
			SELECT (
				(SELECT tokens_distributed 
				FROM platform_metrics_snapshots 
				ORDER BY timestamp DESC 
				LIMIT 1) 
				+ COALESCE((
					SELECT SUM(project_token_amount / POW(10, project_token_decimals))
					FROM launchpool_project_token_claim
					WHERE timestamp > (SELECT MAX(timestamp) FROM platform_metrics_snapshots)
				), 0)
			) AS tokens_distributed;
		`;

		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const totalActiveUsers = await prismaClient.user.count({
			where: {
				last_active: {
					gte: sevenDaysAgo,
				},
			},
		});
		console.log("Total Active Users (7 days): ", totalActiveUsers);

		const pools = await prismaClient.launchpool.findMany({
			select: {
				total_staked: true,
				v_asset_address: true,
			},
		});

		const poolUSDAmounts = [];
		for (const pool of pools) {
			logger.info(
				`Processing pool with asset address ${pool.v_asset_address}`
			);
			const totalStaked = pool.total_staked;
			const { decimals, id } = selectedChain.tokens.find(
				(token) =>
					normalizeAddress(token.address) ===
					normalizeAddress(pool.v_asset_address)
			);

			if (!decimals) {
				throw new Error(
					`Decimals not found for token address: ${pool.v_asset_address}`
				);
			}

			// Convert totalStaked to a valid BigInt
			const totalStakedBigInt = BigInt(Number(totalStaked)); // Convert scientific notation to integer string
			const offchainAmount = ethers.formatUnits(
				totalStakedBigInt,
				decimals
			);

			try {
				const url = `https://api.coingecko.com/api/v3/coins/${id}`;
				const options = {
					method: "GET",
					headers: {
						accept: "application/json",
						"x-cg-demo-api-key": process.env.API_KEY,
					},
					timeout: 5000,
				};

				const response = await axios.get(url, options);
				const data = response.data;
				const priceInUSD = data.market_data.current_price.usd;

				logger.info(`Price for ${id} in USD: ${priceInUSD}`);
				await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for 0.5 second
				poolUSDAmounts.push(priceInUSD * parseFloat(offchainAmount));
			} catch (error) {
				logger.error(`Error fetching price for ${id}: ${error}`);
				if (error instanceof AxiosError && error.response.status) {
					switch (error.response.status) {
						case 400:
							throw new Error(`Bad request for coin: ${id}`);
						case 404:
							throw new Error(`Coin not found: ${id}`);
						case 429:
							logger.warn(
								`Provider rate limit exceeded for coin: ${id}. Retrying after delay...`
							);
							await new Promise((resolve) =>
								setTimeout(resolve, 1000)
							); // Retry after 1 second
							break;
						default:
							logger.error(
								`Axios error: ${error.message} - ${error.response?.status} - ${error.response?.data}`
							);
					}
				}
			}
		}

		logger.debug(
			"Total Staked Amount Off Chain in Pools: ",
			poolUSDAmounts
		);
		const totalStakedAmount: number = poolUSDAmounts.reduce(
			(acc, amount) => acc + amount,
			0
		);
		logger.debug(
			"Total Staked Amount Off Chain in Pools: ",
			totalStakedAmount
		);

		const totalStakedTx = await prismaClient.launchpool_stake.count();
		logger.debug("Total Staked Tx: ", totalStakedTx);

		const totalUnstakedTx = await prismaClient.launchpool_unstake.count();
		logger.debug("Total Unstaked Tx: ", totalUnstakedTx);

		const totalTx = totalStakedTx + totalUnstakedTx;
		logger.debug("Total Tx: ", totalTx);

		//Insert data into PlatformMetricsSnapshots table
		const insertData = await prismaClient.platform_metrics_snapshots.create(
			{
				data: {
					id: `${timestamp}`,
					timestamp: new Date(timestamp * 1000),
					count_active_users: totalActiveUsers,
					count_unique_users: totalUniqueUsers,
					count_launchpools: totalLaunchpools,
					count_projects: totalProjects,
					count_transactions: totalTx,
					total_value_locked: totalStakedAmount,
					tokens_distributed:
						resultTokensDistributed[0]?.tokens_distributed || 0,
				},
			}
		);
		logger.info(
			`Successfully inserted platform metrics snapshot with ID: ${insertData.id}`
		);
	} catch (error) {
		logger.error(`Error snapshoting platform metrics: ${error}`);
		return;
	}
}
