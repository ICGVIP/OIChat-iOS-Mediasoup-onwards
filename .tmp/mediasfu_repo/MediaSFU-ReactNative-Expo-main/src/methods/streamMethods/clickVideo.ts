import { Socket } from 'socket.io-client';
import {
  CheckPermissionType, DisconnectSendTransportVideoParameters, DisconnectSendTransportVideoType, RequestPermissionCameraType, ShowAlert, StreamSuccessVideoParameters, StreamSuccessVideoType,
  VidCons, MediaDevices, MediaStream
} from '../../@types/types';


export interface ClickVideoParameters extends DisconnectSendTransportVideoParameters, StreamSuccessVideoParameters {
  checkMediaPermission: boolean;
  hasCameraPermission: boolean;
  videoAlreadyOn: boolean;
  audioOnlyRoom: boolean;
  recordStarted: boolean;
  recordResumed: boolean;
  recordPaused: boolean;
  recordStopped: boolean;
  recordingMediaOptions: string;
  islevel: string;
  youAreCoHost: boolean;
  adminRestrictSetting: boolean;
  videoRequestState: string | null;
  videoRequestTime: number;
  member: string;
  socket: Socket;
  roomName: string;
  userDefaultVideoInputDevice: string;
  currentFacingMode: string;
  vidCons: VidCons;
  frameRate: number;
  videoAction: boolean;
  localStream: MediaStream | null;
  audioSetting: string;
  videoSetting: string;
  screenshareSetting: string;
  chatSetting: string;
  updateRequestIntervalSeconds: number;

  showAlert?: ShowAlert;
  updateVideoAlreadyOn: (value: boolean) => void;
  updateVideoRequestState: (state: string) => void;
  updateLocalStream: (stream: MediaStream | null) => void;
  mediaDevices: MediaDevices;

  streamSuccessVideo: StreamSuccessVideoType;
  disconnectSendTransportVideo: DisconnectSendTransportVideoType;
  requestPermissionCamera: RequestPermissionCameraType;
  checkPermission: CheckPermissionType;

  getUpdatedAllParams: () => ClickVideoParameters;
  [key: string]: any;

}

export interface ClickVideoOptions {
  parameters: ClickVideoParameters;
}

// Export the type definition for the function
export type ClickVideoType = (options: ClickVideoOptions) => Promise<void>;

/**
 * Handles the click event to toggle the participant's video on/off and manages video permission requests.
 *
 * @param {ClickVideoOptions} options - The function parameters.
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * clickVideo({
 *   parameters: {
 *     checkMediaPermission: true,
 *     hasCameraPermission: false,
 *     videoAlreadyOn: false,
 *     audioOnlyRoom: false,
 *     recordStarted: true,
 *     recordResumed: false,
 *     recordPaused: true,
 *     recordStopped: false,
 *     recordingMediaOptions: 'video',
 *     islevel: '1',
 *     youAreCoHost: false,
 *     adminRestrictSetting: false,
 *     videoRequestState: null,
 *     videoRequestTime: Date.now(),
 *     member: 'John Doe',
 *     socket: socketInstance,
 *     roomName: 'room123',
 *     userDefaultVideoInputDevice: 'default',
 *     currentFacingMode: 'user',
 *     vidCons: { width: 1280, height: 720 },
 *     frameRate: 30,
 *     videoAction: false,
 *     localStream: null,
 *     audioSetting: 'allow',
 *     videoSetting: 'allow',
 *     screenshareSetting: 'allow',
 *     chatSetting: 'allow',
 *     updateRequestIntervalSeconds: 60,
 *     showAlert: showAlertFunction,
 *     updateVideoAlreadyOn: setVideoAlreadyOn,
 *     updateVideoRequestState: setVideoRequestState,
 *     updateLocalStream: setLocalStream,
 *     mediaDevices: navigator.mediaDevices,
 *     streamSuccessVideo: streamSuccessVideoFunction,
 *     disconnectSendTransportVideo: disconnectVideoTransportFunction,
 *     requestPermissionCamera: requestCameraPermissionFunction,
 *     checkPermission: checkPermissionFunction,
 *     getUpdatedAllParams: getUpdatedParamsFunction
 *   }
 * });
 * ```
 */

export const clickVideo = async ({ parameters }: ClickVideoOptions): Promise<void> => {
  let {
    checkMediaPermission,
    hasCameraPermission,
    videoAlreadyOn,
    audioOnlyRoom,
    recordStarted,
    recordResumed,
    recordPaused,
    recordStopped,
    recordingMediaOptions,
    islevel,
    youAreCoHost,
    adminRestrictSetting,
    videoRequestState,
    videoRequestTime,
    member,
    socket,
    roomName,
    userDefaultVideoInputDevice,
    currentFacingMode,
    vidCons,
    frameRate,
    videoAction,
    localStream,
    audioSetting,
    videoSetting,
    screenshareSetting,
    chatSetting,
    updateRequestIntervalSeconds,
    streamSuccessVideo,
    showAlert,
    updateVideoAlreadyOn,
    updateVideoRequestState,
    updateLocalStream,
    mediaDevices,
    disconnectSendTransportVideo,
    requestPermissionCamera,
    checkPermission,
  } = parameters;

  if (audioOnlyRoom) {
    showAlert?.({
      message: 'You cannot turn on your camera in an audio-only event.',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  if (videoAlreadyOn) {
    if (islevel === '2' && (recordStarted || recordResumed)) {
      if (!(recordPaused || recordStopped)) {
        if (recordingMediaOptions === 'video') {
          showAlert?.({
            message: 'You cannot turn off your camera while recording video, please pause or stop recording first.',
            type: 'danger',
            duration: 3000,
          });
          return;
        }
      }
    }

    videoAlreadyOn = false;
    updateVideoAlreadyOn(videoAlreadyOn);
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = false;
      updateLocalStream(localStream);
    }
    await disconnectSendTransportVideo({ parameters });
  } else {
    if (adminRestrictSetting) {
      showAlert?.({
        message: 'You cannot turn on your camera. Access denied by host.',
        duration: 3000,
        type: 'danger',
      });
      return;
    }

    let response = 2;

    if (!videoAction && islevel !== '2' && !youAreCoHost) {
      response = await checkPermission({
        permissionType: 'videoSetting',
        audioSetting, videoSetting, screenshareSetting, chatSetting,
      });
    } else {
      response = 0;
    }

    if (response == 1) {
      //approval
      //check if request is pending or not
      if (videoRequestState === 'pending') {
        showAlert?.({
          message: 'A request is pending. Please wait for the host to respond.',
          type: 'danger',
          duration: 3000,
        });
        return;
      }
      // check if rejected and current time is less than videoRequestTime
      if (videoRequestState === 'rejected' && Date.now() - videoRequestTime < updateRequestIntervalSeconds) {
        showAlert?.({
          message: `A request was rejected. Please wait for ${updateRequestIntervalSeconds} seconds before sending another request.`,
          type: 'danger',
          duration: 3000,
        });
        return;
      }

      // send request to host
      showAlert?.({
        message: 'Request sent to host.',
        type: 'success',
        duration: 3000,
      });
      videoRequestState = 'pending';
      updateVideoRequestState(videoRequestState);

      const userRequest = { id: socket.id, name: member, icon: 'fa-video' };
      await socket.emit('participantRequest', { userRequest, roomName });
    } else if (response === 2) {
      //if video permission is set to deny then show alert
      showAlert?.({
        message: 'You cannot turn on your camera. Access denied by host.',
        type: 'danger',
        duration: 3000,
      });
    } else {
      //if video permission is set to allow then turn on video

      //first check if permission is granted
      if (!hasCameraPermission) {
        if (checkMediaPermission) {
          const statusCamera = await requestPermissionCamera();
          if (statusCamera !== 'granted') {
            showAlert?.({
              message: 'Allow access to your camera or check if your camera is not being used by another application.',
              type: 'danger',
              duration: 3000,
            });
            return;
          }
        }
      }

      let mediaConstraints = {};
      let altMediaConstraints = {};
      if (userDefaultVideoInputDevice) {
        if (vidCons && vidCons.width && vidCons.height) {
          mediaConstraints = {
            video: {
              deviceId: userDefaultVideoInputDevice,
              facingMode: currentFacingMode,
              ...vidCons,
              frameRate: { ideal: frameRate },
            },
            audio: false,
          };
          altMediaConstraints = {
            video: { ...vidCons, frameRate: { ideal: frameRate } },
            audio: false,
          };
        } else {
          mediaConstraints = {
            video: { ...vidCons, frameRate: { ideal: frameRate } },
            audio: false,
          };
          altMediaConstraints = {
            video: { frameRate: { ideal: frameRate } },
            audio: false,
          };
        }
      } else {
        if (vidCons && vidCons.width && vidCons.height) {
          mediaConstraints = {
            video: { ...vidCons, frameRate: { ideal: frameRate } },
            audio: false,
          };
          altMediaConstraints = {
            video: { ...vidCons, frameRate: { ideal: frameRate } },
            audio: false,
          };
        } else {
          mediaConstraints = {
            video: { frameRate: { ideal: frameRate } },
            audio: false,
          };
        }
      }

      await mediaDevices
        .getUserMedia(mediaConstraints)
        .then(async (stream) => {
          await streamSuccessVideo({ stream, parameters });
        })
        .catch(async () => {
          await mediaDevices
            .getUserMedia(altMediaConstraints)
            .then(async (stream) => {
              await streamSuccessVideo({ stream, parameters });
            })
            .catch(async () => {
              //remove frameRate from constraints
              altMediaConstraints = {
                video: { ...vidCons },
                audio: false,
              };
              await mediaDevices
                .getUserMedia(altMediaConstraints)
                .then(async (stream) => {
                  await streamSuccessVideo({ stream, parameters });
                }).catch(() => {

                  showAlert?.({
                    message:
                      'Allow access to your camera or check if your camera is not being used by another application.',
                    type: 'danger',
                    duration: 3000,
                  });

                });
            });
        });
    }
  }
};
