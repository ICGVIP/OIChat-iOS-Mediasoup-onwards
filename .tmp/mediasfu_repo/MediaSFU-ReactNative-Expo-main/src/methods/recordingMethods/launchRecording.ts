import { ShowAlert } from '../../@types/types';

export interface LaunchRecordingOptions {
  updateIsRecordingModalVisible: (visible: boolean) => void;
  isRecordingModalVisible: boolean;
  showAlert?: ShowAlert;
  stopLaunchRecord: boolean;
  canLaunchRecord: boolean;
  recordingAudioSupport: boolean;
  recordingVideoSupport: boolean;
  updateCanRecord: (canRecord: boolean) => void;
  updateClearedToRecord: (cleared: boolean) => void;
  recordStarted: boolean;
  recordPaused: boolean;
  localUIMode: boolean;

  [key: string]: any;
}

// Export the type definition for the function
export type LaunchRecordingType = (options: LaunchRecordingOptions) => void;

/**
 * Launches the recording process based on various conditions and updates the UI accordingly.
 *
 * @param {Object} options - The options for launching the recording.
 * @param {Function} options.updateIsRecordingModalVisible - Function to update the visibility of the recording modal.
 * @param {boolean} options.isRecordingModalVisible - Indicates if the recording modal is currently visible.
 * @param {Function} options.showAlert - Function to show an alert message.
 * @param {boolean} options.stopLaunchRecord - Indicates if the recording launch should be stopped.
 * @param {boolean} options.canLaunchRecord - Indicates if the recording can be launched.
 * @param {boolean} options.recordingAudioSupport - Indicates if audio recording is supported.
 * @param {boolean} options.recordingVideoSupport - Indicates if video recording is supported.
 * @param {Function} options.updateCanRecord - Function to update the recording capability.
 * @param {Function} options.updateClearedToRecord - Function to update the cleared-to-record status.
 * @param {boolean} options.recordStarted - Indicates if the recording has started.
 * @param {boolean} options.recordPaused - Indicates if the recording is paused.
 * @param {boolean} options.localUIMode - Indicates if the local UI mode is active.
 *
 * @returns {void}
 * 
 * @example
 * ```typescript
 * launchRecording({
 *   updateIsRecordingModalVisible: (visible) => console.log(`Modal visible: ${visible}`),
 *   isRecordingModalVisible: false,
 *   showAlert: (alert) => console.log(alert.message),
 *   stopLaunchRecord: false,
 *   canLaunchRecord: true,
 *   recordingAudioSupport: true,
 *   recordingVideoSupport: true,
 *   updateCanRecord: (canRecord) => console.log(`Can record: ${canRecord}`),
 *   updateClearedToRecord: (cleared) => console.log(`Cleared to record: ${cleared}`),
 *   recordStarted: false,
 *   recordPaused: false,
 *   localUIMode: false
 * });
 * ```
 */

export const launchRecording = ({
  updateIsRecordingModalVisible,
  isRecordingModalVisible,
  showAlert,
  stopLaunchRecord,
  canLaunchRecord,
  recordingAudioSupport,
  recordingVideoSupport,
  updateCanRecord,
  updateClearedToRecord,
  recordStarted,
  recordPaused,
  localUIMode,
}: LaunchRecordingOptions): void => {
  // Check if recording is already launched
  if (!isRecordingModalVisible && stopLaunchRecord && !localUIMode) {
    showAlert?.({
      message: 'Recording has already ended or you are not allowed to record',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  // Check if recording initiation is allowed
  if (!isRecordingModalVisible && canLaunchRecord && !localUIMode) {
    // Check if both audio and video recording are not allowed
    if (!recordingAudioSupport && !recordingVideoSupport) {
      showAlert?.({
        message: 'You are not allowed to record',
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    // Update clearedToRecord and canRecord
    updateClearedToRecord(false);
    updateCanRecord(false);
  }

  if (!isRecordingModalVisible && recordStarted) {
    if (!recordPaused) {
      showAlert?.({
        message: 'You can only re-configure recording after pausing it',
        type: 'danger',
        duration: 3000,
      });
      return;
    }
  }

  if (
    !isRecordingModalVisible
    && !recordingAudioSupport
    && !recordingVideoSupport
    && !localUIMode
  ) {
    showAlert?.({
      message: 'You are not allowed to record',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  // Update the visibility of the recording modal
  updateIsRecordingModalVisible(!isRecordingModalVisible);
};
