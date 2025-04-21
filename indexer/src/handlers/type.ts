import { DataHandlerContext, Log } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";

/**
 * Defines the signature for a function responsible for processing a batch of EVM logs.
 * These handlers are typically used within Subsquid main processor thread to react to specific blockchain events.
 *
 * @param ctx - The data handler context provided by Subsquid, containing access to the database store (`Store`) and block/transaction information.
 * @param pendingLogs - An array of EVM log objects (`Log`) that are pending processing by this handler.
 * @param moreProps - Optional additional properties or context that might be needed by the specific handler implementation.
 * @returns A Promise that resolves to an object indicating the outcome of the processing attempt.
 *          - `topic0`: The specific event topic (topic0 hash) that this handler is designed to process.
 *          - `success`: A boolean flag indicating whether the processing of relevant logs was successful.
 *          - `error`: A string containing an error message if processing failed, otherwise `null`.  *          - `unprocessedLogs`: An array containing logs from the input `pendingLogs` that were not processed by this handler (e.g., due to errors or because they didn't match the handler's criteria).
 */
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
