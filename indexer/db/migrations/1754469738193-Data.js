module.exports = class Data1754469738193 {
	name = "Data1754469738193";

	async up(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" RENAME COLUMN "cumulative_exchange_rate" TO "project_token_exchange_rate"`
		);
	}

	async down(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" RENAME COLUMN "project_token_exchange_rate" TO "cumulative_exchange_rate"`
		);
	}
};
