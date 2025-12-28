import { Socket } from 'socket.io-client';
import { Request, RequestResponse } from '../../@types/types';

export interface RespondToRequestsOptions {
  socket: Socket;
  request: Request;
  updateRequestList: (newRequestList: Request[]) => void;
  requestList: Request[];
  action: string;
  roomName: string;
}

// Export the type definition for the function
export type RespondToRequestsType = (options: RespondToRequestsOptions) => Promise<void>;

/**
 * Responds to incoming requests by updating the request list and emitting a response to the server.
 *
 * @param {Object} options - The options for responding to requests.
 * @param {Socket} options.socket - The socket instance used to emit the response.
 * @param {Request} options.request - The request object containing details of the request.
 * @param {Function} options.updateRequestList - The function to update the request list.
 * @param {Request[]} options.requestList - The current list of requests.
 * @param {string} options.action - The action to be taken on the request.
 * @param {string} options.roomName - The name of the room to which the response should be emitted.
 *
 * @returns {Promise<void>} A promise that resolves when the response has been emitted.
 * 
 * @example
 * ```typescript
 * respondToRequests({
 *   socket,
 *   request: { id: "123", name: "John", icon: "fa-microphone" },
 *   updateRequestList: setRequestList,
 *   requestList: currentRequests,
 *   action: "accept",
 *   roomName: "mainRoom"
 * });
 * ```
 */

export const respondToRequests = async ({
  socket,
  request,
  updateRequestList,
  requestList,
  action,
  roomName,
}: RespondToRequestsOptions): Promise<void> => {
  // Filter out the request from the request list
  const newRequestList = requestList.filter(
    (request_) => !(
      request_.id === request.id
        && request_.icon === request.icon
        && request_.name === request.name
    ),
  );

  // Update the request list with the filtered list
  updateRequestList(newRequestList);

  // Prepare the request response
  const requestResponse: RequestResponse = {
    id: request.id,
    name: request.name,
    type: request.icon,
    action,
  };

  // Emit the request response to the server
  socket.emit('updateUserofRequestStatus', { requestResponse, roomName });
};
