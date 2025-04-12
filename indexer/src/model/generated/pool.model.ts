import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, FloatColumn as FloatColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {PoolType} from "./_poolType"
import {Project} from "./project.model"
import {Stake} from "./stake.model"
import {Unstake} from "./unstake.model"
import {EmissionRate} from "./emissionRate.model"
import {NativeExchangeRateSnapshot} from "./nativeExchangeRateSnapshot.model"
import {ProjectExchangeRateSnapshot} from "./projectExchangeRateSnapshot.model"

@Entity_()
export class Pool {
    constructor(props?: Partial<Pool>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    poolAddress!: string

    @Column_("varchar", {length: 10, nullable: false})
    poolType!: PoolType

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

    @OneToMany_(() => Stake, e => e.pool)
    stakes!: Stake[]

    @OneToMany_(() => Unstake, e => e.pool)
    unstakes!: Unstake[]

    @OneToMany_(() => EmissionRate, e => e.pool)
    emissionRates!: EmissionRate[]

    @OneToMany_(() => NativeExchangeRateSnapshot, e => e.pool)
    nativeRateSnapshots!: NativeExchangeRateSnapshot[]

    @OneToMany_(() => ProjectExchangeRateSnapshot, e => e.pool)
    projectRateSnapshots!: ProjectExchangeRateSnapshot[]

    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    @DateTimeColumn_({nullable: false})
    updatedAt!: Date
}
