module.exports = class Data1753982972561 {
	name = "Data1753982972561";

	async up(db) {
		await db.query(
			`ALTER TABLE "launchpool" ADD "project_token_decimals" integer NOT NULL DEFAULT 18`
		);
	}

	async down(db) {
		await db.query(
			`ALTER TABLE "launchpool" DROP COLUMN "project_token_decimals"`
		);
	}
};
