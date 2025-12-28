import { Socket } from 'socket.io-client';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { validateAlphanumeric } from '../../methods/utils/validateAlphanumeric'; // Import the validateAlphanumeric function from the validateAlphanumeric file

export interface JoinConRoomOptions {
  socket: Socket;
  roomName: string;
  islevel: string;
  member: string;
  sec: string;
  apiUserName: string;
}

export interface JoinConRoomResponse {
  success: boolean;
  rtpCapabilities: RtpCapabilities | null;
  reason?: string;
  banned?: boolean;
  suspended?: boolean;
  noAdmin?: boolean;
  [key: string]: any;
}

// Export the type definition for the function
export type JoinConRoomType = (options: JoinConRoomOptions) => Promise<JoinConRoomResponse>;

/**
 * Joins a conference room using the provided options.
 *
 * @param {JoinConRoomOptions} options - The options for joining the conference room.
 * @param {Socket} options.socket - The socket instance to use for communication.
 * @param {string} options.roomName - The name of the room to join.
 * @param {string} options.islevel - The level of the user.
 * @param {string} options.member - The member identifier.
 * @param {string} options.sec - The security token.
 * @param {string} options.apiUserName - The API username.
 * 
 * @returns {Promise<JoinConRoomResponse>} A promise that resolves with the response of the join operation.
 *
 * @example
 * ```typescript
 * const options = {
 *   socket: socketInstance,
 *   roomName: "s12345678",
 *   islevel: "1",
 *   member: "user123",
 *   sec: "64CharacterLongSecretHere",
 *   apiUserName: "user123",
 * };
 *
 * try {
 *   const response = await joinConRoom(options);
 *   console.log("Room joined:", response);
 * } catch (error) {
 *   console.error("Failed to join room:", error);
 * }
 * ```
 */

export async function joinConRoom(
  {
    socket, roomName, islevel, member, sec, apiUserName,
  }: JoinConRoomOptions,
): Promise<JoinConRoomResponse> {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!(sec && roomName && islevel && apiUserName && member)) {
      const validationError: JoinConRoomResponse = {
        success: false,
        rtpCapabilities: null,
        reason: 'Missing required parameters',
      };
      reject(validationError);
      return;
    }

    // Validate alphanumeric for roomName, apiUserName, and member
    try {
      validateAlphanumeric({ str: roomName });
      validateAlphanumeric({ str: apiUserName });
      validateAlphanumeric({ str: member });
    } catch {
      const validationError: JoinConRoomResponse = {
        success: false,
        rtpCapabilities: null,
        reason: 'Invalid roomName or apiUserName or member',
      };
      reject(validationError);
      return;
    }

    // Validate roomName starts with 's' or 'p'
    if (!(roomName.startsWith('s') || roomName.startsWith('p'))) {
      const validationError: JoinConRoomResponse = {
        success: false,
        rtpCapabilities: null,
        reason: 'Invalid roomName, must start with s or p',
      };
      reject(validationError);
      return;
    }

    // Validate other conditions for sec, roomName, islevel, apiUserName
    if (
      !(
        sec.length === 64
        && roomName.length >= 8
        && islevel.length === 1
        && apiUserName.length >= 6
        && (islevel == '0' || islevel == '1' || islevel == '2')
      )
    ) {
      const validationError: JoinConRoomResponse = {
        success: false,
        rtpCapabilities: null,
        reason: 'Invalid roomName or islevel or apiUserName or secret',
      };
      reject(validationError);
      return;
    }

    socket.emit(
      'joinConRoom',
      {
        roomName, islevel, member, sec, apiUserName,
      },
      async (data: JoinConRoomResponse) => {
        try {
          // Check if rtpCapabilities is null
          if (data.rtpCapabilities == null) {
            // Check if banned, suspended, or noAdmin
            if (data.banned) {
              throw new Error('User is banned.');
            }
            if (data.suspended) {
              throw new Error('User is suspended.');
            }
            if (data.noAdmin) {
              throw new Error('Host has not joined the room yet.');
            }

            // Resolve with the data received from the 'joinConRoom' event
            resolve(data);
          } else {
            // Handle other cases or perform additional actions
            resolve(data);
          }
        } catch (error) {
          // Handle errors during the joinConRoom process
          console.log('Error joining room:', error);
          reject(error);
        }
      },
    );
  });
}
