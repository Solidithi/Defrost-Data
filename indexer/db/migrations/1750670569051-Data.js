module.exports = class Data1750670569051 {
	name = "Data1750670569051";

	async up(db) {
		await db.query(
			`CREATE TABLE "launchpool_unstake" ("id" character varying NOT NULL, "amount" numeric NOT NULL, "block_number" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying, "launchpool_id" character varying, CONSTRAINT "PK_82fb058b1ab00db097f47d2a6b0" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_45ac69b00417b3e04fb04feb0d" ON "launchpool_unstake" ("user_id") `
		);
		await db.query(
			`CREATE INDEX "IDX_5ffd534f5829b4c756e48a0727" ON "launchpool_unstake" ("launchpool_id") `
		);
		await db.query(
			`CREATE TABLE "launchpool_emission_rate" ("id" character varying NOT NULL, "pool_id" text NOT NULL, "change_block" numeric NOT NULL, "change_date" TIMESTAMP WITH TIME ZONE NOT NULL, "emission_rate" numeric NOT NULL, "launchpool_id" character varying, CONSTRAINT "PK_38472c23c797a7e136f274865fe" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_5ab70405fc2d5f0d67eeee10ea" ON "launchpool_emission_rate" ("launchpool_id") `
		);
		await db.query(
			`CREATE TABLE "launchpool_native_ex_rate_snapshot" ("id" character varying NOT NULL, "pool_id" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" numeric NOT NULL, "exchange_rate" numeric NOT NULL, "avg_gradient" numeric NOT NULL, "sample_count" integer NOT NULL, "launchpool_id" character varying, CONSTRAINT "PK_dd7610d63abfb47540ab262e57f" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_d644baf226133c3eafa016b85c" ON "launchpool_native_ex_rate_snapshot" ("launchpool_id") `
		);
		await db.query(
			`CREATE TABLE "launchpool_project_ex_rate_snapshot" ("id" character varying NOT NULL, "pool_id" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" numeric NOT NULL, "cumulative_exchange_rate" numeric NOT NULL, "pending_exchange_rate" numeric NOT NULL, "launchpool_id" character varying, CONSTRAINT "PK_2001c62e364c91911dace26a392" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_f089a275a776b3bbcb76b598b6" ON "launchpool_project_ex_rate_snapshot" ("launchpool_id") `
		);
		await db.query(
			`CREATE TABLE "launchpool" ("id" character varying NOT NULL, "pool_id" text NOT NULL, "project_id" character varying NOT NULL, "tx_hash" text NOT NULL, "chain_id" integer NOT NULL, "start_block" numeric NOT NULL, "end_block" numeric NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "project_token_address" text NOT NULL, "v_asset_address" text NOT NULL, "native_asset_address" text NOT NULL, "total_staked" numeric NOT NULL, "total_stakers" integer NOT NULL, "staker_apy" numeric NOT NULL, "owner_apy" numeric NOT NULL, "platform_apy" numeric NOT NULL, "combined_apy" numeric NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_901f124077fb71d351b6b4e883b" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_e0adb6bb4df5fcacfe76c9e944" ON "launchpool" ("project_id") `
		);
		await db.query(
			`CREATE TABLE "launchpool_stake" ("id" character varying NOT NULL, "amount" numeric NOT NULL, "block_number" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying, "launchpool_id" character varying, CONSTRAINT "PK_c8f1b177a4792a3944a19e801cd" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_ef9ac0e83cf6a94667428dc537" ON "launchpool_stake" ("user_id") `
		);
		await db.query(
			`CREATE INDEX "IDX_23117e8789fcd54d325404f13b" ON "launchpool_stake" ("launchpool_id") `
		);
		await db.query(
			`CREATE TABLE "user" ("id" character varying NOT NULL, "first_seen" TIMESTAMP WITH TIME ZONE NOT NULL, "last_active" TIMESTAMP WITH TIME ZONE NOT NULL, "total_pools_participated" integer NOT NULL, "total_staked" numeric NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE TABLE "project" ("id" character varying NOT NULL, "name" text, "token_address" text, "token_symbol" text, "token_decimals" integer, "logo" text, "images" text array, "short_description" text, "long_description" text, "tx_hash" text NOT NULL, "chain_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "discord" text, "github" text, "telegram" text, "twitter" text, "website" text, "owner_id" character varying, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_d40afe32d1d771bea7a5f46818" ON "project" ("owner_id") `
		);
		await db.query(
			`CREATE TABLE "launchpool_interest_claim" ("id" character varying NOT NULL, "claim_type" character varying(14) NOT NULL, "claimer_address" text NOT NULL, "amount" numeric NOT NULL, "block_number" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "launchpool_id" character varying, "user_id" character varying, CONSTRAINT "PK_8e9af7d28c210f651818c3edc67" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_1372d2c7fe0403b3ddf1dc4ce5" ON "launchpool_interest_claim" ("launchpool_id") `
		);
		await db.query(
			`CREATE INDEX "IDX_d79889452a5c8686e512ab8349" ON "launchpool_interest_claim" ("user_id") `
		);
		await db.query(
			`CREATE TABLE "launchpool_project_token_claim" ("id" character varying NOT NULL, "project_token_amount" numeric NOT NULL, "block_number" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying, "launchpool_id" character varying, CONSTRAINT "PK_61bf92c0d4b30ff33956785480b" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_772b6b6ec508506b8d681c6f2a" ON "launchpool_project_token_claim" ("user_id") `
		);
		await db.query(
			`CREATE INDEX "IDX_d77f4e25026b4b29be09ae93cd" ON "launchpool_project_token_claim" ("launchpool_id") `
		);
		await db.query(
			`CREATE TABLE "platform_metrics_snapshots" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "count_projects" integer NOT NULL, "count_launchpools" integer NOT NULL, "count_unique_users" integer NOT NULL, "count_transactions" integer NOT NULL, "count_active_users" integer NOT NULL, "total_value_locked" numeric NOT NULL, CONSTRAINT "PK_2edb023cca470d9ec7f196004d5" PRIMARY KEY ("id"))`
		);
		await db.query(
			`ALTER TABLE "launchpool_unstake" ADD CONSTRAINT "FK_45ac69b00417b3e04fb04feb0d9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_unstake" ADD CONSTRAINT "FK_5ffd534f5829b4c756e48a0727e" FOREIGN KEY ("launchpool_id") REFERENCES "launchpool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_emission_rate" ADD CONSTRAINT "FK_5ab70405fc2d5f0d67eeee10ead" FOREIGN KEY ("launchpool_id") REFERENCES "launchpool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_native_ex_rate_snapshot" ADD CONSTRAINT "FK_d644baf226133c3eafa016b85c6" FOREIGN KEY ("launchpool_id") REFERENCES "launchpool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" ADD CONSTRAINT "FK_f089a275a776b3bbcb76b598b69" FOREIGN KEY ("launchpool_id") REFERENCES "launchpool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool" ADD CONSTRAINT "FK_e0adb6bb4df5fcacfe76c9e944a" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_stake" ADD CONSTRAINT "FK_ef9ac0e83cf6a94667428dc537d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_stake" ADD CONSTRAINT "FK_23117e8789fcd54d325404f13b8" FOREIGN KEY ("launchpool_id") REFERENCES "launchpool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "project" ADD CONSTRAINT "FK_d40afe32d1d771bea7a5f468185" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_interest_claim" ADD CONSTRAINT "FK_1372d2c7fe0403b3ddf1dc4ce50" FOREIGN KEY ("launchpool_id") REFERENCES "launchpool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_interest_claim" ADD CONSTRAINT "FK_d79889452a5c8686e512ab83499" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_project_token_claim" ADD CONSTRAINT "FK_772b6b6ec508506b8d681c6f2a8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "launchpool_project_token_claim" ADD CONSTRAINT "FK_d77f4e25026b4b29be09ae93cdd" FOREIGN KEY ("launchpool_id") REFERENCES "launchpool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	async down(db) {
		await db.query(`DROP TABLE "launchpool_unstake"`);
		await db.query(`DROP INDEX "public"."IDX_45ac69b00417b3e04fb04feb0d"`);
		await db.query(`DROP INDEX "public"."IDX_5ffd534f5829b4c756e48a0727"`);
		await db.query(`DROP TABLE "launchpool_emission_rate"`);
		await db.query(`DROP INDEX "public"."IDX_5ab70405fc2d5f0d67eeee10ea"`);
		await db.query(`DROP TABLE "launchpool_native_ex_rate_snapshot"`);
		await db.query(`DROP INDEX "public"."IDX_d644baf226133c3eafa016b85c"`);
		await db.query(`DROP TABLE "launchpool_project_ex_rate_snapshot"`);
		await db.query(`DROP INDEX "public"."IDX_f089a275a776b3bbcb76b598b6"`);
		await db.query(`DROP TABLE "launchpool"`);
		await db.query(`DROP INDEX "public"."IDX_e0adb6bb4df5fcacfe76c9e944"`);
		await db.query(`DROP TABLE "launchpool_stake"`);
		await db.query(`DROP INDEX "public"."IDX_ef9ac0e83cf6a94667428dc537"`);
		await db.query(`DROP INDEX "public"."IDX_23117e8789fcd54d325404f13b"`);
		await db.query(`DROP TABLE "user"`);
		await db.query(`DROP TABLE "project"`);
		await db.query(`DROP INDEX "public"."IDX_d40afe32d1d771bea7a5f46818"`);
		await db.query(`DROP TABLE "launchpool_interest_claim"`);
		await db.query(`DROP INDEX "public"."IDX_1372d2c7fe0403b3ddf1dc4ce5"`);
		await db.query(`DROP INDEX "public"."IDX_d79889452a5c8686e512ab8349"`);
		await db.query(`DROP TABLE "launchpool_project_token_claim"`);
		await db.query(`DROP INDEX "public"."IDX_772b6b6ec508506b8d681c6f2a"`);
		await db.query(`DROP INDEX "public"."IDX_d77f4e25026b4b29be09ae93cd"`);
		await db.query(`DROP TABLE "platform_metrics_snapshots"`);
		await db.query(
			`ALTER TABLE "launchpool_unstake" DROP CONSTRAINT "FK_45ac69b00417b3e04fb04feb0d9"`
		);
		await db.query(
			`ALTER TABLE "launchpool_unstake" DROP CONSTRAINT "FK_5ffd534f5829b4c756e48a0727e"`
		);
		await db.query(
			`ALTER TABLE "launchpool_emission_rate" DROP CONSTRAINT "FK_5ab70405fc2d5f0d67eeee10ead"`
		);
		await db.query(
			`ALTER TABLE "launchpool_native_ex_rate_snapshot" DROP CONSTRAINT "FK_d644baf226133c3eafa016b85c6"`
		);
		await db.query(
			`ALTER TABLE "launchpool_project_ex_rate_snapshot" DROP CONSTRAINT "FK_f089a275a776b3bbcb76b598b69"`
		);
		await db.query(
			`ALTER TABLE "launchpool" DROP CONSTRAINT "FK_e0adb6bb4df5fcacfe76c9e944a"`
		);
		await db.query(
			`ALTER TABLE "launchpool_stake" DROP CONSTRAINT "FK_ef9ac0e83cf6a94667428dc537d"`
		);
		await db.query(
			`ALTER TABLE "launchpool_stake" DROP CONSTRAINT "FK_23117e8789fcd54d325404f13b8"`
		);
		await db.query(
			`ALTER TABLE "project" DROP CONSTRAINT "FK_d40afe32d1d771bea7a5f468185"`
		);
		await db.query(
			`ALTER TABLE "launchpool_interest_claim" DROP CONSTRAINT "FK_1372d2c7fe0403b3ddf1dc4ce50"`
		);
		await db.query(
			`ALTER TABLE "launchpool_interest_claim" DROP CONSTRAINT "FK_d79889452a5c8686e512ab83499"`
		);
		await db.query(
			`ALTER TABLE "launchpool_project_token_claim" DROP CONSTRAINT "FK_772b6b6ec508506b8d681c6f2a8"`
		);
		await db.query(
			`ALTER TABLE "launchpool_project_token_claim" DROP CONSTRAINT "FK_d77f4e25026b4b29be09ae93cdd"`
		);
	}
};
