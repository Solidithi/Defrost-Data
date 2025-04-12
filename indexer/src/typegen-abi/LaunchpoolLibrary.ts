import * as p from "@subsquid/evm-codec";
import { event, fun, viewFun, indexed, ContractBase } from "@subsquid/evm-abi";
import type {
	EventParams as EParams,
	FunctionArguments,
	FunctionReturn,
} from "@subsquid/evm-abi";

export const events = {
	LaunchpoolCreated: event(
		"0x9574e12b40ffbb140b76a06609bf8507d243b9b7d910fe5a228c4a5bcfc5ebdb",
		"LaunchpoolCreated(uint64,uint8,uint64,address,address,address,uint128,uint128)",
		{
			projectId: indexed(p.uint64),
			poolType: indexed(p.uint8),
			poolId: p.uint64,
			projectToken: p.address,
			vAsset: indexed(p.address),
			poolAddress: p.address,
			startBlock: p.uint128,
			endBlock: p.uint128,
		}
	),
};

export class Contract extends ContractBase {}

/// Event types
export type LaunchpoolCreatedEventArgs = EParams<
	typeof events.LaunchpoolCreated
>;
