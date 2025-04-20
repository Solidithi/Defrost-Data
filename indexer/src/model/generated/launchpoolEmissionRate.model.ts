import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {Launchpool} from "./launchpool.model"

@Entity_()
export class LaunchpoolEmissionRate {
    constructor(props?: Partial<LaunchpoolEmissionRate>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    poolId!: string

    @BigIntColumn_({nullable: false})
    changeBlock!: bigint

    @DateTimeColumn_({nullable: false})
    changeDate!: Date

    @BigIntColumn_({nullable: false})
    emissionRate!: bigint

    @Index_()
    @ManyToOne_(() => Launchpool, {nullable: true})
    launchpool!: Launchpool
}
