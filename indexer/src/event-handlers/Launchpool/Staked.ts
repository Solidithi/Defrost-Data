import { In } from "typeorm";
import { Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { LaunchpoolStake, User, Launchpool } from "../../model/generated";
import { cacheStore, logger } from "../../singletons";
import { scheduleOnce } from "../../tasks";
import { updateLaunchpoolAPR } from "../../tasks/actions";
import { normalizeAddress } from "../../utils";
import * as launchpoolABI from "../../typegen-abi/Launchpool";

export async function handleStaked(
	ctx: DataHandlerContext<Store>,
	pendingLogs: Log[]
): Promise<{
	topic0: string;
	success: boolean;
	error: string | null;
	unprocessedLogs: Log[];
}> {
	try {
		logger.info("Step 1: Grouping logs by pool address...");
		const stakesPerPool = new Map<
			string,
			{
				log: Log;
				event: ReturnType<typeof launchpoolABI.events.Staked.decode>;
			}[]
		>();

		// First pass - group Staked logs by pool
		let skippedLogsCount = 0;

		for (const log of pendingLogs) {
			const poolAddress = normalizeAddress(log.address);

			const isPoolObserved =
				await cacheStore.isObservedLaunchpool(poolAddress);
			if (!isPoolObserved) {
				skippedLogsCount++;
				continue;
			}

			try {
				const event = launchpoolABI.events.Staked.decode(log);

				if (!stakesPerPool.has(poolAddress)) {
					stakesPerPool.set(poolAddress, []);
				}

				stakesPerPool.get(poolAddress)!.push({ log, event });
			} catch (decodeErr) {
				logger.error(
					decodeErr,
					`ERROR: Failed to decode log for pool ${poolAddress}:`
				);
				logger.error(log, "Problematic log:");
			}
		}

		logger.info(
			`Log grouping complete: ${skippedLogsCount}/${pendingLogs.length} skipped (not in observed pools)`
		);

		if (skippedLogsCount === pendingLogs.length) {
			logger.info("No logs to process, exiting...");
			return {
				topic0: launchpoolABI.events.Staked.topic,
				success: true,
				error: null,
				unprocessedLogs: [],
			};
		}

		logger.info(`Found stakes for ${stakesPerPool.size} different pools`);

		// Process each pool's stakes in batch
		logger.info("Step 3: Processing pools one by one...");
		let poolIndex = 0;
		let totalProcessedPools = 0;

		for (const [poolAddress, poolData] of stakesPerPool.entries()) {
			poolIndex++;
			logger.info(
				`\n==== Processing pool ${poolIndex}/${stakesPerPool.size}: ${poolAddress} ====`
			);
			logger.info(`Pool has ${poolData.length} stake events to process`);

			// Fetch pool by poolAddress
			logger.info(`Looking up pool by address: ${poolAddress}`);
			const launchpoolToSave = await ctx.store.findOneBy(Launchpool, {
				id: poolAddress,
			});

			if (!launchpoolToSave) {
				logger.error(
					`ERROR: Pool with address ${poolAddress} not found in database!`
				);
				logger.error(
					"This could indicate a synchronization issue between Redis and the DB"
				);
				logger.error(
					`Skipping ${poolData.length} stake events for this pool`
				);
				continue;
			}

			logger.info(
				`Found pool: ID=${launchpoolToSave.id}, ProjectID=${launchpoolToSave.projectId}`
			);

			// Group by user to count new stakers
			logger.info("Grouping stakes by user...");
			const userStakes = new Map<
				string,
				{
					logs: Log[];
					events: ReturnType<
						typeof launchpoolABI.events.Staked.decode
					>[];
					totalAmount: bigint;
				}
			>();

			for (const { log, event } of poolData) {
				const userAddress = event.user.toString();
				if (!userStakes.has(userAddress)) {
					userStakes.set(userAddress, {
						logs: [],
						events: [],
						totalAmount: 0n,
					});
				}

				const userData = userStakes.get(userAddress)!;
				userData.logs.push(log);
				userData.events.push(event);
				userData.totalAmount += event.amount;
			}

			logger.info(
				`Found ${userStakes.size} unique users staking in this pool`
			);

			// Get all users that need updates
			const userAddresses = Array.from(userStakes.keys());
			logger.info(
				`Fetching ${userAddresses.length} users from database...`
			);

			const users = await ctx.store.find(User, {
				where: { id: In(userAddresses) },
			});

			logger.info(
				`Found ${users.length} existing users, ${userAddresses.length - users.length} new users to create`
			);

			const existingUserMap = new Map(
				users.map((user) => [user.id, user])
			);

			// Check which users already staked in this pool
			logger.trace("Checking for users' existing stakes in this pool...");
			const existingStakes = await ctx.store.find(LaunchpoolStake, {
				where: {
					user: In(userAddresses),
					id: launchpoolToSave.id,
				},
			});

			console.debug(
				`Found ${existingStakes.length} existing stakes from these users in this pool`
			);

			logger.trace("Creating a set of users with existing stakes...");
			const usersWithExistingStakes = new Set(
				existingStakes.map((stake) => stake.user.id)
			);

			logger.trace("Checking for new stakers...");
			const newStakersCount = userAddresses.filter(
				(addr) => !usersWithExistingStakes.has(addr)
			).length;

			console.debug(
				`${newStakersCount} users are staking in this pool for the first time`
			);

			// Update pool stats
			logger.info("Calculating pool statistics updates...");
			let totalNewStaked = 0n;
			for (const userData of userStakes.values()) {
				totalNewStaked += userData.totalAmount;
			}

			const oldTotalStaked = launchpoolToSave.totalStaked;
			const oldTotalStakers = launchpoolToSave.totalStakers;

			launchpoolToSave.totalStaked += totalNewStaked;
			launchpoolToSave.totalStakers += newStakersCount;
			launchpoolToSave.updatedAt = new Date();

			logger.info(
				`Pool stats update: totalStaked ${oldTotalStaked} -> ${launchpoolToSave.totalStaked}, totalStakers ${oldTotalStakers} -> ${launchpoolToSave.totalStakers}`
			);

			// Create or update users and build stake entities
			const usersToSave: User[] = [];
			const stakesToSave: LaunchpoolStake[] = [];

			for (const [userAddress, userData] of userStakes.entries()) {
				// Handle user update or creation
				let user = existingUserMap.get(userAddress);
				const isNewUser = !user;

				if (isNewUser) {
					logger.info(`Creating new user: ${userAddress}`);
					user = new User({
						id: userAddress,
						firstSeen: new Date(userData.logs[0].block.timestamp),
						lastActive: new Date(userData.logs[0].block.timestamp),
						totalPoolsParticipated: 1,
						totalStaked: userData.totalAmount,
					});
				} else {
					logger.info(`Updating existing user: ${userAddress}`);
					user.lastActive = new Date(
						Math.max(
							...userData.logs.map((log) => log.block.timestamp)
						)
					);

					const oldTotalStaked = user.totalStaked;
					user.totalStaked += userData.totalAmount;
					logger.info(
						`User totalStaked: ${oldTotalStaked} -> ${user.totalStaked}`
					);

					// Increment totalPoolsParticipated only if this is user's first stake in this pool
					if (!usersWithExistingStakes.has(userAddress)) {
						const oldParticipation = user.totalPoolsParticipated;
						user.totalPoolsParticipated += 1;
						logger.info(
							`User totalPoolsParticipated: ${oldParticipation} -> ${user.totalPoolsParticipated}`
						);
					}
				}

				usersToSave.push(user);

				// Create stake entities
				logger.info(
					`Creating ${userData.logs.length} stake records for user ${userAddress}`
				);
				for (let i = 0; i < userData.logs.length; i++) {
					const log = userData.logs[i];
					const event = userData.events[i];

					try {
						const stakeId = `${log.id}-${userAddress}`;
						logger.trace(`Creating stake: ID=${stakeId}`);

						const stake = new LaunchpoolStake({
							id: stakeId,
							amount: event.amount,
							blockNumber: BigInt(log.block.height),
							timestamp: new Date(log.block.timestamp),
							txHash: log.getTransaction().hash,
							user,
							launchpool: launchpoolToSave,
							createdAt: new Date(log.block.timestamp),
						});

						stakesToSave.push(stake);
					} catch (stakeErr) {
						logger.error(
							stakeErr,
							`Failed to create stake for user ${userAddress}:`
						);
					}
				}
			}

			logger.trace("Scheduling APR update after after stakes");
			const argsUpdateLaunchpoolAPR = [
				poolAddress,
				poolData[poolData.length - 1].log.block.height,
			];
			scheduleOnce(
				`update-staker-apr-${Date.now()}`,
				10,
				updateLaunchpoolAPR,
				argsUpdateLaunchpoolAPR,
				1, // retry count
				new Date(Date.now() + 5000)
			);
			logger.trace(
				`Scheduled APR update for pool ${poolAddress} in 5 seconds`
			);

			// Save everything in batches
			await ctx.store.save(usersToSave);
			await ctx.store.save(launchpoolToSave);
			await ctx.store.save(stakesToSave);

			logger.trace(`Finished processing 1 pool: ${poolAddress}`);
			totalProcessedPools++;
		}

		logger.info(
			`Finished processing all pools: ${totalProcessedPools}/${stakesPerPool.size} successfully processed`
		);

		return {
			topic0: launchpoolABI.events.Staked.topic,
			success: true,
			error: null,
			unprocessedLogs: [],
		};
	} catch (err) {
		logger.error(err, "Error processing stake events:");
		return {
			topic0: launchpoolABI.events.Staked.topic,
			success: false,
			error: err.message,
			unprocessedLogs: pendingLogs,
		};
	}
}
