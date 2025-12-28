import { clickVideo, ClickVideoParameters } from '../methods/streamMethods/clickVideo';
import {
  ShowAlert, VidCons, RequestPermissionCameraType, StreamSuccessVideoType, SleepType, StreamSuccessVideoParameters,
  MediaDevices
} from '../@types/types';

export interface SwitchUserVideoParameters extends StreamSuccessVideoParameters, ClickVideoParameters {
  audioOnlyRoom: boolean;
  frameRate: number;
  vidCons: VidCons;
  prevVideoInputDevice: string;
  userDefaultVideoInputDevice: string;
  showAlert?: ShowAlert;
  mediaDevices: MediaDevices;
  hasCameraPermission: boolean;
  updateVideoSwitching: (state: boolean) => void;
  updateUserDefaultVideoInputDevice: (deviceId: string) => void;

  // media functions
  requestPermissionCamera: RequestPermissionCameraType;
  streamSuccessVideo: StreamSuccessVideoType;
  sleep: SleepType;
  checkMediaPermission: boolean;

  getUpdatedAllParams: () => SwitchUserVideoParameters;
  [key: string]: any;
}

export interface SwitchUserVideoOptions {
  videoPreference: string;
  checkoff: boolean;
  parameters: SwitchUserVideoParameters;
}

// Export the type definition for the function
export type SwitchUserVideoType = (options: SwitchUserVideoOptions) => Promise<void>;


/**
 * Switches the user's video input device based on the provided options.
 *
 * @param {SwitchUserVideoOptions} options - The options for switching the user's video.
 * @param {string} options.videoPreference - The preferred video input device ID.
 * @param {boolean} options.checkoff - Flag indicating whether to turn off the video.
 * @param {Object} options.parameters - Additional parameters required for switching the video.
 * @param {boolean} options.parameters.audioOnlyRoom - Indicates if the room is audio-only.
 * @param {number} options.parameters.frameRate - The desired frame rate for the video.
 * @param {Object} options.parameters.vidCons - Video constraints such as width and height.
 * @param {string} options.parameters.prevVideoInputDevice - The previous video input device ID.
 * @param {Function} options.parameters.showAlert - Function to show alerts to the user.
 * @param {Object} options.parameters.mediaDevices - Media devices object to access user media.
 * @param {boolean} options.parameters.hasCameraPermission - Indicates if the user has camera permission.
 * @param {Function} options.parameters.updateVideoSwitching - Function to update video switching state.
 * @param {Function} options.parameters.updateUserDefaultVideoInputDevice - Function to update the default video input device.
 * @param {Function} options.parameters.requestPermissionCamera - Function to request camera permission.
 * @param {Function} options.parameters.streamSuccessVideo - Function to handle successful video stream.
 * @param {Function} options.parameters.sleep - Function to pause execution for a specified duration.
 * @param {Function} options.parameters.checkMediaPermission - Function to check media permissions.
 *
 * @returns {Promise<void>} A promise that resolves when the video input device has been successfully switched.
 *
 * @throws Will throw an error if the audio input device cannot be accessed or if there is an unexpected error.
 *
 * @example
 * ```typescript
 * await switchUserVideo({
 *   videoPreference: 'video-device-id',
 *   checkoff: false,
 *   parameters: {
 *     audioOnlyRoom: false,
 *     frameRate: 30,
 *     vidCons: { width: 640, height: 480 },
 *     prevVideoInputDevice: 'prev-video-device-id',
 *     showAlert: showAlertFunction,
 *     mediaDevices: navigator.mediaDevices,
 *     hasCameraPermission: true,
 *     updateVideoSwitching: updateVideoSwitchingFunction,
 *     updateUserDefaultVideoInputDevice: updateUserDefaultVideoInputDeviceFunction,
 *     requestPermissionCamera: requestPermissionCameraFunction,
 *     streamSuccessVideo: streamSuccessVideoFunction,
 *     sleep: sleepFunction,
 *     checkMediaPermission: true,
 *     getUpdatedAllParams: getUpdatedAllParamsFunction,
 *   },
 * });
 * ```
 */

export async function switchUserVideo({
  videoPreference,
  checkoff,
  parameters,
}: SwitchUserVideoOptions): Promise<void> {
  const {
    audioOnlyRoom,
    frameRate,
    vidCons,
    prevVideoInputDevice,
    showAlert,
    mediaDevices,
    hasCameraPermission,
    updateVideoSwitching,
    updateUserDefaultVideoInputDevice,

    // mediasfu functions
    requestPermissionCamera,
    streamSuccessVideo,
    sleep,
    checkMediaPermission,
  } = parameters;

  try {
    // Check if it's an audio-only room
    if (audioOnlyRoom) {
      showAlert?.({
        message: 'You cannot turn on your camera in an audio-only event.',
        type: 'danger',
        duration: 3000,
      });

      return;
    }

    // If checkoff is not true, trigger a click on the video button to turn off the video
    if (!checkoff) {
      await clickVideo({ parameters });
      updateVideoSwitching(true);
      await sleep({ ms: 500 });
      updateVideoSwitching(false);
    }

    // Check camera permission
    if (!hasCameraPermission) {
      if (checkMediaPermission) {
        const statusCamera = await requestPermissionCamera();
        if (statusCamera !== 'granted') {
          showAlert?.({
            message:
              'Allow access to your camera or check if your camera is not being used by another application.',
            type: 'danger',
            duration: 3000,
          });

          return;
        }
      }
    }

    let mediaConstraints: MediaStreamConstraints;

    if (vidCons && vidCons.width && vidCons.height) {
      mediaConstraints = {
        video: {
          deviceId: { exact: videoPreference },
          ...vidCons,
          frameRate: { ideal: frameRate },
        },
        audio: false,
      };
    } else {
      mediaConstraints = {
        video: {
          deviceId: { exact: videoPreference },
          frameRate: { ideal: frameRate },
        },
        audio: false,
      };
    }

    // Get user media with the defined constraints
    await mediaDevices
      .getUserMedia(mediaConstraints)
      .then(async (stream) => {
        await streamSuccessVideo({ stream, parameters });
      })
      .catch(async () => {
        // Handle errors and revert to the previous video input device
        updateUserDefaultVideoInputDevice(prevVideoInputDevice);

        showAlert?.({
          message:
            'Error switching; not accessible, might need to turn off your video and turn it back on after switching.',
          type: 'danger',
          duration: 3000,
        });
      });
  } catch {
    // Handle unexpected errors and revert to the previous video input device
    updateUserDefaultVideoInputDevice(prevVideoInputDevice);

    showAlert?.({
      message:
        'Error switching; not accessible, might need to turn off your video and turn it back on after switching.',
      type: 'danger',
      duration: 3000,
    });
  }
}
