import {
  Participant, PrepopulateUserMediaType, ReorderStreamsType, ReUpdateInterParameters,
  ReUpdateInterType, ReorderStreamsParameters, PrepopulateUserMediaParameters,
} from '../../@types/types';

export interface ProducerMediaPausedParameters extends PrepopulateUserMediaParameters, ReorderStreamsParameters, ReUpdateInterParameters {
  activeSounds: string[];
  meetingDisplayType: string;
  meetingVideoOptimized: boolean;
  participants: Participant[];
  oldSoundIds: string[];
  shared: boolean;
  shareScreenStarted: boolean;
  updateMainWindow: boolean;
  hostLabel: string;
  islevel: string;
  updateActiveSounds: (activeSounds: string[]) => void;
  updateUpdateMainWindow: (updateMainWindow: boolean) => void;

  // mediasfu functions
  reorderStreams: ReorderStreamsType;
  prepopulateUserMedia: PrepopulateUserMediaType;
  reUpdateInter: ReUpdateInterType;

  getUpdatedAllParams: () => ProducerMediaPausedParameters;
  [key: string]: any;
}

export interface ProducerMediaPausedOptions {
  producerId: string;
  kind: 'audio' | 'video' | 'screenshare' | 'screen';
  name: string;
  parameters: ProducerMediaPausedParameters;
}

// Export the type definition for the function
export type ProducerMediaPausedType = (options: ProducerMediaPausedOptions) => Promise<void>;

/**
 * Handles the event when media is paused for a producer.
 *
 * @param {ProducerMediaPausedOptions} options - The options for the producer media paused event.
 * @param {string} options.producerId - The ID of the producer.
 * @param {string} options.kind - The kind of media (e.g., "audio", "video").
 * @param {string} options.name - The name of the producer.
 * @param {ProducerMediaPausedParameters} options.parameters - The parameters for the event.
 *
 * @returns {Promise<void>} A promise that resolves when the media paused handling is complete.
 *
 * @description
 * This function handles the event when media is paused for a producer. It performs the following tasks:
 * - Updates the parameters.
 * - Iterates through participants and updates the UI based on their muted status and other conditions.
 * - Manages active sounds and screen sharing state.
 * - Optimizes UI based on meeting display type and video optimization settings.
 *
 * @example
 * ```typescript
 * const options = {
 *   producerId: "abc123",
 *   kind: "audio",
 *   name: "Participant1",
 *   parameters: {
 *     activeSounds: [],
 *     meetingDisplayType: "media",
 *     meetingVideoOptimized: false,
 *     participants: [{ name: "Participant1", muted: true, islevel: "2", videoID: null }],
 *     oldSoundIds: ["Participant1"],
 *     shared: false,
 *     shareScreenStarted: false,
 *     updateMainWindow: false,
 *     hostLabel: "Host",
 *     islevel: "1",
 *     updateActiveSounds: (sounds) => console.log("Active sounds updated:", sounds),
 *     updateUpdateMainWindow: (update) => console.log("Main window update:", update),
 *     reorderStreams: async (params) => console.log("Reordered streams:", params),
 *     prepopulateUserMedia: async (params) => console.log("Prepopulated user media:", params),
 *     reUpdateInter: async (params) => console.log("Re-updated interface:", params),
 *     getUpdatedAllParams: () => ({ }),
 *   },
 * };
 *
 * await producerMediaPaused(options);
 * ```
 */

export const producerMediaPaused = async ({
  producerId,
  kind,
  name,
  parameters,
}: ProducerMediaPausedOptions): Promise<void> => {
  // Get updated parameters
  parameters = parameters.getUpdatedAllParams();

  let {
    activeSounds,
    meetingDisplayType,
    meetingVideoOptimized,
    participants,
    oldSoundIds,
    shared,
    shareScreenStarted,
    updateMainWindow,
    hostLabel,
    islevel,
    updateActiveSounds,
    updateUpdateMainWindow,
    reorderStreams,
    prepopulateUserMedia,
    reUpdateInter,
  } = parameters;

  // Iterate through participants and update UI
  await Promise.all(
    participants.map(async (participant) => {
      if (participant.muted) {
        try {
          if (participant.islevel === '2' && !participant.videoID && !shared && !shareScreenStarted && islevel !== '2') {
            updateMainWindow = true;
            updateUpdateMainWindow(updateMainWindow);
            await prepopulateUserMedia({ name: hostLabel, parameters });
            updateMainWindow = false;
            updateUpdateMainWindow(updateMainWindow);
          }
        } catch { /* empty */ }

        if (shareScreenStarted || shared) {
          if (participant.name && activeSounds.includes(participant.name)) {
            activeSounds = activeSounds.filter((audioStream) => audioStream !== participant.name);
            updateActiveSounds(activeSounds);
          }

          reUpdateInter({
            name: participant.name!,
            add: false,
            force: true,
            parameters,
          });
        } else {
          // no screensahre so obey user display settings; show waveforms, ..
        }
      }
    }),
  );

  // Handle meeting display type and optimize UI
  if (
    meetingDisplayType === 'media'
    || (meetingDisplayType === 'video' && !meetingVideoOptimized)
  ) {
    const participant = participants.find((p) => p.name === name);
    const hasVideo = participant?.videoID !== null && participant?.videoID !== '';

    if (!hasVideo && !(shareScreenStarted || shared)) {
      await reorderStreams({ add: false, screenChanged: true, parameters });
    }
  }

  // Handle audio media
  if (kind === 'audio') {
    try {
      const participant = participants.find((p) => p.audioID === producerId) || participants.find((p) => p.name === name);

      if (participant && ((participant.name && oldSoundIds.includes(participant.name)) || (name && oldSoundIds.includes(name)))) {
        reUpdateInter({
          name: participant.name!,
          add: false,
          force: true,
          parameters,
        });
      }
    } catch { /* empty */ }
  }
};
