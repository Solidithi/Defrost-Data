import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, StringColumn as StringColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {User} from "./user.model"
import {Launchpool} from "./launchpool.model"

@Entity_()
export class LaunchpoolProjectTokenClaim {
    constructor(props?: Partial<LaunchpoolProjectTokenClaim>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: false})
    projectTokenAmount!: bigint

    @IntColumn_({nullable: false})
    projectTokenDecimals!: number

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @StringColumn_({nullable: false})
    txHash!: string

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    user!: User

    @Index_()
    @ManyToOne_(() => Launchpool, {nullable: true})
    launchpool!: Launchpool

    @DateTimeColumn_({nullable: false})
    createdAt!: Date
}
