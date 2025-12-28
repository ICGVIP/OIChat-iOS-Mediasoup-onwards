import { Socket } from 'socket.io-client';
import { Participant, CoHostResponsibility, ShowAlert } from '../../@types/types';

export interface MuteParticipantsOptions {
  socket: Socket;
  coHostResponsibility: CoHostResponsibility[];
  participant: Participant;
  member: string;
  islevel: string;
  showAlert?: ShowAlert;
  coHost: string;
  roomName: string;
}

// Export the type definition for the function
export type MuteParticipantsType = (options: MuteParticipantsOptions) => Promise<void>;

/**
 * Mutes a participant in a media session if the current member has the necessary permissions.
 *
 * @param {MuteParticipantsOptions} options - The options for muting participants.
 * @param {Socket} options.socket - The socket instance for communication.
 * @param {CoHostResponsibility[]} options.coHostResponsibility - List of co-host responsibilities.
 * @param {Participant} options.participant - The participant to be muted.
 * @param {string} options.member - The current member attempting to mute.
 * @param {string} options.islevel - The level of the current member.
 * @param {ShowAlert} [options.showAlert] - Optional function to show alerts.
 * @param {string} options.coHost - The co-host information.
 * @param {string} options.roomName - The name of the room.
 *
 * @example
 * ```typescript
 * muteParticipants({
 *   socket,
 *   coHostResponsibility: [{ name: "media", value: true }],
 *   participant: { id: "123", name: "John Doe", muted: false, islevel: "1" },
 *   member: "currentMember",
 *   islevel: "2",
 *   showAlert: (alert) => console.log(alert.message),
 *   coHost: "coHostMember",
 *   roomName: "room1",
 * });
 * ```
 */

export const muteParticipants = async ({
  socket,
  coHostResponsibility,
  participant,
  member,
  islevel,
  showAlert,
  coHost,
  roomName,
}: MuteParticipantsOptions): Promise<void> => {
  let mediaValue = false;

  try {
    mediaValue = coHostResponsibility.find((item) => item.name === 'media')?.value ?? false;
  } catch (error) {
    console.error(error);
  }

  if (islevel === '2' || (coHost === member && mediaValue)) {
    if (!participant.muted && participant.islevel !== '2') {
      const participantId = participant.id;
      socket.emit('controlMedia', {
        participantId,
        participantName: participant.name,
        type: 'all',
        roomName,
      });
    }
  } else {
    showAlert?.({
      message: 'You are not allowed to mute other participants',
      type: 'danger',
      duration: 3000,
    });
  }
};
