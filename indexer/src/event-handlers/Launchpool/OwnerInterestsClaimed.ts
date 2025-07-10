import { Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { LaunchpoolOwnerInterestsClaimed, User, Launchpool } from "../../model";
import { logger } from "../../singletons";
import { normalizeAddress } from "../../utils";
import { In } from "typeorm";
import * as launchpoolABI from "../../typegen-abi/Launchpool";

export async function handleOwnerInterestsClaimed(
	ctx: DataHandlerContext<Store>,
	pendingLogs: Log[],
	moreProps?: object
): Promise<{
	topic0: string;
	success: boolean;
	error: string | null;
	unprocessedLogs: Log[];
}> {
	const claimsToSave: LaunchpoolOwnerInterestsClaimed[] = [];
	const addressToUser = new Map<string, User>(); // Map to store unique users by address

	const logCount = pendingLogs.length;
	logger.info(
		`Processing ${logCount} LaunchpoolOwnerInterestsClaimed logs...`
	);

	for (const log of pendingLogs) {
		const { claimer, ownerClaims, platformFee } =
			launchpoolABI.events.OwnerInterestsClaimed.decode(log);

		const normClaimerAddress = normalizeAddress(claimer);
		// Assume each user is new for now (remove user from map later if already exists)
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
			new LaunchpoolOwnerInterestsClaimed({
				id: `${log.id}-${claimer}`, // Unique ID for the claim event (log.id is unique for each log, assigned by subsquid indexer)
				ownerClaims: ownerClaims,
				platformFee: platformFee,
				claimer: { id: normalizeAddress(claimer) } as User,
				timestamp: new Date(log.block.timestamp),
				createdAt: new Date(),
			})
		);
	}

	const dbUsers = await ctx.store.find(User, {
		where: { id: In(Array.from(addressToUser.keys())) },
	});

	dbUsers.forEach((dbUser) => {
		const dbUserAddress = normalizeAddress(dbUser.id);
		const preparedUser = addressToUser.get(dbUserAddress);
		addressToUser.set(dbUserAddress, {
			...dbUser,
			lastActive: preparedUser.lastActive,
		});
	});

	await ctx.store.save(Array.from(addressToUser.values()));
	await ctx.store.save(claimsToSave);

	logger.info(`Saved ${dbUsers.length} users to db`);
	logger.info(
		`Saved ${claimsToSave.length} LaunchpoolOwnerInterestsClaimed claims to db`
	);
	logger.info(
		`Successfully processed ${logCount} LaunchpoolOwnerInterestsClaimed logs`
	);

	return {
		topic0: launchpoolABI.events.ProjectTokensClaimed.topic,
		success: false,
		error: "Failed to save LaunchpoolProjectTokenClaim to db",
		unprocessedLogs: pendingLogs,
	};
}
