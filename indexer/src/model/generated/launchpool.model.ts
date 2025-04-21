import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, FloatColumn as FloatColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Project} from "./project.model"
import {LaunchpoolStake} from "./launchpoolStake.model"
import {LaunchpoolUnstake} from "./launchpoolUnstake.model"
import {LaunchpoolEmissionRate} from "./launchpoolEmissionRate.model"
import {LaunchpoolNativeExRateSnapshot} from "./launchpoolNativeExRateSnapshot.model"
import {LaunchpoolProjectExRateSnapshot} from "./launchpoolProjectExRateSnapshot.model"

@Entity_()
export class Launchpool {
    constructor(props?: Partial<Launchpool>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    poolId!: string

    @StringColumn_({nullable: false})
    projectId!: string

    @StringColumn_({nullable: false})
    txHash!: string

    @IntColumn_({nullable: false})
    chainId!: number

    @BigIntColumn_({nullable: false})
    startBlock!: bigint

    @BigIntColumn_({nullable: false})
    endBlock!: bigint

    @DateTimeColumn_({nullable: false})
    startDate!: Date

    @DateTimeColumn_({nullable: false})
    endDate!: Date

    @StringColumn_({nullable: false})
    projectTokenAddress!: string

    @StringColumn_({nullable: false})
    vAssetAddress!: string

    @StringColumn_({nullable: false})
    nativeAssetAddress!: string

    @BigIntColumn_({nullable: false})
    totalStaked!: bigint

    @IntColumn_({nullable: false})
    totalStakers!: number

    @FloatColumn_({nullable: false})
    stakerAPY!: number

    @FloatColumn_({nullable: false})
    ownerAPY!: number

    @FloatColumn_({nullable: false})
    platformAPY!: number

    @FloatColumn_({nullable: false})
    combinedAPY!: number

    @Index_()
    @ManyToOne_(() => Project, {nullable: true})
    project!: Project

    @OneToMany_(() => LaunchpoolStake, e => e.launchpool)
    stakes!: LaunchpoolStake[]

    @OneToMany_(() => LaunchpoolUnstake, e => e.launchpool)
    unstakes!: LaunchpoolUnstake[]

    @OneToMany_(() => LaunchpoolEmissionRate, e => e.launchpool)
    emissionRates!: LaunchpoolEmissionRate[]

    @OneToMany_(() => LaunchpoolNativeExRateSnapshot, e => e.launchpool)
    nativeRateSnapshots!: LaunchpoolNativeExRateSnapshot[]

    @OneToMany_(() => LaunchpoolProjectExRateSnapshot, e => e.launchpool)
    projectRateSnapshots!: LaunchpoolProjectExRateSnapshot[]

    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    @DateTimeColumn_({nullable: false})
    updatedAt!: Date
}
