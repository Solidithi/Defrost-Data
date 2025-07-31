module.exports = class Data1753957672779 {
	name = "Data1753957672779";

	async up(db) {
		await db.query(
			`ALTER TABLE "launchpool" ADD "project_token_amount" numeric NOT NULL`
		);
	}

	async down(db) {
		await db.query(
			`ALTER TABLE "launchpool" DROP COLUMN "project_token_amount"`
		);
	}
};
