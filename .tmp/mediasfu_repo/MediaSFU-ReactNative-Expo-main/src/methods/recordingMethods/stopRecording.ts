import { Socket } from 'socket.io-client';
import { ShowAlert } from '../../@types/types';
import { recordPauseTimer } from './recordPauseTimer';

export interface StopRecordingParameters {
  roomName: string;
  socket: Socket;
  localSocket?: Socket;
  showAlert?: ShowAlert;
  startReport: boolean;
  endReport: boolean;
  recordStarted: boolean;
  recordPaused: boolean;
  recordStopped: boolean;
  updateRecordPaused: (paused: boolean) => void;
  updateRecordStopped: (stopped: boolean) => void;
  updateStartReport: (startReport: boolean) => void;
  updateEndReport: (endReport: boolean) => void;
  updateShowRecordButtons: (show: boolean) => void;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  recordingMediaOptions: string;

  // mediasfu functions
  captureCanvasStream: (options: { parameters: any; start?: boolean }) => void;

  [key: string]: any;
}

export interface StopRecordingOptions {
  parameters: StopRecordingParameters;
}

// Export the type definition for the function
export type StopRecordingType = (options: StopRecordingOptions) => Promise<void>;

/**
 * Stops the recording process if it has been started and not yet stopped.
 * 
 * @param {StopRecordingOptions} parameters - The parameters required to stop the recording.
 * @param {string} parameters.roomName - The name of the room where the recording is taking place.
 * @param {Socket} parameters.socket - The socket instance used for communication.
 * @param {Socket} [parameters.localSocket] - The local socket instance used for communication.
 * @param {Function} parameters.showAlert - Function to show alert messages.
 * @param {boolean} parameters.startReport - Indicates if the recording start report is active.
 * @param {boolean} parameters.endReport - Indicates if the recording end report is active.
 * @param {boolean} parameters.recordStarted - Indicates if the recording has started.
 * @param {boolean} parameters.recordPaused - Indicates if the recording is paused.
 * @param {boolean} parameters.recordStopped - Indicates if the recording has stopped.
 * @param {Function} parameters.updateRecordPaused - Function to update the record paused state.
 * @param {Function} parameters.updateRecordStopped - Function to update the record stopped state.
 * @param {Function} parameters.updateStartReport - Function to update the start report state.
 * @param {Function} parameters.updateEndReport - Function to update the end report state.
 * @param {Function} parameters.updateShowRecordButtons - Function to update the visibility of record buttons.
 * @param {boolean} parameters.whiteboardStarted - Indicates if the whiteboard session has started.
 * @param {boolean} parameters.whiteboardEnded - Indicates if the whiteboard session has ended.
 * @param {string} parameters.recordingMediaOptions - The media options for recording (e.g., 'video').
 * @param {Function} parameters.captureCanvasStream - Function to capture the canvas stream.
 * 
 * @returns {Promise<void>} A promise that resolves when the recording stop process is complete.
 * 
 * @example
 * ```typescript
 * stopRecording({
 *   parameters: {
 *     roomName: 'Room101',
 *     socket: mySocket,
 *     localSocket: myLocalSocket,
 *     showAlert: myShowAlert,
 *     startReport: true,
 *     endReport: false,
 *     recordStarted: true,
 *     recordPaused: false,
 *     recordStopped: false,
 *     updateRecordPaused: setRecordPaused,
 *     updateRecordStopped: setRecordStopped,
 *     updateStartReport: setStartReport,
 *     updateEndReport: setEndReport,
 *     updateShowRecordButtons: setShowRecordButtons,
 *     whiteboardStarted: true,
 *     whiteboardEnded: false,
 *     recordingMediaOptions: 'video',
 *     captureCanvasStream: myCaptureCanvasStream,
 *   },
 * });
 * ```
 */

export const stopRecording = async ({
  parameters,
}: StopRecordingOptions): Promise<void> => {
  let {
    roomName,
    socket,
    localSocket,
    showAlert,
    startReport,
    endReport,
    recordStarted,
    recordPaused,
    recordStopped,
    updateRecordPaused,
    updateRecordStopped,
    updateStartReport,
    updateEndReport,
    updateShowRecordButtons,
    whiteboardStarted,
    whiteboardEnded,
    recordingMediaOptions,

    //mediasfu functions
    captureCanvasStream,
  } = parameters;

  let recAttempt = false;

  if (recordStarted && !recordStopped) {
    const stop = recordPauseTimer({
       stop: true, 
       isTimerRunning: parameters.isTimerRunning,
       canPauseResume: parameters.canPauseResume,
       showAlert: parameters.showAlert,
    });
       
    if (stop) {
      const action = 'stopRecord';

      let socketRef = localSocket && localSocket.connected ? localSocket : socket;

      await new Promise<void>((resolve) => {
        socketRef.emit(
          action,
          { roomName },
          ({ success, reason, recordState }: { success: boolean; reason: string; recordState: string }) => {
            if (success) {
              startReport = false;
              endReport = true;
              recordPaused = false;
              recordStopped = true;
              recAttempt = true;

              updateStartReport(startReport);
              updateEndReport(endReport);
              updateRecordPaused(recordPaused);
              updateRecordStopped(recordStopped);
              showAlert?.({ message: 'Recording Stopped', type: 'success' });
              updateShowRecordButtons(false);
              recAttempt = true;
            } else {
              const reasonMessage = `Recording Stop Failed: ${reason}; the recording is currently ${recordState}`;
              showAlert?.({ message: reasonMessage, type: 'danger' });
              recAttempt = false;
            }

            resolve();
          }
        );
      });

      // Handle canvas stream if necessary
      try {
        if (recAttempt && whiteboardStarted && !whiteboardEnded && recordingMediaOptions === 'video') {
          captureCanvasStream({ parameters, start: false });
        }
      } catch (error) {
        console.error('Error capturing canvas stream:', error);
      }
    } else {
      return;
    }
  } else {
    showAlert?.({
      message: 'Recording is not started yet or already stopped',
      type: 'danger',
    });
  }
};
