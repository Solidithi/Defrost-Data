import "reflect-metadata";
import { EvmBatchProcessor } from "@subsquid/evm-processor";
import { User, Project, Pool, PoolType } from "./model/generated";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import { BlockData, Log, DataHandlerContext } from "@subsquid/evm-processor";
import { ethers } from "ethers";
import * as projectLibraryAbi from "./typegen-abi/ProjectLibrary";
import * as launchpoolLibraryAbi from "./typegen-abi/LaunchpoolLibrary";
import "dotenv/config";

const CHAIN_ID = 1287; // Moonbase Alpha testnet
const BLOCK_TIME = 6; // For Moonbase Alpha

const config = {
	ethereum: {
		squidGateway: "https://v2.archive.subsquid.io/network/ethereum-mainnet",
		rpc: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
	},
	moonbase_alpha: {
		squidGateway: "https://v2.archive.subsquid.io/network/moonbase-testnet",
		rpc: "https://rpc.api.moonbase.moonbeam.network",
	},
	sepolia: {
		squidGateway: "",
		rpc: "",
	},
};

type Network = "moonbase_alpha" | "ethereum" | "sepolia";
const network: Network = "moonbase_alpha";

const provider = new ethers.providers.JsonRpcProvider(config[network].rpc);

// Squid DB for handling indexer's internal stats such as indexer health, etc.
const squidDb = new TypeormDatabase({
	stateSchema: "squid_processor",
});

const processor = new EvmBatchProcessor()
	.setGateway(config[network].squidGateway)
	.setRpcEndpoint({
		url: config[network].rpc,
		rateLimit: 10,
	})
	.setBlockRange({
		from: 11512110,
	})
	.setFinalityConfirmation(10) // 6 seconds confirmation time
	.addLog({
		address: ["0x2CD45db1754b74dddbE42F742BB10B70D0AC7819".toLowerCase()], // ProjectHubProjeUpgradable Proxy contract
		topic0: [projectLibraryAbi.events.ProjectCreated.topic],
		transaction: true,
	})
	.addLog({
		address: ["0x2CD45db1754b74dddbE42F742BB10B70D0AC7819".toLowerCase()], // ProjectHubProjeUpgradable Proxy contract
		topic0: [launchpoolLibraryAbi.events.LaunchpoolCreated.topic],
		transaction: true,
	});

// Debug
console.log(
	"Topic[0] hash of event: ",
	projectLibraryAbi.events.ProjectCreated.topic
);

type LogsHandler = (
	ctx: DataHandlerContext<Store>,
	pendingLogs: Log[],
	moreProps?: object
) => Promise<{
	topic0: string;
	success: boolean;
	error: string | null;
	unprocessedLogs: Log[];
}>;

const logsDispatch = new Map<
	string,
	{ pendingLogs: Log[]; logsHandler: LogsHandler }
>();

logsDispatch.set(projectLibraryAbi.events.ProjectCreated.topic, {
	pendingLogs: [],
	logsHandler: handleProjectCreated,
});
logsDispatch.set(launchpoolLibraryAbi.events.LaunchpoolCreated.topic, {
	pendingLogs: [],
	logsHandler: handleLaunchpoolCreated,
});

processor.run(squidDb, async (ctx) => {
	// Aggregeate logs by topic
	for (const block of ctx.blocks) {
		for (const log of block.logs) {
			const dispatch = logsDispatch.get(log.topics[0]);
			if (!dispatch) continue;

			console.log("Block timestamp from block is: ", log.block.timestamp);
			console.log(
				"Block.timestamp here is miliseconds since 1/1/1970, don't mismatch it with seconds"
			);

			dispatch.pendingLogs.push(log);
		}
	}

	// Process aggregated batches of logs
	const entries = Array.from(logsDispatch.entries());
	const results = await Promise.all(
		entries.map(async ([_, dispatch]) =>
			dispatch.logsHandler(ctx, dispatch.pendingLogs)
		)
	);
	results.map((result) => {
		logsDispatch.set(result.topic0, {
			...logsDispatch.get(result.topic0),
			pendingLogs: result.unprocessedLogs,
		});
	});
});

async function handleProjectCreated(
	ctx: DataHandlerContext<Store>,
	pendingLogs: Log[],
	moreProps?: object
): Promise<{
	topic0: string;
	success: boolean;
	error: string | null;
	unprocessedLogs: Log[];
}> {
	const projects: Project[] = [];

	for (const log of pendingLogs) {
		const { projectId, projectOwner } =
			projectLibraryAbi.events.ProjectCreated.decode(log);
		projects.push(
			new Project({
				id: projectId.toString(),
				chainId: CHAIN_ID,
				projectOwner: projectOwner.toString(),
				createdAt: new Date(log.block.timestamp),
				txHash: log.getTransaction().hash,
			})
		);
	}

	// Extract unique project owners
	const uniqueAddresses = new Set<string>(
		projects.map((p) => p.projectOwner)
	);
	const uniqueOwners: User[] = [];

	for (const address of uniqueAddresses) {
		const createdAt =
			projects.find((p) => p.projectOwner === address)?.createdAt ??
			new Date();
		// Check if user already exists in the database
		let user = await ctx.store.findOneBy(User, {
			id: address,
		});

		if (user) {
			console.log("User already exists: ", user.id);
			user.lastActive = createdAt;
		} else {
			console.log("New user: ", address);
			user = new User({
				id: address,
				firstSeen: createdAt,
				lastActive: createdAt,
				totalPoolsParticipated: 0,
				totalStaked: 0n,
			});
		}

		uniqueOwners.push(user);
	}

	console.log("New projects: ", projects.length);

	// Insert users using ctx.store (will handle duplicates automatically)
	try {
		await ctx.store.save(uniqueOwners);
		await ctx.store.save(projects);
	} catch (e) {
		console.error("Error saving projects: ", e);
		return {
			topic0: projectLibraryAbi.events.ProjectCreated.topic,
			success: false,
			error: "Error saving projects: " + e,
			unprocessedLogs: pendingLogs,
		};
	}

	// TODO: implement this later
	return {
		topic0: projectLibraryAbi.events.ProjectCreated.topic,
		success: true,
		error: null,
		unprocessedLogs: [],
	};
}

async function handleLaunchpoolCreated(
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
		return signedBlockDelta * BLOCK_TIME;
	};

	const pools: Pool[] = pendingLogs.map((log) => {
		const launchpoolCreated =
			launchpoolLibraryAbi.events.LaunchpoolCreated.decode(log);

		return new Pool({
			id: launchpoolCreated.poolId.toString(),
			chainId: CHAIN_ID,
			txHash: log.getTransaction().hash,
			projectId: launchpoolCreated.projectId.toString(),
			poolAddress: launchpoolCreated.poolAddress.toString(),
			poolType: PoolType.LAUNCHPOOL,

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
			projectTokenAddress: launchpoolCreated.projectToken.toString(),
			vAssetAddress: launchpoolCreated.vAsset.toString(),
			nativeAssetAddress: "", // fill later

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
	} catch (e) {
		console.error("Error saving pools: ", e);
		return {
			topic0: launchpoolLibraryAbi.events.LaunchpoolCreated.topic,
			success: false,
			error: "Error saving pools: " + e,
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
