import { ethers } from "ethers";
import { prismaClient, logger, ethersProvider } from "../../singletons";
import { selectedChain } from "../../config";
import { normalizeAddress } from "../../utils";

export async function snapshotPlatformMetrics(): Promise<void> {
	// Fetch, process, calculate needed data
	// Write data to PlatformMetricsSnapshots table using prismaClient or typeOrmDB
}
