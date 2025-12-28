export interface SleepOptions {
  ms: number;
}

// Export the type definition for the function
export type SleepType = (options: SleepOptions) => Promise<void>;

/**
 * Pauses the execution for a specified number of milliseconds.
 *
 * @param {SleepOptions} options - An object containing the sleep duration.
 * @param {number} options.ms - The number of milliseconds to sleep.
 * @returns {Promise<void>} A promise that resolves after the specified duration.
 * 
 * @example
 * ```typescript
 * await sleep({ ms: 2000 });
 * console.log("Waited for 2 seconds");
 * ```
 */

export function sleep({ ms }: SleepOptions): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
