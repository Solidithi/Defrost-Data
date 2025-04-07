import {
	Entity as Entity_,
	Column as Column_,
	PrimaryColumn as PrimaryColumn_,
	StringColumn as StringColumn_,
	BigIntColumn as BigIntColumn_,
	DateTimeColumn as DateTimeColumn_,
	ManyToOne as ManyToOne_,
	Index as Index_,
} from "@subsquid/typeorm-store";
import { Pool } from "./pool.model";

@Entity_()
export class EmissionRate {
	constructor(props?: Partial<EmissionRate>) {
		Object.assign(this, props);
	}

	@PrimaryColumn_()
	id!: string;

	@StringColumn_({ nullable: false })
	poolId!: string;

	@BigIntColumn_({ nullable: false })
	changeBlock!: bigint;

	@DateTimeColumn_({ nullable: false })
	changeDate!: Date;

	@BigIntColumn_({ nullable: false })
	emissionRate!: bigint;

	@Index_()
	@ManyToOne_(() => Pool, { nullable: true })
	pool!: Pool;
}
