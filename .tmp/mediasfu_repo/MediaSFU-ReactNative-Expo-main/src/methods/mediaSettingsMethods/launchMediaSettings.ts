import { MediaDevices } from '../../@types/types';

export interface LaunchMediaSettingsOptions {
  updateIsMediaSettingsModalVisible: (isVisible: boolean) => void;
  isMediaSettingsModalVisible: boolean;
  mediaDevices: MediaDevices;
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  updateAudioInputs: (inputs: MediaDeviceInfo[]) => void;
  updateVideoInputs: (inputs: MediaDeviceInfo[]) => void;
}

// Export the type definition for the function
export type LaunchMediaSettingsType = (options: LaunchMediaSettingsOptions) => Promise<void>;

/**
 * Launches the media settings modal and updates the available audio and video input devices.
 *
 * @param {Object} options - The options for launching media settings.
 * @param {Function} options.updateIsMediaSettingsModalVisible - Function to update the visibility state of the media settings modal.
 * @param {boolean} options.isMediaSettingsModalVisible - Current visibility state of the media settings modal.
 * @param {MediaDevices} options.mediaDevices - MediaDevices interface to enumerate media devices.
 * @param {MediaDeviceInfo[]} options.audioInputs - Array to store available audio input devices.
 * @param {MediaDeviceInfo[]} options.videoInputs - Array to store available video input devices.
 * @param {Function} options.updateAudioInputs - Function to update the available audio input devices.
 * @param {Function} options.updateVideoInputs - Function to update the available video input devices.
 * @returns {Promise<void>} A promise that resolves when the media settings have been updated.
 *
 * @example
 * ```typescript
 * launchMediaSettings({
 *   updateIsMediaSettingsModalVisible: (isVisible) => console.log("Modal visible:", isVisible),
 *   isMediaSettingsModalVisible: false,
 *   mediaDevices: navigator.mediaDevices,
 *   audioInputs: [],
 *   videoInputs: [],
 *   updateAudioInputs: (inputs) => console.log("Audio Inputs:", inputs),
 *   updateVideoInputs: (inputs) => console.log("Video Inputs:", inputs),
 * });
 * ```
 */

export const launchMediaSettings = async ({
  updateIsMediaSettingsModalVisible,
  isMediaSettingsModalVisible,
  mediaDevices,
  audioInputs,
  videoInputs,
  updateAudioInputs,
  updateVideoInputs,
}: LaunchMediaSettingsOptions): Promise<void> => {
  // Check if media settings modal is not visible and update available audio and video input devices
  if (!isMediaSettingsModalVisible) {
    try {
      // Get the list of all available media devices
      const devices: any = await mediaDevices.enumerateDevices();

      // Filter the devices to get only audio and video input devices
      videoInputs = devices.filter((device: MediaDeviceInfo) => device.kind === 'videoinput');
      audioInputs = devices.filter((device: MediaDeviceInfo) => device.kind === 'audioinput');

      // Update the available audio and video input devices
      updateVideoInputs(videoInputs);
      updateAudioInputs(audioInputs);
    } catch (error) {
      console.log('Error getting media devices', error);
    }
  }

  // Open or close the media settings modal based on its current visibility state
  updateIsMediaSettingsModalVisible(!isMediaSettingsModalVisible);
};
