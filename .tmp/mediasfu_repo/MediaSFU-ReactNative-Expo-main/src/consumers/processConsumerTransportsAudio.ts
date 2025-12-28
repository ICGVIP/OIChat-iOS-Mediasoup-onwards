import {
  Stream, Transport, Participant, SleepType,
} from '../@types/types';

export interface ProcessConsumerTransportsAudioParameters {

  // mediasfu functions
  sleep: SleepType;
  [key: string]: any;
}

export interface ProcessConsumerTransportsAudioOptions {
  consumerTransports: Transport[];
  lStreams: (Stream | Participant)[];
  parameters: ProcessConsumerTransportsAudioParameters;
}

// Export the type definition for the function
export type ProcessConsumerTransportsAudioType = (
  options: ProcessConsumerTransportsAudioOptions
) => Promise<void>;

/**
 * Adjusts the layout parameters based on the provided options.
 *
 * @param {ReadjustOptions} options - The options for readjusting the layout.
 * @param {number} options.n - The number of participants or elements.
 * @param {number} options.state - The current state of the layout.
 * @param {object} options.parameters - The parameters for the layout adjustment.
 * @param {function} options.parameters.getUpdatedAllParams - Function to get updated parameters.
 * @param {string} options.parameters.eventType - The type of event (e.g., "broadcast", "chat", "conference").
 * @param {boolean} options.parameters.shareScreenStarted - Indicates if screen sharing has started.
 * @param {boolean} options.parameters.shared - Indicates if content is being shared.
 * @param {number} options.parameters.mainHeightWidth - The main height and width value.
 * @param {number} options.parameters.prevMainHeightWidth - The previous main height and width value.
 * @param {string} options.parameters.hostLabel - The label for the host.
 * @param {boolean} options.parameters.first_round - Indicates if it is the first round.
 * @param {boolean} options.parameters.lock_screen - Indicates if the screen is locked.
 * @param {function} options.parameters.updateMainHeightWidth - Function to update the main height and width.
 * @param {function} options.parameters.prepopulateUserMedia - Function to prepopulate user media.
 * @returns {Promise<void>} A promise that resolves when the layout adjustment is complete.
 * @throws {Error} Throws an error if there is an issue updating the grid sizes.
 *
 * @example
 * ```typescript
 * await readjust({
 *   n: 5,
 *   state: 1,
 *   parameters: {
 *     eventType: 'conference',
 *     shareScreenStarted: false,
 *     shared: false,
 *     mainHeightWidth: 100,
 *     prevMainHeightWidth: 80,
 *     hostLabel: 'Host Name',
 *     first_round: false,
 *     lock_screen: false,
 *     updateMainHeightWidth: updateMainHeightWidthFunction,
 *     getUpdatedAllParams: getUpdatedAllParamsFunction,
 *   },
 * });
 * ```
 */

export const processConsumerTransportsAudio = async ({
  consumerTransports,
  lStreams,
  parameters,
}: ProcessConsumerTransportsAudioOptions): Promise<void> => {
  try {
    const { sleep } = parameters;

    // Function to check if the producerId is valid in the given stream arrays
    const isValidProducerId = (producerId: string, ...streamArrays: (Stream | Participant)[][]): boolean => (
      producerId !== null
        && producerId !== ''
        && streamArrays.some((streamArray) => (
          streamArray.length > 0
          && streamArray.some((stream) => stream?.producerId === producerId)
        ))
    );

    // Get paused consumer transports that are audio
    const consumerTransportsToResume = consumerTransports.filter(
      (transport) => isValidProducerId(transport.producerId, lStreams)
        && transport.consumer?.paused === true
        && transport.consumer.kind === 'audio',
    );

    // Get unpaused consumer transports that are audio
    const consumerTransportsToPause = consumerTransports.filter(
      (transport) => transport.producerId
        && transport.producerId !== null
        && transport.producerId !== ''
        && !lStreams.some(
          (stream) => stream.producerId === transport.producerId,
        )
        && transport.consumer
        && transport.consumer.kind
        && transport.consumer.paused !== true
        && transport.consumer.kind === 'audio',
    );

    await sleep({ ms: 100 });

    // Emit consumer.pause() for each transport to pause
    for (const transport of consumerTransportsToPause) {
      transport.consumer.pause();
      transport.socket_.emit(
        'consumer-pause',
        { serverConsumerId: transport.serverConsumerTransportId },
        async () => {
          // Handle the response if needed
        },
      );
    }

    // Emit consumer.resume() for each transport to resume
    for (const transport of consumerTransportsToResume) {
      transport.socket_.emit(
        'consumer-resume',
        { serverConsumerId: transport.serverConsumerTransportId },
        async ({ resumed }: { resumed: boolean }) => {
          if (resumed) {
            transport.consumer.resume();
          }
        },
      );
    }
  } catch (error) {
    console.error('Error in processConsumerTransportsAudio:', error);
  }
};
