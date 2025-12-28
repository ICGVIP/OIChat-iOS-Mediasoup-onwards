import { Socket } from 'socket.io-client';
import {
  CheckPermissionType, CheckScreenShareParameters, CheckScreenShareType, ShowAlert, StopShareScreenParameters, StopShareScreenType,
} from '../../@types/types';

export interface ClickScreenShareParameters extends CheckScreenShareParameters, StopShareScreenParameters {
  showAlert?: ShowAlert;
  roomName: string;
  member: string;
  socket: Socket;
  islevel: string;
  youAreCoHost: boolean;
  adminRestrictSetting: boolean;
  audioSetting: string;
  videoSetting: string;
  screenshareSetting: string;
  chatSetting: string;
  screenAction: boolean;
  screenAlreadyOn: boolean;
  screenRequestState: string | null;
  screenRequestTime: number;
  audioOnlyRoom: boolean;
  updateRequestIntervalSeconds: number;
  updateScreenRequestState: (state: string | null) => void
  updateScreenAlreadyOn: (status: boolean) => void;

  // mediasfu functions
  checkPermission: CheckPermissionType;
  checkScreenShare: CheckScreenShareType;
  stopShareScreen: StopShareScreenType;

  getUpdatedAllParams: () => ClickScreenShareParameters;
  [key: string]: any;

}

export interface ClickScreenShareOptions {
  parameters: ClickScreenShareParameters;
}

// Export the type definition for the function
export type ClickScreenShareType = (options: ClickScreenShareOptions) => Promise<void>;

/**
 * Handles the action for the screen button, including starting and stopping screen sharing.
 *
 * @param {ClickScreenShareOptions} options - Options for handling the screen button action.
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * clickScreenShare({
 *   parameters: {
 *     showAlert: showAlertFunction,
 *     roomName: "room123",
 *     member: "John Doe",
 *     socket: socketInstance,
 *     islevel: "1",
 *     youAreCoHost: false,
 *     adminRestrictSetting: false,
 *     audioSetting: "allow",
 *     videoSetting: "allow",
 *     screenshareSetting: "allow",
 *     chatSetting: "allow",
 *     screenAction: false,
 *     screenAlreadyOn: false,
 *     screenRequestState: null,
 *     screenRequestTime: Date.now(),
 *     audioOnlyRoom: false,
 *     updateRequestIntervalSeconds: 60,
 *     updateScreenRequestState: setScreenRequestState,
 *     updateScreenAlreadyOn: setScreenAlreadyOn,
 *     checkPermission: checkPermissionFunction,
 *     checkScreenShare: checkScreenShareFunction,
 *     stopShareScreen: stopShareScreenFunction,
 *     getUpdatedAllParams: getUpdatedParamsFunction
 *   }
 * });
 * ```
 */

export const clickScreenShare = async ({ parameters }: ClickScreenShareOptions): Promise<void> => {
  let {
    showAlert,
    roomName,
    member,
    socket,
    islevel,
    youAreCoHost,
    adminRestrictSetting,
    audioSetting,
    videoSetting,
    screenshareSetting,
    chatSetting,
    screenAction,
    screenAlreadyOn,
    screenRequestState,
    screenRequestTime,
    audioOnlyRoom,
    updateRequestIntervalSeconds,
    updateScreenRequestState,
    updateScreenAlreadyOn,

    // mediasfu functions
    checkPermission,
    checkScreenShare,
    stopShareScreen,
  } = parameters;

  // Check if the room is audio-only
  if (audioOnlyRoom) {
    showAlert?.({
      message: 'You cannot turn on your camera in an audio-only event.',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  // Check if the room is a demo room
  if (roomName.startsWith('d')) {
    showAlert?.({
      message: 'You cannot start screen share in a demo room.',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  // Toggle screen sharing based on current status
  if (screenAlreadyOn) {
    screenAlreadyOn = false;
    updateScreenAlreadyOn(screenAlreadyOn);
    await stopShareScreen({ parameters });
  } else {
    // Check if screen sharing is restricted by the host
    if (adminRestrictSetting) {
      showAlert?.({
        message: 'You cannot start screen share. Access denied by host.',
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    let response = 2;
    // Check and turn on screen sharing
    if (!screenAction && islevel !== '2' && !youAreCoHost) {
      response = await checkPermission({
        permissionType: 'screenshareSetting',
        audioSetting,
        videoSetting,
        screenshareSetting,
        chatSetting,
      });
    } else {
      response = 0;
    }

    // Handle different responses
    switch (response) {
      case 0:
        // Allow screen sharing
        checkScreenShare({ parameters });
        break;
      case 1: {
        // Approval required
        // Check if a request is already pending
        if (screenRequestState === 'pending') {
          showAlert?.({
            message: 'A request is already pending. Please wait for the host to respond.',
            type: 'danger',
            duration: 3000,
          });
          return;
        }

        if (screenRequestState === 'rejected' && Date.now() - screenRequestTime < updateRequestIntervalSeconds) {
          showAlert?.({
            message: 'You cannot send another request at this time.',
            type: 'danger',
            duration: 3000,
          });
          return;
        }

        showAlert?.({
          message: 'Your request has been sent to the host.',
          type: 'success',
          duration: 3000,
        });

        screenRequestState = 'pending';
        updateScreenRequestState(screenRequestState);

        const userRequest = { id: socket.id, name: member, icon: 'fa-desktop' };
        socket.emit('participantRequest', { userRequest, roomName });
        break;
      }
      case 2:
        showAlert?.({
          message: 'You are not allowed to start screen share.',
          type: 'danger',
          duration: 3000,
        });
        break;
      default:
        break;
    }
  }
};
