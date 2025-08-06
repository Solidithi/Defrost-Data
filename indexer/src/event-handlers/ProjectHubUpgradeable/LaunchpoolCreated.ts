import { Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { Launchpool, Project } from "../../model/generated";
import { cacheStore, logger, prismaClient } from "../../singletons";
import { selectedChain } from "../../config";
import { normalizeAddress } from "../../utils";
import { cacheProjectTokenDecimalsTilLauncpoolEnd } from "../../utils/launchpool-project-token";
import * as launchpoolLibraryAbi from "../../typegen-abi/LaunchpoolLibrary";

export async function handleLaunchpoolCreated(
	ctx: DataHandlerContext<Store>,
	pendingLogs: Log[],
	moreProps?: object
): Promise<{
	topic0: string;
	success: boolean;
	error: string | null;
	unprocessedLogs: Log[];
}> {
	logger.info(`Processing ${pendingLogs.length} LaunchpoolCreated logs...`);

	const secondsBetweenBlocks = (from: number, to: number): number => {
		const signedBlockDelta = to - from;
		return signedBlockDelta * selectedChain.blockTime;
	};

	const ownerToLastActive = new Map<string, Date>();

	const poolsToSave: Launchpool[] = await Promise.all(
		pendingLogs.map(async (log) => {
			const launchpoolCreated =
				launchpoolLibraryAbi.events.LaunchpoolCreated.decode(log);

			const projectOwnerAddr = normalizeAddress(log.transaction.from);
			ownerToLastActive.set(
				projectOwnerAddr,
				new Date(log.block.timestamp)
			);

			// Cache projectTokenDecimals for fast access later (e.g. ProjectTokensClaimed event processing)
			await cacheProjectTokenDecimalsTilLauncpoolEnd(
				launchpoolCreated.projectToken,
				launchpoolCreated.projectTokenDecimals,
				launchpoolCreated.endBlock,
				BigInt(log.block.height) // current block number
			);

			return new Launchpool({
				id: normalizeAddress(launchpoolCreated.poolAddress),
				poolId: launchpoolCreated.poolId.toString(),
				chainId: selectedChain.chainID,
				txHash: log.getTransaction().hash,
				projectId: launchpoolCreated.projectId.toString(),

				// Time tracking
				startBlock: launchpoolCreated.startBlock,
				endBlock: launchpoolCreated.endBlock,
				// Estimate start/end dates based on current block timestamp and average block time
				// Note: This is an estimation and might differ slightly from the actual block timestamps
				startDate: new Date(
					log.block.timestamp + // log.block.timestamp is in miliseconds
						secondsBetweenBlocks(
							log.block.height,
							Number(launchpoolCreated.startBlock)
						) *
							1000 // Add estimated seconds * 1000 for milliseconds
				),
				endDate: new Date(
					log.block.timestamp +
						secondsBetweenBlocks(
							log.block.height,
							Number(launchpoolCreated.endBlock)
						) *
							1000 // Add estimated seconds * 1000 for milliseconds
				),

				// Asset tracking
				projectTokenAddress: normalizeAddress(
					launchpoolCreated.projectToken
				),
				projectTokenAmount: launchpoolCreated.projectTokenAmount,
				projectTokenDecimals: launchpoolCreated.projectTokenDecimals,
				vAssetAddress: normalizeAddress(launchpoolCreated.vAsset),
				nativeAssetAddress: normalizeAddress(
					launchpoolCreated.nativeAsset
				),

				// Live stats
				totalStaked: 0n,
				totalStakers: 0,

				// APY information
				stakerAPY: 0,
				ownerAPY: 0,
				platformAPY: 0,
				combinedAPY: 0,

				// Relations
				project: {
					id: launchpoolCreated.projectId.toString(),
				} as Project,

				// Time metadata
				createdAt: new Date(log.block.timestamp),
				updatedAt: new Date(log.block.timestamp),
			});
		})
	);

	try {
		await ctx.store.save(poolsToSave);
		for (const pool of poolsToSave) {
			await cacheStore.saveObservedLaunchpool(pool.id);
			// Debug logging
			console.log(".............");
			console.log(
				`Added pool ${pool.id} to set of redis observed pools: `
			);
		}
	} catch (e) {
		logger.error(e, "Error saving pools: ");
		return {
			topic0: launchpoolLibraryAbi.events.LaunchpoolCreated.topic,
			success: false,
			error: "Error saving pools: " + e,
			unprocessedLogs: pendingLogs,
		};
	}

	try {
		// for (const [address, lastActive] of ownerToLastActive.entries()) {
		// Sacrifice litlte last_active time accuracy for efficiency
		const ownerAddresses = Array.from(ownerToLastActive.keys());
		if (ownerAddresses.length > 0) {
			await prismaClient.user.updateMany({
				where: {
					id: {
						in: ownerAddresses,
					},
				},
				data: {
					last_active: new Date(),
				},
			});
		}

		return {
			topic0: launchpoolLibraryAbi.events.LaunchpoolCreated.topic,
			success: true,
			error: null,
			unprocessedLogs: [],
		};
	} catch (err) {
		logger.error(err, "Error updating users: ");
		return {
			topic0: launchpoolLibraryAbi.events.LaunchpoolCreated.topic,
			success: false,
			error: "Error updating users: " + err,
			unprocessedLogs: pendingLogs,
		};
	}
}
