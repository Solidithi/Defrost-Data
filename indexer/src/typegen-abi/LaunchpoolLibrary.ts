import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    LaunchpoolCreated: event("0x2ee2995fcae2ecfecc3d65cc643a584d23788fb36cd3aa7dcda02432532c9cb6", "LaunchpoolCreated(uint64,uint8,uint64,address,uint256,uint8,address,address,address,uint128,uint128)", {"projectId": indexed(p.uint64), "poolType": indexed(p.uint8), "poolId": p.uint64, "projectToken": p.address, "projectTokenAmount": p.uint256, "projectTokenDecimals": p.uint8, "vAsset": indexed(p.address), "nativeAsset": p.address, "poolAddress": p.address, "startBlock": p.uint128, "endBlock": p.uint128}),
}

export class Contract extends ContractBase {
}

/// Event types
export type LaunchpoolCreatedEventArgs = EParams<typeof events.LaunchpoolCreated>
