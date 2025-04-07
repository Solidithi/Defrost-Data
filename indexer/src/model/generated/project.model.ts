import {
	Entity as Entity_,
	Column as Column_,
	PrimaryColumn as PrimaryColumn_,
	StringColumn as StringColumn_,
	IntColumn as IntColumn_,
	DateTimeColumn as DateTimeColumn_,
	OneToMany as OneToMany_,
	ManyToOne as ManyToOne_,
	Index as Index_,
} from "@subsquid/typeorm-store";
import { Pool } from "./pool.model";
import { User } from "./user.model";

@Entity_()
export class Project {
	constructor(props?: Partial<Project>) {
		Object.assign(this, props);
	}

	@PrimaryColumn_()
	id!: string;

	@StringColumn_({ nullable: true })
	name!: string | undefined | null;

	@StringColumn_({ nullable: false })
	projectOwner!: string;

	@StringColumn_({ nullable: true })
	tokenAddress!: string | undefined | null;

	@StringColumn_({ nullable: true })
	tokenSymbol!: string | undefined | null;

	@IntColumn_({ nullable: true })
	tokenDecimals!: number | undefined | null;

	@StringColumn_({ nullable: true })
	logo!: string | undefined | null;

	@StringColumn_({ array: true, nullable: true })
	images!: string[] | undefined | null;

	@StringColumn_({ nullable: true })
	shortDescription!: string | undefined | null;

	@StringColumn_({ nullable: true })
	longDescription!: string | undefined | null;

	@StringColumn_({ nullable: false })
	txHash!: string;

	@IntColumn_({ nullable: false })
	chainId!: number;

	@DateTimeColumn_({ nullable: false })
	createdAt!: Date;

	@OneToMany_(() => Pool, (e) => e.project)
	pools!: Pool[];

	@Index_()
	@ManyToOne_(() => User, { nullable: true })
	ownerDetails!: User;
}
