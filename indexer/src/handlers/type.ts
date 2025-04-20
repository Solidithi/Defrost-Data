import { DataHandlerContext, Log } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";

export type LogsHandler = (
	ctx: DataHandlerContext<Store>,
	pendingLogs: Log[],
	moreProps?: object
) => Promise<{
	topic0: string;
	success: boolean;
	error: string | null;
	unprocessedLogs: Log[];
}>;
