import { Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { User, Project } from "../model/generated";
import { selectedChain } from "../config";
import * as projectLibraryAbi from "../typegen-abi/ProjectLibrary";
import { normalizeAddress } from "../utils";
import { In } from "typeorm";
import { logger } from "../singletons";

export async function handleProjectCreated(
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
		const { projectId, projectOwner: ownerAddress } =
			projectLibraryAbi.events.ProjectCreated.decode(log);
		projects.push(
			new Project({
				id: projectId.toString(),
				chainId: selectedChain.chainID,
				createdAt: new Date(log.block.timestamp),
				owner: { id: normalizeAddress(ownerAddress) } as User,
				txHash: log.getTransaction().hash,
			})
		);
	}

	// Extract unique project owners
	const uniqueAddresses = new Set<string>(projects.map((p) => p.owner.id));
	const existingUsers: User[] = await ctx.store.findBy(User, {
		id: In(Array.from(uniqueAddresses)),
	});
	logger.info(`Existing users: ${existingUsers.length}`);

	// Create a map for fast lookups
	const usersToSave: User[] = [...existingUsers];

	// Update existing users
	for (const existingUser of existingUsers) {
		const createdAt =
			projects.find((p) => p.owner.id === existingUser.id)?.createdAt ??
			new Date();
		existingUser.lastActive = createdAt;
		uniqueAddresses.delete(existingUser.id);
	}

	// Handle new users
	logger.info(`New users: ${uniqueAddresses.size}`);
	for (const newAddress of uniqueAddresses) {
		const createdAt =
			projects.find((p) => p.owner.id === newAddress)?.createdAt ??
			new Date();
		usersToSave.push(
			new User({
				id: newAddress,
				firstSeen: createdAt,
				lastActive: createdAt,
				totalPoolsParticipated: 0,
				totalStaked: 0n,
			})
		);
	}

	logger.info(`Total users to save: ${usersToSave.length}`);
	logger.info(`New projects: ${projects.length}`);

	// Insert users using ctx.store (outside any loop)
	try {
		await ctx.store.save(usersToSave);
		await ctx.store.save(projects);
		return {
			topic0: projectLibraryAbi.events.ProjectCreated.topic,
			success: true,
			error: null,
			unprocessedLogs: [],
		};
	} catch (e) {
		logger.error(`Error saving projects: ${e}`);
		return {
			topic0: projectLibraryAbi.events.ProjectCreated.topic,
			success: false,
			error: `Error saving projects: ${e}`,
			unprocessedLogs: pendingLogs,
		};
	}
}
