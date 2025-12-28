import { ShowAlert } from '../../@types/types';

export interface CheckPauseStateOptions {
  recordingMediaOptions: string; // "video" | "audio"
  recordingVideoPausesLimit: number;
  recordingAudioPausesLimit: number;
  pauseRecordCount: number;
  showAlert?: ShowAlert;
}

// Export the type definition for the function
export type CheckPauseStateType = (options: CheckPauseStateOptions) => Promise<boolean>;

/**
 * Checks if the recording can be paused based on the current pause count and the allowed pause limits.
 *
 * @param {Object} options - The options for checking the pause state.
 * @param {string} options.recordingMediaOptions - The type of media being recorded ("video" or "audio").
 * @param {number} options.recordingVideoPausesLimit - The maximum number of pauses allowed for video recordings.
 * @param {number} options.recordingAudioPausesLimit - The maximum number of pauses allowed for audio recordings.
 * @param {number} options.pauseRecordCount - The current count of pauses that have been made.
 * @param {Function} options.showAlert - A function to show an alert message if the pause limit is reached.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the recording can be paused, otherwise `false`.
 * @example
 * 
 * ```typescript
 * const canPause = await checkPauseState({
 *   recordingMediaOptions: "audio",
 *   recordingVideoPausesLimit: 3,
 *   recordingAudioPausesLimit: 5,
 *   pauseRecordCount: 4,
 *   showAlert: ({ message, type, duration }) => console.log(message),
 * });
 * console.log(canPause); // true if pauseRecordCount is below the limit, false if limit reached
 * ```
 */

export const checkPauseState = async ({
  recordingMediaOptions,
  recordingVideoPausesLimit,
  recordingAudioPausesLimit,
  pauseRecordCount,
  showAlert,
}: CheckPauseStateOptions): Promise<boolean> => {
  // Determine the reference limit for pauses based on the media type
  const ref_limit = recordingMediaOptions === 'video'
    ? recordingVideoPausesLimit
    : recordingAudioPausesLimit;

  // Check if the user can still pause the recording
  if (pauseRecordCount < ref_limit) {
    return true;
  }
  // Show alert if the pause limit is reached
  showAlert?.({
    message:
        'You have reached the limit of pauses - you can choose to stop recording.',
    type: 'danger',
    duration: 3000,
  });
  return false;
};
