import { ethers } from "ethers";
import { prismaClient, logger, ethersProvider } from "../../singletons";
import { selectedChain } from "../../config";
import { normalizeAddress } from "../../utils";

/**
 * @notice Don't user console.log in this function. Use logger instead.
 * example: use logger.info("Hello world!") instead of console.log("Hello world!")
 * example2:
 * try {
 * 	// do sth
 * } catch (error) {
 * 	logger.error(error, "Error message");
 * }
 */
export async function snapshotPlatformMetrics(): Promise<void> {
	// Fetch, process, calculate needed data
	// Write data to PlatformMetricsSnapshots table using prismaClient or typeOrmDB
}
