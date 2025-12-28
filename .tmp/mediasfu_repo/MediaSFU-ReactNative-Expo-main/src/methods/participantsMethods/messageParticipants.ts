import { Participant, CoHostResponsibility, ShowAlert } from '../../@types/types';

export interface MessageParticipantsOptions {
  coHostResponsibility: CoHostResponsibility[];
  participant: Participant;
  member: string;
  islevel: string;
  showAlert?: ShowAlert;
  coHost: string;
  updateIsMessagesModalVisible: (isVisible: boolean) => void;
  updateDirectMessageDetails: (participant: Participant | null) => void;
  updateStartDirectMessage: (start: boolean) => void;
}

// Export the type definition for the function
export type MessageParticipantsType = (options: MessageParticipantsOptions) => void;

/**
 * Sends a direct message to a participant if the current member has the necessary permissions.
 *
 * @param {MessageParticipantsOptions} options - The options for messaging participants.
 * @param {CoHostResponsibility[]} options.coHostResponsibility - Array of responsibilities assigned to the co-host.
 * @param {Participant} options.participant - The participant to whom the message is to be sent.
 * @param {string} options.member - The current member attempting to send the message.
 * @param {string} options.islevel - The level of the current member.
 * @param {ShowAlert} [options.showAlert] - Function to show an alert message.
 * @param {string} options.coHost - The co-host member.
 * @param {Function} options.updateIsMessagesModalVisible - Function to update the visibility of the messages modal.
 * @param {Function} options.updateDirectMessageDetails - Function to update the details of the direct message.
 * @param {Function} options.updateStartDirectMessage - Function to start the direct message.
 *
 * @example
 * ```typescript
 * messageParticipants({
 *   coHostResponsibility: [{ name: "chat", value: true }],
 *   participant: { name: "John Doe", islevel: "1" },
 *   member: "currentMember",
 *   islevel: "2",
 *   showAlert: (alert) => console.log(alert.message),
 *   coHost: "coHostMember",
 *   updateIsMessagesModalVisible: (isVisible) => setMessagesModalVisible(isVisible),
 *   updateDirectMessageDetails: (participant) => setDirectMessageDetails(participant),
 *   updateStartDirectMessage: (start) => setStartDirectMessage(start),
 * });
 * ```
 */

export const messageParticipants = ({

  coHostResponsibility,
  participant,
  member,
  islevel,
  showAlert,
  coHost,
  updateIsMessagesModalVisible,
  updateDirectMessageDetails,
  updateStartDirectMessage,
}: MessageParticipantsOptions): void => {
  let chatValue = false;

  try {
    chatValue = coHostResponsibility.find((item) => item.name === 'chat')?.value ?? false;
  } catch (error) {
    console.error(error);
  }

  if (islevel === '2' || (coHost === member && chatValue === true)) {
    if (participant.islevel !== '2') {
      updateDirectMessageDetails(participant);
      updateStartDirectMessage(true);
      updateIsMessagesModalVisible(true);
    }
  } else {
    showAlert?.({
      message: 'You are not allowed to send this message',
      type: 'danger',
      duration: 3000,
    });
  }
};
