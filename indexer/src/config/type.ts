export type ChainName = "moonbase_alpha" | "ethereum" | "sepolia";

export type Chain = {
	chainId: number;
	name: ChainName;
	squidGateway: string;
	rpc: string;
	blockTime: number;
	indexFromBlock: number;
	observedContracts?: {
		ProjectHubUpgradeableProxy?: string;
	};
	tokens: {
		address: string;
		symbol: string;
		name: string;
		decimals: number;
		alias?: string; // Optional alias (for development purpose), e.g. "mockProjectToken"
	}[];
};
