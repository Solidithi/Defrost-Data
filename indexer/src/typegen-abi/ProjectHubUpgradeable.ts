import * as p from "@subsquid/evm-codec";
import { event, fun, viewFun, indexed, ContractBase } from "@subsquid/evm-abi";
import type {
	EventParams as EParams,
	FunctionArguments,
	FunctionReturn,
} from "@subsquid/evm-abi";

export const events = {
	Initialized: event(
		"0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2",
		"Initialized(uint64)",
		{ version: p.uint64 }
	),
	OwnershipTransferred: event(
		"0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
		"OwnershipTransferred(address,address)",
		{ previousOwner: indexed(p.address), newOwner: indexed(p.address) }
	),
	VAssetMappingUpdated: event(
		"0x53b4841fe6b1c42ef57b78111df1f77f065ec7a60dd0bfb84c43159919ba0c3e",
		"VAssetMappingUpdated(address,address)",
		{ vAsset: indexed(p.address), nativeAsset: indexed(p.address) }
	),
};

export const functions = {
	MULTICALL_SENDER_SLOT: viewFun(
		"0x6254eceb",
		"MULTICALL_SENDER_SLOT()",
		{},
		p.bytes32
	),
	createLaunchpool: fun(
		"0x7007ff24",
		"createLaunchpool((uint64,uint256,address,address,uint128,uint128,uint256,uint128[],uint256[]))",
		{
			_params: p.struct({
				projectId: p.uint64,
				projectTokenAmount: p.uint256,
				projectToken: p.address,
				vAsset: p.address,
				startBlock: p.uint128,
				endBlock: p.uint128,
				maxVTokensPerStaker: p.uint256,
				changeBlocks: p.array(p.uint128),
				emissionRateChanges: p.array(p.uint256),
			}),
		},
		p.uint64
	),
	createProject: fun("0xc7b96dba", "createProject()", {}),
	initialize: fun("0x4a200fa5", "initialize(address,address[],address[])", {
		_initialOwner: p.address,
		_initialVAssets: p.array(p.address),
		_initialNativeAssets: p.array(p.address),
	}),
	nextPoolId: viewFun("0x18e56131", "nextPoolId()", {}, p.uint64),
	nextProjectId: viewFun("0xe935b7b1", "nextProjectId()", {}, p.uint64),
	owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
	pools: viewFun(
		"0x89a5f084",
		"pools(uint64)",
		{ _0: p.uint64 },
		{
			poolId: p.uint64,
			poolType: p.uint8,
			poolAddress: p.address,
			projectId: p.uint64,
		}
	),
	projects: viewFun(
		"0x4aa3a56d",
		"projects(uint64)",
		{ _0: p.uint64 },
		{ projectId: p.uint64, projectOwner: p.address }
	),
	removeVAssetSupport: fun("0x43a342a9", "removeVAssetSupport(address)", {
		_vAsset: p.address,
	}),
	renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}),
	selfMultiCall: fun(
		"0xfade8dba",
		"selfMultiCall(bytes[])",
		{ callPayloadBatch: p.array(p.bytes) },
		p.array(p.bytes)
	),
	setNativeAssetForVAsset: fun(
		"0x2ee63c26",
		"setNativeAssetForVAsset(address,address)",
		{ _vAsset: p.address, _nativeAsset: p.address }
	),
	transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {
		newOwner: p.address,
	}),
	vAssetToNativeAsset: viewFun(
		"0x52ebac8f",
		"vAssetToNativeAsset(address)",
		{ _0: p.address },
		p.address
	),
};

export class Contract extends ContractBase {
	MULTICALL_SENDER_SLOT() {
		return this.eth_call(functions.MULTICALL_SENDER_SLOT, {});
	}

	nextPoolId() {
		return this.eth_call(functions.nextPoolId, {});
	}

	nextProjectId() {
		return this.eth_call(functions.nextProjectId, {});
	}

	owner() {
		return this.eth_call(functions.owner, {});
	}

	pools(_0: PoolsParams["_0"]) {
		return this.eth_call(functions.pools, { _0 });
	}

	projects(_0: ProjectsParams["_0"]) {
		return this.eth_call(functions.projects, { _0 });
	}

	vAssetToNativeAsset(_0: VAssetToNativeAssetParams["_0"]) {
		return this.eth_call(functions.vAssetToNativeAsset, { _0 });
	}
}

/// Event types
export type InitializedEventArgs = EParams<typeof events.Initialized>;
export type OwnershipTransferredEventArgs = EParams<
	typeof events.OwnershipTransferred
>;
export type VAssetMappingUpdatedEventArgs = EParams<
	typeof events.VAssetMappingUpdated
>;

/// Function types
export type MULTICALL_SENDER_SLOTParams = FunctionArguments<
	typeof functions.MULTICALL_SENDER_SLOT
>;
export type MULTICALL_SENDER_SLOTReturn = FunctionReturn<
	typeof functions.MULTICALL_SENDER_SLOT
>;

export type CreateLaunchpoolParams = FunctionArguments<
	typeof functions.createLaunchpool
>;
export type CreateLaunchpoolReturn = FunctionReturn<
	typeof functions.createLaunchpool
>;

export type CreateProjectParams = FunctionArguments<
	typeof functions.createProject
>;
export type CreateProjectReturn = FunctionReturn<
	typeof functions.createProject
>;

export type InitializeParams = FunctionArguments<typeof functions.initialize>;
export type InitializeReturn = FunctionReturn<typeof functions.initialize>;

export type NextPoolIdParams = FunctionArguments<typeof functions.nextPoolId>;
export type NextPoolIdReturn = FunctionReturn<typeof functions.nextPoolId>;

export type NextProjectIdParams = FunctionArguments<
	typeof functions.nextProjectId
>;
export type NextProjectIdReturn = FunctionReturn<
	typeof functions.nextProjectId
>;

export type OwnerParams = FunctionArguments<typeof functions.owner>;
export type OwnerReturn = FunctionReturn<typeof functions.owner>;

export type PoolsParams = FunctionArguments<typeof functions.pools>;
export type PoolsReturn = FunctionReturn<typeof functions.pools>;

export type ProjectsParams = FunctionArguments<typeof functions.projects>;
export type ProjectsReturn = FunctionReturn<typeof functions.projects>;

export type RemoveVAssetSupportParams = FunctionArguments<
	typeof functions.removeVAssetSupport
>;
export type RemoveVAssetSupportReturn = FunctionReturn<
	typeof functions.removeVAssetSupport
>;

export type RenounceOwnershipParams = FunctionArguments<
	typeof functions.renounceOwnership
>;
export type RenounceOwnershipReturn = FunctionReturn<
	typeof functions.renounceOwnership
>;

export type SelfMultiCallParams = FunctionArguments<
	typeof functions.selfMultiCall
>;
export type SelfMultiCallReturn = FunctionReturn<
	typeof functions.selfMultiCall
>;

export type SetNativeAssetForVAssetParams = FunctionArguments<
	typeof functions.setNativeAssetForVAsset
>;
export type SetNativeAssetForVAssetReturn = FunctionReturn<
	typeof functions.setNativeAssetForVAsset
>;

export type TransferOwnershipParams = FunctionArguments<
	typeof functions.transferOwnership
>;
export type TransferOwnershipReturn = FunctionReturn<
	typeof functions.transferOwnership
>;

export type VAssetToNativeAssetParams = FunctionArguments<
	typeof functions.vAssetToNativeAsset
>;
export type VAssetToNativeAssetReturn = FunctionReturn<
	typeof functions.vAssetToNativeAsset
>;
