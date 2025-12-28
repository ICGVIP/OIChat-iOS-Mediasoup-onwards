import { Transport, CloseAndResizeParameters, CloseAndResizeType } from '../../@types/types';

export interface ProducerClosedParameters extends CloseAndResizeParameters {
  consumerTransports: Transport[];
  screenId?: string;
  updateConsumerTransports: (transports: Transport[]) => void;

  // mediasfu functions
  closeAndResize: CloseAndResizeType;
  getUpdatedAllParams: () => ProducerClosedParameters;
  [key: string]: any;

}

export interface ProducerClosedOptions {
  remoteProducerId: string;
  parameters: ProducerClosedParameters;
}

// Export the type definition for the function
export type ProducerClosedType = (options: ProducerClosedOptions) => Promise<void>;

/**
 * Handles the closure of a producer identified by its remote producer ID.
 * This function will clean up the consumer transports and resize the video outputs.
 *
 * @function
 * @async
 * @param {ProducerClosedOptions} options - The options for closing the producer.
 * @param {string} options.remoteProducerId - The ID of the remote producer to close.
 * @param {ProducerClosedParameters} options.parameters - Additional parameters for the operation.
 * @param {Transport[]} options.parameters.consumerTransports - The list of consumer transports associated with the producer.
 * @param {Function} options.parameters.closeAndResize - Function to handle the closing and resizing of video streams.
 * @param {string} [options.parameters.screenId] - The ID of the screen producer (if applicable).
 * @param {Function} options.parameters.updateConsumerTransports - Function to update the state of consumer transports.
 * @returns {Promise<void>} A promise that resolves when the producer has been successfully closed.
 * @throws Will throw an error if there is an issue closing the consumer transport or the producer.
 *
 * @example
 * import { producerClosed } from 'mediasfu-reactnative-expo';
 * 
 * const options = {
 *   remoteProducerId: 'producerId',
 *   parameters: {
 *     consumerTransports: [], // Array of consumer transports
 *     closeAndResize: (params) => console.log('Close and resize called', params),
 *     screenId: 'screenId',
 *     updateConsumerTransports: (transports) => console.log('Updated transports:', transports),
 *   },
 * };
 * 
 * producerClosed(options)
 *   .then(() => {
 *     console.log('Producer closed successfully');
 *   })
 *   .catch((error) => {
 *     console.error('Error closing producer:', error);
 *   });
 */


export const producerClosed = async ({
  remoteProducerId,
  parameters,
}: ProducerClosedOptions): Promise<void> => {
  let {
    consumerTransports, closeAndResize, screenId, updateConsumerTransports,
  } = parameters;

  // Handle producer closed
  const producerToClose = consumerTransports.find(
    (transportData: any) => transportData.producerId === remoteProducerId,
  );

  if (!producerToClose) {
    return;
  }

  // Check if the ID of the producer to close is the same as the screenId
  let { kind } = producerToClose.consumer as { kind: string }; // Allow 'screenshare' as well

  if (producerToClose.producerId === screenId) {
    kind = 'screenshare' as string;
  }

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

  // Filter out the closed producer
  consumerTransports = consumerTransports.filter(
    (transportData: any) => transportData.producerId !== remoteProducerId,
  );
  updateConsumerTransports(consumerTransports);

  // Close and resize the videos
  await closeAndResize({ producerId: remoteProducerId, kind, parameters });
};
