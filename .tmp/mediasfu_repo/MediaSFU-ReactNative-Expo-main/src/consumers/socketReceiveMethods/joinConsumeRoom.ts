/**
 * Joins a consumption room by sending a request to the server and handles the necessary setup.
 * @function
 * @async
 * @param {Object} params - The parameters object containing necessary variables.
 * @param {string} params.remote_sock - The remote socket information.
 * @param {string} params.apiToken - The API token for authentication.
 * @param {string} params.apiUserName - The API username for authentication.
 * @param {Object} params.parameters - Additional parameters required for the function.
 * @param {string} params.roomName - The name of the room to join.
 * @param {string} params.islevel - The level of the participant.
 * @param {Object} params.member - Information about the participant.
 * @param {Object} params.device - The media device used by the participant.
 * @param {Object} params.mediasoupClient - The mediasoup client object.
 * @param {Object} params.rtpCapabilities - The RTP capabilities.
 * @param {function} params.receiveAllPipedTransports - Function to receive all piped transports.
 * @param {function} params.createDeviceClient - Function to create a device client.
 * @param {function} params.joinConRoom - Function to join a consumption room.
 * @returns {Object} - An object containing data related to the success of joining the room.
 * @throws {Error} Throws an error if there is an issue joining the room or setting up the necessary components.
 */

import { Device, RtpCapabilities } from 'mediasoup-client/lib/types';
import { Socket } from 'socket.io-client';
import { joinConRoom } from '../../producers/producerEmits/joinConRoom';
import { ReceiveAllPipedTransportsParameters, ReceiveAllPipedTransportsType, CreateDeviceClientType } from '../../@types/types';

export interface JoinConsumeRoomParameters extends ReceiveAllPipedTransportsParameters {
  roomName: string;
  islevel: string;
  member: string;
  device: Device | null;
  updateDevice: (device: Device | null) => void;

  // Mediasfu functions
  receiveAllPipedTransports: ReceiveAllPipedTransportsType;
  createDeviceClient: CreateDeviceClientType;
  getUpdatedAllParams: () => JoinConsumeRoomParameters;
  [key: string]: any;
}
export interface JoinConsumeRoomOptions {
  remote_sock: Socket;
  apiToken: string;
  apiUserName: string;
  parameters: JoinConsumeRoomParameters;
}

interface JoinConsumeRoomResponse {
  success: boolean;
  rtpCapabilities?: RtpCapabilities | null;
}

// Export the type definition for the function
export type JoinConsumeRoomType = (options: JoinConsumeRoomOptions) => Promise<JoinConsumeRoomResponse>;

/**
 * Joins a consumption room by sending a request to the server, handling device setup, and managing piped transports.
 * 
 * @function
 * @async
 * @param {Object} options - The configuration options.
 * @param {Socket} options.remote_sock - The remote socket for communication.
 * @param {string} options.apiToken - The API token for authentication.
 * @param {string} options.apiUserName - The API username for authentication.
 * @param {JoinConsumeRoomParameters} options.parameters - Additional parameters including room details and Mediasoup configurations.
 * @returns {Promise<JoinConsumeRoomResponse>} - An object indicating the success of joining the room and optional RTP capabilities.
 * @throws {Error} Throws an error if joining the room or setup fails.
 *
 * @example
 * import { joinConsumeRoom } from 'mediasfu-reactnative-expo';
 * import { io } from 'socket.io-client';
 * 
 * const apiToken = 'your-api-token';
 * const apiUserName = 'your-api-username';
 * const remote_sock = io("http://localhost:3000");
 * 
 * const parameters = {
 *   roomName: 'room-name',
 *   islevel: '2',
 *   member: 'user-id',
 *   device: null,
 *   updateDevice: (device) => console.log('Device updated:', device),
 *   receiveAllPipedTransports: (params) => console.log('Receiving all piped transports:', params),
 *   createDeviceClient: async (params) => { // Device client setup logic  },
 *   getUpdatedAllParams: () => console.log('Getting updated parameters'),
 * };
 * 
 * async function init() {
 *   try {
 *     const data = await joinConsumeRoom({
 *       remote_sock,
 *       apiToken,
 *       apiUserName,
 *       parameters,
 *     });
 *     console.log('Joined room:', data);
 *   } catch (error) {
 *     console.error('Error joining room:', error);
 *   }
 * }
 * init();
 * // Expected output: { success: true, rtpCapabilities: { ... } }
 */


export const joinConsumeRoom = async ({
  remote_sock,
  apiToken,
  apiUserName,
  parameters,
}: JoinConsumeRoomOptions): Promise<JoinConsumeRoomResponse> => {
  const {
    roomName,
    islevel,
    member,
    device,
    updateDevice,

    // Mediasfu functions
    receiveAllPipedTransports,
    createDeviceClient,
  } = parameters;

  try {
    // Join the consumption room
    const data: JoinConsumeRoomResponse = await joinConRoom({
      socket: remote_sock, roomName, islevel, member, sec: apiToken, apiUserName,
    });

    if (data && data.success) {
      // Setup media device if not already set
      if (!device) {
        if (data.rtpCapabilities) {
          const device_: Device | null = await createDeviceClient({
            rtpCapabilities: data.rtpCapabilities,
          });

          if (device_) {
            updateDevice(device_);
          }
        }
      }

      // Receive all piped transports
      await receiveAllPipedTransports({ nsock: remote_sock, parameters });
    }

    return data;
  } catch (error) {
    console.error('Error in joinConsumeRoom:', error);
    throw new Error('Failed to join the consumption room or set up necessary components.');
  }
};
