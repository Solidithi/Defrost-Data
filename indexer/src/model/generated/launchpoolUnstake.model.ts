import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {User} from "./user.model"
import {Launchpool} from "./launchpool.model"

@Entity_()
export class LaunchpoolUnstake {
    constructor(props?: Partial<LaunchpoolUnstake>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    userAddress!: string

    @StringColumn_({nullable: false})
    poolId!: string

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @BigIntColumn_({nullable: false})
    nativeAmount!: bigint

    @BigIntColumn_({nullable: false})
    claimedProjectTokens!: bigint

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @StringColumn_({nullable: false})
    txHash!: string

    @BigIntColumn_({nullable: false})
    nativeExchangeRate!: bigint

    @BigIntColumn_({nullable: false})
    cumulativeProjectExRate!: bigint

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    user!: User

    @Index_()
    @ManyToOne_(() => Launchpool, {nullable: true})
    launchpool!: Launchpool

    @DateTimeColumn_({nullable: false})
    createdAt!: Date
}
