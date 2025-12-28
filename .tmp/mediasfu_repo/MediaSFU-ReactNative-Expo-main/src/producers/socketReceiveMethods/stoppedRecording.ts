import { ShowAlert } from '../../@types/types';

export interface StoppedRecordingOptions {
  state: string;
  reason: string;
  showAlert?: ShowAlert;
}

// Export the type definition for the function
export type StoppedRecordingType = (options: StoppedRecordingOptions) => Promise<void>;

/**
 * Displays an alert message when the recording has stopped, indicating the reason.
 *
 * @param {StoppedRecordingOptions} options - Options for showing the recording stopped alert.
 * @param {string} options.state - The state of the recording, should be "stop" to trigger the alert.
 * @param {string} options.reason - Reason why the recording stopped.
 * @param {ShowAlert} [options.showAlert] - Optional function to display the alert message.
 *
 * @returns {Promise<void>} A promise that resolves once the alert is shown, if applicable.
 *
 * @example
 * ```typescript
 * const options = {
 *   state: "stop",
 *   reason: "The session ended.",
 *   showAlert: (alert) => console.log(alert.message),
 * };
 * 
 * stoppedRecording(options);
 * // Output: "The recording has stopped - The session ended."
 * ```
 */

export const stoppedRecording = async ({
  state,
  reason,
  showAlert,
}: StoppedRecordingOptions): Promise<void> => {
  try {
    // Ensure the state is 'stop' before showing the alert
    if (state === 'stop') {
      showAlert?.({
        message: `The recording has stopped - ${reason}.`,
        duration: 3000,
        type: 'danger',
      });
    }
  } catch (error) {
    console.log('Error in stoppedRecording: ', error);
    // throw new Error("Failed to display the recording stopped alert message.");
  }
};
