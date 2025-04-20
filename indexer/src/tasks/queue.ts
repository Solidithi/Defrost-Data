import { Task } from "./type";
import { PriorityQueue } from "priority-queue-typescript";

export const taskQueue = new PriorityQueue<Task>(
	5,
	// Comparator function (lower number means higher priority)
	(t1: Task, t2: Task) => t1.priority - t2.priority
);
export * from "./type";
