import { getPrismaClient } from "./prismaClient";
export * from "@prisma/client";
export { getPrismaClient };

// Export specific model types
export type {
	user as User,
	project as Project,
	pool as Pool,
	stake as Stake,
	unstake as Unstake,
	interest_claim as InterestClaim,
	platform_statistics as PlatformStatistics,
	emission_rate as EmissionRate,
	native_exchange_rate_snapshot as NativeExchangeRateSnapshot,
	project_exchange_rate_snapshot as ProjectExchangeRateSnapshot,
} from "@prisma/client";
