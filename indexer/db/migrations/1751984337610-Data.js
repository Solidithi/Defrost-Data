module.exports = class Data1751984337610 {
	name = "Data1751984337610";

	async up(db) {
		await db.query(
			`CREATE TABLE "launchpool_owner_interests_claimed" ("id" character varying NOT NULL, "owner_claims" numeric NOT NULL, "platform_fee" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "claimer_id" character varying, "launchpool_id" character varying, CONSTRAINT "PK_68e9e13a9b166e4a353779422a2" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_d7d3bf9aafab477db9703d2de4" ON "launchpool_owner_interests_claimed" ("claimer_id") `
		);
		await db.query(
			`CREATE INDEX "IDX_1df32af5b9000c67e507d6a9a1" ON "launchpool_owner_interests_claimed" ("launchpool_id") `
		);
		await db.query(
			`CREATE TABLE "launchpool_platform_fee_claimed" ("id" character varying NOT NULL, "platform_fee" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "launchpool_id" character varying, "claimer_id" character varying, CONSTRAINT "PK_ed49e0fe01f8be861a5b2b8ea02" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_358fd5548620c722600708f414" ON "launchpool_platform_fee_claimed" ("launchpool_id") `
		);
		await db.query(
			`CREATE INDEX "IDX_f93b87600b37d9055cdc37aae7" ON "launchpool_platform_fee_claimed" ("claimer_id") `
		);
		await db.query(
			`ALTER TABLE "launchpool_owner_interests_claimed" ADD CONSTRAINT "FK_d7d3bf9aafab477db9703d2de45" FOREIGN KEY ("claimer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_owner_interests_claimed" ADD CONSTRAINT "FK_1df32af5b9000c67e507d6a9a17" FOREIGN KEY ("launchpool_id") REFERENCES "launchpool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_platform_fee_claimed" ADD CONSTRAINT "FK_358fd5548620c722600708f4144" FOREIGN KEY ("launchpool_id") REFERENCES "launchpool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_platform_fee_claimed" ADD CONSTRAINT "FK_f93b87600b37d9055cdc37aae70" FOREIGN KEY ("claimer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	async down(db) {
		await db.query(`DROP TABLE "launchpool_owner_interests_claimed"`);
		await db.query(`DROP INDEX "public"."IDX_d7d3bf9aafab477db9703d2de4"`);
		await db.query(`DROP INDEX "public"."IDX_1df32af5b9000c67e507d6a9a1"`);
		await db.query(`DROP TABLE "launchpool_platform_fee_claimed"`);
		await db.query(`DROP INDEX "public"."IDX_358fd5548620c722600708f414"`);
		await db.query(`DROP INDEX "public"."IDX_f93b87600b37d9055cdc37aae7"`);
		await db.query(
			`ALTER TABLE "launchpool_owner_interests_claimed" DROP CONSTRAINT "FK_d7d3bf9aafab477db9703d2de45"`
		);
		await db.query(
			`ALTER TABLE "launchpool_owner_interests_claimed" DROP CONSTRAINT "FK_1df32af5b9000c67e507d6a9a17"`
		);
		await db.query(
			`ALTER TABLE "launchpool_platform_fee_claimed" DROP CONSTRAINT "FK_358fd5548620c722600708f4144"`
		);
		await db.query(
			`ALTER TABLE "launchpool_platform_fee_claimed" DROP CONSTRAINT "FK_f93b87600b37d9055cdc37aae70"`
		);
	}
};
