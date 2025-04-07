import {
	Entity as Entity_,
	Column as Column_,
	PrimaryColumn as PrimaryColumn_,
	StringColumn as StringColumn_,
	DateTimeColumn as DateTimeColumn_,
	BigIntColumn as BigIntColumn_,
	ManyToOne as ManyToOne_,
	Index as Index_,
} from "@subsquid/typeorm-store";
import { Pool } from "./pool.model";

@Entity_()
export class ProjectExchangeRateSnapshot {
	constructor(props?: Partial<ProjectExchangeRateSnapshot>) {
		Object.assign(this, props);
	}

	@PrimaryColumn_()
	id!: string;

	@StringColumn_({ nullable: false })
	poolId!: string;

	@DateTimeColumn_({ nullable: false })
	timestamp!: Date;

	@BigIntColumn_({ nullable: false })
	blockNumber!: bigint;

	@BigIntColumn_({ nullable: false })
	cumulativeExchangeRate!: bigint;

	@BigIntColumn_({ nullable: false })
	pendingExchangeRate!: bigint;

	@Index_()
	@ManyToOne_(() => Pool, { nullable: true })
	pool!: Pool;
}
