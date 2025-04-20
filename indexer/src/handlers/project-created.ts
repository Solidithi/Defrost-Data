import { BlockData, Log, DataHandlerContext } from "@subsquid/evm-processor";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import { User, Project } from "../model/generated";
import { selectedChain } from "../config";
import * as projectLibraryAbi from "../typegen-abi/ProjectLibrary";

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
		const { projectId, projectOwner } =
			projectLibraryAbi.events.ProjectCreated.decode(log);
		projects.push(
			new Project({
				id: projectId.toString(),
				chainId: selectedChain.chainId,
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
