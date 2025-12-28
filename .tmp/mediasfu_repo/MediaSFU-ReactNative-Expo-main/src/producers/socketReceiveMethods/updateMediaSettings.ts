import { Settings } from '../../@types/types';

export interface UpdateMediaSettingsOptions {
  settings: Settings;
  updateAudioSetting: (value: string) => void;
  updateVideoSetting: (value: string) => void;
  updateScreenshareSetting: (value: string) => void;
  updateChatSetting: (value: string) => void;
}

// Export the type definition for the function
export type UpdateMediaSettingsType = (options: UpdateMediaSettingsOptions) => void;

/**
 * Updates media settings by calling the respective update functions for each setting type.
 *
 * @param {UpdateMediaSettingsOptions} options - The options for updating media settings.
 * @param {Settings} options.settings - The settings array containing values for audio, video, screenshare, and chat.
 * @param {Function} options.updateAudioSetting - Function to update the audio setting.
 * @param {Function} options.updateVideoSetting - Function to update the video setting.
 * @param {Function} options.updateScreenshareSetting - Function to update the screenshare setting.
 * @param {Function} options.updateChatSetting - Function to update the chat setting.
 *
 * @returns {void} Does not return a value, as it directly updates each setting via provided functions.
 *
 * @example
 * ```typescript
 * const options = {
 *   settings: ["enabled", "enabled", "disabled", "enabled"],
 *   updateAudioSetting: (value) => console.log("Audio setting:", value),
 *   updateVideoSetting: (value) => console.log("Video setting:", value),
 *   updateScreenshareSetting: (value) => console.log("Screenshare setting:", value),
 *   updateChatSetting: (value) => console.log("Chat setting:", value),
 * };
 *
 * updateMediaSettings(options);
 * // Logs:
 * // "Audio setting: enabled"
 * // "Video setting: enabled"
 * // "Screenshare setting: disabled"
 * // "Chat setting: enabled"
 * ```
 */

export const updateMediaSettings = ({
  settings,
  updateAudioSetting,
  updateVideoSetting,
  updateScreenshareSetting,
  updateChatSetting,
}: UpdateMediaSettingsOptions): void => {
  const [audioSetting, videoSetting, screenshareSetting, chatSetting] = settings;

  // Update audio setting
  updateAudioSetting(audioSetting);
  // Update video setting
  updateVideoSetting(videoSetting);
  // Update screenshare setting
  updateScreenshareSetting(screenshareSetting);
  // Update chat setting
  updateChatSetting(chatSetting);
};
