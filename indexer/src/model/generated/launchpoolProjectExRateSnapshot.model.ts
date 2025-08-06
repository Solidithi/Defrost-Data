import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_, FloatColumn as FloatColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {Launchpool} from "./launchpool.model"

@Entity_()
export class LaunchpoolProjectExRateSnapshot {
    constructor(props?: Partial<LaunchpoolProjectExRateSnapshot>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @BigIntColumn_({nullable: false})
    projectTokenExchangeRate!: bigint

    @BigIntColumn_({nullable: true})
    pendingExchangeRate!: bigint | undefined | null

    @FloatColumn_({nullable: false})
    stakerAPR!: number

    @Index_()
    @ManyToOne_(() => Launchpool, {nullable: true})
    launchpool!: Launchpool
}
