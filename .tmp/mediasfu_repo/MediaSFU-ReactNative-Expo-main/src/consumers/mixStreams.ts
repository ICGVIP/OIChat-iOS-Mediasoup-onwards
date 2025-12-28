import { Stream, Participant } from '../@types/types';

export interface MixStreamsOptions {
  alVideoStreams: (Stream | Participant)[];
  non_alVideoStreams: Participant[];
  ref_participants: (Stream | Participant)[];
}

// Export the type definition for the function
export type MixStreamsType = (options: MixStreamsOptions) => Promise<(Stream | Participant)[]>;

/**
 * Mixes video and audio streams and participants based on specified parameters.
 *
 * @param {MixStreamsOptions} options - The options for mixing streams.
 * @param {Array} options.alVideoStreams - The list of audio and video streams to mix.
 * @param {Array} options.non_alVideoStreams - The list of non-audio and video streams to mix.
 * @param {Array} options.ref_participants - The list of reference participants to mix.
 * @returns {Promise<Array>} A promise that resolves with the mixed streams.
 * @throws Will throw an error if there is an issue mixing the streams.
 * @example
 * ```typescript
 * const mixedStreams = await mixStreams({
 *   alVideoStreams: [stream1, stream2],
 *   non_alVideoStreams: [participant1, participant2],
 *   ref_participants: [participant1, participant2],
 * });
 * console.log('Mixed streams:', mixedStreams);
 * ```
 */

export async function mixStreams({
  alVideoStreams,
  non_alVideoStreams,
  ref_participants,
}: MixStreamsOptions): Promise<(Stream | Participant)[]> {
  try {
    const mixedStreams: (Stream | Participant)[] = [];

    // Find "youyou" or "youyouyou" stream
    const youyouStream = alVideoStreams.find(
      (obj) => obj.producerId === 'youyou' || obj.producerId === 'youyouyou',
    );

    const remainingAlVideoStreams = alVideoStreams.filter(
      (obj) => obj.producerId !== 'youyou' && obj.producerId !== 'youyouyou',
    );

    // Separate unmuted and muted streams
    const unmutedAlVideoStreams = remainingAlVideoStreams.filter((obj) => {
      const participant = ref_participants.find(
        (p) => p.videoID === obj.producerId,
      );
      return !obj.muted && participant && participant.muted === false;
    });

    const mutedAlVideoStreams = remainingAlVideoStreams.filter((obj) => {
      const participant = ref_participants.find(
        (p) => p.videoID === obj.producerId,
      );
      return obj.muted || (participant && participant.muted === true);
    });

    const nonAlVideoStreams = [...non_alVideoStreams]; // Create a copy of non_alVideoStreams

    // Add unmutedAlVideoStreams to mixedStreams
    mixedStreams.push(...unmutedAlVideoStreams);

    // Interleave the mutedAlVideoStreams and nonAlVideoStreams
    let nonAlIndex = 0;
    for (let i = 0; i < mutedAlVideoStreams.length; i++) {
      if (nonAlIndex < nonAlVideoStreams.length) {
        mixedStreams.push(nonAlVideoStreams[nonAlIndex]);
        nonAlIndex++;
      }
      mixedStreams.push(mutedAlVideoStreams[i]);
    }

    // Handle remaining nonAlVideoStreams (if any)
    for (let i = nonAlIndex; i < nonAlVideoStreams.length; i++) {
      mixedStreams.push(nonAlVideoStreams[i]);
    }

    // Unshift 'youyou' or 'youyouyou' stream to mixedStreams
    if (youyouStream) {
      mixedStreams.unshift(youyouStream);
    }

    return mixedStreams;
  } catch (error) {
    // Handle errors during the process of mixing streams
    console.log('Error mixing streams:', (error as Error).message);
    throw error;
  }
}
