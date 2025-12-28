import { EventType, Message, Participant } from '../../@types/types';

export interface ReceiveMessageOptions {
  message: Message;
  messages: Message[];
  participantsAll: Participant[];
  member: string;
  eventType: EventType;
  islevel: string;
  coHost: string;
  updateMessages: (messages: Message[]) => void;
  updateShowMessagesBadge: (showBadge: boolean) => void;
}

// Export the type definition for the function
export type ReceiveMessageType = (options: ReceiveMessageOptions) => Promise<void>;

/**
 * Asynchronously processes and updates the received message.
 *
 * @param {ReceiveMessageOptions} options - The options object.
 * @param {Message} options.message - The received message object.
 * @param {Message[]} options.messages - The current array of messages.
 * @param {Participant[]} options.participantsAll - The list of all participants.
 * @param {string} options.member - The current member's name.
 * @param {EventType} options.eventType - The type of event triggering the message reception.
 * @param {string} options.islevel - The level of the current member.
 * @param {string} options.coHost - The co-host's name.
 * @param {Function} options.updateMessages - Function to update the messages array.
 * @param {Function} options.updateShowMessagesBadge - Function to update the visibility of the messages badge.
 *
 * @returns {Promise<void>} A promise that resolves when the message processing is complete.
 *
 * @example
 * ```typescript
 * const options = {
 *   message: { sender: "user1", receivers: ["user2"], message: "Hello", timestamp: Date.now(), group: false },
 *   messages: [],
 *   participantsAll: [{ name: "user1", isBanned: false }],
 *   member: "user2",
 *   eventType: "conference",
 *   islevel: "1",
 *   coHost: "user3",
 *   updateMessages: (msgs) => { console.log("Updated messages:", msgs); },
 *   updateShowMessagesBadge: (show) => { console.log("Show message badge:", show); },
 * };
 *
 * await receiveMessage(options);
 * ```
 */

export const receiveMessage = async ({
  message,
  messages,
  participantsAll,
  member,
  eventType,
  islevel,
  coHost,
  updateMessages,
  updateShowMessagesBadge,
}: ReceiveMessageOptions): Promise<void> => {
  // Add the received message to the messages array
  const {
    sender, receivers, message: content, timestamp, group,
  } = message;
  const oldMessages = messages;
  messages = [...messages, {
    sender, receivers, message: content, timestamp, group,
  }];

  // Filter out messages with banned senders
  if (eventType !== 'broadcast' && eventType !== 'chat') {
    messages = messages.filter((msg) => participantsAll.some(
      (participant) => participant.name === msg.sender && !participant.isBanned,
    ));
    updateMessages(messages);
  } else {
    messages = messages.filter((msg) => {
      const participant = participantsAll.find((p) => p.name === msg.sender);
      return !participant || !participant.isBanned;
    });
    updateMessages(messages);
  }

  // Separate group and direct messages
  const oldGroupMessages = oldMessages.filter((msg) => msg.group);
  const oldDirectMessages = oldMessages.filter((msg) => !msg.group);

  // Group messages logic
  const groupMessages = messages.filter((msg) => msg.group);

  if (eventType !== 'broadcast' && eventType !== 'chat') {
    if (oldGroupMessages.length !== groupMessages.length) {
      const newGroupMessages = groupMessages.filter(
        (msg) => !oldGroupMessages.some((oldMsg) => oldMsg.timestamp === msg.timestamp),
      );

      const newGroupMessages2 = newGroupMessages.filter(
        (msg) => msg.sender === member || msg.receivers.includes(member),
      );

      const newGroupMessages3 = newGroupMessages2.filter((msg) => msg.sender === member);

      if (newGroupMessages.length > 0 && newGroupMessages.length !== newGroupMessages3.length) {
        updateShowMessagesBadge(true);
      }
    }
  }

  // Direct messages logic
  const directMessages = messages.filter((msg) => !msg.group);

  if (eventType !== 'broadcast' && eventType !== 'chat') {
    if (oldDirectMessages.length !== directMessages.length) {
      const newDirectMessages = directMessages.filter(
        (msg) => !oldDirectMessages.some((oldMsg) => oldMsg.timestamp === msg.timestamp),
      );

      const newDirectMessages2 = newDirectMessages.filter(
        (msg) => msg.sender === member || msg.receivers.includes(member),
      );

      const newDirectMessages3 = newDirectMessages2.filter((msg) => msg.sender === member);

      if (
        (newDirectMessages.length > 0 && newDirectMessages2.length > 0)
        || (newDirectMessages.length > 0 && (islevel === '2' || coHost === member))
      ) {
        if (islevel === '2' || coHost === member) {
          if (newDirectMessages.length !== newDirectMessages3.length) {
            updateShowMessagesBadge(true);
          }
        } else if (newDirectMessages2.length > 0) {
          if (newDirectMessages.length !== newDirectMessages3.length) {
            updateShowMessagesBadge(true);
          }
        }
      }
    }
  }
};
