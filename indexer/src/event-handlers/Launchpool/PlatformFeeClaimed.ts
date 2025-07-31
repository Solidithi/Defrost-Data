import { Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import {
	LaunchpoolPlatformFeeClaimed,
	User,
	Launchpool,
} from "../../model/generated";
import { logger } from "../../singletons";
import { normalizeAddress } from "../../utils";
import { In } from "typeorm";
import * as launchpoolABI from "../../typegen-abi/Launchpool";

export async function handlePlatformFeeClaimed(
	ctx: DataHandlerContext<Store>,
	pendingLogs: Log[],
	moreProps?: object
): Promise<{
	topic0: string;
	success: boolean;
	error: string | null;
	unprocessedLogs: Log[];
}> {
	const claimsToSave: LaunchpoolPlatformFeeClaimed[] = [];
	const addressToUser = new Map<string, User>();
	const logCount = pendingLogs.length;
	logger.info(`Processing ${logCount} PlatformFeeClaimed logs...`);

	for (const log of pendingLogs) {
		const poolAddress = normalizeAddress(log.address);
		const { claimer, platformFee } =
			launchpoolABI.events.PlatformFeeClaimed.decode(log);
		const normClaimerAddress = normalizeAddress(claimer);
		// Prepare user for upsert
		addressToUser.set(
			normClaimerAddress,
			new User({
				id: normClaimerAddress,
				firstSeen: new Date(log.block.timestamp),
				lastActive: new Date(log.block.timestamp),
				totalPoolsParticipated: 0,
				totalStaked: 0n,
			})
		);
		claimsToSave.push(
			new LaunchpoolPlatformFeeClaimed({
				id: `${log.id}-${claimer}`,
				platformFee: platformFee,
				timestamp: new Date(log.block.timestamp),
				createdAt: new Date(),
				claimer: { id: normClaimerAddress } as User,
				launchpool: { id: poolAddress } as Launchpool,
			})
		);
	}

	// Upsert users: fetch existing, update lastActive, create new if needed
	const dbUsers = await ctx.store.find(User, {
		where: { id: In(Array.from(addressToUser.keys())) },
	});
	dbUsers.forEach((dbUser) => {
		const dbUserAddress = normalizeAddress(dbUser.id);
		const preparedUser = addressToUser.get(dbUserAddress);
		if (preparedUser) {
			dbUser.lastActive = preparedUser.lastActive;
			addressToUser.set(dbUserAddress, dbUser);
		}
	});
	await ctx.store.save(Array.from(addressToUser.values()));
	await ctx.store.save(claimsToSave);

	logger.info(`Saved ${dbUsers.length} users to db`);
	logger.info(`Saved ${claimsToSave.length} PlatformFeeClaimed claims to db`);
	logger.info(`Successfully processed ${logCount} PlatformFeeClaimed logs`);

	return {
		topic0: launchpoolABI.events.PlatformFeeClaimed.topic,
		success: true,
		error: null,
		unprocessedLogs: [],
	};
}
