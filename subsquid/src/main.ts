import { EvmBatchProcessor } from "@subsquid/evm-processor";
import { prismaClient } from "@/lib";
import * as Launchpool from "@/subsquid/src/typegen-abi/Launchpool";
// import { TypeormDatabase } from '@subsquid/typeorm-store'
// import * as usdtAbi from './abi/usdt'
// import { Transfer } from './model'

const processor = new EvmBatchProcessor()
	.setGateway("https://v2.archive.subsquid.io/network/ethereum-mainnet")
	.setRpcEndpoint({
		url: process.env.RPC_MOONBASE_ALHA_URL || "",
		rateLimit: 10,
	})
	.setFinalityConfirmation(75) // 15 mins to finality
	.addLog({
		address: ["0xdAC17F958D2ee523a2206206994597C13D831ec7"],
		// topic0: [LaunchpoolAbi.events.Transfer.topic],
		topic0: [Launchpool.events.Staked.topic[0]],
	});
