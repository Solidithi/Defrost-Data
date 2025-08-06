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
import { getAndCacheProjectTokenDecimals } from "../../utils/launchpool-project-token";
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
		const { endBlock: launchpoolEndBlock, projectTokenAddress } =
			await ctx.store.findOneBy(Launchpool, {
				id: launchpoolAddress,
			});

		let projectTokenDecimals: number;
		try {
			projectTokenDecimals = await getAndCacheProjectTokenDecimals(
				projectTokenAddress,
				launchpoolEndBlock,
				BigInt(log.block.height) // Current block number
			);
		} catch (error) {
			logger.error(
				error,
				`Failed to fetch project token decimals for ${projectTokenAddress}`
			);
			continue; // Skip this log if we can't fetch decimals
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
