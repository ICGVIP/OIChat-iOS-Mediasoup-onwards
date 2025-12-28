import { clickVideo, ClickVideoParameters } from '../methods/streamMethods/clickVideo';
import {
  ShowAlert, VidCons, RequestPermissionCameraType, StreamSuccessVideoType, SleepType, StreamSuccessVideoParameters,
  MediaDevices
} from '../@types/types';

export interface SwitchUserVideoAltParameters extends StreamSuccessVideoParameters, ClickVideoParameters {
  audioOnlyRoom: boolean;
  frameRate: number;
  vidCons: VidCons;
  showAlert?: ShowAlert;
  mediaDevices: MediaDevices;
  hasCameraPermission: boolean;
  updateVideoSwitching: (state: boolean) => void;
  updateCurrentFacingMode: (mode: string) => void;

  // mediasfu functions
  requestPermissionCamera: RequestPermissionCameraType;
  streamSuccessVideo: StreamSuccessVideoType;
  sleep: SleepType;
  checkMediaPermission: boolean;
  getUpdatedAllParams: () => SwitchUserVideoAltParameters;

  [key: string]: any;
}

export interface SwitchUserVideoAltOptions {
  videoPreference: string;
  checkoff: boolean;
  parameters: SwitchUserVideoAltParameters;
}

// Export the type definition for the function
export type SwitchUserVideoAltType = (options: SwitchUserVideoAltOptions) => Promise<void>;

/**
 * Switches the user's video stream based on the provided video preference and other parameters.
 * 
 * @param {SwitchUserVideoAltOptions} options - The options for switching the user's video.
 * @param {string} options.videoPreference - The preferred video facing mode (e.g., "user" or "environment").
 * @param {boolean} options.checkoff - A flag indicating whether to turn off the video before switching.
 * @param {SwitchUserVideoAltParameters} options.parameters - The parameters required for switching the video.
 * 
 * @returns {Promise<void>} A promise that resolves when the video switching is complete.
 * 
 * @throws Will throw an error if there is an issue with switching the video.
 * 
 * @example
 * ```typescript
 * const options = {
 *   videoPreference: "user",
 *   checkoff: false,
 *   parameters: {
 *     audioOnlyRoom: false,
 *     frameRate: 30,
 *     vidCons: { width: 640, height: 480 },
 *     showAlert: showNotification,
 *     mediaDevices: navigator.mediaDevices,
 *     hasCameraPermission: true,
 *     updateVideoSwitching: updateVideoSwitchingState,
 *     updateCurrentFacingMode: updateCurrentFacingMode,
 *     requestPermissionCamera: requestCameraPermission,
 *     streamSuccessVideo: streamSuccessVideoFunction,
 *     sleep: sleepFunction,
 *     checkMediaPermission: true,
 *     getUpdatedAllParams: getUpdatedAllParamsFunction,
 *   },
 * };
 * 
 * switchUserVideoAlt(options)
 *   .then(() => {
 *     console.log("Video switched successfully");
 *   })
 *   .catch((error) => {
 *     console.error("Error switching video:", error);
 *   });
 * ```
 */

export async function switchUserVideoAlt({
  videoPreference,
  checkoff,
  parameters,
}: SwitchUserVideoAltOptions): Promise<void> {
  const updatedParameters = parameters.getUpdatedAllParams();

  const {
    audioOnlyRoom,
    frameRate,
    vidCons,
    showAlert,
    mediaDevices,
    hasCameraPermission,
    updateVideoSwitching,
    updateCurrentFacingMode,

    // mediasfu functions
    requestPermissionCamera,
    streamSuccessVideo,
    sleep,
    checkMediaPermission,
  } = parameters;

  let { currentFacingMode, prevFacingMode } = updatedParameters;

  try {
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
    if (!hasCameraPermission && checkMediaPermission) {
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

    // Enumerate video devices
    const videoDevices: any = await mediaDevices.enumerateDevices();

    // Define media constraints based on preferences and options
    let mediaConstraints = {};

    if (vidCons && vidCons.width && vidCons.height) {
      mediaConstraints = {
        video: {
          facingMode: { exact: videoPreference },
          ...vidCons,
          frameRate: { ideal: frameRate },
        },
        audio: false,
      };
    } else {
      mediaConstraints = {
        video: {
          facingMode: { exact: videoPreference },
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
        let videoDevicesFront: MediaDeviceInfo[] = [];

        // Filter video devices based on the preferred facing mode
        if (videoPreference === 'user') {
          videoDevicesFront = videoDevices.filter(
            (device: MediaDeviceInfo) => device.label.includes('front') && device.kind === 'videoinput',
          );
        } else {
          videoDevicesFront = videoDevices.filter(
            (device: MediaDeviceInfo) => device.label.includes('back') && device.kind === 'videoinput',
          );
        }

        if (videoDevicesFront.length > 0) {
          videoDevicesFront.forEach((device) => {
            if (device.kind === 'videoinput') {
              const videoDeviceId = device.deviceId;

              // Update media constraints with the specific video device
              if (vidCons && vidCons.width && vidCons.height) {
                mediaConstraints = {
                  video: {
                    deviceId: { exact: videoDeviceId },
                    ...vidCons,
                    frameRate: { ideal: frameRate },
                  },
                  audio: false,
                };
              } else {
                mediaConstraints = {
                  video: {
                    deviceId: { exact: videoDeviceId },
                    frameRate: { ideal: frameRate },
                  },
                  audio: false,
                };
              }

              // Try to get user media with the new constraints
              mediaDevices
                .getUserMedia(mediaConstraints)
                .then(async (stream) => {
                  await streamSuccessVideo({ stream, parameters });
                })
                .catch(() => {
                  // If the current video device is the last one in the list, show the error; otherwise, try the next device
                  if (
                    videoDeviceId
                    === videoDevicesFront[videoDevicesFront.length - 1].deviceId
                  ) {
                    currentFacingMode = prevFacingMode;
                    updateCurrentFacingMode(currentFacingMode);

                    showAlert?.({
                      message:
                        'Error switching; not accessible, might need to turn off your video and turn it back on after switching.',
                      type: 'danger',
                      duration: 3000,
                    });
                  }
                });
            }
          });
        } else {
          // Show error if no compatible video devices are found
          currentFacingMode = prevFacingMode;
          updateCurrentFacingMode(currentFacingMode);

          showAlert?.({
            message:
              'Error switching; not accessible, might need to turn off your video and turn it back on after switching.',
            type: 'danger',
            duration: 3000,
          });
        }
      });
  } catch {
    // Handle any unexpected errors

    const videoDevices: any = await mediaDevices.enumerateDevices();
    // Handle any unexpected errors
    let videoDevicesFront: MediaDeviceInfo[] = [];
    if (videoPreference === 'user') {
      videoDevicesFront = videoDevices.filter(
        (device: MediaDeviceInfo) => device.label.includes('front') && device.kind === 'videoinput',
      );
    } else {
      videoDevicesFront = videoDevices.filter(
        (device: MediaDeviceInfo) => device.label.includes('back') && device.kind === 'videoinput',
      );
    }

    let mediaConstraints = {};

    if (videoDevicesFront.length > 0) {
      videoDevicesFront.forEach((device) => {
        if (device.kind === 'videoinput') {
          const videoDeviceId = device.deviceId;

          if (vidCons && vidCons.width && vidCons.height) {
            mediaConstraints = {
              video: {
                deviceId: { exact: videoDeviceId },
                ...vidCons,
                frameRate: { ideal: frameRate },
              },
              audio: false,
            };
          } else {
            mediaConstraints = {
              video: {
                deviceId: { exact: videoDeviceId },
                frameRate: { ideal: frameRate },
              },
              audio: false,
            };
          }

          mediaDevices
            .getUserMedia(mediaConstraints)
            .then(async (stream) => {
              await streamSuccessVideo({ stream, parameters });
            })
            .catch(() => {
              if (
                videoDeviceId
                === videoDevicesFront[videoDevicesFront.length - 1].deviceId
              ) {
                currentFacingMode = prevFacingMode;
                updateCurrentFacingMode(currentFacingMode);

                showAlert?.({
                  message:
                    'Error switching; not accessible, might need to turn off your video and turn it back on after switching.',
                  type: 'danger',
                  duration: 3000,
                });
              }
            });
        }
      });
    } else {
      currentFacingMode = prevFacingMode;
      updateCurrentFacingMode(currentFacingMode);

      showAlert?.({
        message:
          'Error switching; not accessible, might need to turn off your video and turn it back on after switching.',
        type: 'danger',
        duration: 3000,
      });
    }
  }
}
