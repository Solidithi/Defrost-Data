import {
	Entity as Entity_,
	Column as Column_,
	PrimaryColumn as PrimaryColumn_,
	StringColumn as StringColumn_,
	BigIntColumn as BigIntColumn_,
	DateTimeColumn as DateTimeColumn_,
} from "@subsquid/typeorm-store";
import { ClaimType } from "./_claimType";

@Entity_()
export class InterestClaim {
	constructor(props?: Partial<InterestClaim>) {
		Object.assign(this, props);
	}

	@PrimaryColumn_()
	id!: string;

	@StringColumn_({ nullable: false })
	poolId!: string;

	@Column_("varchar", { length: 14, nullable: false })
	claimType!: ClaimType;

	@StringColumn_({ nullable: false })
	claimerAddress!: string;

	@BigIntColumn_({ nullable: false })
	amount!: bigint;

	@BigIntColumn_({ nullable: false })
	blockNumber!: bigint;

	@DateTimeColumn_({ nullable: false })
	timestamp!: Date;

	@StringColumn_({ nullable: false })
	txHash!: string;

	@DateTimeColumn_({ nullable: false })
	createdAt!: Date;
}
