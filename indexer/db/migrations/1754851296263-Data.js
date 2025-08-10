module.exports = class Data1754851296263 {
	name = "Data1754851296263";

	async up(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" DROP COLUMN "pending_exchange_rate"`
		);
	}

	async down(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" ADD "pending_exchange_rate" numeric`
		);
	}
};
