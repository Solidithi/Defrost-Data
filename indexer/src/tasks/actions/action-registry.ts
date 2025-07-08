/* Actions can't be serialized, so we need to map their names to the actual implementation */
import { updateLaunchpoolAPY } from "./update-launchpool-apy";
import { ActionHandler } from "../type";
import { snapshotPlatformMetrics } from "./snapshot-platform-metrics";

// Type-safe action registry
export const actionRegistry = new Map<string, ActionHandler>();

// Function to register known action handlers
export function registerAction<TArgs extends unknown[]>(
	name: string,
	handler: (...args: TArgs) => Promise<void>
): void {
	actionRegistry.set(name, handler as ActionHandler);
}

// REGISTER ACTIONS HERE
registerAction(updateLaunchpoolAPY.name, updateLaunchpoolAPY);
registerAction(snapshotPlatformMetrics.name, snapshotPlatformMetrics);
