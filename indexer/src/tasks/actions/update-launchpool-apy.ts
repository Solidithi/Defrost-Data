import { ContractTransactionReceipt, ethers } from "ethers";
import { prismaClient, logger, ethersProvider } from "../../singletons";
import { selectedChain } from "../../config";
import { abi as launchpoolABI } from "../../../abi/Launchpool.json";
import { abi as IERC20MetadataABI } from "../../../abi/IERC20Metadata.json";
import { normalizeAddress } from "../../utils";

export async function updateLaunchpoolAPY(poolAddress: string): Promise<void> {
	poolAddress = normalizeAddress(poolAddress);

	console.debug("Pool address is: ", poolAddress);
	console.debug("Ethers provider is: ", ethersProvider);

	console.log("Fetching total staked and project token address from DB");
	const {
		total_staked: totalNativeStaked,
		project_token_address: projectTokenAddr,
		native_asset_address: nativeTokenAddr,
	} = await prismaClient.launchpool.findFirst({
		where: {
			pool_address: poolAddress,
		},
		select: {
			total_staked: true,
			project_token_address: true,
			native_asset_address: true,
		},
	});

	if (!totalNativeStaked) {
		throw new Error(
			`Pool ${poolAddress} not found in database. Cannot update APY.`
		);
	}
	if (!projectTokenAddr) {
		throw new Error(
			`Project token address not found for pool ${poolAddress}. Cannot update APY.`
		);
	}
	if (!nativeTokenAddr) {
		throw new Error(
			`Native token address not found for pool ${poolAddress}. Cannot update APY.`
		);
	}

	console.log("Initializing contract instances:... ");
	const launchpoolContract = new ethers.Contract(
		poolAddress,
		launchpoolABI,
		ethersProvider
	);

	const pTokenMetadataContract = new ethers.Contract(
		projectTokenAddr,
		IERC20MetadataABI,
		ethersProvider
	);

	console.log("Fetching project token decimals...");
	const pTokenDecimals = Number(await pTokenMetadataContract.decimals());
	if (!pTokenDecimals) {
		throw new Error(
			`Project token decimals not found for pool ${poolAddress}. Cannot update APY.`
		);
	}
	console.log("Project token decimals:", pTokenDecimals);

	console.log("Fetching native tokens decimals...");
	const nativeTokenDecimals = selectedChain.tokens.find(
		(token) => token.address === normalizeAddress(nativeTokenAddr)
	)?.decimals;

	if (!nativeTokenDecimals) {
		throw new Error(
			`Native token decimals not found for pool ${poolAddress}. Cannot update APY.`
		);
	}
	console.log("Native token decimals:", nativeTokenDecimals);

	console.log("Fetching lastEmissionRate and totalNativeStaked...");
	const latestEmissionRate: bigint =
		await launchpoolContract.getEmissionRate();
	const totalNativeStake = await launchpoolContract.totalNativeStake();
	console.log("Latest emission rate:", latestEmissionRate);
	console.log("Total native staked:", totalNativeStake);

	const newAPY = calcProjectTokenAPY(
		latestEmissionRate,
		totalNativeStake,
		Number(pTokenDecimals),
		Number(nativeTokenDecimals)
	);

	logger.info(`Is debug level enabled: ${logger.isLevelEnabled("debug")}`);
	logger.info(`Is trace level enabled: ${logger.isLevelEnabled("trace")}`);
	logger.info(`New APY: ${newAPY}%`);

	const affected = await prismaClient.launchpool.updateMany({
		data: {
			staker_apy: newAPY,
		},
		where: {
			pool_address: poolAddress,
		},
	});
	console.log(`Updated ${affected.count} rows in launchpool for new APY`);
}

function calcProjectTokenAPY(
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

	const blocksPerYear = (365 * 24 * 60 * 60) / selectedChain.blockTime;

	// Calculate yearly emission
	const yearlyEmission = emissionRate * BigInt(blocksPerYear);
	const yearlyEmissionNum = Number(
		ethers.formatUnits(yearlyEmission, pTokenDecimals)
	); // Assuming 18 decimals for the token (change later)
	const totalStakedNum = Number(
		ethers.formatUnits(totalStaked, nativeTokenDecimals)
	); // Assuming 18 decimals for the token (change later)

	const apy = (yearlyEmissionNum / totalStakedNum) * 100;
	return apy;
}
