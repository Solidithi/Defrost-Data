import { createClient } from "redis";
import { RedisClientType } from "redis";
import { logger } from "./logger";
import { normalizeAddress } from "../utils";

export class CacheStore {
	private redisClient: RedisClientType;
	private static instance: CacheStore;

	private constructor() {
		this.redisClient = createClient({
			url: process.env.REDIS_URL,
		});
		this.redisClient.connect();
	}

	static getInstance(): CacheStore {
		if (!this.instance) {
			this.instance = new CacheStore();
		}
		return this.instance;
	}

	get isReady(): boolean {
		return this.redisClient.isReady;
	}

	async connect(): Promise<void> {
		if (!this.redisClient.isOpen) {
			await this.redisClient.connect();
		}
	}

	async disconnect(): Promise<void> {
		if (this.redisClient.isOpen) {
			await this.redisClient.quit();
		}
	}

	async getObservedLaunchpools(): Promise<string[]> {
		return await this.redisClient.sMembers("observedLaunchpools");
	}

	async saveObservedLaunchpool(poolAddress: string): Promise<void> {
		await this.redisClient.sAdd(
			"observedLaunchpools",
			normalizeAddress(poolAddress)
		);
	}

	async isObservedLaunchpool(poolAddress: string): Promise<boolean> {
		return await this.redisClient.sIsMember(
			"observedLaunchpools",
			normalizeAddress(poolAddress)
		);
	}

	async removeObservedLaunchpool(poolAddress: string): Promise<void> {
		await this.redisClient.sRem(
			"observedLaunchpools",
			normalizeAddress(poolAddress)
		);
	}

	async getTokenInfo(
		tokenAddress: string,
		field: "name" | "symbol" | "decimals"
	): Promise<number | null> {
		const key = `token${normalizeAddress(tokenAddress)}`;
		const decimalsStr = await this.redisClient.hGet(key, field);
		return decimalsStr ? Number(decimalsStr) : null;
	}

	async saveTokenInfoField(
		tokenAddress: string,
		field: "name" | "symbol" | "decimals",
		value: string,
		TTL?: number
	): Promise<void> {
		const key = `token${normalizeAddress(tokenAddress)}`;
		await this.redisClient.hSet(key, field, value);
		if (TTL) {
			await this.redisClient.expire(key, TTL);
		}
	}

	async getScheduledTasks(
		taskType: "once" | "recurring"
	): Promise<Record<string, string>> {
		return await this.redisClient.hGetAll(`scheduled:${taskType}`);
	}

	/**
	 * Store scheduled task in Redis for persistence
	 */
	async saveScheduledTask(
		taskType: "once" | "recurring",
		id: string,
		data: any
	): Promise<void> {
		await this.redisClient.hSet(
			`scheduled:${taskType}`,
			id,
			JSON.stringify(data)
		);
	}

	async removeScheduledTask(
		taskType: "once" | "recurring",
		id: string
	): Promise<void> {
		try {
			await this.redisClient.hDel(`scheduled:${taskType}`, id);
		} catch (err) {
			logger.error(`Failed to persist scheduled task ${id}:`, err);
			throw err;
		}
	}
}

export const cacheStore = CacheStore.getInstance();
