/**
 * All pre-defined priorities values for one-time tasks
 */
export const oneTimeTaskPriorities = {
	ASAP: 0,
	FEW_SECONDS_DELAY: 2,
	NORMAL: 3,
	FEW_MINUTES_DELAY: 4,
	FEW_HOURS_DELAY: 6,
	FEW_DAYS_DELAY: 8,
	FEW_WEEKS_DELAY: 10,
	FEW_MONTHS_DELAY: 12,
	FEW_QUARTERS_DELAY: 14,
	FEW_YEARS_DELAY: 16,
	FEW_DECADES_DELAY: 18,
	NO_ONE_CARES: 1000, // Special priority for tasks that either can be done or not
} as const;

export type OneTimeTaskPriority =
	(typeof oneTimeTaskPriorities)[keyof typeof oneTimeTaskPriorities];

/*
 * All pre-defined priorities values for recurring tasks
 */
export const recurringTaskPriorities = {
	ASAP: 1001,
	FEW_SECONDS_DELAY: 1002,
	NORMAL: 1003,
	FEW_MINUTES_DELAY: 1004,
	FEW_HOURS_DELAY: 1006,
	FEW_DAYS_DELAY: 1008,
	FEW_WEEKS_DELAY: 1010,
	FEW_MONTHS_DELAY: 1012,
	FEW_QUARTERS_DELAY: 1014,
	FEW_YEARS_DELAY: 1016,
	FEW_DECADES_DELAY: 1018,
	NO_ONE_CARES: 1020,
} as const;

export type RecurringTaskPriority =
	(typeof recurringTaskPriorities)[keyof typeof recurringTaskPriorities];
