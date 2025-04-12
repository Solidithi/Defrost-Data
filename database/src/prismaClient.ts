import { PrismaClient } from "@prisma/client";

export function getPrismaClient(dbUrl?: string): PrismaClient {
	const client = new PrismaClient({
		datasources: dbUrl
			? {
					db: {
						url: dbUrl,
					},
				}
			: undefined,
	});
	return client;
}
