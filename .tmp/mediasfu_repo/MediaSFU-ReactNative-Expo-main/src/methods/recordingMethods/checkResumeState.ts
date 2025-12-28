export interface CheckResumeStateOptions {
  recordingMediaOptions: string; // 'video' or 'audio'
  recordingVideoPausesLimit: number;
  recordingAudioPausesLimit: number;
  pauseRecordCount: number;
}

// Export the type definition for the function
export type CheckResumeStateType = (options: CheckResumeStateOptions) => Promise<boolean>;

/**
 * Checks if the recording can be resumed based on the media type and pause limits.
 *
 * @param {Object} options - The options for checking resume state.
 * @param {string} options.recordingMediaOptions - The type of media being recorded ("video" or "audio").
 * @param {number} options.recordingVideoPausesLimit - The maximum number of pauses allowed for video recording.
 * @param {number} options.recordingAudioPausesLimit - The maximum number of pauses allowed for audio recording.
 * @param {number} options.pauseRecordCount - The current number of pauses that have occurred.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the recording can be resumed.
 * 
 * @example
 * ```typescript
 * const canResume = await checkResumeState({
 *   recordingMediaOptions: "video",
 *   recordingVideoPausesLimit: 3,
 *   recordingAudioPausesLimit: 5,
 *   pauseRecordCount: 2,
 * });
 * console.log(canResume); // true if pauseRecordCount is within limits
 * ```
 */

export const checkResumeState = async ({
  recordingMediaOptions,
  recordingVideoPausesLimit,
  recordingAudioPausesLimit,
  pauseRecordCount,
}: CheckResumeStateOptions): Promise<boolean> => {
  // Determine the reference limit for pauses based on the media type
  const ref_limit = recordingMediaOptions === 'video'
    ? recordingVideoPausesLimit
    : recordingAudioPausesLimit;

  // Check if the user can resume the recording
  return pauseRecordCount <= ref_limit;
};
