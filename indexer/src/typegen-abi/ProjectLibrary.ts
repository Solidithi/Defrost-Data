import * as p from "@subsquid/evm-codec";
import { event, fun, viewFun, indexed, ContractBase } from "@subsquid/evm-abi";
import type {
	EventParams as EParams,
	FunctionArguments,
	FunctionReturn,
} from "@subsquid/evm-abi";

export const events = {
	ProjectCreated: event(
		"0xb389127aea3e9b52abcaab568c3d92f16a02cf59d8a8b40a22157c1befb70c46",
		"ProjectCreated(uint64,address)",
		{ projectId: indexed(p.uint64), projectOwner: indexed(p.address) }
	),
};

export class Contract extends ContractBase {}

/// Event types
export type ProjectCreatedEventArgs = EParams<typeof events.ProjectCreated>;
