import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, DateTimeColumn as DateTimeColumn_, OneToMany as OneToMany_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {Stake} from "./stake.model"
import {Unstake} from "./unstake.model"
import {Project} from "./project.model"

@Entity_()
export class User {
    constructor(props?: Partial<User>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @DateTimeColumn_({nullable: false})
    firstSeen!: Date

    @DateTimeColumn_({nullable: false})
    lastActive!: Date

    @OneToMany_(() => Stake, e => e.user)
    stakes!: Stake[]

    @OneToMany_(() => Unstake, e => e.user)
    unstakes!: Unstake[]

    @OneToMany_(() => Project, e => e.ownerDetails)
    ownedProjects!: Project[]

    @IntColumn_({nullable: false})
    totalPoolsParticipated!: number

    @BigIntColumn_({nullable: false})
    totalStaked!: bigint
}
