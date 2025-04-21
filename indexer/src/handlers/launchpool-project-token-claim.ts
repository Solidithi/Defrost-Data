import { Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import {
	Launchpool,
	LaunchpoolProjectTokenClaim,
	User,
} from "../model/generated";
import { logger } from "../singletons";
import { normalizeAddress } from "../utils";
import * as launchpoolABI from "../typegen-abi/Launchpool";

export async function handleLaunchpoolProjectTokenClaim(
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

	for (const log of pendingLogs) {
		const { user: userAddr, amount: projectTokenAmount } =
			launchpoolABI.events.ProjectTokensClaimed.decode(log);

		claims.push(
			new LaunchpoolProjectTokenClaim({
				id: `${log.id}-${userAddr}`, // Unique ID for the claim event
				user: { id: normalizeAddress(userAddr) } as User, // Link to the User entity using only its ID
				launchpool: { id: normalizeAddress(log.address) } as Launchpool, // Link to the Launchpool entity using its ID (assuming log.address is the pool ID)
				projectTokenAmount,
				blockNumber: BigInt(log.block.height),
				timestamp: new Date(log.block.timestamp),
				txHash: log.getTransaction().hash, // Use log.transactionHash for consistency
				createdAt: new Date(log.block.timestamp), // Use block timestamp for creation time
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
