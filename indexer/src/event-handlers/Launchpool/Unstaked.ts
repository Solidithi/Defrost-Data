import { Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { LaunchpoolUnstake, User, Launchpool } from "../../model/generated";
import { cacheStore, logger } from "../../singletons";
import { updateLaunchpoolAPY } from "../../tasks/actions";
import * as launchpoolABI from "../../typegen-abi/Launchpool";
import { In } from "typeorm";
import { normalizeAddress } from "../../utils";
import { scheduleOnce } from "../../tasks";

export async function handleUnstaked(
	ctx: DataHandlerContext<Store>,
	pendingLogs: Log[]
): Promise<{
	topic0: string;
	success: boolean;
	error: string | null;
	unprocessedLogs: Log[];
}> {
	try {
		logger.info("Step 1: Grouping unstake logs by pool address...");
		const unstakesPerPool = new Map<
			string,
			{
				log: Log;
				event: ReturnType<typeof launchpoolABI.events.Unstaked.decode>;
			}[]
		>();

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
				const event = launchpoolABI.events.Unstaked.decode(log);
				if (!unstakesPerPool.has(poolAddress)) {
					unstakesPerPool.set(poolAddress, []);
				}
				unstakesPerPool.get(poolAddress)!.push({ log, event });
			} catch (decodeErr) {
				logger.error(
					decodeErr,
					`ERROR: Failed to decode Unstaked log for pool ${poolAddress}:`
				);
			}
		}

		logger.info(
			`Log grouping complete: ${skippedLogsCount}/${pendingLogs.length} skipped (not observed)`
		);

		if (skippedLogsCount === pendingLogs.length) {
			logger.info("No logs to process. Exiting.");
			return {
				topic0: launchpoolABI.events.Unstaked.topic,
				success: true,
				error: null,
				unprocessedLogs: [],
			};
		}

		logger.info(
			`Found unstakes for ${unstakesPerPool.size} different pools`
		);

		// Process each pool's unstakes
		logger.info("Step 2: Processing pools one by one...");
		let totalProcessedPools = 0;

		for (const [poolAddress, poolData] of unstakesPerPool.entries()) {
			const normalizedPoolAddress = normalizeAddress(poolAddress);

			logger.info(
				`==== Processing pool ${normalizedPoolAddress} (${poolData.length} unstakes) ====`
			);

			// Fetch pool
			const launchpoolToSave = await ctx.store.findOneBy(Launchpool, {
				id: normalizedPoolAddress,
			});
			if (!launchpoolToSave) {
				logger.error(
					`Pool ${normalizedPoolAddress} not found in database! Skipping.`
				);
				continue;
			}

			// Group by user
			const userUnstakes = new Map<
				string,
				{
					logs: Log[];
					events: ReturnType<
						typeof launchpoolABI.events.Unstaked.decode
					>[];
					totalUnstakeAmount: bigint;
				}
			>();

			for (const { log, event } of poolData) {
				const userAddress = normalizeAddress(event.user);
				if (!userUnstakes.has(userAddress)) {
					userUnstakes.set(userAddress, {
						logs: [],
						events: [],
						totalUnstakeAmount: 0n,
					});
				}
				const userUnstakeData = userUnstakes.get(userAddress)!;
				userUnstakeData.logs.push(log);
				userUnstakeData.events.push(event);
				userUnstakeData.totalUnstakeAmount += event.amount;
			}

			// Fetch users
			const userAddresses = Array.from(userUnstakes.keys());
			const usersInDB = await ctx.store.find(User, {
				where: { id: In(userAddresses) },
				relations: {
					launchpoolStakes: { launchpool: true },
					launchpoolUnstakes: { launchpool: true },
				},
			});

			const usersInDBMap = new Map(usersInDB.map((uDB) => [uDB.id, uDB]));

			// Create unstake entities and update users
			const usersToSave: User[] = [];
			const unstakesToSave: LaunchpoolUnstake[] = [];

			// Prepare to update pool stats
			let totalUnstakedAmount = 0n;
			const oldTotalStaked = launchpoolToSave.totalStaked;

			// Loop to aggregate unstake amounts and update user, pool stats
			for (const [
				userAddress,
				userUnstakesData,
			] of userUnstakes.entries()) {
				totalUnstakedAmount += userUnstakesData.totalUnstakeAmount;

				const userInDB = usersInDBMap.get(userAddress);
				if (!userInDB) {
					logger.warn(
						`User ${userAddress} not found in DB during unstake processing. Skipping user update.`
					);
					// Still process the unstake record, but can't link/update the user
				} else {
					// const oldUserTotalStaked = user.totalStaked;
					userInDB.lastActive = new Date(
						Math.max(
							userInDB.lastActive.getTime(),
							...userUnstakesData.logs.map(
								(log) => log.block.timestamp
							)
						)
					);
					usersToSave.push(userInDB);

					// Check if the user is unstaking their entire balance from this specific pool
					let userTotalStakedInThisPool = 0n;
					let userTotalUnstakedBefore = 0n;

					if (
						userInDB.launchpoolStakes &&
						userInDB.launchpoolStakes.length > 0
					) {
						userInDB.launchpoolStakes.forEach((stake) => {
							if (stake.launchpool?.id === launchpoolToSave.id)
								userTotalStakedInThisPool += stake.amount;
						});
					} else {
						logger.warn(
							`User ${userAddress} has no launchpoolStakes.`
						);
					}
					if (
						userInDB.launchpoolUnstakes &&
						userInDB.launchpoolUnstakes.length > 0
					) {
						userInDB.launchpoolUnstakes.forEach((unstake) => {
							if (unstake.launchpool.id === launchpoolToSave.id)
								userTotalUnstakedBefore += unstake.amount;
						});
					} else {
						logger.warn(
							`User ${userAddress} has no launchpoolUnstakes.`
						);
					}

					// If the total amount unstaked in this batch is >= the user's total staked amount in this pool
					// (calculated *before* applying this unstake), then the user is effectively leaving the pool.
					logger.info(
						"User total staked in this pool: ",
						userTotalStakedInThisPool
					);
					logger.info(
						"User total unstaked before: ",
						userTotalUnstakedBefore
					);

					if (
						userTotalStakedInThisPool > 0n &&
						userTotalUnstakedBefore +
							userUnstakesData.totalUnstakeAmount >=
							userTotalStakedInThisPool
					) {
						logger.info(
							`User ${userAddress} fully unstaked from pool`
						);
						if (launchpoolToSave.totalStakers > 0) {
							launchpoolToSave.totalStakers -= 1;
							logger.info(
								`User ${userAddress} fully unstaked from pool ${normalizedPoolAddress}. Decrementing totalStakers.`
							);
						} else {
							logger.warn(
								`Attempted to decrement totalStakers for pool ${normalizedPoolAddress} below zero.`
							);
						}
					}
				}

				// Create unstake records
				for (let i = 0; i < userUnstakesData.logs.length; i++) {
					const log = userUnstakesData.logs[i];
					const event = userUnstakesData.events[i];
					const timestamp = new Date(log.block.timestamp);

					const unstake = new LaunchpoolUnstake({
						id: `${log.id}-${userAddress}`,
						amount: event.amount,
						blockNumber: BigInt(log.block.height),
						timestamp: timestamp,
						txHash: log.getTransaction().hash,
						user: userInDB, // Link user if found
						launchpool: launchpoolToSave,
						createdAt: timestamp,
					});
					unstakesToSave.push(unstake);
				}
			}

			// Update pool stats
			launchpoolToSave.totalStaked -= totalUnstakedAmount;
			launchpoolToSave.updatedAt = new Date(
				Math.max(...poolData.map((d) => d.log.block.timestamp))
			);
			logger.info(
				`Pool stats update: totalStaked ${oldTotalStaked} -> ${launchpoolToSave.totalStaked}`
			);

			logger.trace("Scheduling APY update after unstakes");
			scheduleOnce(
				`update-staker-apy-${Date.now()}`,
				10,
				updateLaunchpoolAPY,
				[poolAddress],
				1,
				new Date(Date.now() + 5000)
			);

			// Save updates for the current pool
			await ctx.store.save(usersToSave);
			await ctx.store.save(launchpoolToSave);
			await ctx.store.save(unstakesToSave);

			logger.trace(
				`Scheduled APY update for pool ${poolAddress} in 5 seconds`
			);

			totalProcessedPools++;
		}

		logger.info(
			`Finished processing unstakes: ${totalProcessedPools}/${unstakesPerPool.size} pools`
		);

		return {
			topic0: launchpoolABI.events.Unstaked.topic,
			success: true,
			error: null,
			unprocessedLogs: [],
		};
	} catch (err) {
		logger.error(err, "Error processing unstake events:");
		return {
			topic0: launchpoolABI.events.Unstaked.topic,
			success: false,
			error: err.message,
			unprocessedLogs: pendingLogs,
		};
	}
}
