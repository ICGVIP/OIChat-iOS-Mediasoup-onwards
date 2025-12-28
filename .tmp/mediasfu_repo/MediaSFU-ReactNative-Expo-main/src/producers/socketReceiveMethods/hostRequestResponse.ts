import { ShowAlert, Request, RequestResponse } from '../../@types/types';

export interface HostRequestResponseOptions {
  requestResponse: RequestResponse;

  showAlert?: ShowAlert;
  requestList: Request[];
  updateRequestList: (requestList: Request[]) => void;
  updateMicAction: (action: boolean) => void;
  updateVideoAction: (action: boolean) => void;
  updateScreenAction: (action: boolean) => void;
  updateChatAction: (action: boolean) => void;
  updateAudioRequestState: (state: string | null) => void;
  updateVideoRequestState: (state: string | null) => void;
  updateScreenRequestState: (state: string | null) => void;
  updateChatRequestState: (state: string | null) => void;
  updateAudioRequestTime: (time: number) => void;
  updateVideoRequestTime: (time: number) => void;
  updateScreenRequestTime: (time: number) => void;
  updateChatRequestTime: (time: number) => void;
  updateRequestIntervalSeconds: number;
}

// Export the type definition for the function
export type HostRequestResponseType = (options: HostRequestResponseOptions) => Promise<void>;

/**
 * Handles a host's response to a participant request, updating the request list and performing actions based on the response.
 *
 * @param {HostRequestResponseOptions} options - The options for handling the host's response to the participant request.
 * @param {RequestResponse} options.requestResponse - The host's response to the request.
 * @param {Function} [options.showAlert] - Optional function to show alerts.
 * @param {Request[]} options.requestList - The current list of participant requests.
 * @param {Function} options.updateRequestList - Function to update the request list.
 * @param {Function} options.updateMicAction - Function to update the microphone action state.
 * @param {Function} options.updateVideoAction - Function to update the video action state.
 * @param {Function} options.updateScreenAction - Function to update the screen action state.
 * @param {Function} options.updateChatAction - Function to update the chat action state.
 * @param {Function} options.updateAudioRequestState - Function to update the audio request state.
 * @param {Function} options.updateVideoRequestState - Function to update the video request state.
 * @param {Function} options.updateScreenRequestState - Function to update the screen request state.
 * @param {Function} options.updateChatRequestState - Function to update the chat request state.
 * @param {Function} options.updateAudioRequestTime - Function to set a cooldown for new audio requests.
 * @param {Function} options.updateVideoRequestTime - Function to set a cooldown for new video requests.
 * @param {Function} options.updateScreenRequestTime - Function to set a cooldown for new screenshare requests.
 * @param {Function} options.updateChatRequestTime - Function to set a cooldown for new chat requests.
 * @param {number} options.updateRequestIntervalSeconds - The interval in seconds to wait before allowing another request of the same type.
 *
 * @returns {Promise<void>} A promise that resolves when the host's response has been processed.
 *
 * @example
 * ```typescript
 * await hostRequestResponse({
 *   requestResponse: { id: "req123", type: "fa-video", action: "accepted" },
 *   showAlert: (alertOptions) => console.log(alertOptions.message),
 *   requestList: [{ id: "req123", icon: "fa-video", name: "Video Request" }],
 *   updateRequestList: (list) => console.log("Updated request list", list),
 *   updateMicAction: (state) => console.log("Mic action:", state),
 *   updateVideoAction: (state) => console.log("Video action:", state),
 *   updateScreenAction: (state) => console.log("Screen action:", state),
 *   updateChatAction: (state) => console.log("Chat action:", state),
 *   updateAudioRequestState: (state) => console.log("Audio request state:", state),
 *   updateVideoRequestState: (state) => console.log("Video request state:", state),
 *   updateScreenRequestState: (state) => console.log("Screen request state:", state),
 *   updateChatRequestState: (state) => console.log("Chat request state:", state),
 *   updateAudioRequestTime: (time) => console.log("Audio request cooldown:", time),
 *   updateVideoRequestTime: (time) => console.log("Video request cooldown:", time),
 *   updateScreenRequestTime: (time) => console.log("Screenshare request cooldown:", time),
 *   updateChatRequestTime: (time) => console.log("Chat request cooldown:", time),
 *   updateRequestIntervalSeconds: 30,
 * });
 * ```
 */

export const hostRequestResponse = async ({
  requestResponse,
  showAlert,
  requestList,
  updateRequestList,
  updateMicAction,
  updateVideoAction,
  updateScreenAction,
  updateChatAction,
  updateAudioRequestState,
  updateVideoRequestState,
  updateScreenRequestState,
  updateChatRequestState,
  updateAudioRequestTime,
  updateVideoRequestTime,
  updateScreenRequestTime,
  updateChatRequestTime,
  updateRequestIntervalSeconds,
}: HostRequestResponseOptions): Promise<void> => {
  // Filter out the request from the list
  const filteredRequests = requestList.filter(
    (request) => request.id !== requestResponse.id
      && request.icon !== requestResponse.type
      && request.name !== requestResponse.name
      && request.username !== requestResponse.username,
  );
  updateRequestList(filteredRequests);

  const requestType = requestResponse.type;

  // Handle accepted actions
  if (requestResponse.action === 'accepted') {
    switch (requestType) {
      case 'fa-microphone':
        showAlert?.({
          message: 'Unmute request was accepted; click the mic button again to begin.',
          type: 'success',
          duration: 10000,
        });
        updateMicAction(true);
        updateAudioRequestState('accepted');
        break;
      case 'fa-video':
        showAlert?.({
          message: 'Video request was accepted; click the video button again to begin.',
          type: 'success',
          duration: 10000,
        });
        updateVideoAction(true);
        updateVideoRequestState('accepted');
        break;
      case 'fa-desktop':
        showAlert?.({
          message: 'Screenshare request was accepted; click the screen button again to begin.',
          type: 'success',
          duration: 10000,
        });
        updateScreenAction(true);
        updateScreenRequestState('accepted');
        break;
      case 'fa-comments':
        showAlert?.({
          message: 'Chat request was accepted; click the chat button again to begin.',
          type: 'success',
          duration: 10000,
        });
        updateChatAction(true);
        updateChatRequestState('accepted');
        break;
    }
  } else {
    // Handle rejected actions
    let timerDate: Date;
    switch (requestType) {
      case 'fa-microphone':
        showAlert?.({
          message: 'Unmute request was not accepted',
          type: 'danger',
          duration: 10000,
        });
        updateAudioRequestState('rejected');
        timerDate = new Date();
        timerDate.setSeconds(timerDate.getSeconds() + updateRequestIntervalSeconds);
        updateAudioRequestTime(timerDate.getTime());
        break;
      case 'fa-video':
        showAlert?.({
          message: 'Video request was not accepted',
          type: 'danger',
          duration: 10000,
        });
        updateVideoRequestState('rejected');
        timerDate = new Date();
        timerDate.setSeconds(timerDate.getSeconds() + updateRequestIntervalSeconds);
        updateVideoRequestTime(timerDate.getTime());
        break;
      case 'fa-desktop':
        showAlert?.({
          message: 'Screenshare request was not accepted',
          type: 'danger',
          duration: 10000,
        });
        updateScreenRequestState('rejected');
        timerDate = new Date();
        timerDate.setSeconds(timerDate.getSeconds() + updateRequestIntervalSeconds);
        updateScreenRequestTime(timerDate.getTime());
        break;
      case 'fa-comments':
        showAlert?.({
          message: 'Chat request was not accepted',
          type: 'danger',
          duration: 10000,
        });
        updateChatRequestState('rejected');
        timerDate = new Date();
        timerDate.setSeconds(timerDate.getSeconds() + updateRequestIntervalSeconds);
        updateChatRequestTime(timerDate.getTime());
        break;
    }
  }
};
