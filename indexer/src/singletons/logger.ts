import pino, { levels, transport } from "pino";
import fs from "fs";
import path from "path";
import "dotenv/config";

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}
const logFilePath = path.join(logsDir, "indexer.log");

const nodeENV = process.env.NODE_ENV || "development";

// File transport for pino logger
const fileTransport = pino.transport({
	targets: [
		// Console output only in development mode
		...(nodeENV !== "production"
			? [
					{
						target: "pino-pretty",
						options: {
							colorize: true,
							translateTime: "SYS:standard",
							ignore: "pid,hostname",
						},
						level: "trace",
					},
				]
			: []),
		// Always have file output
		{
			target: "pino-roll",
			options: {
				file: logFilePath,
				frequency: "daily",
				size: "10m",
				mkdir: true,
				compress: false,
				ignore: "pid,hostname",
			},
			level: "trace",
		},
	],
});

export const logger = pino(fileTransport);
