import { Socket } from 'socket.io-client';

export interface ReInitiateRecordingOptions {
  roomName: string;
  member: string;
  socket: Socket;
  adminRestrictSetting: boolean;
}

// Export the type definition for the function
export type ReInitiateRecordingType = (options: ReInitiateRecordingOptions) => Promise<void>;

/**
 * Re-initiates the recording for a given room and member.
 *
 * @param {ReInitiateRecordingOptions} options - The options for re-initiating the recording.
 * @param {string} options.roomName - The name of the room to re-initiate recording.
 * @param {string} options.member - The member re-initiating the recording.
 * @param {Socket} options.socket - The socket instance for communication.
 * @param {boolean} options.adminRestrictSetting - Determines if the admin has restricted access to specific media features.
 *
 * @returns {Promise<void>} A promise that resolves when the recording is re-initiated.
 *
 * @example
 * ```typescript
 * const options = {
 *   roomName: "exampleRoom",
 *   member: "adminUser",
 *   socket: socketInstance,
 *   adminRestrictSetting: false,
 * };
 * 
 * await reInitiateRecording(options);
 * ```
 */

export const reInitiateRecording = async ({
  roomName, member, socket, adminRestrictSetting,
}: ReInitiateRecordingOptions): Promise<void> => {
  // Function to re-initiate recording
  if (!adminRestrictSetting) {
    socket.emit(
      'startRecordIng',
      { roomName, member },
      ({ success }: { success: boolean; }) => {
        if (success) {
          // Handle success, if needed
        } else {
          // Handle failure, if needed
        }
      },
    );
  }
};
