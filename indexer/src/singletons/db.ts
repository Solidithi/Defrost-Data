import "reflect-metadata";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import { DataSource } from "typeorm";
import { PrismaClient } from "@prisma/client";
// import * as models from "../model/generated";
import "dotenv/config";

export const typeormDB = new TypeormDatabase({
	stateSchema: "squid_processor",
});

export const prismaClient = new PrismaClient({});
