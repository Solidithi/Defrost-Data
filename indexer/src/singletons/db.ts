import "reflect-metadata";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

export const typeormDB = new TypeormDatabase({
	stateSchema: "squid_processor",
});

export const prismaClient = new PrismaClient({});
