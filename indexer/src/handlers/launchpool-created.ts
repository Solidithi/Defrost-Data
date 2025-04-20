import { BlockData, Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { Launchpool, User } from "../model/generated";
import { cacheStore, prismaClient } from "../singletons";
import { selectedChain } from "../config";
import { normalizeAddress } from "../utils";
import * as launchpoolLibraryAbi from "../typegen-abi/LaunchpoolLibrary";

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
	const secondsBetweenBlocks = (from: number, to: number): number => {
		const signedBlockDelta = from - to;
		return signedBlockDelta * selectedChain.blockTime;
	};

	const ownerToLastActive = new Map<string, Date>();

	const pools: Launchpool[] = pendingLogs.map((log) => {
		const launchpoolCreated =
			launchpoolLibraryAbi.events.LaunchpoolCreated.decode(log);

		const projectOwnerAddr = log.transaction.from.toString().toLowerCase();
		ownerToLastActive.set(projectOwnerAddr, new Date(log.block.timestamp));

		return new Launchpool({
			id: launchpoolCreated.poolId.toString(),
			chainId: selectedChain.blockTime,
			txHash: log.getTransaction().hash,
			projectId: launchpoolCreated.projectId.toString(),
			poolAddress: launchpoolCreated.poolAddress.toString(),

			// Time tracking
			startBlock: launchpoolCreated.startBlock,
			endBlock: launchpoolCreated.endBlock,
			startDate: new Date(
				Date.now() +
					secondsBetweenBlocks(
						log.block.height,
						Number(launchpoolCreated.startBlock)
					) *
						1000
			),
			endDate: new Date(
				Date.now() +
					secondsBetweenBlocks(
						log.block.height,
						Number(launchpoolCreated.endBlock)
					) *
						1000
			),

			// Asset tracking
			projectTokenAddress: normalizeAddress(
				launchpoolCreated.projectToken
			),
			vAssetAddress: normalizeAddress(launchpoolCreated.vAsset),
			nativeAssetAddress: normalizeAddress(launchpoolCreated.nativeAsset),

			// Live stats
			totalStaked: 0n,
			totalStakers: 0,

			// APY information
			stakerAPY: 0,
			ownerAPY: 0,
			platformAPY: 0,
			combinedAPY: 0,

			// Time metadata
			createdAt: new Date(log.block.timestamp),
			updatedAt: new Date(log.block.timestamp),
		});
	});

	try {
		await ctx.store.save(pools);
		for (const pool of pools) {
			await cacheStore.saveObservedLaunchpool(pool.poolAddress);
			// Debug logging
			console.log(".............");
			console.log(
				`Added pool ${pool.poolAddress} to set of redis observed pools: `
			);
		}
	} catch (e) {
		console.error("Error saving pools: ", e);
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
	} catch (err) {
		console.error("Error updating users: ", err);
		return {
			topic0: launchpoolLibraryAbi.events.LaunchpoolCreated.topic,
			success: false,
			error: "Error updating users: " + err,
			unprocessedLogs: pendingLogs,
		};
	}

	return {
		topic0: launchpoolLibraryAbi.events.LaunchpoolCreated.topic,
		success: true,
		error: null,
		unprocessedLogs: [],
	};
}
