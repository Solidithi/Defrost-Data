import "reflect-metadata";
import { EvmBatchProcessor } from "@subsquid/evm-processor";
import { logger, prismaClient, typeormDB, cacheStore } from "./singletons";
import { selectedChain } from "./config";
import * as projectLibraryABI from "./typegen-abi/ProjectLibrary";
import * as launchpoolLibraryABI from "./typegen-abi/LaunchpoolLibrary";
import * as launchpoolABI from "./typegen-abi/Launchpool";
import "dotenv/config";
import { logsDispatch } from "./handlers";
import { initTaskWorker, initTaskScheduler, scheduleOnce } from "./tasks";
import { updateLaunchpoolAPY } from "./tasks/actions";

// Initialize both task worker and scheduler
Promise.all([initTaskWorker(), initTaskScheduler()])
	.then(() => logger.info("Task worker and scheduler initialized"))
	.catch((err) => {
		console.error("Failed to initialize task system:", err);
		process.exit(1);
	});

if (!selectedChain.observedContracts.ProjectHubUpgradeableProxy) {
	throw new Error(
		"ProjectHubUpgradeableProxy contract address not found for chain " +
			selectedChain.name
	);
}

logger.info(
	`Observing project hub proxy contract: ${selectedChain.observedContracts.ProjectHubUpgradeableProxy}`
);

const processor = new EvmBatchProcessor()
	.setGateway(selectedChain.squidGateway)
	.setRpcEndpoint({
		url: selectedChain.rpc,
		rateLimit: 10,
	})
	.setBlockRange({
		from: selectedChain.indexFromBlock,
	})
	.setFinalityConfirmation(10) // 6 seconds confirmation time
	.addLog({
		address: [selectedChain.observedContracts!.ProjectHubUpgradeableProxy], // ProjectHubUpgradable Proxy contract
		topic0: [projectLibraryABI.events.ProjectCreated.topic],
		transaction: true,
	})
	.addLog({
		address: [selectedChain.observedContracts!.ProjectHubUpgradeableProxy], // ProjectHubUpgradable Proxy contract
		topic0: [launchpoolLibraryABI.events.LaunchpoolCreated.topic],
		transaction: true,
	})
	.addLog({
		topic0: [launchpoolABI.events.Staked.topic],
		transaction: true,
	})
	.addLog({
		topic0: [launchpoolABI.events.Unstaked.topic],
		transaction: true,
	})
	.addLog({
		topic0: [launchpoolABI.events.ProjectTokensClaimed.topic],
		transaction: true,
	});

let isIndexerInitialized = false;

async function onIndexerStartup(): Promise<void> {
	if (isIndexerInitialized) {
		return;
	}

	try {
		if (!cacheStore.isReady) {
			logger.info("Connecting to cache store's client...");
			await cacheStore.connect();
			logger.info("Cache store's client connected");
		}

		try {
			await prismaClient.$queryRaw`SELECT 1`;
			logger.info("Prisma client is connected");
		} catch (e) {
			logger.info("prisma client not connected, connecting now...");
			await prismaClient.$connect();
			console.log("Done");
		}
	} catch (err) {
		logger.fatal(err, "Error initializing connections: ");
		process.exit(1);
	}

	// Insert first row for PlatformStatistics table
	try {
		const count = await prismaClient.platform_statistics.count();

		if (count === 0) {
			await prismaClient.platform_statistics.create({
				data: {
					id: "1",
					date: new Date(),
					total_projects: 0,
					total_pools: 0,
					unique_users: 0,
					daily_active_users: 0,
					total_staked_value: 0,
					total_transactions: 0,
				},
			});
			logger.debug("Created initial platform statistics record");
		}
	} catch (err) {
		logger.fatal(
			err,
			"Error creating initial platform statistics record: "
		);
		process.exit(1);
	}

	isIndexerInitialized = true;
}

onIndexerStartup().then(() =>
	processor.run(typeormDB, async (ctx) => {
		await onIndexerStartup();
		processor.addLog;

		// Debug
		console.log(
			"Topic[0] hash of event: ",
			projectLibraryABI.events.ProjectCreated.topic
		);
		// Aggregeate logs by topic
		for (const block of ctx.blocks) {
			for (const log of block.logs) {
				const dispatch = logsDispatch.get(log.topics[0]);
				if (!dispatch) continue;

				console.log(
					"Block timestamp from block is: ",
					log.block.timestamp
				);
				console.log(
					"Block.timestamp here is miliseconds since 1/1/1970, don't mismatch it with seconds"
				);

				dispatch.pendingLogs.push(log);
			}
		}

		// Process aggregated batches of logs
		const dispatches = Array.from(logsDispatch.entries());
		const results = await Promise.all(
			dispatches.map(async ([_, dispatch]) =>
				dispatch.logsHandler(ctx, dispatch.pendingLogs)
			)
		);
		results.map((result) => {
			logsDispatch.set(result.topic0, {
				...logsDispatch.get(result.topic0),
				pendingLogs: result.unprocessedLogs,
			});
		});
	})
);

// Test schedule once
const poolAddress = "0xd2ae079e420c600d414444666182cf26f618de1e";

scheduleOnce(
	`update-staker-apy-${Date.now()}`,
	10,
	updateLaunchpoolAPY,
	[poolAddress],
	1,
	new Date(Date.now() + 5000)
);
logger.info(
	`TESTTTTTT Scheduled APY update for pool ${poolAddress} in 5 seconds`
);
