import { Socket } from 'socket.io-client';
import { Device } from 'mediasoup-client/lib/types';
import { signalNewConsumerTransport } from '../../consumers/signalNewConsumerTransport';
import {
  ReorderStreamsParameters, ReorderStreamsType, SignalNewConsumerTransportParameters, ConnectRecvTransportParameters, ConnectRecvTransportType, ShowAlert,
} from '../../@types/types';

export interface NewPipeProducerParameters extends ReorderStreamsParameters, SignalNewConsumerTransportParameters, ConnectRecvTransportParameters {

  first_round: boolean;
  shareScreenStarted: boolean;
  shared: boolean;
  landScaped: boolean;
  showAlert?: ShowAlert;
  isWideScreen: boolean;
  updateFirst_round: (firstRound: boolean) => void;
  updateLandScaped: (landScaped: boolean) => void;
  device: Device | null;
  consumingTransports: string[];
  lock_screen: boolean;
  updateConsumingTransports: (transports: string[]) => void;

  // mediasfu functions
  connectRecvTransport: ConnectRecvTransportType;
  reorderStreams: ReorderStreamsType;
  getUpdatedAllParams: () => NewPipeProducerParameters;
  [key: string]: any;

}

export interface NewPipeProducerOptions {
  producerId: string;
  islevel: string;
  nsock: Socket;
  parameters: NewPipeProducerParameters;
}

// Export the type definition for the function
export type NewPipeProducerType = (options: NewPipeProducerOptions) => Promise<void>;

/**
 * Handles the creation of a new pipe producer by signaling for a new consumer transport and updating the necessary parameters.
 *
 * @function
 * @async
 * @param {NewPipeProducerOptions} options - The options for the new pipe producer.
 * @param {string} options.producerId - The ID of the producer to be consumed.
 * @param {string} options.islevel - The level status of the participant.
 * @param {Socket} options.nsock - The socket instance for real-time communication.
 * @param {NewPipeProducerParameters} options.parameters - Additional parameters required for the producer.
 * @param {boolean} options.parameters.shareScreenStarted - Indicates if screen sharing has started.
 * @param {boolean} options.parameters.shared - Indicates if sharing is active.
 * @param {boolean} options.parameters.landScaped - Indicates if the device is in landscape mode.
 * @param {ShowAlert} options.parameters.showAlert - Function to show alerts to the user.
 * @param {boolean} options.parameters.isWideScreen - Indicates if the device is a widescreen.
 * @param {Function} options.parameters.updateFirst_round - Function to update the first round status.
 * @param {Function} options.parameters.updateLandScaped - Function to update the landscape status.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} Will throw an error if the operation fails to signal the new consumer transport.
 *
 * @example
 * import { newPipeProducer } from 'mediasfu-reactnative-expo';
 * import { io } from 'socket.io-client';
 * 
 * const parameters = {
 *   shareScreenStarted: true,
 *   shared: true,
 *   landScaped: false,
 *   showAlert: (alert) => console.log(alert.message),
 *   isWideScreen: false,
 *   updateFirst_round: (firstRound) => console.log('First round updated:', firstRound),
 *   updateLandScaped: (landScaped) => console.log('Landscape status updated:', landScaped),
 * };
 * 
 * const producerId = 'producer-123';
 * const islevel = '2';
 * const nsock = io("http://localhost:3000");
 * 
 * async function init() {
 *   try {
 *     await newPipeProducer({
 *       producerId,
 *       islevel,
 *       nsock,
 *       parameters,
 *     });
 *     console.log('New pipe producer created successfully');
 *   } catch (error) {
 *     console.error('Error creating new pipe producer:', error);
 *   }
 * }
 * 
 * init();
 */


export const newPipeProducer = async ({
  producerId,
  islevel,
  nsock,
  parameters,
}: NewPipeProducerOptions): Promise<void> => {
  const {
    shareScreenStarted,
    shared,
    landScaped,
    showAlert,
    isWideScreen,
    updateFirst_round,
    updateLandScaped,
  } = parameters;

  // Signal new consumer transport
  await signalNewConsumerTransport({
    remoteProducerId: producerId,
    islevel,
    nsock,
    parameters,
  });

  // Modify first_round and landscape status
  let updatedFirstRound = false;

  if (shareScreenStarted || shared) {
    if (!isWideScreen) {
      if (!landScaped) {
        if (showAlert) {
          showAlert({
            message: 'Please rotate your device to landscape mode for better experience',
            type: 'success',
            duration: 3000,
          });
        }
        updateLandScaped(true);
      }
    }

    updatedFirstRound = true;
    updateFirst_round(updatedFirstRound);
  }
};
