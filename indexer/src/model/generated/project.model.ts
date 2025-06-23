import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {User} from "./user.model"
import {Launchpool} from "./launchpool.model"

@Entity_()
export class Project {
    constructor(props?: Partial<Project>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: true})
    name!: string | undefined | null

    @StringColumn_({nullable: true})
    tokenAddress!: string | undefined | null

    @StringColumn_({nullable: true})
    tokenSymbol!: string | undefined | null

    @IntColumn_({nullable: true})
    tokenDecimals!: number | undefined | null

    @StringColumn_({nullable: true})
    logo!: string | undefined | null

    @StringColumn_({array: true, nullable: true})
    images!: (string)[] | undefined | null

    @StringColumn_({nullable: true})
    shortDescription!: string | undefined | null

    @StringColumn_({nullable: true})
    longDescription!: string | undefined | null

    @StringColumn_({nullable: false})
    txHash!: string

    @IntColumn_({nullable: false})
    chainId!: number

    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    owner!: User

    @OneToMany_(() => Launchpool, e => e.project)
    launchpools!: Launchpool[]

    @StringColumn_({nullable: true})
    discord!: string | undefined | null

    @StringColumn_({nullable: true})
    github!: string | undefined | null

    @StringColumn_({nullable: true})
    telegram!: string | undefined | null

    @StringColumn_({nullable: true})
    twitter!: string | undefined | null

    @StringColumn_({nullable: true})
    website!: string | undefined | null
}
