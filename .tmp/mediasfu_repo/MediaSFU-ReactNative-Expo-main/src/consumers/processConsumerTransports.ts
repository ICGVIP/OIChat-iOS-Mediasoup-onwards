import {
  Stream, Participant, Transport, SleepType,
} from '../@types/types';

export interface ProcessConsumerTransportsParameters {
  remoteScreenStream: Stream[];
  oldAllStreams: (Stream | Participant)[];
  newLimitedStreams: (Stream | Participant)[];

  // mediasfu functions
  sleep: SleepType;
  getUpdatedAllParams: () => ProcessConsumerTransportsParameters;
  [key: string]: any;
}

export interface ProcessConsumerTransportsOptions {
  consumerTransports: Transport[];
  lStreams_: (Stream | Participant)[];
  parameters: ProcessConsumerTransportsParameters;
}

// Export the type definition for the function
export type ProcessConsumerTransportsType = (options: ProcessConsumerTransportsOptions) => Promise<void>;

/**
 * Processes consumer transports for audio streams by pausing and resuming them based on their current state and the provided streams.
 *
 * @param {Object} options - The options for processing consumer transports.
 * @param {Array} options.consumerTransports - The list of consumer transports to process.
 * @param {Array} options.lStreams - The list of local streams to check against.
 * @param {Object} options.parameters - Additional parameters for processing.
 * @param {Function} options.parameters.sleep - A function to pause execution for a specified duration.
 *
 * @returns {Promise<void>} A promise that resolves when the processing is complete.
 *
 * @throws Will throw an error if there is an issue processing the consumer transports.
 *
 * @example
 * ```typescript
 * await processConsumerTransportsAudio({
 *   consumerTransports: [transport1, transport2],
 *   lStreams: [stream1, stream2],
 *   parameters: {
 *     sleep: sleepFunction,
 *   },
 * });
 * ```
 */

export async function processConsumerTransports({
  consumerTransports,
  lStreams_,
  parameters,
}: ProcessConsumerTransportsOptions): Promise<void> {
  try {
    // Destructure parameters and get updated values
    parameters = parameters.getUpdatedAllParams();

    const {
      remoteScreenStream,
      oldAllStreams,
      newLimitedStreams,
      sleep,
    } = parameters;

    // Function to check if the producerId is valid in the given stream arrays
    // eslint-disable-next-line no-inner-declarations
    function isValidProducerId(producerId: string, ...streamArrays: (Stream | Participant)[][]): boolean {
      return (
        producerId !== null
        && producerId !== ''
        && streamArrays.some((streamArray) => (
          streamArray.length > 0
            && streamArray.some((stream) => stream?.producerId === producerId)
        ))
      );
    }

    // Get paused consumer transports that are not audio
    const consumerTransportsToResume = consumerTransports.filter(
      (transport) => isValidProducerId(
        transport.producerId,
        lStreams_,
        remoteScreenStream,
        oldAllStreams,
        newLimitedStreams,
      )
        && transport.consumer?.paused === true
        && transport.consumer.kind !== 'audio',
    );

    // Get unpaused consumer transports that are not audio
    const consumerTransportsToPause = consumerTransports.filter(
      (transport) => transport.producerId
        && transport.producerId !== null
        && transport.producerId !== ''
        && !lStreams_.some(
          (stream) => stream.producerId === transport.producerId,
        )
        && transport.consumer
        && transport.consumer.kind
        && transport.consumer.paused !== true
        && transport.consumer.kind !== 'audio'
        && !remoteScreenStream.some((stream) => stream.producerId === transport.producerId)
        && !oldAllStreams.some((stream) => stream.producerId === transport.producerId)
        && !newLimitedStreams.some((stream) => stream.producerId === transport.producerId),
    );

    // Pause consumer transports after a short delay
    await sleep({ ms: 100 });

    // Emit consumer.pause() for each filtered transport (not audio)
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

    // Emit consumer.resume() for each filtered transport (not audio)
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
    if (error instanceof Error) {
      console.error(`Error processing consumer transports: ${error.message}`);
    } else {
      console.error('Error processing consumer transports:', error);
    }
    // throw new Error(`Error processing consumer transports: ${error.message}`);
  }
}
