import { Log } from "@subsquid/evm-processor";
import { LogsHandler } from "./type";
import { handleProjectCreated } from "./project-created";
import { handleLaunchpoolCreated } from "./launchpool-created";
import { handleLaunchpoolStake } from "./launchpool-stake";
import { handleLaunchpoolUnstake } from "./launchpool-unstake";
import { handleLaunchpoolProjectTokenClaim } from "./launchpool-project-token-claim";
import * as projectLibraryABI from "../typegen-abi/ProjectLibrary";
import * as launchpoolLibraryABI from "../typegen-abi/LaunchpoolLibrary";
import * as launchpoolABI from "../typegen-abi/Launchpool";

/**
 * A global map to dispatch logs to their respective handlers based on the event topic.
 * Keys are event topics, values are objects containing pending logs and the handler function.
 */
export const logsDispatch = new Map<
	string,
	{ pendingLogs: Log[]; logsHandler: LogsHandler }
>();

logsDispatch.set(projectLibraryABI.events.ProjectCreated.topic, {
	pendingLogs: [],
	logsHandler: handleProjectCreated,
});
logsDispatch.set(launchpoolLibraryABI.events.LaunchpoolCreated.topic, {
	pendingLogs: [],
	logsHandler: handleLaunchpoolCreated,
});
logsDispatch.set(launchpoolABI.events.Staked.topic, {
	pendingLogs: [],
	logsHandler: handleLaunchpoolStake,
});
logsDispatch.set(launchpoolABI.events.Unstaked.topic, {
	pendingLogs: [],
	logsHandler: handleLaunchpoolUnstake,
});
logsDispatch.set(launchpoolABI.events.ProjectTokensClaimed.topic, {
	pendingLogs: [],
	logsHandler: handleLaunchpoolProjectTokenClaim,
});
