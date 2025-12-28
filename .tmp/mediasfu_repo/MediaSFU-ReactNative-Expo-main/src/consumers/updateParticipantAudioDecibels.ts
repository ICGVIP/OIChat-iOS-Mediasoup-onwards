import { AudioDecibels } from '../@types/types';

export interface UpdateParticipantAudioDecibelsOptions {
  name: string;
  averageLoudness: number;
  audioDecibels: AudioDecibels[];
  updateAudioDecibels: (audioDecibels: AudioDecibels[]) => void;
}

// Export the type definition for the function
export type UpdateParticipantAudioDecibelsType = (options: UpdateParticipantAudioDecibelsOptions) => void;

/**
 * Updates the audio decibels for a participant.
 *
 * @param {UpdateParticipantAudioDecibelsOptions} options - The options for updating participant audio decibels.
 * @param {string} options.name - The name of the participant.
 * @param {number} options.averageLoudness - The average loudness of the participant.
 * @param {Array<AudioDecibels>} options.audioDecibels - The array of audio decibels entries.
 * @param {Function} options.updateAudioDecibels - The function to update the audio decibels array.
 *
 * @returns {void}
 * 
 * @example
 * const options = {
 *   name: 'participant1',
 *   averageLoudness: 50,
 *   audioDecibels: [{ name: 'participant1', averageLoudness: 50 }],
 *   updateAudioDecibels: updateAudioDecibelsFunction,
 * };
 * 
 * updateParticipantAudioDecibels(options);
 */

export function updateParticipantAudioDecibels({
  name,
  averageLoudness,
  audioDecibels,
  updateAudioDecibels,
}: UpdateParticipantAudioDecibelsOptions): void {
  // Function to update the audioDecibels array
  // Check if the entry already exists in audioDecibels
  const existingEntry = audioDecibels.find((entry) => entry.name === name);

  if (existingEntry) {
    // Entry exists, update the averageLoudness
    existingEntry.averageLoudness = averageLoudness;
  } else {
    // Entry doesn't exist, add a new entry to audioDecibels
    audioDecibels.push({ name, averageLoudness });
  }

  // Update the audioDecibels array
  updateAudioDecibels(audioDecibels);
}
