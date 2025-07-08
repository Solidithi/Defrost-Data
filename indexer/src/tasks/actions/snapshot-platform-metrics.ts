import { ethers } from "ethers";
import { prismaClient, logger, ethersProvider } from "../../singletons";
import { selectedChain } from "../../config";
import { normalizeAddress } from "../../utils";
import axios from "axios";

export async function snapshotPlatformMetrics(): Promise<void> {
	// Fetch, process, calculate needed data
	try {
		const blockNumber = await ethersProvider.getBlockNumber();
		const block = await ethersProvider.getBlock(blockNumber);
		const timestamp = block.timestamp;

		const totalProjects = await prismaClient.project.count();
		console.log("Total Projects: ", totalProjects);

		const totalLaunchpools = await prismaClient.launchpool.count();
		console.log("Total Launchpools: ", totalLaunchpools);

		const totalUniqueUsers = await prismaClient.user.count();
		console.log("Total Unique Users: ", totalUniqueUsers);

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
		try {
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
					logger.error(
						`Decimals not found for token address: ${pool.v_asset_address}`
					);
					continue;
				}

				try {
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
						await new Promise((resolve) =>
							setTimeout(resolve, 500)
						); // Delay for 0.5 second
						poolUSDAmounts.push(
							priceInUSD * parseFloat(offchainAmount)
						);

						// const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`;
						// 	const response = await axios.get(url, { timeout: 5000 });
						// 	const data = response.data;
						// 	logger.info(
						// 		`Price for ${id} in USD: ${data[id].usd}`
						// 	);
						// 	await new Promise(resolve => setTimeout(resolve, 5000)); // Delay for 1 second
						// 	poolUSDAmounts.push(data[id].usd * parseFloat(offchainAmount));
						// 	logger.info("Passed")
						// 	logger.info(
						// 		data[id].usd * parseFloat(offchainAmount),
						// 		`Total Staked Amount in USD ${id}: `
						// 	)
					} catch (error) {
						logger.error(
							`Error fetching price for ${id}: ${error}`
						);
					}
				} catch (error) {
					console.error(
						`Error converting totalStaked for pool ${pool.v_asset_address}: ${error}`
					);
				}
			}
		} catch (error) {
			logger.error(`Error fetching pools: ${error}`);
		}

		console.log("Total Staked Amount Off Chain in Pools: ", poolUSDAmounts);
		const totalStakedAmount: number = poolUSDAmounts.reduce(
			(acc, amount) => acc + amount,
			0
		);
		console.log(
			"Total Staked Amount Off Chain in Pools: ",
			totalStakedAmount
		);

		const totalStakedTx = await prismaClient.launchpool_stake.count();
		console.log("Total Staked Tx: ", totalStakedTx);

		const totalUnstakedTx = await prismaClient.launchpool_unstake.count();
		console.log("Total Unstaked Tx: ", totalUnstakedTx);

		const totalTx = totalStakedTx + totalUnstakedTx;
		console.log("Total Tx: ", totalTx);

		//Insert data into PlatformMetricsSnapshots table
		const insertData = await prismaClient.platform_metrics_snapshots.create(
			{
				data: {
					timestamp: new Date(timestamp * 1000),
					count_active_users: totalActiveUsers,
					count_unique_users: totalUniqueUsers,
					count_launchpools: totalLaunchpools,
					count_projects: totalProjects,
					count_transactions: totalTx,
					total_value_locked: totalStakedAmount,
					tokens_distributed:
						resultTokensDistributed[0]?.tokens_distributed || 0,
					id: `${timestamp}`,
				},
			}
		);
		logger.info(
			`Successfully inserted platform metrics snapshot with ID: ${insertData.id}`
		);
	} catch (error) {
		logger.error(`Error fetching platform metrics: ${error}`);
		return;
	}
}
