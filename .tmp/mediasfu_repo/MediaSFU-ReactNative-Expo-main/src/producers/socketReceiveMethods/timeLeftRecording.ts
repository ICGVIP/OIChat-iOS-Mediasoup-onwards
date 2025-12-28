import { ShowAlert } from '../../@types/types';

export interface TimeLeftRecordingOptions {
  timeLeft: number;
  showAlert?: ShowAlert;
}

// Export the type definition for the function
export type TimeLeftRecordingType = (options: TimeLeftRecordingOptions) => void;

/**
 * Displays an alert message indicating the remaining time left for recording.
 *
 * @param {TimeLeftRecordingOptions} options - Options to manage time left for recording.
 * @param {number} options.timeLeft - Time remaining for the recording in seconds.
 * @param {ShowAlert} [options.showAlert] - Optional function to show alert message.
 * 
 * @returns {void}
 * 
 * @example
 * ```typescript
 * const options = {
 *   timeLeft: 30,
 *   showAlert: (alert) => console.log(alert.message),
 * };
 * 
 * timeLeftRecording(options);
 * // Output: "The recording will stop in less than 30 seconds."
 * ```
 */

export const timeLeftRecording = ({ timeLeft, showAlert }: TimeLeftRecordingOptions): void => {
  try {
    // Display alert message

    showAlert?.({
      message: `The recording will stop in less than ${timeLeft} seconds.`,
      duration: 3000,
      type: 'danger',
    });
  } catch (error) {
    console.log('Error in timeLeftRecording: ', error);
    // throw new Error("Failed to display the time left alert message.");
  }
};
