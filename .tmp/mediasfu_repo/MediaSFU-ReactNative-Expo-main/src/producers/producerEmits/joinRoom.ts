import { Socket } from 'socket.io-client';
import { ResponseJoinRoom } from '../../@types/types';
import { validateAlphanumeric } from '../../methods/utils/validateAlphanumeric';

export interface JoinRoomOptions {
  socket: Socket;
  roomName: string;
  islevel: string;
  member: string;
  sec: string;
  apiUserName: string;
}

// Export the type definition for the function
export type JoinRoomType = (
  socket: Socket,
  roomName: string,
  islevel: string,
  member: string,
  sec: string,
  apiUserName: string
) => Promise<object>;

/**
 * Joins a user to a specified room via a socket connection.
 *
 * @param {JoinRoomOptions} options - The options for joining the room.
 * @param {Socket} options.socket - The socket instance to use for communication.
 * @param {string} options.roomName - The name of the room to join.
 * @param {string} options.islevel - The level of the user.
 * @param {string} options.member - The member identifier.
 * @param {string} options.sec - The security token.
 * @param {string} options.apiUserName - The API username of the user.
 * 
 * @returns {Promise<object>} A promise that resolves with the data received from the 'joinRoom' event or rejects with a validation error.
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
 *   const response = await joinRoom(options);
 *   console.log("Room joined:", response);
 * } catch (error) {
 *   console.error("Failed to join room:", error);
 * }
 * ```
 */

async function joinRoom({
  socket,
  roomName,
  islevel,
  member,
  sec,
  apiUserName,
}: JoinRoomOptions): Promise<object> {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!(sec && roomName && islevel && apiUserName && member)) {
      const validationError = {
        success: false,
        rtpCapabilities: null as any,
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
      const validationError = {
        success: false,
        rtpCapabilities: null as any,
        reason: 'Invalid roomName or apiUserName or member',
      };
      reject(validationError);
      return;
    }

    // Validate roomName starts with 's' or 'p'
    if (!(roomName.startsWith('s') || roomName.startsWith('p'))) {
      const validationError = {
        success: false,
        rtpCapabilities: null as any,
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
        && (islevel === '0' || islevel === '1' || islevel === '2')
      )
    ) {
      const validationError = {
        success: false,
        rtpCapabilities: null as any,
        reason: 'Invalid roomName or islevel or apiUserName or secret',
      };
      reject(validationError);
      return;
    }

    socket.emit(
      'joinRoom',
      {
        roomName, islevel, member, sec, apiUserName,
      },
      async (data: ResponseJoinRoom) => {
        try {
          // Check if rtpCapabilities is null
          if (data.rtpCapabilities === null) {
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

            // If not null, create device or perform other actions as needed
            // ...

            // Resolve with the data received from the 'joinRoom' event
            resolve(data);
          } else {
            // Handle other cases or perform additional actions
            // ...

            // Resolve with the data received from the 'joinRoom' event
            resolve(data);
          }
        } catch (error) {
          // Handle errors during the joinRoom process
          console.log('Error joining room:', error);
          reject(error);
        }
      },
    );
  });
}

export { joinRoom };
