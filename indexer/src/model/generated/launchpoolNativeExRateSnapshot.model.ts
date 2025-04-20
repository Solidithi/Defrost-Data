import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {Launchpool} from "./launchpool.model"

@Entity_()
export class LaunchpoolNativeExRateSnapshot {
    constructor(props?: Partial<LaunchpoolNativeExRateSnapshot>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    poolId!: string

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @BigIntColumn_({nullable: false})
    exchangeRate!: bigint

    @BigIntColumn_({nullable: false})
    avgGradient!: bigint

    @IntColumn_({nullable: false})
    sampleCount!: number

    @Index_()
    @ManyToOne_(() => Launchpool, {nullable: true})
    launchpool!: Launchpool
}
