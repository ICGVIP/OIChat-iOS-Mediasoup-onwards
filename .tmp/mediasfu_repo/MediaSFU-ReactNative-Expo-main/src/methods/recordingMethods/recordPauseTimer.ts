import { ShowAlert } from '../../@types/types';

export interface RecordPauseTimerOptions {
  stop?: boolean;
  isTimerRunning: boolean;
  canPauseResume: boolean;
  showAlert?: ShowAlert;
}

// Export the type definition for the function
export type RecordPauseTimerType = (options: RecordPauseTimerOptions) => boolean;

/**
 * Records the pause timer.
 *
 * @param {RecordPauseTimerOptions} options - The options for recording the pause timer.
 * @param {boolean} options.stop - A flag to stop the timer.
 * @param {boolean} options.isTimerRunning - A flag to check if the timer is running.
 * @param {boolean} options.canPauseResume - A flag to check if the timer can be paused or resumed.
 * @param {Function} options.showAlert - A function to show alerts.
 * @returns {boolean} A boolean value indicating if the timer can be paused or resumed.
 * 
 * @example
 * ```typescript
 * const canPause = recordPauseTimer({
 *   stop: false,
 *   isTimerRunning: true,
 *   canPauseResume: true,
 *   showAlert: (alert) => console.log(alert.message),
 * });
 * console.log("Can pause:", canPause); // Logs true or shows alert if conditions not met
 * ```
 */

export function recordPauseTimer({
  stop = false,
  isTimerRunning,
  canPauseResume,
  showAlert,
}: RecordPauseTimerOptions): boolean {
  // Ensure the timer is running and pause/resume actions are allowed
  if (isTimerRunning && canPauseResume) {
    return true;
  }
  const message = stop
    ? 'Can only stop after 15 seconds of starting or pausing or resuming recording'
    : 'Can only pause or resume after 15 seconds of starting or pausing or resuming recording';
  showAlert?.({
    message,
    type: 'danger',
  });
  return false;
}
