import { Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import {
	Launchpool,
	LaunchpoolProjectTokenClaim,
	User,
} from "../../model/generated";
import { logger } from "../../singletons";
import { normalizeAddress } from "../../utils";
import { cacheStore } from "../../singletons";
import { ethers } from "ethers";
import { ethersProvider } from "../../singletons";
import * as launchpoolABI from "../../typegen-abi/Launchpool";

export async function handleProjectTokensClaimed(
	ctx: DataHandlerContext<Store>,
	pendingLogs: Log[],
	moreProps?: object
): Promise<{
	topic0: string;
	success: boolean;
	error: string | null;
	unprocessedLogs: Log[];
}> {
	const claims: LaunchpoolProjectTokenClaim[] = [];

	logger.info(
		`Processing ${pendingLogs.length} LaunchpoolProjectTokenClaim logs...`
	);

	for (const log of pendingLogs) {
		const poolAddress = normalizeAddress(log.address);

		const isPoolObserved =
			await cacheStore.isObservedLaunchpool(poolAddress);
		if (!isPoolObserved) {
			continue;
		}

		const { user: userAddr, amount: projectTokenAmount } =
			launchpoolABI.events.ProjectTokensClaimed.decode(log);

		// Fetch project token decimals from cache
		const launchpoolAddress = normalizeAddress(log.address);
		// Read project token address from launchpool table
		const { endDate, projectTokenAddress } = await ctx.store.findOneBy(
			Launchpool,
			{
				id: launchpoolAddress,
			}
		);
		let projectTokenDecimals = (await cacheStore.getTokenInfo(
			projectTokenAddress,
			"decimals"
		)) as number | null;

		// Fetch project token decimals from blockchain if not cached
		if (!projectTokenDecimals) {
			try {
				const decimalsAbi = [
					{
						type: "function",
						name: "decimals",
						inputs: [],
						outputs: [
							{
								name: "",
								type: "uint8",
								internalType: "uint8",
							},
						],
						stateMutability: "view",
					},
				];
				const tokenContract = new ethers.Contract(
					projectTokenAddress,
					decimalsAbi,
					ethersProvider
				);
				projectTokenDecimals = await tokenContract.decimals();

				// calculate TTL based on pool end date
				const now = new Date();
				const launchpoolRemainingSeconds =
					now >= endDate
						? 60 * 60 * 24 // 1 day in seconds
						: Math.ceil((endDate.getTime() - now.getTime()) / 1000); // pool remaining time in seconds

				// save to cache for later access
				await cacheStore.saveTokenInfoField(
					projectTokenAddress,
					"decimals",
					projectTokenDecimals.toString(),
					launchpoolRemainingSeconds + 86400 // add 1 day to TTL
				);
			} catch (err) {
				logger.error(
					err,
					`Failed to fetch decimals for project token ${projectTokenAddress}`
				);
				continue; // Skip this log if we can't get decimals
			}
		}

		claims.push(
			new LaunchpoolProjectTokenClaim({
				id: `${log.id}-${userAddr}`, // Unique ID for the claim event (log.id is unique for each log, assigned by subsquid indexer)
				user: { id: normalizeAddress(userAddr) } as User, // Link to the User entity using only its ID
				launchpool: { id: normalizeAddress(log.address) } as Launchpool, // Link to the Launchpool entity using its ID (assuming log.address is the pool ID)
				projectTokenAmount,
				projectTokenDecimals,
				blockNumber: BigInt(log.block.height),
				timestamp: new Date(log.block.timestamp),
				txHash: log.getTransaction().hash, // Use log.transactionHash for consistency
				createdAt: new Date(),
			})
		);
	}

	try {
		logger.info(
			`Saving ${claims.length} new LaunchpoolProjectTokenClaim to db...`
		);
		await ctx.store.save(claims);

		// TODO: deeper implementation later
		return {
			topic0: launchpoolABI.events.ProjectTokensClaimed.topic,
			success: true,
			error: null,
			unprocessedLogs: [],
		};
	} catch (err) {
		logger.error(
			err,
			`ERROR: Failed to save LaunchpoolProjectTokenClaim to db:`
		);
		return {
			topic0: launchpoolABI.events.ProjectTokensClaimed.topic,
			success: false,
			error: "Failed to save LaunchpoolProjectTokenClaim to db",
			unprocessedLogs: pendingLogs,
		};
	}
}
