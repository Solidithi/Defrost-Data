import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    Paused: event("0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258", "Paused(address)", {"account": p.address}),
    Staked: event("0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d", "Staked(address,uint256)", {"user": indexed(p.address), "amount": p.uint256}),
    Unpaused: event("0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa", "Unpaused(address)", {"account": p.address}),
    Unstaked: event("0x0f5bb82176feb1b5e747e28471aa92156a04d9f3ab9f45f28e2d704232b93f75", "Unstaked(address,uint256)", {"user": indexed(p.address), "amount": p.uint256}),
}

export const functions = {
    BASE_PRECISION: viewFun("0x72cacb70", "BASE_PRECISION()", {}, p.uint256),
    MAX_DECIMALS: viewFun("0x0417cf8e", "MAX_DECIMALS()", {}, p.uint256),
    ONE_VTOKEN: viewFun("0xbb8afc7b", "ONE_VTOKEN()", {}, p.uint256),
    SCALING_FACTOR: viewFun("0xef4cadc5", "SCALING_FACTOR()", {}, p.uint256),
    acceptedNativeAsset: viewFun("0x8e70fa8c", "acceptedNativeAsset()", {}, p.address),
    acceptedVAsset: viewFun("0x99dc0390", "acceptedVAsset()", {}, p.address),
    avgNativeExRateGradient: viewFun("0xb66a72df", "avgNativeExRateGradient()", {}, p.uint256),
    changeBlocks: viewFun("0x976251e6", "changeBlocks(uint256)", {"_0": p.uint256}, p.uint128),
    claimLeftoverProjectToken: fun("0xab7302bb", "claimLeftoverProjectToken()", {}, ),
    claimOwnerInterest: fun("0x72e48cf3", "claimOwnerInterest()", {}, ),
    claimPlatformFee: fun("0x9c8aea90", "claimPlatformFee()", {}, ),
    cumulativeExchangeRate: viewFun("0x33d8773d", "cumulativeExchangeRate()", {}, p.uint256),
    emissionRateChanges: viewFun("0xb87a6aeb", "emissionRateChanges(uint128)", {"_0": p.uint128}, p.uint256),
    endBlock: viewFun("0x083c6323", "endBlock()", {}, p.uint128),
    getClaimableProjectToken: viewFun("0x80729f17", "getClaimableProjectToken(address)", {"_investor": p.address}, p.uint256),
    getEmissionRate: viewFun("0xc0a77da9", "getEmissionRate()", {}, p.uint256),
    getPoolInfo: viewFun("0x60246c88", "getPoolInfo()", {}, {"_0": p.uint128, "_1": p.uint128, "_2": p.uint256, "_3": p.uint256}),
    getStakerNativeAmount: viewFun("0x7d334107", "getStakerNativeAmount(address)", {"_investor": p.address}, p.uint256),
    getStakingRange: viewFun("0xfce88e6f", "getStakingRange()", {}, {"_0": p.uint256, "_1": p.uint256}),
    getTotalProjectToken: viewFun("0xf73a8b5c", "getTotalProjectToken()", {}, p.uint256),
    getTotalStakedVTokens: viewFun("0x534a9d00", "getTotalStakedVTokens()", {}, p.uint256),
    getWithdrawableVTokens: viewFun("0x5bf0fa89", "getWithdrawableVTokens(uint256)", {"_withdrawnNativeTokens": p.uint256}, p.uint256),
    lastNativeExRate: viewFun("0x9b4f8321", "lastNativeExRate()", {}, p.uint256),
    lastNativeExRateUpdateBlock: viewFun("0xb1f0af1b", "lastNativeExRateUpdateBlock()", {}, p.uint128),
    lastProcessedChangeBlockIndex: viewFun("0xa748afb0", "lastProcessedChangeBlockIndex()", {}, p.uint256),
    maxStakers: viewFun("0x4f7ff503", "maxStakers()", {}, p.uint256),
    maxVAssetPerStaker: viewFun("0x81cadea0", "maxVAssetPerStaker()", {}, p.uint256),
    nativeExRateSampleCount: viewFun("0x06508ebc", "nativeExRateSampleCount()", {}, p.uint128),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    ownerShareOfInterest: viewFun("0x84d38d48", "ownerShareOfInterest()", {}, p.uint128),
    pause: fun("0x8456cb59", "pause()", {}, ),
    paused: viewFun("0x5c975abb", "paused()", {}, p.bool),
    platformAdminAddress: viewFun("0x129989a3", "platformAdminAddress()", {}, p.address),
    platformFeeClaimed: viewFun("0xd065cf8e", "platformFeeClaimed()", {}, p.bool),
    projectToken: viewFun("0x4b60ce77", "projectToken()", {}, p.address),
    recoverWrongToken: fun("0x018bcf5c", "recoverWrongToken(address)", {"_tokenAddress": p.address}, ),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    setXCMOracleAddress: fun("0xaac9ce5c", "setXCMOracleAddress(address)", {"_xcmOracleAddress": p.address}, ),
    stake: fun("0xa694fc3a", "stake(uint256)", {"_vTokenAmount": p.uint256}, ),
    stakers: viewFun("0x9168ae72", "stakers(address)", {"_0": p.address}, {"nativeAmount": p.uint256, "claimOffset": p.uint256}),
    startBlock: viewFun("0x48cd4cb1", "startBlock()", {}, p.uint128),
    tickBlock: viewFun("0xbfc55b8a", "tickBlock()", {}, p.uint128),
    totalNativeStake: viewFun("0x544c2d76", "totalNativeStake()", {}, p.uint256),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
    unpause: fun("0x3f4ba83a", "unpause()", {}, ),
    unstake: fun("0x2e17de78", "unstake(uint256)", {"_vTokenAmount": p.uint256}, ),
    unstakeWithoutProjectToken: fun("0xb64a025e", "unstakeWithoutProjectToken(uint256)", {"_withdrawnVTokens": p.uint256}, ),
    xcmOracle: viewFun("0x6cf56846", "xcmOracle()", {}, p.address),
}

export class Contract extends ContractBase {

    BASE_PRECISION() {
        return this.eth_call(functions.BASE_PRECISION, {})
    }

    MAX_DECIMALS() {
        return this.eth_call(functions.MAX_DECIMALS, {})
    }

    ONE_VTOKEN() {
        return this.eth_call(functions.ONE_VTOKEN, {})
    }

    SCALING_FACTOR() {
        return this.eth_call(functions.SCALING_FACTOR, {})
    }

    acceptedNativeAsset() {
        return this.eth_call(functions.acceptedNativeAsset, {})
    }

    acceptedVAsset() {
        return this.eth_call(functions.acceptedVAsset, {})
    }

    avgNativeExRateGradient() {
        return this.eth_call(functions.avgNativeExRateGradient, {})
    }

    changeBlocks(_0: ChangeBlocksParams["_0"]) {
        return this.eth_call(functions.changeBlocks, {_0})
    }

    cumulativeExchangeRate() {
        return this.eth_call(functions.cumulativeExchangeRate, {})
    }

    emissionRateChanges(_0: EmissionRateChangesParams["_0"]) {
        return this.eth_call(functions.emissionRateChanges, {_0})
    }

    endBlock() {
        return this.eth_call(functions.endBlock, {})
    }

    getClaimableProjectToken(_investor: GetClaimableProjectTokenParams["_investor"]) {
        return this.eth_call(functions.getClaimableProjectToken, {_investor})
    }

    getEmissionRate() {
        return this.eth_call(functions.getEmissionRate, {})
    }

    getPoolInfo() {
        return this.eth_call(functions.getPoolInfo, {})
    }

    getStakerNativeAmount(_investor: GetStakerNativeAmountParams["_investor"]) {
        return this.eth_call(functions.getStakerNativeAmount, {_investor})
    }

    getStakingRange() {
        return this.eth_call(functions.getStakingRange, {})
    }

    getTotalProjectToken() {
        return this.eth_call(functions.getTotalProjectToken, {})
    }

    getTotalStakedVTokens() {
        return this.eth_call(functions.getTotalStakedVTokens, {})
    }

    getWithdrawableVTokens(_withdrawnNativeTokens: GetWithdrawableVTokensParams["_withdrawnNativeTokens"]) {
        return this.eth_call(functions.getWithdrawableVTokens, {_withdrawnNativeTokens})
    }

    lastNativeExRate() {
        return this.eth_call(functions.lastNativeExRate, {})
    }

    lastNativeExRateUpdateBlock() {
        return this.eth_call(functions.lastNativeExRateUpdateBlock, {})
    }

    lastProcessedChangeBlockIndex() {
        return this.eth_call(functions.lastProcessedChangeBlockIndex, {})
    }

    maxStakers() {
        return this.eth_call(functions.maxStakers, {})
    }

    maxVAssetPerStaker() {
        return this.eth_call(functions.maxVAssetPerStaker, {})
    }

    nativeExRateSampleCount() {
        return this.eth_call(functions.nativeExRateSampleCount, {})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    ownerShareOfInterest() {
        return this.eth_call(functions.ownerShareOfInterest, {})
    }

    paused() {
        return this.eth_call(functions.paused, {})
    }

    platformAdminAddress() {
        return this.eth_call(functions.platformAdminAddress, {})
    }

    platformFeeClaimed() {
        return this.eth_call(functions.platformFeeClaimed, {})
    }

    projectToken() {
        return this.eth_call(functions.projectToken, {})
    }

    stakers(_0: StakersParams["_0"]) {
        return this.eth_call(functions.stakers, {_0})
    }

    startBlock() {
        return this.eth_call(functions.startBlock, {})
    }

    tickBlock() {
        return this.eth_call(functions.tickBlock, {})
    }

    totalNativeStake() {
        return this.eth_call(functions.totalNativeStake, {})
    }

    xcmOracle() {
        return this.eth_call(functions.xcmOracle, {})
    }
}

/// Event types
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PausedEventArgs = EParams<typeof events.Paused>
export type StakedEventArgs = EParams<typeof events.Staked>
export type UnpausedEventArgs = EParams<typeof events.Unpaused>
export type UnstakedEventArgs = EParams<typeof events.Unstaked>

/// Function types
export type BASE_PRECISIONParams = FunctionArguments<typeof functions.BASE_PRECISION>
export type BASE_PRECISIONReturn = FunctionReturn<typeof functions.BASE_PRECISION>

export type MAX_DECIMALSParams = FunctionArguments<typeof functions.MAX_DECIMALS>
export type MAX_DECIMALSReturn = FunctionReturn<typeof functions.MAX_DECIMALS>

export type ONE_VTOKENParams = FunctionArguments<typeof functions.ONE_VTOKEN>
export type ONE_VTOKENReturn = FunctionReturn<typeof functions.ONE_VTOKEN>

export type SCALING_FACTORParams = FunctionArguments<typeof functions.SCALING_FACTOR>
export type SCALING_FACTORReturn = FunctionReturn<typeof functions.SCALING_FACTOR>

export type AcceptedNativeAssetParams = FunctionArguments<typeof functions.acceptedNativeAsset>
export type AcceptedNativeAssetReturn = FunctionReturn<typeof functions.acceptedNativeAsset>

export type AcceptedVAssetParams = FunctionArguments<typeof functions.acceptedVAsset>
export type AcceptedVAssetReturn = FunctionReturn<typeof functions.acceptedVAsset>

export type AvgNativeExRateGradientParams = FunctionArguments<typeof functions.avgNativeExRateGradient>
export type AvgNativeExRateGradientReturn = FunctionReturn<typeof functions.avgNativeExRateGradient>

export type ChangeBlocksParams = FunctionArguments<typeof functions.changeBlocks>
export type ChangeBlocksReturn = FunctionReturn<typeof functions.changeBlocks>

export type ClaimLeftoverProjectTokenParams = FunctionArguments<typeof functions.claimLeftoverProjectToken>
export type ClaimLeftoverProjectTokenReturn = FunctionReturn<typeof functions.claimLeftoverProjectToken>

export type ClaimOwnerInterestParams = FunctionArguments<typeof functions.claimOwnerInterest>
export type ClaimOwnerInterestReturn = FunctionReturn<typeof functions.claimOwnerInterest>

export type ClaimPlatformFeeParams = FunctionArguments<typeof functions.claimPlatformFee>
export type ClaimPlatformFeeReturn = FunctionReturn<typeof functions.claimPlatformFee>

export type CumulativeExchangeRateParams = FunctionArguments<typeof functions.cumulativeExchangeRate>
export type CumulativeExchangeRateReturn = FunctionReturn<typeof functions.cumulativeExchangeRate>

export type EmissionRateChangesParams = FunctionArguments<typeof functions.emissionRateChanges>
export type EmissionRateChangesReturn = FunctionReturn<typeof functions.emissionRateChanges>

export type EndBlockParams = FunctionArguments<typeof functions.endBlock>
export type EndBlockReturn = FunctionReturn<typeof functions.endBlock>

export type GetClaimableProjectTokenParams = FunctionArguments<typeof functions.getClaimableProjectToken>
export type GetClaimableProjectTokenReturn = FunctionReturn<typeof functions.getClaimableProjectToken>

export type GetEmissionRateParams = FunctionArguments<typeof functions.getEmissionRate>
export type GetEmissionRateReturn = FunctionReturn<typeof functions.getEmissionRate>

export type GetPoolInfoParams = FunctionArguments<typeof functions.getPoolInfo>
export type GetPoolInfoReturn = FunctionReturn<typeof functions.getPoolInfo>

export type GetStakerNativeAmountParams = FunctionArguments<typeof functions.getStakerNativeAmount>
export type GetStakerNativeAmountReturn = FunctionReturn<typeof functions.getStakerNativeAmount>

export type GetStakingRangeParams = FunctionArguments<typeof functions.getStakingRange>
export type GetStakingRangeReturn = FunctionReturn<typeof functions.getStakingRange>

export type GetTotalProjectTokenParams = FunctionArguments<typeof functions.getTotalProjectToken>
export type GetTotalProjectTokenReturn = FunctionReturn<typeof functions.getTotalProjectToken>

export type GetTotalStakedVTokensParams = FunctionArguments<typeof functions.getTotalStakedVTokens>
export type GetTotalStakedVTokensReturn = FunctionReturn<typeof functions.getTotalStakedVTokens>

export type GetWithdrawableVTokensParams = FunctionArguments<typeof functions.getWithdrawableVTokens>
export type GetWithdrawableVTokensReturn = FunctionReturn<typeof functions.getWithdrawableVTokens>

export type LastNativeExRateParams = FunctionArguments<typeof functions.lastNativeExRate>
export type LastNativeExRateReturn = FunctionReturn<typeof functions.lastNativeExRate>

export type LastNativeExRateUpdateBlockParams = FunctionArguments<typeof functions.lastNativeExRateUpdateBlock>
export type LastNativeExRateUpdateBlockReturn = FunctionReturn<typeof functions.lastNativeExRateUpdateBlock>

export type LastProcessedChangeBlockIndexParams = FunctionArguments<typeof functions.lastProcessedChangeBlockIndex>
export type LastProcessedChangeBlockIndexReturn = FunctionReturn<typeof functions.lastProcessedChangeBlockIndex>

export type MaxStakersParams = FunctionArguments<typeof functions.maxStakers>
export type MaxStakersReturn = FunctionReturn<typeof functions.maxStakers>

export type MaxVAssetPerStakerParams = FunctionArguments<typeof functions.maxVAssetPerStaker>
export type MaxVAssetPerStakerReturn = FunctionReturn<typeof functions.maxVAssetPerStaker>

export type NativeExRateSampleCountParams = FunctionArguments<typeof functions.nativeExRateSampleCount>
export type NativeExRateSampleCountReturn = FunctionReturn<typeof functions.nativeExRateSampleCount>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type OwnerShareOfInterestParams = FunctionArguments<typeof functions.ownerShareOfInterest>
export type OwnerShareOfInterestReturn = FunctionReturn<typeof functions.ownerShareOfInterest>

export type PauseParams = FunctionArguments<typeof functions.pause>
export type PauseReturn = FunctionReturn<typeof functions.pause>

export type PausedParams = FunctionArguments<typeof functions.paused>
export type PausedReturn = FunctionReturn<typeof functions.paused>

export type PlatformAdminAddressParams = FunctionArguments<typeof functions.platformAdminAddress>
export type PlatformAdminAddressReturn = FunctionReturn<typeof functions.platformAdminAddress>

export type PlatformFeeClaimedParams = FunctionArguments<typeof functions.platformFeeClaimed>
export type PlatformFeeClaimedReturn = FunctionReturn<typeof functions.platformFeeClaimed>

export type ProjectTokenParams = FunctionArguments<typeof functions.projectToken>
export type ProjectTokenReturn = FunctionReturn<typeof functions.projectToken>

export type RecoverWrongTokenParams = FunctionArguments<typeof functions.recoverWrongToken>
export type RecoverWrongTokenReturn = FunctionReturn<typeof functions.recoverWrongToken>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type SetXCMOracleAddressParams = FunctionArguments<typeof functions.setXCMOracleAddress>
export type SetXCMOracleAddressReturn = FunctionReturn<typeof functions.setXCMOracleAddress>

export type StakeParams = FunctionArguments<typeof functions.stake>
export type StakeReturn = FunctionReturn<typeof functions.stake>

export type StakersParams = FunctionArguments<typeof functions.stakers>
export type StakersReturn = FunctionReturn<typeof functions.stakers>

export type StartBlockParams = FunctionArguments<typeof functions.startBlock>
export type StartBlockReturn = FunctionReturn<typeof functions.startBlock>

export type TickBlockParams = FunctionArguments<typeof functions.tickBlock>
export type TickBlockReturn = FunctionReturn<typeof functions.tickBlock>

export type TotalNativeStakeParams = FunctionArguments<typeof functions.totalNativeStake>
export type TotalNativeStakeReturn = FunctionReturn<typeof functions.totalNativeStake>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type UnpauseParams = FunctionArguments<typeof functions.unpause>
export type UnpauseReturn = FunctionReturn<typeof functions.unpause>

export type UnstakeParams = FunctionArguments<typeof functions.unstake>
export type UnstakeReturn = FunctionReturn<typeof functions.unstake>

export type UnstakeWithoutProjectTokenParams = FunctionArguments<typeof functions.unstakeWithoutProjectToken>
export type UnstakeWithoutProjectTokenReturn = FunctionReturn<typeof functions.unstakeWithoutProjectToken>

export type XcmOracleParams = FunctionArguments<typeof functions.xcmOracle>
export type XcmOracleReturn = FunctionReturn<typeof functions.xcmOracle>

