import { Log } from "@subsquid/evm-processor";
import { LogsHandler } from "./type";
import {
	handleProjectCreated,
	handleLaunchpoolCreated,
} from "./ProjectHubUpgradeable";
import {
	handleStaked,
	handleUnstaked,
	handleProjectTokensClaimed,
	handleOwnerInterestsClaimed,
} from "./Launchpool";
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
	logsHandler: handleStaked,
});
logsDispatch.set(launchpoolABI.events.Unstaked.topic, {
	pendingLogs: [],
	logsHandler: handleUnstaked,
});
logsDispatch.set(launchpoolABI.events.ProjectTokensClaimed.topic, {
	pendingLogs: [],
	logsHandler: handleProjectTokensClaimed,
});
logsDispatch.set(launchpoolABI.events.OwnerInterestsClaimed.topic, {
	pendingLogs: [],
	logsHandler: handleOwnerInterestsClaimed,
});
