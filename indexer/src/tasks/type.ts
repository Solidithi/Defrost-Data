// Define a base handler type that all action functions must match
export type ActionHandler<TArgs extends unknown[] = any[]> = (
	...args: TArgs
) => Promise<void>;

/** Generic task interface that captures the argument types */
export interface Task<TArgs extends unknown[] = any[]> {
	id?: string;
	name: string;
	priority: number;
	actionName: string;
	actionArgs: TArgs;
	retryCount: number;
	createdAt?: Date;
}

/** Helper function to create tasks */
export function createTask<TArgs extends unknown[]>(
	name: string,
	priority: number,
	actionName: string,
	actionArgs: TArgs,
	retryCount = 3
): Task<TArgs> {
	return {
		name,
		priority,
		actionName,
		actionArgs,
		retryCount,
		createdAt: new Date(),
	};
}
