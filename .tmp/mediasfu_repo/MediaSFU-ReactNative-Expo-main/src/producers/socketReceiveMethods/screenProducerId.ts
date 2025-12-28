import { Participant } from '../../@types/types';

export interface ScreenProducerIdOptions {
  producerId: string;
  screenId: string;
  membersReceived: boolean;
  shareScreenStarted: boolean;
  deferScreenReceived: boolean;
  participants: Participant[];
  updateScreenId: (id: string) => void;
  updateShareScreenStarted: (started: boolean) => void;
  updateDeferScreenReceived: (received: boolean) => void;
}

// Export the type definition for the function
export type ScreenProducerIdType = (options: ScreenProducerIdOptions) => void;

/**
 * Manages and updates screen sharing based on the producer ID.
 *
 * @param {ScreenProducerIdOptions} options - The configuration options.
 * @param {string} options.producerId - The producer's unique ID for screen sharing.
 * @param {string} options.screenId - The current screen ID.
 * @param {boolean} options.membersReceived - Indicates if member data has been received.
 * @param {boolean} options.shareScreenStarted - Indicates if screen sharing has started.
 * @param {boolean} options.deferScreenReceived - Indicates if screen sharing should be deferred.
 * @param {Participant[]} options.participants - List of participants.
 * @param {Function} options.updateScreenId - Function to update the screen ID.
 * @param {Function} options.updateShareScreenStarted - Function to update the screen sharing status.
 * @param {Function} options.updateDeferScreenReceived - Function to update the defer screen sharing status.
 *
 * @returns {void}
 *
 * @example
 * ```typescript
 * const options = {
 *   producerId: "abc123",
 *   screenId: "screen1",
 *   membersReceived: true,
 *   shareScreenStarted: false,
 *   deferScreenReceived: false,
 *   participants: [{ ScreenID: "screen1", ScreenOn: true }],
 *   updateScreenId: (id) => console.log("Screen ID updated to:", id),
 *   updateShareScreenStarted: (started) => console.log("Share screen started:", started),
 *   updateDeferScreenReceived: (deferred) => console.log("Defer screen received:", deferred),
 * };
 *
 * screenProducerId(options);
 * // Output:
 * // Screen ID updated to: abc123
 * // Share screen started: true
 * // Defer screen received: false
 * ```
 */

export const screenProducerId = ({
  producerId,
  screenId,
  membersReceived,
  shareScreenStarted,
  deferScreenReceived,
  participants,
  updateScreenId,
  updateShareScreenStarted,
  updateDeferScreenReceived,
}: ScreenProducerIdOptions): void => {
  // Check if members data has been received with the screenId participant in it
  const host = participants.find(
    (participant) => participant.ScreenID === screenId && participant.ScreenOn === true,
  );

  // Operations to update the UI
  if (host && membersReceived) {
    screenId = producerId;
    shareScreenStarted = true;
    deferScreenReceived = false;

    updateScreenId(screenId);
    updateShareScreenStarted(shareScreenStarted);
    updateDeferScreenReceived(deferScreenReceived);
  } else {
    deferScreenReceived = true;
    screenId = producerId;

    updateScreenId(screenId);
    updateDeferScreenReceived(deferScreenReceived);
  }
};
