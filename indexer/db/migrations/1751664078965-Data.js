module.exports = class Data1751664078965 {
	name = "Data1751664078965";

	async up(db) {
		await db.query(
			`ALTER TABLE "platform_metrics_snapshots" ADD "tokens_distributed" numeric NOT NULL default 0`
		);
	}

	async down(db) {
		await db.query(
			`ALTER TABLE "platform_metrics_snapshots" DROP COLUMN "tokens_distributed"`
		);
	}
};
