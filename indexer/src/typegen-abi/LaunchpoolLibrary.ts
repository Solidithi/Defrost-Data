import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    LaunchpoolCreated: event("0x61dc01716ac96577ed8bed3d032962de7586eb08f6c84fe7f84648d1d0abe177", "LaunchpoolCreated(uint64,uint8,uint64,address,uint256,address,address,address,uint128,uint128)", {"projectId": indexed(p.uint64), "poolType": indexed(p.uint8), "poolId": p.uint64, "projectToken": p.address, "projectTokenAmount": p.uint256, "vAsset": indexed(p.address), "nativeAsset": p.address, "poolAddress": p.address, "startBlock": p.uint128, "endBlock": p.uint128}),
}

export class Contract extends ContractBase {
}

/// Event types
export type LaunchpoolCreatedEventArgs = EParams<typeof events.LaunchpoolCreated>
