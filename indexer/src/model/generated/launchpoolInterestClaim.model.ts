import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {LaunchpoolClaimType} from "./_launchpoolClaimType"
import {Launchpool} from "./launchpool.model"
import {User} from "./user.model"

@Entity_()
export class LaunchpoolInterestClaim {
    constructor(props?: Partial<LaunchpoolInterestClaim>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("varchar", {length: 14, nullable: false})
    claimType!: LaunchpoolClaimType

    @StringColumn_({nullable: false})
    claimerAddress!: string

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @StringColumn_({nullable: false})
    txHash!: string

    @Index_()
    @ManyToOne_(() => Launchpool, {nullable: true})
    launchpool!: Launchpool

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    user!: User

    @DateTimeColumn_({nullable: false})
    createdAt!: Date
}
