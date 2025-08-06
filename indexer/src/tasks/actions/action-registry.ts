/* Actions can't be serialized, so we need to map their names to the actual implementation */
import { updateLaunchpoolAPR } from "./update-launchpool-apr";
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

/**
 * @DEV REGISTER ACTIONS HERE
 * This is a central place to register all action handlers.
 * It allows us to easily add, remove, or modify actions without changing the core logic.
 */
registerAction("updateLaunchpoolAPR", updateLaunchpoolAPR);
registerAction("snapshotPlatformMetrics", snapshotPlatformMetrics);
