module.exports = class Data1754423241747 {
	name = "Data1754423241747";

	async up(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" DROP COLUMN "pool_id"`
		);
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" ALTER COLUMN "pending_exchange_rate" DROP NOT NULL`
		);
		await db.query(
			`ALTER TABLE "launchpool" ALTER COLUMN "project_token_decimals" DROP DEFAULT`
		);
	}

	async down(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" ADD "pool_id" text NOT NULL`
		);
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" ALTER COLUMN "pending_exchange_rate" SET NOT NULL`
		);
		await db.query(
			`ALTER TABLE "launchpool" ALTER COLUMN "project_token_decimals" SET DEFAULT '18'`
		);
	}
};
