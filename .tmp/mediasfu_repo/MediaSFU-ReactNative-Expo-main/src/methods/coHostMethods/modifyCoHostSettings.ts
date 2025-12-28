import { Socket } from 'socket.io-client';
import { ShowAlert, CoHostResponsibility } from '../../@types/types';

export interface ModifyCoHostSettingsOptions {
  roomName: string;
  showAlert?: ShowAlert;
  selectedParticipant: string;
  coHost: string;
  coHostResponsibility: CoHostResponsibility[];
  updateIsCoHostModalVisible: (isVisible: boolean) => void;
  updateCoHostResponsibility: (coHostResponsibility: CoHostResponsibility[]) => void;
  updateCoHost: (coHost: string) => void;
  socket: Socket;
}

// Export the type definition for the function
export type ModifyCoHostSettingsType = (options: ModifyCoHostSettingsOptions) => Promise<void>;

/**
 * Modifies the co-host settings for a given room.
 *
 * @param {Object} options - The options for modifying co-host settings.
 * @param {string} options.roomName - The name of the room.
 * @param {Function} options.showAlert - Function to show an alert message.
 * @param {string} options.selectedParticipant - The participant selected to be co-host.
 * @param {string} options.coHost - The current co-host.
 * @param {CoHostResponsibility[]} options.coHostResponsibility - The responsibilities assigned to the co-host.
 * @param {Function} options.updateIsCoHostModalVisible - Function to update the visibility of the co-host modal.
 * @param {Function} options.updateCoHostResponsibility - Function to update the co-host responsibility.
 * @param {Function} options.updateCoHost - Function to update the co-host.
 * @param {Socket} options.socket - The socket instance for emitting events.
 * @returns {Promise<void>} A promise that resolves when the co-host settings have been modified.
 *
 * @example
 * ```typescript
 * const options: ModifyCoHostSettingsOptions = {
 *   roomName: "mainRoom",
 *   showAlert: (alert) => console.log(alert.message),
 *   selectedParticipant: "User123",
 *   coHost: "No coHost",
 *   coHostResponsibility: [{ name: "media", value: true }],
 *   updateIsCoHostModalVisible: setModalVisible,
 *   updateCoHostResponsibility: setCoHostResponsibility,
 *   updateCoHost: setCoHost,
 *   socket: socketInstance,
 * };
 *
 * modifyCoHostSettings(options);
 * // Sets User123 as the new co-host with specific responsibilities and emits the update event.
 * ```
 */

export const modifyCoHostSettings = async ({
  roomName,
  showAlert,
  selectedParticipant,
  coHost,
  coHostResponsibility,
  updateIsCoHostModalVisible,
  updateCoHostResponsibility,
  updateCoHost,
  socket,
}: ModifyCoHostSettingsOptions): Promise<void> => {
  // Check if the chat room is in demo mode
  if (roomName.toLowerCase().startsWith('d')) {
    showAlert?.({
      message: 'You cannot add co-host in demo mode.',
      type: 'danger',
      duration: 3000,
    });

    return;
  }

  let newCoHost = coHost;

  if (
    coHost !== 'No coHost'
    || (selectedParticipant && selectedParticipant !== 'Select a participant')
  ) {
    if (selectedParticipant && selectedParticipant !== 'Select a participant') {
      newCoHost = selectedParticipant;
      updateCoHost(newCoHost);
    }

    updateCoHostResponsibility(coHostResponsibility);

    // Emit a socket event to update co-host information
    socket.emit('updateCoHost', {
      roomName,
      coHost: newCoHost,
      coHostResponsibility,
    });
  }

  // Close the co-host modal
  updateIsCoHostModalVisible(false);
};
