import {
	Entity as Entity_,
	Column as Column_,
	PrimaryColumn as PrimaryColumn_,
	StringColumn as StringColumn_,
	DateTimeColumn as DateTimeColumn_,
	BigIntColumn as BigIntColumn_,
	IntColumn as IntColumn_,
	ManyToOne as ManyToOne_,
	Index as Index_,
} from "@subsquid/typeorm-store";
import { Pool } from "./pool.model";

@Entity_()
export class NativeExchangeRateSnapshot {
	constructor(props?: Partial<NativeExchangeRateSnapshot>) {
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
	exchangeRate!: bigint;

	@BigIntColumn_({ nullable: false })
	avgGradient!: bigint;

	@IntColumn_({ nullable: false })
	sampleCount!: number;

	@Index_()
	@ManyToOne_(() => Pool, { nullable: true })
	pool!: Pool;
}
