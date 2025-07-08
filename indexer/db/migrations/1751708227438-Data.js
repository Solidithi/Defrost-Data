module.exports = class Data1751708227438 {
	name = "Data1751708227438";

	async up(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_token_claim" ADD "project_token_decimals" integer NOT NULL DEFAULT 18`
		);
	}

	async down(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_token_claim" DROP COLUMN "project_token_decimals"`
		);
	}
};
