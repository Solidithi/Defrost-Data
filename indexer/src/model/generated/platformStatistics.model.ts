import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, DateTimeColumn as DateTimeColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class PlatformStatistics {
    constructor(props?: Partial<PlatformStatistics>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @DateTimeColumn_({nullable: false})
    date!: Date

    @IntColumn_({nullable: false})
    totalProjects!: number

    @IntColumn_({nullable: false})
    totalPools!: number

    @IntColumn_({nullable: false})
    uniqueUsers!: number

    @IntColumn_({nullable: false})
    dailyActiveUsers!: number

    @BigIntColumn_({nullable: false})
    totalStakedValue!: bigint

    @IntColumn_({nullable: false})
    totalTransactions!: number
}
