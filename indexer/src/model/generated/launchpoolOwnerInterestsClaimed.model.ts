import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {User} from "./user.model"
import {Launchpool} from "./launchpool.model"

@Entity_()
export class LaunchpoolOwnerInterestsClaimed {
    constructor(props?: Partial<LaunchpoolOwnerInterestsClaimed>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: false})
    ownerClaims!: bigint

    @BigIntColumn_({nullable: false})
    platformFee!: bigint

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    claimer!: User

    @Index_()
    @ManyToOne_(() => Launchpool, {nullable: true})
    launchpool!: Launchpool
}
