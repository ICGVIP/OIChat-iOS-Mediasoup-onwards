import { Audio } from 'expo-av';
export interface SoundPlayerOptions {
  soundUrl: string;
}

// Export the type definition for the function
export type SoundPlayerType = (options: SoundPlayerOptions) => void;

/**
 * Plays a sound from a given URL.
 * 
 * @param {SoundPlayerOptions} options - The options for the sound player.
 * @param {string} options.soundUrl - The URL of the sound to play.
 * 
 * @returns {void}
 * 
 * @example
 * ```typescript
 * SoundPlayer({ soundUrl: 'https://example.com/sound.mp3' });
 * ```
 */

export const SoundPlayer = async ({ soundUrl }: SoundPlayerOptions): Promise<void> => {
  /**
   * Plays a sound from the specified URL.
   * @function
   * @param {string} url - The URL of the sound to play.
   */
  const { sound } = await Audio.Sound.createAsync({ uri: soundUrl });

  // Play the sound
  await sound.playAsync();

  // Release the sound once it's finished playing
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync();
    }
  });
};
