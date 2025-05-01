import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, DateTimeColumn as DateTimeColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class PlatformMetricsSnapshots {
    constructor(props?: Partial<PlatformMetricsSnapshots>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @IntColumn_({nullable: false})
    countProjects!: number

    @IntColumn_({nullable: false})
    countLaunchpools!: number

    @IntColumn_({nullable: false})
    countUniqueUsers!: number

    @IntColumn_({nullable: false})
    countTransactions!: number

    @IntColumn_({nullable: false})
    countActiveUsers!: number

    @BigIntColumn_({nullable: false})
    totalValueLocked!: bigint
}
