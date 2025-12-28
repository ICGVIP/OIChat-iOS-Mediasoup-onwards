import {
  ShowAlert, StreamSuccessAudioSwitchType, RequestPermissionAudioType, StreamSuccessAudioSwitchParameters,
  MediaDevices
} from '../@types/types';

export interface SwitchUserAudioParameters extends StreamSuccessAudioSwitchParameters {
  mediaDevices: MediaDevices;
  userDefaultAudioInputDevice: string;
  prevAudioInputDevice: string;
  showAlert?: ShowAlert;
  hasAudioPermission: boolean;
  updateUserDefaultAudioInputDevice: (deviceId: string) => void;

  // mediasfu functions
  streamSuccessAudioSwitch: StreamSuccessAudioSwitchType;
  requestPermissionAudio: RequestPermissionAudioType;
  checkMediaPermission: boolean;

  [key: string]: any;
}

export interface SwitchUserAudioOptions {
  audioPreference: string;
  parameters: SwitchUserAudioParameters;
}

// Export the type definition for the function
export type SwitchUserAudioType = (options: SwitchUserAudioOptions) => Promise<void>;

/**
 * Switches the user's audio input device based on the provided audio preference.
 * 
 * @param {SwitchUserAudioOptions} options - The options for switching the user's audio input device.
 * @param {string} options.audioPreference - The preferred audio input device ID.
 * @param {Object} options.parameters - Additional parameters required for switching the audio input device.
 * @param {MediaDevices} options.parameters.mediaDevices - The media devices interface for accessing user media.
 * @param {string} options.parameters.prevAudioInputDevice - The previous audio input device ID.
 * @param {Function} options.parameters.showAlert - Function to show alert messages.
 * @param {boolean} options.parameters.hasAudioPermission - Flag indicating if the user has granted audio permission.
 * @param {Function} options.parameters.updateUserDefaultAudioInputDevice - Function to update the user's default audio input device.
 * @param {Function} options.parameters.streamSuccessAudioSwitch - Function to handle successful audio stream switch.
 * @param {Function} options.parameters.requestPermissionAudio - Function to request audio permission from the user.
 * @param {Function} options.parameters.checkMediaPermission - Function to check if media permission is granted.
 * 
 * @returns {Promise<void>} A promise that resolves when the audio input device has been successfully switched.
 * 
 * @throws Will throw an error if the audio input device cannot be accessed or if there is an unexpected error.
 * 
 * @example
 * ```typescript
 * await switchUserAudio({
 *   audioPreference: 'audio-device-id',
 *   parameters: {
 *     mediaDevices,
 *     prevAudioInputDevice: 'prev-audio-device-id',
 *     showAlert,
 *     hasAudioPermission,
 *     updateUserDefaultAudioInputDevice,
 *     streamSuccessAudioSwitch,
 *     requestPermissionAudio,
 *     checkMediaPermission,
 *   },
 * });
 * ```
 */

export async function switchUserAudio({ audioPreference, parameters }: SwitchUserAudioOptions): Promise<void> {
  const {
    mediaDevices,
    prevAudioInputDevice,
    showAlert,
    hasAudioPermission,
    updateUserDefaultAudioInputDevice,

    // Media functions
    streamSuccessAudioSwitch,
    requestPermissionAudio,
    checkMediaPermission,
  } = parameters;

  try {
    // Check if audio permission is granted
    if (!hasAudioPermission) {
      if (checkMediaPermission) {
        const statusMic = await requestPermissionAudio();
        if (statusMic !== 'granted') {
          showAlert?.({
            message:
              'Allow access to your microphone or check if your microphone is not being used by another application.',
            type: 'danger',
            duration: 3000,
          });
          return;
        }
      }
    }

    const mediaConstraints: MediaStreamConstraints = {
      audio: {
        deviceId: { exact: audioPreference },
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    };

    // Get user media with the defined audio constraints
    await mediaDevices
      .getUserMedia(mediaConstraints)
      .then(async (stream) => {
        await streamSuccessAudioSwitch({ stream, parameters });
      })
      .catch((error) => {
        console.log('Error switching audio A', error);
        // Handle errors and revert to the previous audio input device
        updateUserDefaultAudioInputDevice(prevAudioInputDevice);

        showAlert?.({
          message: 'Error switching; the specified microphone could not be accessed.',
          type: 'danger',
          duration: 3000,
        });
      });
  } catch (error) {
    console.log('Error switching audio', error);
    // Handle unexpected errors and revert to the previous audio input device
    updateUserDefaultAudioInputDevice(prevAudioInputDevice);

    showAlert?.({
      message: 'Error switching; the specified microphone could not be accessed.',
      type: 'danger',
      duration: 3000,
    });
  }
}
