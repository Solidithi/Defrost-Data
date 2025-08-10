import { ethers } from "ethers";
import { prismaClient, logger, ethersProvider } from "../../singletons";
import { selectedChain } from "../../config";
import { abi as launchpoolABI } from "../../../abi/Launchpool.json";
import { normalizeAddress } from "../../utils";
import { getAndCacheProjectTokenDecimals } from "../../utils/launchpool-project-token";

export async function updateLaunchpoolAPR(
	poolAddress: string,
	snapshotBlockNum: number
): Promise<void> {
	const normalizedPoolAddress = normalizeAddress(poolAddress);

	logger.debug("Pool address is: ", normalizedPoolAddress);
	logger.debug("Ethers provider is: ", ethersProvider);
	logger.debug("Fetching total staked and project token address from DB");

	const currDatetime = new Date();

	try {
		prismaClient.$transaction(async (tx) => {
			const {
				total_staked: totalNativeStaked,
				project_token_address: projectTokenAddr,
				native_asset_address: nativeTokenAddr,
				end_block: launchpoolEndBlock,
			} = await tx.launchpool.findUnique({
				where: {
					id: normalizedPoolAddress,
				},
				select: {
					total_staked: true,
					project_token_address: true,
					native_asset_address: true,
					end_block: true,
				},
			});

			if (!totalNativeStaked) {
				throw new Error(
					`Pool ${normalizedPoolAddress} not found in database. Cannot update APY.`
				);
			}
			if (!projectTokenAddr) {
				throw new Error(
					`Project token address not found for pool ${normalizedPoolAddress}. Cannot update APY.`
				);
			}
			if (!nativeTokenAddr) {
				throw new Error(
					`Native token address not found for pool ${normalizedPoolAddress}. Cannot update APY.`
				);
			}

			let pTokenDecimals: number;
			try {
				pTokenDecimals = await getAndCacheProjectTokenDecimals(
					projectTokenAddr,
					BigInt(launchpoolEndBlock.toString()),
					BigInt(snapshotBlockNum)
				);
				logger.trace("Project token decimals:", pTokenDecimals);
			} catch (error) {
				throw new Error(
					`Failed to fetch project token decimals for ${projectTokenAddr}`
				);
			}

			logger.trace("Fetching native tokens decimals...");
			const nativeTokenDecimals = selectedChain.tokens.find(
				(token) => token.address === normalizeAddress(nativeTokenAddr)
			)?.decimals;

			if (!nativeTokenDecimals) {
				throw new Error(
					`Native token decimals not found for pool ${normalizedPoolAddress}. Cannot update APY.`
				);
			}
			logger.trace("Native token decimals:", nativeTokenDecimals);

			logger.trace("Initializing contract instances:... ");
			const launchpoolContract = new ethers.Contract(
				normalizedPoolAddress,
				launchpoolABI,
				ethersProvider
			);
			logger.trace(
				"Fetching pool tokenomics from contract for pool address:",
				normalizedPoolAddress
			);
			const [
				totalNativeStake,
				totalVTokenStake, // not used for not, might use later
				projectTokenReserve,
				latestEmissionRate,
				projectTokenExchangeRate,
				nativeTokenExchangeRate,
			] = await launchpoolContract.getPoolTokenomics();
			logger.debug("Latest emission rate:", latestEmissionRate);
			logger.debug("Total native staked:", totalNativeStake);

			const newStakerAPR = calcStakerAPR(
				latestEmissionRate as bigint,
				totalNativeStake as bigint,
				Number(pTokenDecimals),
				Number(nativeTokenDecimals)
			);

			logger.trace(`New staker APY: ${newStakerAPR}%`);

			// Update the launchpool with the new staker APR
			await tx.launchpool.update({
				data: {
					staker_apy: newStakerAPR,
				},
				where: {
					id: normalizedPoolAddress,
				},
			});

			// Snapshot launchpool project token exchange rate + staker's APR
			await tx.launchpool_project_ex_rate_snapshot.create({
				data: {
					id: `${currDatetime.getTime()}-${snapshotBlockNum}-${normalizedPoolAddress}`,
					block_number: snapshotBlockNum,
					project_token_exchange_rate: (
						projectTokenExchangeRate as bigint
					).toString(),
					staker_apr: newStakerAPR,
					timestamp: currDatetime,
					launchpool_id: normalizedPoolAddress,
				},
			});
		});
		// Re-throw the error to be handled by the caller
		logger.info(
			`Successfully updated launchpool APR for pool ${normalizedPoolAddress} at block ${snapshotBlockNum}`
		);
	} catch (error) {
		logger.error(
			error,
			`Failed to update launchpool APR for pool ${normalizedPoolAddress} at block ${snapshotBlockNum}`
		);
	}
}

/**
 *
 * Calculate the APR for stakers based on the emission rate, total staked amount, and token decimals.
 * @param emissionRate
 * @param totalStaked
 * @param pTokenDecimals
 * @param nativeTokenDecimals
 * @returns
 */
export function calcStakerAPR(
	emissionRate: bigint,
	totalStaked: bigint,
	pTokenDecimals: number,
	nativeTokenDecimals: number
): number {
	if (!pTokenDecimals) {
		throw new Error("Project token decimals not provided");
	}
	if (!nativeTokenDecimals) {
		throw new Error("Native token decimals not provided");
	}

	const blocksPerYear = (365 * 24 * 60 * 60) / selectedChain.blockTime; // seconds

	// Calculate yearly emission
	const yearlyEmission = emissionRate * BigInt(blocksPerYear);
	const yearlyEmissionNum = Number(
		ethers.formatUnits(yearlyEmission, pTokenDecimals)
	);
	const totalStakedNum = Number(
		ethers.formatUnits(totalStaked, nativeTokenDecimals)
	);

	const apy = (yearlyEmissionNum / totalStakedNum) * 100;
	return apy;
}

// TODO
function calcOwnerAPR(): number {
	return 100;
}
