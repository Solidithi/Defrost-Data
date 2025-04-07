import "reflect-metadata";
import { EvmBatchProcessor } from "@subsquid/evm-processor";
import { User, Project } from "./model/generated";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import * as projectLibraryAbi from "./typegen-abi/ProjectLibrary";
import "dotenv/config";

const CHAIN_ID = 1287; // Moonbase Alpha testnet

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
	});

// Debug
console.log(
	"Topic[0] hash of event: ",
	projectLibraryAbi.events.ProjectCreated.topic
);

processor.run(squidDb, async (ctx) => {
	// const projects: Array<Prisma.ProjectCreateManyInput> = [];
	const projects: Project[] = [];

	for (const block of ctx.blocks) {
		for (const log of block.logs) {
			const { projectId, projectOwner } =
				projectLibraryAbi.events.ProjectCreated.decode(log);
			projects.push(
				new Project({
					id: projectId.toString(),
					chainId: CHAIN_ID,
					projectOwner: projectOwner.toString(),
					createdAt: new Date(block.header.timestamp),
					txHash: log.getTransaction().hash,
				})
			);
		}
	}

	// Extract unique project owners
	const uniqueOwnerIds = new Set<string>(projects.map((p) => p.projectOwner));
	const uniqueOwners: User[] = [];

	uniqueOwnerIds.forEach((id) => {
		const createdAt =
			projects.find((p) => p.projectOwner === id)?.createdAt ??
			new Date();
		uniqueOwners.push(
			new User({
				id: id,
				firstSeen: createdAt,
				lastActive: createdAt,
				totalPoolsParticipated: 0,
				totalStaked: 0n,
			})
		);
	});

	// Insert users using ctx.store (will handle duplicates automatically)
	await ctx.store.save(uniqueOwners);

	console.log("New projects: ", projects.length);
	await ctx.store.save(projects);

	// TODO: add fallback mechanism: add to queue if prismaClient fails
});
