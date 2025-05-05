import { normalizeAddress } from "../utils";
import { Chain, ChainID } from "./type";

export const availableChains: Record<ChainID, Chain> = {
	1: {
		chainID: 1,
		chainName: "Ethereum",
		squidGateway: "https://v2.archive.subsquid.io/network/ethereum-mainnet",
		rpc: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
		blockTime: 12,
		tokens: [],
		indexFromBlock: 1,
	},
	1287: {
		chainID: 1287,
		chainName: "Moonbase Alpha Testnet",
		blockTime: 6,
		squidGateway: "https://v2.archive.subsquid.io/network/moonbase-testnet",
		rpc: "https://rpc.api.moonbase.moonbeam.network",
		observedContracts: {
			ProjectHubUpgradeableProxy: normalizeAddress(
				"0xB8618EaEEbFf1c817e3DD32A2e27Ece62C9d2317"
			),
		},
		tokens: [
			{
				alias: "MockVToken",
				address: normalizeAddress(
					"0xd02d73e05b002cb8eb7bef9df8ed68ed39752465"
				),
				symbol: "VI",
				id: "voucher-dot",
				name: "Voucher Imaginary",
				decimals: 10,
			},
			{
				address: normalizeAddress(
					"0x7a4ebae8ca815b9f52f23a8ac9a2f707d4d4ff81"
				),
				symbol: "NAT",
				id: "bifrost-voucher-astr~",
				name: "Native Token",
				decimals: 10,
			},
		],
		indexFromBlock: 11810481,
	},
	11155111: {
		chainID: 11155111,
		chainName: "Sepolia Testnet",
		blockTime: 12,
		squidGateway: "",
		rpc: "",
		tokens: [],
		indexFromBlock: 1,
	},
};

/** @dev Change this to choose the chain on which the indexer will run */
const selectedChainID: ChainID = 1287; // Moonbase Alpha

export const selectedChain = availableChains[selectedChainID];
