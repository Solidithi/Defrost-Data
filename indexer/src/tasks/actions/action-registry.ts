/* Actions can't be serialized, so we need to map their names to the actual implementation */
import { updateLaunchpoolAPY } from "./update-launchpool-apy";
import { ActionHandler } from "../type";

// Type-safe action registry
export const actionRegistry = new Map<string, ActionHandler>();

// Function to register known action handlers
export function registerAction<TArgs extends unknown[]>(
	name: string,
	handler: (...args: TArgs) => Promise<void>
): void {
	actionRegistry.set(name, handler as ActionHandler);
}

registerAction(updateLaunchpoolAPY.name, updateLaunchpoolAPY);
