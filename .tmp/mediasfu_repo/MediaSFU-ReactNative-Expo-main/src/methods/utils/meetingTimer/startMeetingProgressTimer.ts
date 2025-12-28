export interface StartMeetingProgressTimerParameters {
  updateMeetingProgressTime: (formattedTime: string) => void;
  validated: boolean;
  roomName: string;

  // mediasfu functions
  getUpdatedAllParams: () => StartMeetingProgressTimerParameters;
  [key: string]: any;

}

export interface StartMeetingProgressTimerOptions {
  startTime: number;
  parameters: StartMeetingProgressTimerParameters;
}

// Export the type definition for the function
export type StartMeetingProgressTimerType = (options: StartMeetingProgressTimerOptions) => void;

/**
 * Starts a timer to track the progress of a meeting.
 * 
 * @param {StartMeetingProgressTimerOptions} options - The options for starting the meeting progress timer.
 * @param {number} options.startTime - The custom start time for the meeting progress timer.
 * @param {StartMeetingProgressTimerParameters} options.parameters - The parameters required for updating the meeting progress.
 * @param {Function} options.parameters.updateMeetingProgressTime - Function to update the meeting progress time.
 * @param {Function} options.parameters.getUpdatedAllParams - Function to get updated parameters.
 * 
 * @example
 * ```typescript
 * startMeetingProgressTimer({
 *   startTime: 1609459200, // e.g., timestamp for the start of the meeting
 *   parameters: {
 *     updateMeetingProgressTime: (formattedTime) => console.log("Meeting time:", formattedTime),
 *     validated: true,
 *     roomName: "room1",
 *     getUpdatedAllParams: () => ({ validated: true, roomName: "room1", updateMeetingProgressTime }),
 *   },
 * });
 * ```
 */

export function startMeetingProgressTimer({
  startTime,
  parameters,
}: StartMeetingProgressTimerOptions): void {
  const { updateMeetingProgressTime, getUpdatedAllParams } = parameters;

  /**
   * Calculate the elapsed time based on the start time.
   * @param {number} startTime - The custom start time for the meeting progress timer.
   * @returns {number} - The elapsed time in seconds.
   */
  function calculateElapsedTime(startTime: number): number {
    const currentTime = Math.floor(new Date().getTime() / 1000);
    return currentTime - startTime;
  }

  /**
   * Utility function to pad single-digit numbers with leading zeros.
   * @param {number} number - The number to pad.
   * @returns {string} - The padded number as a string.
   */
  function padNumber(number: number): string {
    return number.toString().padStart(2, '0');
  }

  /**
   * Format the time in HH:MM:SS format.
   * @param {number} time - The time in seconds.
   * @returns {string} - The formatted time string.
   */
  function formatTime(time: number): string {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(Number(seconds))}`;
  }

  let elapsedTime = calculateElapsedTime(startTime);

  // Update the timer and indicator every second
  let timeProgress: NodeJS.Timeout | null = setInterval(async () => {
    elapsedTime++;
    const formattedTime = formatTime(elapsedTime);
    updateMeetingProgressTime(formattedTime);

    parameters = getUpdatedAllParams();

    if (!parameters.validated || !parameters.roomName) {
      clearInterval(timeProgress!);
      timeProgress = null;
    }
  }, 1000);
}
