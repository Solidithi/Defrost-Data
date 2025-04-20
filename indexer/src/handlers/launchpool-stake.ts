import { Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { LaunchpoolStake, User, Launchpool } from "../model/generated";
import {
	// ethersProvider,
	cacheStore,
	logger,
	// prismaClient,
} from "../singletons";
import * as launchpoolAbi from "../typegen-abi/Launchpool";
// import { parseUnits, formatUnits } from "ethers/lib/utils";
// import { abi as launchpoolABI } from "../../abi/Launchpool.json";
// import { ethers } from "ethers";
import { scheduleOnce } from "../tasks";
import { updateLaunchpoolAPY } from "../tasks/actions";
import { In } from "typeorm";

export async function handleLaunchpoolStake(
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
				event: ReturnType<typeof launchpoolAbi.events.Staked.decode>;
			}[]
		>();

		// First pass - group Staked logs by pool
		let skippedLogsCount = 0;

		for (const log of pendingLogs) {
			const poolAddress = log.address.toString().toLowerCase();

			if (!cacheStore.isObservedLaunchpool(poolAddress)) {
				skippedLogsCount++;
				continue;
			}

			try {
				const event = launchpoolAbi.events.Staked.decode(log);

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
			const launchpool = await ctx.store.findOneBy(Launchpool, {
				poolAddress,
			});

			if (!launchpool) {
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
				`Found pool: ID=${launchpool.id}, ProjectID=${launchpool.projectId}`
			);

			// Group by user to count new stakers
			logger.info("Grouping stakes by user...");
			const userStakes = new Map<
				string,
				{
					logs: Log[];
					events: ReturnType<
						typeof launchpoolAbi.events.Staked.decode
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
			console.trace(
				"Checking for users' existing stakes in this pool..."
			);
			const existingStakes = await ctx.store.find(LaunchpoolStake, {
				where: {
					userAddress: In(userAddresses),
					poolId: launchpool.id,
				},
			});

			console.debug(
				`Found ${existingStakes.length} existing stakes from these users in this pool`
			);

			console.trace("Creating a set of users with existing stakes...");
			const usersWithExistingStakes = new Set(
				existingStakes.map((stake) => stake.userAddress)
			);

			console.trace("Checking for new stakers...");
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

			const oldTotalStaked = launchpool.totalStaked;
			const oldTotalStakers = launchpool.totalStakers;

			launchpool.totalStaked += totalNewStaked;
			launchpool.totalStakers += newStakersCount;
			launchpool.updatedAt = new Date();

			logger.info(
				`Pool stats update: totalStaked ${oldTotalStaked} -> ${launchpool.totalStaked}, totalStakers ${oldTotalStakers} -> ${launchpool.totalStakers}`
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
						// Simple placeholder values for rates - in production you'd compute these
						const nativeExRate = 1000000n; // Simplified - would come from pool contract
						const projectExRate = 1000000n; // Simplified - would come from pool contract

						const stakeId = `${log.id}-${userAddress}`;
						console.trace(`Creating stake: ID=${stakeId}`);

						const stake = new LaunchpoolStake({
							id: stakeId,
							userAddress,
							poolId: launchpool.id,
							amount: event.amount,
							nativeAmount:
								(event.amount * nativeExRate) / 1000000n, // Simplified calculation
							blockNumber: BigInt(log.block.height),
							timestamp: new Date(log.block.timestamp),
							txHash: log.getTransaction().hash,
							nativeExchangeRate: nativeExRate,
							cumulativeProjectExRate: projectExRate,
							user,
							launchpool,
							createdAt: new Date(log.block.timestamp),
						});

						stakesToSave.push(stake);
					} catch (stakeErr) {
						logger.error(
							stakeErr,
							`ERROR: Failed to create stake for user ${userAddress}:`
						);
					}
				}
			}

			// Fetch on-chain project tokens exchange rate
			console.trace("Scheduling APY update after creating stakes");
			scheduleOnce(
				`update-staker-apy-${Date.now()}`,
				10,
				updateLaunchpoolAPY,
				[poolAddress],
				1,
				new Date(Date.now() + 5000)
			);
			console.trace(
				`Scheduled APY update for pool ${poolAddress} in 5 seconds`
			);

			// Save everything in batches
			await ctx.store.save(usersToSave);
			await ctx.store.save(launchpool);
			await ctx.store.save(stakesToSave);

			console.trace(`Finished processing 1 pool: ${poolAddress}`);
			totalProcessedPools++;
		}

		logger.info(
			`Finished processing all pools: ${totalProcessedPools}/${stakesPerPool.size} successfully processed`
		);

		return {
			topic0: launchpoolAbi.events.Staked.topic,
			success: true,
			error: null,
			unprocessedLogs: [],
		};
	} catch (finalErr) {
		logger.error(finalErr, "Error processing stake events:");
		return {
			topic0: launchpoolAbi.events.Staked.topic,
			success: false,
			error: finalErr.message,
			unprocessedLogs: pendingLogs,
		};
	}
}

// async function calculateStakingAPY(
// 	ctx: DataHandlerContext<Store>,
// 	poolId: string
// ): Promise<number> {
// 	// Get the pool to understand current state
// 	const pool = await ctx.store.findOneBy(Launchpool, { id: poolId });
// 	if (!pool) return 0;

// 	// Get current totalStaked value
// 	const totalStaked = Number(pool.totalStaked);
// 	if (totalStaked === 0) return 0;

// 	// Get emission rate
// 	// const latestEmissionRate = await ctx.store.findOne(LaunchpoolEmissionRate, {
// 	// 	where: { poolId },
// 	// 	order: { changeBlock: "DESC" },
// 	// });

// 	// if (!latestEmissionRate) return 0;

// 	const latestEmissionRate;
// }
