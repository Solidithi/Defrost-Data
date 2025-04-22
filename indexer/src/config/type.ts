export type ChainID = 1 | 1287 | 11155111;
export type ChainName = "moonbase_alpha" | "ethereum" | "sepolia";

export type Chain = {
	chainID: ChainID;
	chainName: ChainName;
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
