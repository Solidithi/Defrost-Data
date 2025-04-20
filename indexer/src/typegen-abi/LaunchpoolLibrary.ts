import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    LaunchpoolCreated: event("0x6c2fd29867c02c489edbf2f64902041845d1f68921425b999b9f233155870fba", "LaunchpoolCreated(uint64,uint8,uint64,address,address,address,address,uint128,uint128)", {"projectId": indexed(p.uint64), "poolType": indexed(p.uint8), "poolId": p.uint64, "projectToken": p.address, "vAsset": indexed(p.address), "nativeAsset": p.address, "poolAddress": p.address, "startBlock": p.uint128, "endBlock": p.uint128}),
}

export class Contract extends ContractBase {
}

/// Event types
export type LaunchpoolCreatedEventArgs = EParams<typeof events.LaunchpoolCreated>
