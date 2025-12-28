import { Request, WaitingRoomParticipant } from '../../@types/types';

export interface ParticipantRequestedOptions {
  userRequest: Request;

  requestList: Request[];
  waitingRoomList: WaitingRoomParticipant[];
  updateTotalReqWait: (count: number) => void;
  updateRequestList: (list: Request[]) => void;
}

// Export the type definition for the function
export type ParticipantRequestedType = (options: ParticipantRequestedOptions) => Promise<void>;

/**
 * Handles a participant's request by adding it to the request list and updating the total count of requests and waiting room participants.
 *
 * @param {ParticipantRequestedOptions} options - The options for handling the participant's request.
 * @param {Request} options.userRequest - The user request to be added to the request list.
 * @param {Request[]} options.requestList - The current list of user requests.
 * @param {WaitingRoomParticipant[]} options.waitingRoomList - The current list of participants in the waiting room.
 * @param {Function} options.updateTotalReqWait - Function to update the total count of requests and waiting room participants.
 * @param {Function} options.updateRequestList - Function to update the request list.
 * @returns {Promise<void>} A promise that resolves when the participant's request has been handled.
 *
 * @example
 * ```typescript
 * const options = {
 *   userRequest: { id: "user123", reason: "join" },
 *   requestList: [{ id: "user1", reason: "help" }],
 *   waitingRoomList: [{ id: "user2", name: "Alice" }],
 *   updateTotalReqWait: (count) => console.log("Total requests:", count),
 *   updateRequestList: (list) => console.log("Updated request list:", list),
 * };
 *
 * await participantRequested(options);
 * // Output:
 * // "Updated request list: [{ id: 'user1', reason: 'help' }, { id: 'user123', reason: 'join' }]"
 * // "Total requests: 3"
 * ```
 */

export const participantRequested = async ({
  userRequest,
  requestList,
  waitingRoomList,
  updateTotalReqWait,
  updateRequestList,
}: ParticipantRequestedOptions): Promise<void> => {
  // Add the user request to the request list
  const updatedRequestList = [...requestList, userRequest];
  updateRequestList(updatedRequestList);

  // Update the total count of requests and waiting room participants
  const reqCount = updatedRequestList.length + waitingRoomList.length;
  updateTotalReqWait(reqCount);
};
