import { normalizeAddress } from "../utils";
import { Chain, ChainName } from "./type";

export const availableChains: Record<ChainName, Chain> = {
	ethereum: {
		chainId: 1,
		name: "ethereum",
		squidGateway: "https://v2.archive.subsquid.io/network/ethereum-mainnet",
		rpc: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
		blockTime: 12,
		tokens: [],
		indexFromBlock: 1,
	},
	moonbase_alpha: {
		chainId: 1287,
		name: "moonbase_alpha",
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
				name: "Voucher Imaginary",
				decimals: 18,
			},
			{
				address: normalizeAddress(
					"0x7a4ebae8ca815b9f52f23a8ac9a2f707d4d4ff81"
				),
				symbol: "NAT",
				name: "Native Token",
				decimals: 18,
			},
		],
		indexFromBlock: 11726378,
	},
	sepolia: {
		chainId: 11155111,
		name: "sepolia",
		blockTime: 12,
		squidGateway: "",
		rpc: "",
		tokens: [],
		indexFromBlock: 1,
	},
};

/** @dev Change this to choose the chain on which the indexer will run */
const selectedChainName: ChainName = "moonbase_alpha";

export const selectedChain = availableChains[selectedChainName];
