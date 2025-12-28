import {
  Participant, PrepopulateUserMediaParameters, PrepopulateUserMediaType, ReorderStreamsParameters, ReorderStreamsType,
} from '../../@types/types';

export interface ProducerMediaResumedParameters extends PrepopulateUserMediaParameters, ReorderStreamsParameters {
  meetingDisplayType: string;
  participants: Participant[];
  shared: boolean;
  shareScreenStarted: boolean;
  mainScreenFilled: boolean;
  hostLabel: string;
  updateUpdateMainWindow: (updateMainWindow: boolean) => void;

  // mediasfu functions
  reorderStreams: ReorderStreamsType;
  prepopulateUserMedia: PrepopulateUserMediaType;

  getUpdatedAllParams: () => ProducerMediaResumedParameters;
  [key: string]: any;
}

export interface ProducerMediaResumedOptions {
  name: string;
  kind: 'audio';
  parameters: ProducerMediaResumedParameters;
}

// Export the type definition for the function
export type ProducerMediaResumedType = (options: ProducerMediaResumedOptions) => Promise<void>;

/**
 * Resumes media for a specific participant in a meeting.
 *
 * @param {ProducerMediaResumedOptions} options - The options for resuming media.
 * @param {string} options.name - The name of the participant whose media is to be resumed.
 * @param {ProducerMediaResumedParameters} options.parameters - The parameters related to the meeting and participants.
 * @param {string} options.parameters.meetingDisplayType - The type of meeting display.
 * @param {Participant[]} options.parameters.participants - The list of participants in the meeting.
 * @param {boolean} options.parameters.shared - Indicates if the screen is being shared.
 * @param {boolean} options.parameters.shareScreenStarted - Indicates if screen sharing has started.
 * @param {boolean} options.parameters.mainScreenFilled - Indicates if the main screen is filled.
 * @param {string} options.parameters.hostLabel - The label of the host.
 * @param {Function} options.parameters.updateUpdateMainWindow - Function to update the main window.
 * @param {Function} options.parameters.reorderStreams - Function to reorder the streams.
 * @param {Function} options.parameters.prepopulateUserMedia - Function to prepopulate user media.
 *
 * @returns {Promise<void>} A promise that resolves when the media has been resumed.
 *
 * @example
 * ```typescript
 * const options = {
 *   name: "John Doe",
 *   kind: 'audio',
 *   parameters: {
 *     meetingDisplayType: "media",
 *     participants: [{ name: "John Doe", islevel: "2", videoID: "" }],
 *     shared: false,
 *     shareScreenStarted: false,
 *     mainScreenFilled: false,
 *     hostLabel: "Host",
 *     updateUpdateMainWindow: (update) => { console.log("Main window updated:", update); },
 *     reorderStreams: async (opts) => { console.log("Reordered streams:", opts); },
 *     prepopulateUserMedia: async (opts) => { console.log("Prepopulated user media:", opts); },
 *   },
 * };
 *
 * await producerMediaResumed(options);
 * ```
 */

export const producerMediaResumed = async ({
  name,
  parameters,
}: ProducerMediaResumedOptions): Promise<void> => {
  const {
    meetingDisplayType,
    participants,
    shared,
    shareScreenStarted,
    mainScreenFilled,
    hostLabel,
    updateUpdateMainWindow,
    reorderStreams,
    prepopulateUserMedia,
  } = parameters;

  // Update to resume the audio only of a participant
  const participant = participants.find((obj) => obj.name === name);

  if (participant && !mainScreenFilled && participant.islevel === '2') {
    updateUpdateMainWindow(true);
    await prepopulateUserMedia({ name: hostLabel, parameters });
    updateUpdateMainWindow(false);
  }

  let checker: boolean | undefined;
  if (meetingDisplayType === 'media') {
    if (participant) {
      checker = participant.videoID !== null && participant.videoID !== '';

      if (!checker) {
        if (!(shareScreenStarted || shared)) {
          await reorderStreams({ add: false, screenChanged: true, parameters });
        }
      }
    }
  }
};
