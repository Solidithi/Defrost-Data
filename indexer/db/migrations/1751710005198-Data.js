module.exports = class Data1751710005198 {
	name = "Data1751710005198";

	async up(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_token_claim" ALTER COLUMN "project_token_decimals" DROP DEFAULT`
		);
	}

	async down(db) {
		await db.query(
			`ALTER TABLE "launchpool_project_token_claim" ALTER COLUMN "project_token_decimals" SET DEFAULT '18'`
		);
	}
};
