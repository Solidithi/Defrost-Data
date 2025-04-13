export const chains: Record<ChainName, Chain> = {
	ethereum: {
		chainId: 1,
		squidGateway: "https://v2.archive.subsquid.io/network/ethereum-mainnet",
		rpc: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
		blockTime: 12,
	},
	moonbase_alpha: {
		chainId: 1287,
		blockTime: 6,
		squidGateway: "https://v2.archive.subsquid.io/network/moonbase-testnet",
		rpc: "https://rpc.api.moonbase.moonbeam.network",
		contracts: {
			ProjectHubUpgradeableProxy:
				"0x6967668D0A57f3797ed86FcDC0eac7751F95eB9B".toLowerCase(),
		},
	},
	sepolia: {
		chainId: 11155111,
		blockTime: 12,
		squidGateway: "",
		rpc: "",
	},
};

export type ChainName = "moonbase_alpha" | "ethereum" | "sepolia";
export type Chain = {
	chainId: number;
	squidGateway: string;
	rpc: string;
	blockTime: number;
	contracts?: {
		ProjectHubUpgradeableProxy?: string;
	};
};
