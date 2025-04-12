module.exports = class Data1744485639933 {
	name = "Data1744485639933";

	async up(db) {
		await db.query(
			`CREATE TABLE "unstake" ("id" character varying NOT NULL, "user_address" text NOT NULL, "pool_id" character varying NOT NULL, "amount" numeric NOT NULL, "native_amount" numeric NOT NULL, "claimed_project_tokens" numeric NOT NULL, "block_number" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "native_exchange_rate" numeric NOT NULL, "cumulative_project_ex_rate" numeric NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying, CONSTRAINT "PK_32873b5360007a866a2bd212e76" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_70dac229afb2b65e803b677735" ON "unstake" ("user_id") `
		);
		await db.query(
			`CREATE INDEX "IDX_7a1030f7fded624b5cbdbb60a3" ON "unstake" ("pool_id") `
		);
		await db.query(
			`CREATE TABLE "user" ("id" character varying NOT NULL, "first_seen" TIMESTAMP WITH TIME ZONE NOT NULL, "last_active" TIMESTAMP WITH TIME ZONE NOT NULL, "total_pools_participated" integer NOT NULL, "total_staked" numeric NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE TABLE "stake" ("id" character varying NOT NULL, "user_address" text NOT NULL, "pool_id" character varying NOT NULL, "amount" numeric NOT NULL, "native_amount" numeric NOT NULL, "block_number" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "native_exchange_rate" numeric NOT NULL, "cumulative_project_ex_rate" numeric NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying, CONSTRAINT "PK_8cfd82a65916af9d517d25a894e" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_0b45b45ad3f63c22a6016183b7" ON "stake" ("user_id") `
		);
		await db.query(
			`CREATE INDEX "IDX_646d137a2979aa231fa880711f" ON "stake" ("pool_id") `
		);
		await db.query(
			`CREATE TABLE "emission_rate" ("id" character varying NOT NULL, "pool_id" character varying NOT NULL, "change_block" numeric NOT NULL, "change_date" TIMESTAMP WITH TIME ZONE NOT NULL, "emission_rate" numeric NOT NULL, CONSTRAINT "PK_745985b9d124c2a694655313846" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_b454a2c18d961c2208693fc52c" ON "emission_rate" ("pool_id") `
		);
		await db.query(
			`CREATE TABLE "native_exchange_rate_snapshot" ("id" character varying NOT NULL, "pool_id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" numeric NOT NULL, "exchange_rate" numeric NOT NULL, "avg_gradient" numeric NOT NULL, "sample_count" integer NOT NULL, CONSTRAINT "PK_e51a25904ca4d6043b839e39870" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_c8213090ead9dbd1003f05dded" ON "native_exchange_rate_snapshot" ("pool_id") `
		);
		await db.query(
			`CREATE TABLE "project_exchange_rate_snapshot" ("id" character varying NOT NULL, "pool_id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" numeric NOT NULL, "cumulative_exchange_rate" numeric NOT NULL, "pending_exchange_rate" numeric NOT NULL, CONSTRAINT "PK_b7bac6f1ea37872e8f5bddad93d" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_60f46673f25fb5e0e3f9b826f7" ON "project_exchange_rate_snapshot" ("pool_id") `
		);
		await db.query(
			`CREATE TABLE "pool" ("id" character varying NOT NULL, "pool_address" text NOT NULL, "pool_type" character varying(10) NOT NULL, "project_id" character varying NOT NULL, "tx_hash" text NOT NULL, "chain_id" integer NOT NULL, "is_listed" boolean NOT NULL, "start_block" numeric NOT NULL, "end_block" numeric NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "project_token_address" text NOT NULL, "v_asset_address" text NOT NULL, "native_asset_address" text NOT NULL, "total_staked" numeric NOT NULL, "total_stakers" integer NOT NULL, "staker_apy" numeric NOT NULL, "owner_apy" numeric NOT NULL, "platform_apy" numeric NOT NULL, "combined_apy" numeric NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_c2d63a62643891963c4685e2ef" ON "pool" ("project_id") `
		);
		await db.query(
			`CREATE TABLE "project" ("id" character varying NOT NULL, "name" text, "project_owner" text NOT NULL, "token_address" text, "token_symbol" text, "token_decimals" integer, "logo" text, "images" text array, "short_description" text, "long_description" text, "tx_hash" text NOT NULL, "chain_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "owner_details_id" character varying, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE INDEX "IDX_b9153c3bb5596ec4bf8352bdfc" ON "project" ("owner_details_id") `
		);
		await db.query(
			`CREATE TABLE "interest_claim" ("id" character varying NOT NULL, "pool_id" text NOT NULL, "claim_type" character varying(14) NOT NULL, "claimer_address" text NOT NULL, "amount" numeric NOT NULL, "block_number" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_fcc1888fe4805991e424aa733ee" PRIMARY KEY ("id"))`
		);
		await db.query(
			`CREATE TABLE "platform_statistics" ("id" character varying NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "total_projects" integer NOT NULL, "total_pools" integer NOT NULL, "unique_users" integer NOT NULL, "daily_active_users" integer NOT NULL, "total_staked_value" numeric NOT NULL, "total_transactions" integer NOT NULL, CONSTRAINT "PK_4416a2d6a3a4ec1260e13337020" PRIMARY KEY ("id"))`
		);
		await db.query(
			`ALTER TABLE "unstake" ADD CONSTRAINT "FK_70dac229afb2b65e803b677735c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "unstake" ADD CONSTRAINT "FK_7a1030f7fded624b5cbdbb60a34" FOREIGN KEY ("pool_id") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "stake" ADD CONSTRAINT "FK_0b45b45ad3f63c22a6016183b7b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "stake" ADD CONSTRAINT "FK_646d137a2979aa231fa880711f3" FOREIGN KEY ("pool_id") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "emission_rate" ADD CONSTRAINT "FK_b454a2c18d961c2208693fc52c6" FOREIGN KEY ("pool_id") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "native_exchange_rate_snapshot" ADD CONSTRAINT "FK_c8213090ead9dbd1003f05ddedf" FOREIGN KEY ("pool_id") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "project_exchange_rate_snapshot" ADD CONSTRAINT "FK_60f46673f25fb5e0e3f9b826f76" FOREIGN KEY ("pool_id") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "pool" ADD CONSTRAINT "FK_c2d63a62643891963c4685e2eff" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await db.query(
			`ALTER TABLE "project" ADD CONSTRAINT "FK_b9153c3bb5596ec4bf8352bdfc7" FOREIGN KEY ("owner_details_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	async down(db) {
		await db.query(`DROP TABLE "unstake"`);
		await db.query(`DROP INDEX "public"."IDX_70dac229afb2b65e803b677735"`);
		await db.query(`DROP INDEX "public"."IDX_7a1030f7fded624b5cbdbb60a3"`);
		await db.query(`DROP TABLE "user"`);
		await db.query(`DROP TABLE "stake"`);
		await db.query(`DROP INDEX "public"."IDX_0b45b45ad3f63c22a6016183b7"`);
		await db.query(`DROP INDEX "public"."IDX_646d137a2979aa231fa880711f"`);
		await db.query(`DROP TABLE "emission_rate"`);
		await db.query(`DROP INDEX "public"."IDX_b454a2c18d961c2208693fc52c"`);
		await db.query(`DROP TABLE "native_exchange_rate_snapshot"`);
		await db.query(`DROP INDEX "public"."IDX_c8213090ead9dbd1003f05dded"`);
		await db.query(`DROP TABLE "project_exchange_rate_snapshot"`);
		await db.query(`DROP INDEX "public"."IDX_60f46673f25fb5e0e3f9b826f7"`);
		await db.query(`DROP TABLE "pool"`);
		await db.query(`DROP INDEX "public"."IDX_c2d63a62643891963c4685e2ef"`);
		await db.query(`DROP TABLE "project"`);
		await db.query(`DROP INDEX "public"."IDX_b9153c3bb5596ec4bf8352bdfc"`);
		await db.query(`DROP TABLE "interest_claim"`);
		await db.query(`DROP TABLE "platform_statistics"`);
		await db.query(
			`ALTER TABLE "unstake" DROP CONSTRAINT "FK_70dac229afb2b65e803b677735c"`
		);
		await db.query(
			`ALTER TABLE "unstake" DROP CONSTRAINT "FK_7a1030f7fded624b5cbdbb60a34"`
		);
		await db.query(
			`ALTER TABLE "stake" DROP CONSTRAINT "FK_0b45b45ad3f63c22a6016183b7b"`
		);
		await db.query(
			`ALTER TABLE "stake" DROP CONSTRAINT "FK_646d137a2979aa231fa880711f3"`
		);
		await db.query(
			`ALTER TABLE "emission_rate" DROP CONSTRAINT "FK_b454a2c18d961c2208693fc52c6"`
		);
		await db.query(
			`ALTER TABLE "native_exchange_rate_snapshot" DROP CONSTRAINT "FK_c8213090ead9dbd1003f05ddedf"`
		);
		await db.query(
			`ALTER TABLE "project_exchange_rate_snapshot" DROP CONSTRAINT "FK_60f46673f25fb5e0e3f9b826f76"`
		);
		await db.query(
			`ALTER TABLE "pool" DROP CONSTRAINT "FK_c2d63a62643891963c4685e2eff"`
		);
		await db.query(
			`ALTER TABLE "project" DROP CONSTRAINT "FK_b9153c3bb5596ec4bf8352bdfc7"`
		);
	}
};
