
import { newPipeProducer } from './socketReceiveMethods/newPipeProducer';
import { producerClosed } from './socketReceiveMethods/producerClosed';
import {
    ReorderStreamsParameters, ReorderStreamsType, NewPipeProducerParameters, NewPipeProducerType, ProducerClosedType,
    ProducerClosedParameters,
    ReceiveAllPipedTransportsParameters,
} from '../@types/types';
import { Socket } from 'socket.io-client';

export interface ConnectLocalIpsParameters extends ReorderStreamsParameters, ProducerClosedParameters, NewPipeProducerParameters,
ReceiveAllPipedTransportsParameters {
    socket: Socket;

    // mediasfu functions
    reorderStreams: ReorderStreamsType;
    getUpdatedAllParams: () => ConnectLocalIpsParameters;
    [key: string]: any;
}

export interface ConnectLocalIpsOptions {
    socket: Socket;
    newProducerMethod?: NewPipeProducerType;
    closedProducerMethod?: ProducerClosedType;
    parameters: ConnectLocalIpsParameters;
}

// Export the type definition for the function
export type ConnectLocalIpsType = (options: ConnectLocalIpsOptions) => Promise<void>;

/**
 * Connects to remote IPs and manages socket connections.
 * 
 * @param {ConnectLocalIpsOptions} options - The options for connecting IPs.
 * @param {Socket} options.socket - The socket to connect to.
 * @param {Function} [options.newProducerMethod=newPipeProducer] - The method to handle new pipe producer events.
 * @param {Function} [options.closedProducerMethod=producerClosed] - The method to handle producer closed events.
 * @param {ConnectLocalIpsParameters} options.parameters - Additional parameters.
 * @param {Function} options.parameters.reorderStreams - The function to reorder streams.
 * @param {Function} options.parameters.getUpdatedAllParams - The function to get updated parameters.
 * @param {Socket} options.parameters.socket - The socket to connect to.
 * 
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 * 
 * @throws Will throw an error if required parameters are missing or if there is an issue connecting to a remote IP.
 * 
 * @example
 * ```typescript
 * const options = {
 *  socket,
 * newProducerMethod: newPipeProducer,
 * closedProducerMethod: producerClosed,
 * parameters: connectLocalIpsParameters,
 * };
 * 
 * connectLocalIps(options)
 *  .then(() => {
 *   console.log('Connected to local IPs');
 * })
 * .catch(error => {
 *  console.error('Error connecting to local IPs:', error);
 * });
 * ```
 */

export const connectLocalIps = async ({
    socket,

    // mediasfu methods
    newProducerMethod = newPipeProducer,
    closedProducerMethod = producerClosed,
    parameters,
}: ConnectLocalIpsOptions): Promise<void> => {
    try {

        // Connect to the remote socket using socket.io-client
        // Handle new pipe producer event
        socket.on('new-producer', async ({ producerId, islevel }: { producerId: string; islevel: string }) => {
            if (newProducerMethod) {
                await newProducerMethod({
                    producerId,
                    islevel,
                    nsock: socket,
                    parameters,
                });
            }
        });

        // Handle producer closed event
        socket.on('producer-closed', async ({ remoteProducerId }: { remoteProducerId: string }) => {
            if (closedProducerMethod) {
                await closedProducerMethod({ remoteProducerId, parameters });
            }
        });

        await parameters.receiveAllPipedTransports({ nsock: socket, community: true, parameters });

    } catch (error) {
        // Handle the error
        console.log('ConnectLocalIps error', error);
    }
};
