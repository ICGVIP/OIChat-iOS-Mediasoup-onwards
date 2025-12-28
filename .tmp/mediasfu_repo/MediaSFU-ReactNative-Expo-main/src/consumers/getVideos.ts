import { Stream, Participant } from '../@types/types';

export interface GetVideosOptions {
  participants: Participant[];
  allVideoStreams: (Stream | Participant)[];
  oldAllStreams: (Stream | Participant)[];
  adminVidID?: string;
  updateAllVideoStreams: (streams: (Stream | Participant)[]) => void;
  updateOldAllStreams: (streams: (Stream | Participant)[]) => void;
}

// Export the type definition for the function
export type GetVideosType = (options: GetVideosOptions) => Promise<void>;

/**
 * Asynchronously processes and updates video streams by filtering out the admin's video stream.
 *
 * @param {GetVideosOptions} options - The options for getting videos.
 * @param {Participant[]} options.participants - The list of participants.
 * @param {(Stream | Participant)[]} options.allVideoStreams - The list of all video streams.
 * @param {(Stream | Participant)[]} options.oldAllStreams - The list of old video streams.
 * @param {string} [options.adminVidID] - The ID of the admin's video stream.
 * @param {Function} options.updateAllVideoStreams - Function to update the state variable for all video streams.
 * @param {Function} options.updateOldAllStreams - Function to update the state variable for old video streams.
 *
 * @returns {Promise<void>} A promise that resolves when the video streams have been processed and updated.
 *
 * @throws {Error} Throws an error if an issue occurs while processing the streams.
 *
 * @example
 * const options = {
 *   participants: participantList,
 *   allVideoStreams: allStreams,
 *   oldAllStreams: oldStreams,
 *   adminVidID: 'admin-video-id',
 *   updateAllVideoStreams: (streams) => {
 *     console.log('All video streams updated:', streams);
 *   },
 *   updateOldAllStreams: (streams) => {
 *     console.log('Old video streams updated:', streams);
 *   },
 * };
 *
 * getVideos(options)
 *   .then(() => {
 *     console.log('Video streams processed successfully');
 *   })
 *   .catch((error) => {
 *     console.error('Error processing video streams:', error);
 *   });
 */

export async function getVideos({
  participants,
  allVideoStreams,
  oldAllStreams,
  adminVidID,
  updateAllVideoStreams,
  updateOldAllStreams,
}: GetVideosOptions): Promise<void> {
  try {
    // Filter out the admin's video stream and update state variables
    const admin = participants.filter(
      (participant) => participant.islevel === '2',
    );

    if (admin.length > 0) {
      adminVidID = admin[0].videoID;

      if (adminVidID != null && adminVidID !== '') {
        let oldAllStreams_: (Stream | Participant)[] = [];

        // Check if the length of oldAllStreams is greater than 0
        if (oldAllStreams.length > 0) {
          oldAllStreams_ = oldAllStreams;
        }

        // Filter out admin's video stream from oldAllStreams
        oldAllStreams = allVideoStreams.filter(
          (streame) => streame.producerId === adminVidID,
        );

        // If no admin's video stream found, revert to the previous state
        if (oldAllStreams.length < 1) {
          oldAllStreams = oldAllStreams_;
        }

        // Update the state variable for old video streams
        updateOldAllStreams(oldAllStreams);

        // Filter out admin's video stream from allVideoStreams
        allVideoStreams = allVideoStreams.filter(
          (streame) => streame.producerId !== adminVidID,
        );

        // Update the state variable for all video streams
        updateAllVideoStreams(allVideoStreams);
      }
    }
  } catch (error) {
    // Handle errors during the process of updating video streams
    console.log('Error updating video streams:', (error as Error).message);
    // throw error;
  }
}
