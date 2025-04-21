import { taskQueue } from "./queue";
import { cacheStore, prismaClient } from "../singletons";
import { logger } from "../singletons";
import { actionRegistry } from "./actions/action-registry";

/**
 * Main worker function that processes tasks from the queue
 */
export async function initTaskWorker(): Promise<void> {
	logger.info("Starting task worker thread...");

	// Ensure database and redis connections are initialized
	if (!cacheStore.isReady) {
		logger.info("Connecting Redis client from worker thread...");
		await cacheStore.connect();
	}

	try {
		await prismaClient.$queryRaw`SELECT 1`;
		logger.info("Prisma client is connected");
	} catch (e) {
		logger.info("prisma client not connected, connecting now...");
		await prismaClient.$connect();
		console.log("Done");
	}

	// Start processing loop
	processNextTask();
	logger.info("Task worker initialized and running");
}

/**
 * Recursive function that processes the next task and schedules itself
 */
async function processNextTask(): Promise<void> {
	try {
		// Check if there are tasks in the queue
		if (taskQueue.size() === 0) {
			// No tasks, wait a bit and check again
			logger.debug({
				message: "No tasks in the queue, waiting for 1 second...",
				queueSize: taskQueue.size(),
			});
			setTimeout(processNextTask, 1000);
			return;
		}

		// Get next task from the priority queue without removing it (for potential retries)
		const task = taskQueue.peek();
		if (!task) {
			setTimeout(processNextTask, 1000);
			return;
		}

		logger.debug(
			`Processing task: ${task.name} (priority: ${task.priority})`
		);

		const startTime = Date.now();

		try {
			// Execute the task
			logger.info(`Executing task ${task.name}...`);
			const action = actionRegistry.get(task.actionName);
			await action(...task.actionArgs);

			const duration = Date.now() - startTime;
			logger.info(`Task ${task.name} completed in ${duration}ms`);

			// Remove the task from the queue
			taskQueue.poll();
		} catch (error) {
			logger.error(error, `Task ${task.name} failed:`);

			// Retry logic if task has retries left
			if (task.retryCount > 0) {
				task.retryCount--;
				logger.info(
					`Retrying task ${task.name}, ${task.retryCount} retries left`
				);
			} else {
				taskQueue.poll();
			}
		}

		// Process next task immediately
		setImmediate(processNextTask);
	} catch (err) {
		// Handle any unexpected errors in the worker itself
		logger.error("Error in task worker:", err);
		setTimeout(processNextTask, 5000); // Wait longer if worker had an error
	}
}
