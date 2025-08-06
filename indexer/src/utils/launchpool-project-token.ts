import { selectedChain } from "../config";
import { cacheStore, ethersProvider } from "../singletons";
import { ethers } from "ethers";

/**
 * Caches the project token decimals until the launchpool end date.
 * @param projectTokenAddress The address of the project token.
 * @param projectTokenDecimals The decimals of the project token.
 * @param launchpoolEndBlock The end block of the launchpool.
 */
export async function cacheProjectTokenDecimalsTilLauncpoolEnd(
	projectTokenAddress: string,
	projectTokenDecimals: number,
	launchpoolEndBlock: bigint,
	currentBlock: bigint
): Promise<void> {
	// calculate TTL based on pool end date
	// Cache projectTokenDecimals for fast access later (e.g. ProjectTokensClaimed event processing)
	const launchpoolRemainingSeconds =
		Math.max(Number(launchpoolEndBlock - currentBlock), 0) *
		selectedChain.blockTime;

	await cacheStore.saveTokenInfoField(
		projectTokenAddress,
		"decimals",
		projectTokenDecimals.toString(),
		launchpoolRemainingSeconds + 86400 // Add 1 day to make sure
	);
}

/**
 * Get and cache the project token decimals until the launchpool end block.
 * @param projectTokenAddress The address of the project token.
 * @param launchpoolEndBlock The end block of the launchpool.
 * @returns
 */
export async function getAndCacheProjectTokenDecimals(
	projectTokenAddress: string,
	launchpoolEndBlock: bigint,
	currentBlock: bigint
): Promise<number> {
	let projectTokenDecimals = (await cacheStore.getTokenInfo(
		projectTokenAddress,
		"decimals"
	)) as number | null;

	// Fetch project token decimals from blockchain if not cached
	if (!projectTokenDecimals) {
		const decimalsAbi = [
			{
				type: "function",
				name: "decimals",
				inputs: [],
				outputs: [
					{
						name: "",
						type: "uint8",
						internalType: "uint8",
					},
				],
				stateMutability: "view",
			},
		];
		const tokenContract = new ethers.Contract(
			projectTokenAddress,
			decimalsAbi,
			ethersProvider
		);
		projectTokenDecimals = await tokenContract.decimals();

		await cacheProjectTokenDecimalsTilLauncpoolEnd(
			projectTokenAddress,
			projectTokenDecimals,
			launchpoolEndBlock,
			currentBlock
		);
	}

	return projectTokenDecimals;
}
