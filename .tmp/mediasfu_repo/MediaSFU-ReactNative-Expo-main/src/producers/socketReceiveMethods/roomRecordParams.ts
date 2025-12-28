export interface RecordParams {
  recordingAudioPausesLimit: number;
  recordingAudioPausesCount: number;
  recordingAudioSupport: boolean;
  recordingAudioPeopleLimit: number;
  recordingAudioParticipantsTimeLimit: number;
  recordingVideoPausesCount: number;
  recordingVideoPausesLimit: number;
  recordingVideoSupport: boolean;
  recordingVideoPeopleLimit: number;
  recordingVideoParticipantsTimeLimit: number;
  recordingAllParticipantsSupport: boolean;
  recordingVideoParticipantsSupport: boolean;
  recordingAllParticipantsFullRoomSupport: boolean;
  recordingVideoParticipantsFullRoomSupport: boolean;
  recordingPreferredOrientation: string;
  recordingSupportForOtherOrientation: boolean;
  recordingMultiFormatsSupport: boolean;
}

export interface RoomRecordParamsParameters {
  updateRecordingAudioPausesLimit: (value: number) => void;
  updateRecordingAudioPausesCount: (value: number) => void;
  updateRecordingAudioSupport: (value: boolean) => void;
  updateRecordingAudioPeopleLimit: (value: number) => void;
  updateRecordingAudioParticipantsTimeLimit: (value: number) => void;
  updateRecordingVideoPausesCount: (value: number) => void;
  updateRecordingVideoPausesLimit: (value: number) => void;
  updateRecordingVideoSupport: (value: boolean) => void;
  updateRecordingVideoPeopleLimit: (value: number) => void;
  updateRecordingVideoParticipantsTimeLimit: (value: number) => void;
  updateRecordingAllParticipantsSupport: (value: boolean) => void;
  updateRecordingVideoParticipantsSupport: (value: boolean) => void;
  updateRecordingAllParticipantsFullRoomSupport: (value: boolean) => void;
  updateRecordingVideoParticipantsFullRoomSupport: (value: boolean) => void;
  updateRecordingPreferredOrientation: (value: string) => void;
  updateRecordingSupportForOtherOrientation: (value: boolean) => void;
  updateRecordingMultiFormatsSupport: (value: boolean) => void;

  // mediasfu functions
  [key: string]: any;
}
export interface RoomRecordParamsOptions {
  recordParams: RecordParams;
  parameters: RoomRecordParamsParameters;
}

// Export the type definition for the function
export type RoomRecordParamsType = ({
  recordParams,
  parameters,
}: RoomRecordParamsOptions) => Promise<void>;

/**
 * Updates various recording parameters based on the provided `recordParams`.
 *
 * @param {Object} params - The parameters object.
 * @param {RecordParams} params.recordParams - The recording parameters to update.
 * @param {Parameters} params.parameters - The functions to update each recording parameter.
 * @param {Function} params.parameters.updateRecordingAudioPausesLimit - Function to update the audio pauses limit.
 * @param {Function} params.parameters.updateRecordingAudioPausesCount - Function to update the audio pauses count.
 * @param {Function} params.parameters.updateRecordingAudioSupport - Function to update the audio support.
 * @param {Function} params.parameters.updateRecordingAudioPeopleLimit - Function to update the audio people limit.
 * @param {Function} params.parameters.updateRecordingAudioParticipantsTimeLimit - Function to update the audio participants time limit.
 * @param {Function} params.parameters.updateRecordingVideoPausesCount - Function to update the video pauses count.
 * @param {Function} params.parameters.updateRecordingVideoPausesLimit - Function to update the video pauses limit.
 * @param {Function} params.parameters.updateRecordingVideoSupport - Function to update the video support.
 * @param {Function} params.parameters.updateRecordingVideoPeopleLimit - Function to update the video people limit.
 * @param {Function} params.parameters.updateRecordingVideoParticipantsTimeLimit - Function to update the video participants time limit.
 * @param {Function} params.parameters.updateRecordingAllParticipantsSupport - Function to update the all participants support.
 * @param {Function} params.parameters.updateRecordingVideoParticipantsSupport - Function to update the video participants support.
 * @param {Function} params.parameters.updateRecordingAllParticipantsFullRoomSupport - Function to update the all participants full room support.
 * @param {Function} params.parameters.updateRecordingVideoParticipantsFullRoomSupport - Function to update the video participants full room support.
 * @param {Function} params.parameters.updateRecordingPreferredOrientation - Function to update the preferred orientation.
 * @param {Function} params.parameters.updateRecordingSupportForOtherOrientation - Function to update the support for other orientation.
 * @param {Function} params.parameters.updateRecordingMultiFormatsSupport - Function to update the multi-formats support.
 * @returns {Promise<void>} A promise that resolves when all parameters have been updated.
 *
 * @example
 * ```typescript
 * const recordParams = {
 *   recordingAudioPausesLimit: 3,
 *   recordingAudioPausesCount: 1,
 *   recordingAudioSupport: true,
 *   recordingAudioPeopleLimit: 10,
 *   recordingAudioParticipantsTimeLimit: 60,
 *   recordingVideoPausesCount: 1,
 *   recordingVideoPausesLimit: 3,
 *   recordingVideoSupport: true,
 *   recordingVideoPeopleLimit: 10,
 *   recordingVideoParticipantsTimeLimit: 60,
 *   recordingAllParticipantsSupport: true,
 *   recordingVideoParticipantsSupport: false,
 *   recordingAllParticipantsFullRoomSupport: true,
 *   recordingVideoParticipantsFullRoomSupport: false,
 *   recordingPreferredOrientation: "landscape",
 *   recordingSupportForOtherOrientation: true,
 *   recordingMultiFormatsSupport: false,
 * };
 *
 * const parameters = {
 *   updateRecordingAudioPausesLimit: (value) => console.log("Audio Pauses Limit:", value),
 *   updateRecordingAudioPausesCount: (value) => console.log("Audio Pauses Count:", value),
 *   updateRecordingAudioSupport: (value) => console.log("Audio Support:", value),
 *   updateRecordingAudioPeopleLimit: (value) => console.log("Audio People Limit:", value),
 *   updateRecordingAudioParticipantsTimeLimit: (value) => console.log("Audio Participants Time Limit:", value),
 *   updateRecordingVideoPausesCount: (value) => console.log("Video Pauses Count:", value),
 *   updateRecordingVideoPausesLimit: (value) => console.log("Video Pauses Limit:", value),
 *   updateRecordingVideoSupport: (value) => console.log("Video Support:", value),
 *   updateRecordingVideoPeopleLimit: (value) => console.log("Video People Limit:", value),
 *   updateRecordingVideoParticipantsTimeLimit: (value) => console.log("Video Participants Time Limit:", value),
 *   updateRecordingAllParticipantsSupport: (value) => console.log("All Participants Support:", value),
 *   updateRecordingVideoParticipantsSupport: (value) => console.log("Video Participants Support:", value),
 *   updateRecordingAllParticipantsFullRoomSupport: (value) => console.log("All Participants Full Room Support:", value),
 *   updateRecordingVideoParticipantsFullRoomSupport: (value) => console.log("Video Participants Full Room Support:", value),
 *   updateRecordingPreferredOrientation: (value) => console.log("Preferred Orientation:", value),
 *   updateRecordingSupportForOtherOrientation: (value) => console.log("Support For Other Orientation:", value),
 *   updateRecordingMultiFormatsSupport: (value) => console.log("Multi-Formats Support:", value),
 * };
 *
 * await roomRecordParams({ recordParams, parameters });
 * ```
 */

export const roomRecordParams = async ({
  recordParams,
  parameters,
}: RoomRecordParamsOptions): Promise<void> => {
  const {
    updateRecordingAudioPausesLimit,
    updateRecordingAudioPausesCount,
    updateRecordingAudioSupport,
    updateRecordingAudioPeopleLimit,
    updateRecordingAudioParticipantsTimeLimit,
    updateRecordingVideoPausesCount,
    updateRecordingVideoPausesLimit,
    updateRecordingVideoSupport,
    updateRecordingVideoPeopleLimit,
    updateRecordingVideoParticipantsTimeLimit,
    updateRecordingAllParticipantsSupport,
    updateRecordingVideoParticipantsSupport,
    updateRecordingAllParticipantsFullRoomSupport,
    updateRecordingVideoParticipantsFullRoomSupport,
    updateRecordingPreferredOrientation,
    updateRecordingSupportForOtherOrientation,
    updateRecordingMultiFormatsSupport,
  } = parameters;

  // Update each recording parameter based on the provided recordParams
  updateRecordingAudioPausesLimit(recordParams.recordingAudioPausesLimit);
  updateRecordingAudioPausesCount(recordParams.recordingAudioPausesCount);
  updateRecordingAudioSupport(recordParams.recordingAudioSupport);
  updateRecordingAudioPeopleLimit(recordParams.recordingAudioPeopleLimit);
  updateRecordingAudioParticipantsTimeLimit(
    recordParams.recordingAudioParticipantsTimeLimit,
  );
  updateRecordingVideoPausesCount(recordParams.recordingVideoPausesCount);
  updateRecordingVideoPausesLimit(recordParams.recordingVideoPausesLimit);
  updateRecordingVideoSupport(recordParams.recordingVideoSupport);
  updateRecordingVideoPeopleLimit(recordParams.recordingVideoPeopleLimit);
  updateRecordingVideoParticipantsTimeLimit(
    recordParams.recordingVideoParticipantsTimeLimit,
  );
  updateRecordingAllParticipantsSupport(
    recordParams.recordingAllParticipantsSupport,
  );
  updateRecordingVideoParticipantsSupport(
    recordParams.recordingVideoParticipantsSupport,
  );
  updateRecordingAllParticipantsFullRoomSupport(
    recordParams.recordingAllParticipantsFullRoomSupport,
  );
  updateRecordingVideoParticipantsFullRoomSupport(
    recordParams.recordingVideoParticipantsFullRoomSupport,
  );
  updateRecordingPreferredOrientation(
    recordParams.recordingPreferredOrientation,
  );
  updateRecordingSupportForOtherOrientation(
    recordParams.recordingSupportForOtherOrientation,
  );
  updateRecordingMultiFormatsSupport(recordParams.recordingMultiFormatsSupport);
};
