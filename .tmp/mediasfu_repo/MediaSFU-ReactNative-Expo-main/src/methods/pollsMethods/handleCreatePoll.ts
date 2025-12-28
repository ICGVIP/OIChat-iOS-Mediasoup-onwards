import { Socket } from 'socket.io-client';
import { ShowAlert } from '../../@types/types';

interface NewPoll {
  question: string;
  type: string;
  options: string[];
}
export interface HandleCreatePollOptions {
  poll: NewPoll;
  socket: Socket;
  roomName: string;
  showAlert?: ShowAlert;
  updateIsPollModalVisible: (visible: boolean) => void;

}

// Export the type definition for the function
export type HandleCreatePollType = (options: HandleCreatePollOptions) => Promise<void>;

/**
 * Handles the creation of a poll by emitting a "createPoll" event with the provided details.
 *
 * @param {HandleCreatePollOptions} options - The options for creating the poll.
 * @param {NewPoll} options.poll - The poll object containing the poll question, type, and options.
 * @param {Socket} options.socket - The socket instance used to communicate with the server.
 * @param {string} options.roomName - The name of the room where the poll is created.
 * @param {Function} [options.showAlert] - Optional function to show alert messages.
 * @param {Function} options.updateIsPollModalVisible - Function to toggle the poll modal visibility.
 *
 * @example
 * ```typescript
 * handleCreatePoll({
 *   poll: { question: "Favorite color?", type: "singleChoice", options: ["Red", "Blue", "Green"] },
 *   socket: socketInstance,
 *   roomName: "roomA",
 *   showAlert: (message) => console.log(message),
 *   updateIsPollModalVisible: (isVisible) => setIsPollModalVisible(isVisible),
 * });
 * ```
 */

export const handleCreatePoll = async ({
  poll,
  socket,
  roomName,
  showAlert,
  updateIsPollModalVisible,
}: HandleCreatePollOptions): Promise<void> => {
  try {
    socket.emit(
      'createPoll',
      { roomName, poll },
      (response: { success: boolean; reason?: string }) => {
        if (response.success) {
          showAlert?.({ message: 'Poll created successfully', type: 'success' });
          updateIsPollModalVisible(false);
        } else {
          showAlert?.({ message: response.reason || 'Failed to create poll', type: 'danger' });
        }
      },
    );
  } catch (error) {
    console.error('Error creating poll:', error);
  }
};
