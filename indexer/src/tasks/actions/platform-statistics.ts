// import { DataHandlerContext, Log } from "@subsquid/evm-processor";
// import { Store } from "@subsquid/typeorm-store";
// import { PlatformStatistics, Project, Launchpool, User } from "../model";
// import { rawDB } from "../singletons";
// import { MoreThan } from "typeorm";

// export async function updatePlatformStatistics(
// 	ctx: DataHandlerContext<Store>,
// 	pendingLogs: Log[],
// 	moreProps?: object
// ): Promise<{
// 	success: boolean;
// 	error: string | null;
// 	startedAt: Date;
// 	endedAt: Date;
// 	// unprocessedLogs: Log[];
// }> {
// 	const startedAt = new Date();

// 	// Get row count
// 	const rowCount = 0;
// 	let totalPools = 0;

// 	const totalProjects = await ctx.store.count(Project);
// 	const totalLaunchpools = await ctx.store.count(Launchpool);
// 	totalPools += totalLaunchpools;

// 	const uniqueUsers = await ctx.store.count(User);
// 	const dailyActiveUsers = await ctx.store.count(User, {
// 		where: {
// 			lastActive: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
// 		},
// 	});

// 	// TVL in USD
// 	let TVL = 0;

// 	const totalLaunchpoolStakeByVAsset = await rawDB
// 		.getRepository(Launchpool)
// 		.createQueryBuilder("launchpool")
// 		.select("launchpool.nativeAssetAddress", "cryptoAddress")
// 		.addSelect("SUM(launchpool.totalStaked)", "cryptoAmount")
// 		.groupBy("launchpool.nativeAssetAddress")
// 		.getRawMany();

// 	const totalTransactions =

// 	let usdValues = await getUSDValues(totalLaunchpoolStakeByVAsset);
// 	TVL += usdValues.reduce((sum, { USDAmount }) => sum + USDAmount, 0);

// 	try {
// 		const platformStatistics = new PlatformStatistics({
// 			id: String(rowCount + 1),
// 			date: new Date(),
// 			dailyActiveUsers,
// 			totalPools,
// 			totalProjects,
// 			totalStakedValue: TVL, // rename soon
// 			totalTransactions: 0,
// 			uniqueUsers,
// 		});

// 		await ctx.store.upsert(platformStatistics);
// 	} catch (err) {
// 		// do sth
// 	}

// 	const endedAt = new Date();
// 	return {
// 		success: true,
// 		error: null,
// 		startedAt,
// 		endedAt,
// 	};
// }

// async function getUSDValues(
// 	inputs: { cryptoAddress: string; cryptoAmount: bigint }[]
// ): Promise<
// 	{
// 		cryptoAddress: string;
// 		USDAmount: number;
// 	}[]
// > {
// 	// Mock implementation: simply returns the input addresses with a fixed USD amount
// 	return inputs.map(({ cryptoAddress, cryptoAmount }) => ({
// 		cryptoAddress,
// 		USDAmount: Number(cryptoAmount ?? 0n) * 2, // mock conversion rate
// 	}));
// }
