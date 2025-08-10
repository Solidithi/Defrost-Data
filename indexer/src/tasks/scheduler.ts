import { Task } from "./type";
import { taskQueue } from "./queue";
import { cacheStore } from "../singletons";
import { logger } from "../singletons";
import { actionRegistry } from "./actions/action-registry";
import {
	oneTimeTaskPriorities,
	OneTimeTaskPriority,
	recurringTaskPriorities,
	RecurringTaskPriority,
} from "./priorities";

// Store for recurring tasks
const recurringTasks: Map<
	string,
	{
		task: Omit<Task, "id">;
		intervalMs: number;
		lastRun: number;
		nextRun: number;
	}
> = new Map();

// Store for one-time future tasks
const scheduledTasks: Map<
	string,
	{
		task: Omit<Task, "id">;
		scheduledTime: number;
	}
> = new Map();

/* Utility internal function for creating task */
function createTask(
	name: string,
	priority: number,
	actionName: string,
	actionArgs: any[],
	retryCount = 3
): Task {
	if (!actionRegistry.has(actionName)) {
		throw new Error(`Action ${actionName} not found in registry`);
	}

	return {
		name,
		priority,
		actionName,
		retryCount,
		actionArgs,
		createdAt: new Date(),
	};
}

/**
 * Initialize the scheduler
 */
export async function initTaskScheduler(): Promise<void> {
	// Optional: Restore scheduled tasks from Redis for persistence across restarts
	await restoreScheduledTasks();

	// Start the scheduler loop
	scheduleLoop();
	logger.info("Task scheduler initialized");
}

/**
 * Schedule a task to run at regular intervals
 * @param id Unique identifier for this scheduled task
 * @param task The task to run
 * @param intervalMs Interval in milliseconds between runs
 */
export function scheduleRecurring(
	id: string,
	priority: RecurringTaskPriority = recurringTaskPriorities.NORMAL,
	actionFunction: (...args: any[]) => Promise<void>,
	actionArgs: any[],
	retryCount: number = 3,
	intervalMs: number
): void {
	if (!actionFunction) {
		throw new Error("Action function doesn't exist");
	}

	const task = createTask(
		actionFunction.name,
		priority,
		actionFunction.name,
		actionArgs,
		retryCount
	);

	const now = Date.now();
	recurringTasks.set(id, {
		task,
		intervalMs,
		lastRun: 0, // Never run before
		nextRun: now, // Run immediately the first time
	});

	logger.info(
		`Scheduled recurring task '${id}' to run every ${intervalMs}ms`
	);

	// Persist to Redis for durability
	cacheStore.saveScheduledTask("recurring", id, {
		task,
		intervalMs,
		nextRun: now,
	});
}

/**
 * Schedule a task to run once at a specific time in the future
 * @param id Unique identifier for this scheduled task
 * @param task The task to run
 * @param dateTime When to run the task (Date object or timestamp)
 */
export function scheduleOnce(
	id: string,
	priority: OneTimeTaskPriority = oneTimeTaskPriorities.NORMAL,
	actionFunc: (...arg: any[]) => Promise<void>,
	actionArgs: any[],
	retryCount: number = 3,
	dateTime: Date | number
): void {
	if (!actionFunc) {
		throw new Error("Action function doesn't exist");
	}

	const scheduledTime =
		dateTime instanceof Date ? dateTime.getTime() : dateTime;

	const task = createTask(
		actionFunc.name,
		priority,
		actionFunc.name,
		actionArgs,
		retryCount
	);

	scheduledTasks.set(id, {
		task,
		scheduledTime,
	});

	logger.info(
		`Scheduled one-time task '${id}' to run at ${new Date(scheduledTime).toISOString()}`
	);

	// Persist to Redis for durability
	cacheStore.saveScheduledTask("once", id, { task, scheduledTime });
}

/**
 * Remove a scheduled task
 * @param id Identifier of the task to remove
 * @param type Type of scheduled task ('recurring' or 'once')
 */
export async function unscheduleTask(
	id: string,
	type: "recurring" | "once"
): Promise<void> {
	if (type === "recurring") {
		recurringTasks.delete(id);
	} else {
		scheduledTasks.delete(id);
	}

	// Remove from Redis
	await cacheStore.removeScheduledTask(type, id);
	logger.info(`Unscheduled ${type} task '${id}'`);
}

/**
 * The scheduler loop that checks for tasks that need to be run
 */
async function scheduleLoop(): Promise<void> {
	try {
		const now = Date.now();
		logger.debug("Scheduler task running at: ");
		logger.debug("Scheduler loop running at", new Date(now).toISOString());

		// Check recurring tasks
		for (const [
			id,
			{ task, intervalMs, lastRun, nextRun },
		] of recurringTasks.entries()) {
			if (now >= nextRun) {
				// Enqueue the task for execution
				enqueueTaskWithId(id, task);

				// Update timing information
				const newNextRun = now + intervalMs;
				recurringTasks.set(id, {
					task,
					intervalMs,
					lastRun: now,
					nextRun: newNextRun,
				});

				// Update stored task in cache store
				await cacheStore.saveScheduledTask("recurring", id, {
					task,
					intervalMs,
					lastRun: now,
					nextRun: newNextRun,
				});
			}
		}

		// Check one-time scheduled tasks
		for (const [id, { task, scheduledTime }] of scheduledTasks.entries()) {
			if (now >= scheduledTime) {
				// Enqueue the task for execution
				enqueueTaskWithId(id, task);

				// Remove the task from scheduled tasks
				scheduledTasks.delete(id);

				// Remove from Redis
				cacheStore.removeScheduledTask("once", id);
			}
		}
	} catch (err) {
		logger.error("Error in scheduler loop:", err);
	} finally {
		// Schedule next check in 1 second
		setTimeout(scheduleLoop, 1000);
	}
}

/**
 * Enqueue a task with its ID added
 */
function enqueueTaskWithId(id: string, task: Omit<Task, "id">): void {
	taskQueue.add({ ...task, id });
}

/**
 * Restore scheduled tasks from Redis on startup
 */
async function restoreScheduledTasks(): Promise<void> {
	try {
		// Restore recurring tasks
		const recurringData = await cacheStore.getScheduledTasks("recurring");
		for (const [id, dataStr] of Object.entries(recurringData)) {
			try {
				const data = JSON.parse(dataStr);
				recurringTasks.set(id, {
					task: createTask(
						data.task.name,
						data.task.priority,
						data.task.actionName,
						parseSerializedArgs(data.task.actionArgs),
						data.task.retryCount
					),
					intervalMs: data.intervalMs,
					lastRun: data.lastRun || 0,
					nextRun: data.nextRun || Date.now(),
				});
				logger.info(`Restored recurring task: ${id}`);
			} catch (err) {
				logger.error(`Failed to restore recurring task ${id}:`, err);
			}
		}

		// Restore one-time tasks
		const onceData = await cacheStore.getScheduledTasks("once");
		for (const [id, dataStr] of Object.entries(onceData)) {
			try {
				const data = JSON.parse(dataStr);

				// Skip already expired tasks
				if (data.scheduledTime < Date.now()) {
					await cacheStore.removeScheduledTask("once", id);
					continue;
				}

				scheduledTasks.set(id, {
					task: createTask(
						data.task.name,
						data.task.priority,
						data.task.actionName,
						parseSerializedArgs(data.task.actionArgs),
						data.task.retryCount
					),
					scheduledTime: data.scheduledTime,
				});
				logger.info(`Restored one-time task: ${id}`);
			} catch (err) {
				logger.error(`Failed to restore one-time task ${id}:`, err);
			}
		}

		logger.info(scheduledTasks, "Restored scheduled tasks from Redis: ");
		logger.info(recurringTasks, "Restored recurring tasks from Redis: ");
	} catch (err) {
		logger.error("Failed to restore scheduled tasks:", err);
	}
}

function parseSerializedArgs(actionArgs: any): any[] {
	if (actionArgs === null || actionArgs === undefined) {
		return [];
	}

	if (Array.isArray(actionArgs)) {
		return actionArgs; // Already an array
	}

	if (typeof actionArgs === "string") {
		try {
			const parsed = JSON.parse(actionArgs);
			// Ensure the parsed result is an array
			return Array.isArray(parsed) ? parsed : [parsed];
		} catch {
			// If parsing fails, treat the string as a single argument
			return [actionArgs];
		}
	}

	// If it's some other type (object, number, boolean), wrap it in an array
	return [actionArgs];
}
