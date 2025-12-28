import { Socket } from 'socket.io-client';
import { CoHostResponsibility, Participant, ShowAlert } from '../../@types/types';

export interface RemoveParticipantsOptions {
  coHostResponsibility: CoHostResponsibility[];
  participant: Participant;
  member: string;
  islevel: string;
  showAlert?: ShowAlert;
  coHost: string;
  participants: Participant[];
  socket: Socket;
  roomName: string;
  updateParticipants: (participants: Participant[]) => void;
}

// Export the type definition for the function
export type RemoveParticipantsType = (options: RemoveParticipantsOptions) => Promise<void>;

/**
 * Removes a participant from the room if the user has the necessary permissions.
 *
 * @param {RemoveParticipantsOptions} options - The options for removing a participant.
 * @param {CoHostResponsibility[]} options.coHostResponsibility - The responsibilities assigned to the co-host.
 * @param {Participant} options.participant - The participant to be removed from the room.
 * @param {string} options.member - The current member attempting to remove the participant.
 * @param {string} options.islevel - The level of the current member.
 * @param {ShowAlert} [options.showAlert] - Optional function to display an alert.
 * @param {string} options.coHost - The co-host identifier.
 * @param {Participant[]} options.participants - List of current participants.
 * @param {Socket} options.socket - The socket instance for communication.
 * @param {string} options.roomName - The name of the room.
 * @param {Function} options.updateParticipants - Function to update the participants list.
 *
 * @example
 * ```typescript
 * removeParticipants({
 *   coHostResponsibility: [{ name: "participants", value: true }],
 *   participant: { id: "123", name: "John Doe", islevel: "1" },
 *   member: "currentMember",
 *   islevel: "2",
 *   showAlert: (alert) => console.log(alert.message),
 *   coHost: "coHostMember",
 *   participants: [{ id: "123", name: "John Doe", islevel: "1" }],
 *   socket,
 *   roomName: "room1",
 *   updateParticipants: (updatedParticipants) => console.log(updatedParticipants),
 * });
 * ```
 */

export const removeParticipants = async ({
  coHostResponsibility,
  participant,
  member,
  islevel,
  showAlert,
  coHost,
  participants,
  socket,
  roomName,
  updateParticipants,
}: RemoveParticipantsOptions): Promise<void> => {
  let participantsValue = false;

  try {
    participantsValue = coHostResponsibility.find((item) => item.name === 'participants')?.value ?? false;
  } catch {
    participantsValue = false;
  }

  if (islevel === '2' || (coHost === member && participantsValue === true)) {
    if (participant.islevel !== '2') {
      const participantId = participant.id;

      // Emit a socket event to disconnect the user
      socket.emit('disconnectUserInitiate', {
        member: participant.name,
        roomName,
        id: participantId,
      });

      // Remove the participant from the local array
      const index = participants.findIndex((obj) => obj.name === participant.name);
      if (index !== -1) {
        participants.splice(index, 1);
      }

      // Update the participants array
      updateParticipants(participants);
    }
  } else {
    showAlert?.({
      message: 'You are not allowed to remove other participants',
      type: 'danger',
      duration: 3000,
    });
  }
};
