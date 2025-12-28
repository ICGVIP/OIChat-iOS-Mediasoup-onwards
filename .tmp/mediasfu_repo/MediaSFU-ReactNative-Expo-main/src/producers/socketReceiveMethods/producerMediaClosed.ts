import {
  CloseAndResizeParameters, CloseAndResizeType, PrepopulateUserMediaParameters, PrepopulateUserMediaType, ReorderStreamsParameters, ReorderStreamsType, Transport,
} from '../../@types/types';

export interface ProducerMediaClosedParameters extends CloseAndResizeParameters, PrepopulateUserMediaParameters, ReorderStreamsParameters {
  consumerTransports: Transport[];
  updateConsumerTransports: (transports: Transport[]) => void;
  hostLabel: string;
  shared: boolean;
  updateShared: (shared: boolean) => void;
  updateShareScreenStarted: (started: boolean) => void;
  updateScreenId: (screenId: string) => void;
  updateShareEnded: (ended: boolean) => void;

  // mediasfu functions
  closeAndResize: CloseAndResizeType;
  prepopulateUserMedia: PrepopulateUserMediaType;
  reorderStreams: ReorderStreamsType;

  getUpdatedAllParams: () => ProducerMediaClosedParameters;
  [key: string]: any;
}

export interface ProducerMediaClosedOptions {
  producerId: string;
  kind: 'video' | 'screen' | 'audio' | 'screenshare';
  parameters: ProducerMediaClosedParameters;
}

// Export the type definition for the function
export type ProducerMediaClosedType = (options: ProducerMediaClosedOptions) => Promise<void>;

/**
 * Handles the closure of a media producer.
 *
 * @param {ProducerMediaClosedOptions} options - The options for closing the media producer.
 * @param {string} options.producerId - The ID of the producer to close.
 * @param {string} options.kind - The kind of media (e.g., "screenshare" or "screen").
 * @param {ProducerMediaClosedParameters} options.parameters - The parameters object containing various methods and properties.
 *
 * @returns {Promise<void>} - A promise that resolves when the producer has been closed and necessary updates are made.
 *
 * @remarks
 * This function performs the following steps:
 * 1. Retrieves updated parameters.
 * 2. Finds the transport associated with the producer to close.
 * 3. Closes the consumer transport and consumer if found.
 * 4. Updates the consumer transports list.
 * 5. Calls `closeAndResize` with the necessary parameters.
 * 6. If the producer kind is "screenshare" or "screen", updates shared state and calls various update methods.
 *
 * @example
 * ```typescript
 * const options: ProducerMediaClosedOptions = {
 *   producerId: "12345",
 *   kind: "screenshare",
 *   parameters: {
 *     consumerTransports: [{ producerId: "12345", consumerTransport: someTransport, consumer: someConsumer }],
 *     updateConsumerTransports: (transports) => console.log("Updated transports:", transports),
 *     hostLabel: "Host1",
 *     shared: true,
 *     updateShared: (shared) => console.log("Updated shared state:", shared),
 *     updateShareScreenStarted: (started) => console.log("Screen sharing started:", started),
 *     updateScreenId: (screenId) => console.log("Screen ID updated:", screenId),
 *     updateShareEnded: (ended) => console.log("Share ended:", ended),
 *     closeAndResize: async (params) => console.log("Closed and resized:", params),
 *     prepopulateUserMedia: async (params) => console.log("Prepopulated user media:", params),
 *     reorderStreams: async (params) => console.log("Reordered streams:", params),
 *     getUpdatedAllParams: () => (),
 *   },
 * };
 *
 * await producerMediaClosed(options);
 * ```
 */


export const producerMediaClosed = async ({
  producerId,
  kind,
  parameters,
}: ProducerMediaClosedOptions): Promise<void> => {
  // Get updated parameters
  const updatedParameters = parameters.getUpdatedAllParams();

  const {
    consumerTransports,
    updateConsumerTransports,
    hostLabel,
    shared,
    updateShared,
    updateShareScreenStarted,
    updateScreenId,
    updateShareEnded,
    closeAndResize,
    prepopulateUserMedia,
    reorderStreams,
  } = updatedParameters;

  // Find the transport for the producer to close
  const producerToClose = consumerTransports.find(
    (transportData) => transportData.producerId === producerId,
  );

  if (producerToClose) {
    try {
      await producerToClose.consumerTransport.close();
    } catch (error) {
      console.error('Error closing consumer transport:', error);
    }

    try {
      producerToClose.consumer.close();
    } catch (error) {
      console.error('Error closing consumer:', error);
    }

    const updatedTransports = consumerTransports.filter(
      (transportData) => transportData.producerId !== producerId,
    );
    updateConsumerTransports(updatedTransports);

    await closeAndResize({
      producerId,
      kind,
      parameters: updatedParameters,
    });
  } else if (kind === 'screenshare' || kind === 'screen') {
    if (shared) {
      updateShared(false);
    } else {
      updateShareScreenStarted(false);
      updateScreenId('');
    }
    updateShareEnded(true);
    await prepopulateUserMedia({ name: hostLabel, parameters: updatedParameters });
    await reorderStreams({ add: false, screenChanged: true, parameters: updatedParameters });
  }
};
