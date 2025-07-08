module.exports = class Data1751707849304 {
	name = "Data1751707849304";

	async up(db) {
		await db.query(
			`ALTER TABLE "platform_metrics_snapshots" ALTER COLUMN "tokens_distributed" DROP DEFAULT`
		);
	}

	async down(db) {
		await db.query(
			`ALTER TABLE "platform_metrics_snapshots" ALTER COLUMN "tokens_distributed" SET DEFAULT '0'`
		);
	}
};
