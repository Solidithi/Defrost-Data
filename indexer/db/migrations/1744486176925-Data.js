module.exports = class Data1744486176925 {
	name = "Data1744486176925";

	async up(db) {
		await db.query(`ALTER TABLE "pool" DROP COLUMN "is_listed"`);
	}

	async down(db) {
		await db.query(`ALTER TABLE "pool" ADD "is_listed" boolean NOT NULL`);
	}
};
