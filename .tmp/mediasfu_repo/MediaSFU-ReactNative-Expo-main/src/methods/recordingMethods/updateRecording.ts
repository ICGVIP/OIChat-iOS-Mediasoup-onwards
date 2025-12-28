import { Socket } from 'socket.io-client';
import { RePortParameters, RePortType, ShowAlert, UserRecordingParams } from '../../@types/types';
import { checkPauseState } from './checkPauseState';
import { checkResumeState } from './checkResumeState';
import { recordPauseTimer } from './recordPauseTimer';
import { recordResumeTimer, RecordResumeTimerParameters } from './recordResumeTimer';

export interface UpdateRecordingParameters extends RecordResumeTimerParameters, RePortParameters {
  roomName: string;
  userRecordingParams: UserRecordingParams;
  socket: Socket;
  localSocket?: Socket;
  updateIsRecordingModalVisible: (visible: boolean) => void;
  confirmedToRecord: boolean;
  showAlert?: ShowAlert;
  recordingMediaOptions: string;
  videoAlreadyOn: boolean;
  audioAlreadyOn: boolean;
  recordStarted: boolean;
  recordPaused: boolean;
  recordResumed: boolean;
  recordStopped: boolean;
  recordChangeSeconds: number;
  pauseRecordCount: number;
  startReport: boolean;
  endReport: boolean;
  canRecord: boolean;
  canPauseResume: boolean;
  updateCanPauseResume: (canPauseResume: boolean) => void;
  updatePauseRecordCount: (count: number) => void;
  updateClearedToRecord: (cleared: boolean) => void;
  updateRecordPaused: (paused: boolean) => void;
  updateRecordResumed: (resumed: boolean) => void;
  updateStartReport: (start: boolean) => void;
  updateEndReport: (end: boolean) => void;
  updateCanRecord: (canRecord: boolean) => void;


  // Mediasfu functions
  rePort: RePortType;

  getUpdatedAllParams: () => UpdateRecordingParameters;
  [key: string]: any;
}

export interface UpdateRecordingOptions {
  parameters: UpdateRecordingParameters;
}

// Export the type definition for the function
export type UpdateRecordingType = (options: UpdateRecordingOptions) => Promise<void>;

/**
 * Updates the recording state based on the provided parameters.
 * 
 * @param {UpdateRecordingOptions} parameters - The parameters for updating the recording state.
 * @returns {Promise<void>} A promise that resolves when the recording state has been updated.
 * 
 * @property {string} roomName - The name of the room where the recording is taking place.
 * @property {any} userRecordingParams - Parameters related to the user's recording settings.
 * @property {any} socket - The socket connection used for communication.
 * @property {any} localSocket - The local socket connection used for communication.
 * @property {Function} updateIsRecordingModalVisible - Function to update the visibility of the recording modal.
 * @property {boolean} confirmedToRecord - Indicates if the user has confirmed to start recording.
 * @property {Function} showAlert - Function to show alert messages.
 * @property {string} recordingMediaOptions - The media options for recording (e.g., 'video', 'audio').
 * @property {boolean} videoAlreadyOn - Indicates if the video is already turned on.
 * @property {boolean} audioAlreadyOn - Indicates if the audio is already turned on.
 * @property {boolean} recordStarted - Indicates if the recording has started.
 * @property {boolean} recordPaused - Indicates if the recording is paused.
 * @property {boolean} recordResumed - Indicates if the recording has resumed.
 * @property {boolean} recordStopped - Indicates if the recording has stopped.
 * @property {number} recordChangeSeconds - The interval in seconds for changing the recording state.
 * @property {number} pauseRecordCount - The count of pauses during the recording.
 * @property {boolean} startReport - Indicates if the start report is active.
 * @property {boolean} endReport - Indicates if the end report is active.
 * @property {boolean} canRecord - Indicates if recording is allowed.
 * @property {boolean} canPauseResume - Indicates if pausing and resuming the recording is allowed.
 * @property {Function} updateCanPauseResume - Function to update the pause/resume state.
 * @property {Function} updatePauseRecordCount - Function to update the pause record count.
 * @property {Function} updateClearedToRecord - Function to update the cleared-to-record state.
 * @property {Function} updateRecordPaused - Function to update the record paused state.
 * @property {Function} updateRecordResumed - Function to update the record resumed state.
 * @property {Function} updateStartReport - Function to update the start report state.
 * @property {Function} updateEndReport - Function to update the end report state.
 * @property {Function} updateCanRecord - Function to update the can record state.
 * @property {Function} rePort - Function to handle reporting.
 * 
 * @example
 * ```typescript
 * updateRecording({
 *   parameters: {
 *     roomName: 'Room101',
 *     socket: mySocket,
 *     localSocket: myLocalSocket,
 *     updateIsRecordingModalVisible: setIsRecordingModalVisible,
 *     confirmedToRecord: true,
 *     showAlert: myShowAlert,
 *     recordingMediaOptions: 'video',
 *     videoAlreadyOn: true,
 *     audioAlreadyOn: true,
 *     recordStarted: false,
 *     recordPaused: false,
 *     recordResumed: false,
 *     recordStopped: false,
 *     recordChangeSeconds: 3,
 *     pauseRecordCount: 0,
 *     startReport: false,
 *     endReport: false,
 *     canRecord: true,
 *     canPauseResume: true,
 *     updateCanPauseResume: setCanPauseResume,
 *     updatePauseRecordCount: setPauseRecordCount,
 *     updateClearedToRecord: setClearedToRecord,
 *     updateRecordPaused: setRecordPaused,
 *     updateRecordResumed: setRecordResumed,
 *     updateStartReport: setStartReport,
 *     updateEndReport: setEndReport,
 *     updateCanRecord: setCanRecord,
 *     rePort: myRePortFunction,
 *   },
 * });
 * ```
 */

export const updateRecording = async ({
  parameters
}: UpdateRecordingOptions): Promise<void> => {
  let {
    roomName,
    userRecordingParams,
    socket,
    localSocket,
    updateIsRecordingModalVisible,
    confirmedToRecord,
    showAlert,
    recordingMediaOptions,
    videoAlreadyOn,
    audioAlreadyOn,
    recordStarted,
    recordPaused,
    recordResumed,
    recordStopped,
    recordChangeSeconds,
    pauseRecordCount,
    startReport,
    endReport,
    canRecord,
    canPauseResume,
    updateCanPauseResume,
    updatePauseRecordCount,
    updateClearedToRecord,
    updateRecordPaused,
    updateRecordResumed,
    updateStartReport,
    updateEndReport,
    updateCanRecord,

    //mediasfu functions
    rePort,

  } = parameters;

  // Check if recording has stopped
  if (recordStopped) {
    showAlert?.({
      message: 'Recording has already stopped',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  // Check video requirement for recording
  if (recordingMediaOptions === 'video' && !videoAlreadyOn) {
    showAlert?.({
      message: 'You must turn on your video before you can start recording',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  // Check audio requirement for recording
  if (recordingMediaOptions === 'audio' && !audioAlreadyOn) {
    showAlert?.({
      message: 'You must turn on your audio before you can start recording',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  let socketRef = localSocket && localSocket.connected ? localSocket : socket;

  // Handle pause action
  if (recordStarted && !recordPaused && !recordStopped) {
    const proceed = await checkPauseState({
      recordingMediaOptions,
      recordingVideoPausesLimit: parameters.recordingVideoPausesLimit,
      recordingAudioPausesLimit: parameters.recordingAudioPausesLimit,
      pauseRecordCount,
      showAlert,
    });

    if (!proceed) return;

    const record = recordPauseTimer({
      stop: false,
      isTimerRunning: parameters.isTimerRunning,
      canPauseResume: parameters.canPauseResume,
      showAlert,
    });

    if (record) {
      const action = 'pauseRecord';
      await new Promise<void>((resolve) => {
        socketRef.emit(
          action,
          { roomName },
          async ({ success, reason, recordState, pauseCount }: { success: boolean; reason: string; recordState: string; pauseCount: number }) => {
            pauseRecordCount = pauseCount;
            updatePauseRecordCount(pauseRecordCount);

            if (success) {
              startReport = false;
              endReport = true;
              recordPaused = true;
              updateStartReport(startReport);
              updateEndReport(endReport);
              updateRecordPaused(recordPaused);

              showAlert?.({
                message: 'Recording paused',
                type: 'success',
                duration: 3000,
              });

              // Close recording modal
              updateIsRecordingModalVisible(false);

              // Re-enable pause/resume actions after the change interval
              setTimeout(() => {
                canPauseResume = true;
                updateCanPauseResume(canPauseResume);
              }, recordChangeSeconds);
            } else {
              showAlert?.({
                message: `Recording Pause Failed: ${reason}; the current state is: ${recordState}`,
                type: 'danger',
                duration: 3000,
              });
            }
            resolve();
          }
        );
      });
    }
  }
  // Handle resume action
  else if (recordStarted && recordPaused && !recordStopped) {
    if (!confirmedToRecord) {
      showAlert?.({
        message: 'You must click confirm before you can start recording',
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    const proceed = await checkResumeState({
      recordingMediaOptions,
      recordingVideoPausesLimit: parameters.recordingVideoPausesLimit,
      recordingAudioPausesLimit: parameters.recordingAudioPausesLimit,
      pauseRecordCount,
    });

    if (!proceed) return;

    const resume = await recordResumeTimer({ parameters });
    if (resume) {
      // Mark recording as cleared to resume
      updateClearedToRecord(true);

      const action = 'resumeRecord';
      await new Promise<void>((resolve) => {
        socketRef.emit(
          action,
          { roomName, userRecordingParams },
          async ({ success, reason }: { success: boolean; reason: string }) => {
            if (success) {
              recordResumed = true;
              recordPaused = false;

              updateRecordPaused(recordPaused);
              updateRecordResumed(recordResumed);

              await rePort({ restart: true, parameters });
            } else {
              showAlert?.({
                message: `Recording could not resume - ${reason}`,
                type: 'danger',
                duration: 3000,
              });
            }
            canRecord = true;
            startReport = false;
            endReport = true;

            updateCanRecord(canRecord);
            updateStartReport(startReport);
            updateEndReport(endReport);

            resolve();
          }
        );
      });

      // Close recording modal
      updateIsRecordingModalVisible(false);

      // Re-enable pause/resume actions after the change interval
      setTimeout(() => {
        updateCanPauseResume(true);
      }, recordChangeSeconds);
    }
  }
};
