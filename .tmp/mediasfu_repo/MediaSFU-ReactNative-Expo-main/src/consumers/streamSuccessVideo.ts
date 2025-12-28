import {
  Device, Producer, RtpCodecCapability, ProducerOptions
} from 'mediasoup-client/lib/types';
import { Socket } from 'socket.io-client';
import {
  ConnectSendTransportVideoParameters, Participant, ShowAlert, CreateSendTransportParameters, ReorderStreamsParameters, SleepType, 
  CreateSendTransportType, ConnectSendTransportVideoType, ReorderStreamsType, HParamsType, VParamsType,
} from '../@types/types';
import { MediaStream, MediaStreamTrack as MediaStreamTrackType  } from '../methods/utils/webrtc/webrtc';


export interface StreamSuccessVideoParameters extends CreateSendTransportParameters, ConnectSendTransportVideoParameters, ReorderStreamsParameters {
  socket: Socket;
  participants: Participant[];
  localStream: MediaStream | null;
  transportCreated: boolean;
  transportCreatedVideo: boolean;
  videoAlreadyOn: boolean;
  videoAction: boolean;
  videoParams: ProducerOptions;
  localStreamVideo: MediaStream | null;
  defVideoID: string;
  userDefaultVideoInputDevice: string;
  params: ProducerOptions;
  videoParamse?: ProducerOptions;
  islevel: string;
  member: string;
  updateMainWindow: boolean;
  lock_screen: boolean;
  shared: boolean;
  shareScreenStarted: boolean;
  vParams: VParamsType;
  hParams: HParamsType;
  allowed: boolean;
  currentFacingMode: string;
  device: Device | null;
  keepBackground: boolean;
  appliedBackground: boolean;
  videoProducer: Producer | null;


  // Update functions
  updateTransportCreatedVideo: (created: boolean) => void;
  updateVideoAlreadyOn: (videoOn: boolean) => void;
  updateVideoAction: (videoAction: boolean) => void;
  updateLocalStream: (stream: MediaStream | null) => void;
  updateLocalStreamVideo: (stream: MediaStream | null) => void;
  updateUserDefaultVideoInputDevice: (device: string) => void;
  updateCurrentFacingMode: (mode: string) => void;
  updateDefVideoID: (id: string) => void;
  updateAllowed: (allowed: boolean) => void;
  updateUpdateMainWindow: (updateMainWindow: boolean) => void;
  updateParticipants: (participants: Participant[]) => void;
  updateVideoParams: (params: ProducerOptions) => void;
  updateIsBackgroundModalVisible: (isVisible: boolean) => void;
  updateAutoClickBackground: (autoClick: boolean) => void;

  showAlert?: ShowAlert;

  // Media functions
  createSendTransport: CreateSendTransportType;
  connectSendTransportVideo: ConnectSendTransportVideoType;
  reorderStreams: ReorderStreamsType;
  sleep: SleepType;

  getUpdatedAllParams: () => StreamSuccessVideoParameters;
  [key: string]: any;
}

export interface StreamSuccessVideoOptions {
  stream: MediaStream;
  parameters: StreamSuccessVideoParameters;
}

// Export the type definition for the function
export type StreamSuccessVideoType = (options: StreamSuccessVideoOptions) => Promise<void>;

/**
 * Handles the successful streaming of video by managing the local stream, updating parameters, and handling video transport.
 *
 * @param {StreamSuccessVideoOptions} options - The options for streaming the video.
 * @param {MediaStream} options.stream - The media stream to be used for the video.
 * @param {Object} options.parameters - The parameters required for streaming the video.
 * @param {Socket} options.parameters.socket - The socket connection for communication.
 * @param {Array<Participant>} options.parameters.participants - The list of participants in the room.
 * @param {MediaStream | null} options.parameters.localStream - The local media stream.
 * @param {MediaStream | null} options.parameters.localStreamVideo - The local video stream.
 * @param {boolean} options.parameters.transportCreated - Indicates if the transport has been created.
 * @param {boolean} options.parameters.transportCreatedVideo - Indicates if the video transport has been created.
 * @param {boolean} options.parameters.videoAlreadyOn - Indicates if the video is already on.
 * @param {boolean} options.parameters.videoAction - Indicates the action state of the video.
 * @param {ProducerOptions} options.parameters.videoParams - The video parameters for the producer.
 * @param {string} options.parameters.defVideoID - The default video device ID.
 * @param {string} options.parameters.userDefaultVideoInputDevice - The user default video input device.
 * @param {string} options.parameters.hostLabel - The label of the host.
 * @param {string} options.parameters.islevel - The level of the participant.
 * @param {string} options.parameters.member - The name of the participant.
 * @param {boolean} options.parameters.updateMainWindow - Indicates if the main window should be updated.
 * @param {boolean} options.parameters.lock_screen - Indicates if the screen is locked.
 * @param {boolean} options.parameters.shared - Indicates if the screen is shared.
 * @param {boolean} options.parameters.shareScreenStarted - Indicates if screen sharing has started.
 * @param {VParamsType} options.parameters.vParams - Video parameters.
 * @param {HParamsType} options.parameters.hParams - Horizontal parameters.
 * @param {boolean} options.parameters.allowed - Indicates if the action is allowed.
 * @param {string} options.parameters.currentFacingMode - The current facing mode of the camera.
 * @param {Device | null} options.parameters.device - The device being used for streaming.
 * @param {boolean} options.parameters.keepBackground - Indicates if the background should be kept.
 * @param {boolean} options.parameters.appliedBackground - Indicates if the background has been applied.
 * @param {Producer | null} options.parameters.videoProducer - The video producer instance.
 * @param {Function} options.parameters.updateTransportCreatedVideo - Function to update the transport created state for video.
 * @param {Function} options.parameters.updateVideoAlreadyOn - Function to update the video already on state.
 * @param {Function} options.parameters.updateVideoAction - Function to update the video action state.
 * @param {Function} options.parameters.updateLocalStream - Function to update the local stream.
 * @param {Function} options.parameters.updateLocalStreamVideo - Function to update the local video stream.
 * @param {Function} options.parameters.updateUserDefaultVideoInputDevice - Function to update the user default video input device.
 * @param {Function} options.parameters.updateCurrentFacingMode - Function to update the current facing mode.
 * @param {Function} options.parameters.updateDefVideoID - Function to update the default video device ID.
 * @param {Function} options.parameters.updateAllowed - Function to update the allowed state.
 * @param {Function} options.parameters.updateUpdateMainWindow - Function to update the main window state.
 * @param {Function} options.parameters.createSendTransport - Function to create a send transport.
 * @param {Function} options.parameters.connectSendTransportVideo - Function to connect the send transport for video.
 * @param {Function} options.parameters.showAlert - Function to display alert messages to the user.
 *
 * @returns {Promise<void>} A promise that resolves when the video streaming setup is complete.
 * 
 * @throws Will throw an error if there is an issue with streaming the video.
 * 
 * @example
 * ```typescript
 * await streamSuccessVideo({
 *   stream: mediaStream,
 *   parameters: {
 *     socket,
 *     participants,
 *     localStream: null,
 *     localStreamVideo: null,
 *     transportCreated: false,
 *     transportCreatedVideo: false,
 *     videoAlreadyOn: false,
 *     videoAction: false,
 *     videoParams: producerOptions,
 *     defVideoID: "default-video-id",
 *     userDefaultVideoInputDevice: "user-device-id",
 *     hostLabel: "Host",
 *     islevel: "1",
 *     member: "Participant1",
 *     lock_screen: false,
 *     shared: false,
 *     shareScreenStarted: false,
 *     vParams,
 *     hParams,
 *     allowed: true,
 *     currentFacingMode: "user",
 *     device: mediaDevice,
 *     updateTransportCreatedVideo,
 *     updateVideoAlreadyOn,
 *     updateVideoAction,
 *     updateLocalStream,
 *     updateLocalStreamVideo,
 *     updateUserDefaultVideoInputDevice,
 *     updateCurrentFacingMode,
 *     updateDefVideoID,
 *     updateAllowed,
 *     updateUpdateMainWindow,
 *     createSendTransport,
 *     connectSendTransportVideo,
 *     showAlert,
 *   },
 * });
 * ```
 */

export const streamSuccessVideo = async ({
  stream,
  parameters,
}: StreamSuccessVideoOptions): Promise<void> => {
  const { getUpdatedAllParams } = parameters;
  parameters = getUpdatedAllParams();

  try {
    let {
      socket,
      participants,
      localStream,
      transportCreated,
      transportCreatedVideo,
      videoAlreadyOn,
      videoAction,
      videoParams,
      localStreamVideo,
      defVideoID,
      userDefaultVideoInputDevice,
      params,
      videoParamse,
      islevel,
      member,
      updateMainWindow,
      lock_screen,
      shared,
      shareScreenStarted,
      vParams,
      hParams,
      allowed,
      currentFacingMode,
      device,

      keepBackground,
      appliedBackground,
      videoProducer,


      updateTransportCreatedVideo,
      updateVideoAlreadyOn,
      updateVideoAction,
      updateLocalStream,
      updateLocalStreamVideo,
      updateUserDefaultVideoInputDevice,
      updateCurrentFacingMode,
      updateDefVideoID,
      updateAllowed,
      updateUpdateMainWindow,
      updateParticipants,
      updateVideoParams,
      updateIsBackgroundModalVisible,
      updateAutoClickBackground,

      // mediasfu functions
      createSendTransport,
      connectSendTransportVideo,
      showAlert,
      reorderStreams,
      sleep,
    } = parameters;

    localStreamVideo = stream;
    updateLocalStreamVideo(localStreamVideo);

    if (localStream == null) {
      localStream = new MediaStream([localStreamVideo.getVideoTracks()[0]]);
    } else {
      // remove all video tracks that are currently in the localStream
      localStream.getVideoTracks().forEach((track: MediaStreamTrackType) => {
        localStream!.removeTrack(track);
      });
      // add the new video track to the localStream
      localStream.addTrack(localStreamVideo.getVideoTracks()[0]);
      updateLocalStream(localStream);
    }

    const videoTracked = localStream.getVideoTracks()[0];
    defVideoID = (videoTracked.getSettings() as MediaTrackSettings).deviceId || '';
    userDefaultVideoInputDevice = defVideoID;
    currentFacingMode = (videoTracked.getSettings() as MediaTrackSettings)?.facingMode || 'user';

    if (defVideoID) {
      updateDefVideoID(defVideoID);
    }
    if (userDefaultVideoInputDevice) {
      updateUserDefaultVideoInputDevice(userDefaultVideoInputDevice);
    }
    if (currentFacingMode) {
      updateCurrentFacingMode(currentFacingMode);
    }

    allowed = true;
    updateAllowed(allowed);

    try {
      if (islevel === '2') {
        params = shared || shareScreenStarted ? vParams : hParams;
        videoParamse = { ...params };
      } else {
        params = vParams;
        videoParamse = { ...params };
      }

      const codec = device?.rtpCapabilities?.codecs?.filter(
        (codec: RtpCodecCapability) => codec.mimeType.toLowerCase() !== 'video/vp9' && codec.kind === 'video',
      ) || [];


      // if encodings is in the videoParamse object and length is not greater than 1, remove it
      // React Native does not support encodings for server-side simulcast recording
      if (videoParamse.encodings && videoParamse.encodings.length <= 1) {
        delete videoParamse.encodings;
      }

      videoParams = {
        track: localStream.getVideoTracks()[0] as any,
        ...videoParamse,
        codec: codec[0],
      };
      updateVideoParams(videoParams);

      if (keepBackground && appliedBackground) {
        videoAlreadyOn = true;
        updateVideoAlreadyOn(videoAlreadyOn);

        updateAutoClickBackground(true);
        updateIsBackgroundModalVisible(true);
        await sleep({ ms: 500 });
        updateIsBackgroundModalVisible(false);
        updateAutoClickBackground(false);
      } else if (!transportCreated) {
        try {
          await createSendTransport({
            parameters: { ...parameters, videoParams },
            option: 'video',
          });
        } catch { /* Handle error */ }
      } else {
        try {
            videoProducer!.close();
            await sleep({ ms: 500 });
        } catch { /* Handle error */ }
        await connectSendTransportVideo({
          parameters,
          videoParams,
        });
      }
    } catch (error) {
      showAlert?.({
        message: (error as Error).message,
        type: 'danger',
        duration: 3000,
      });
    }

    videoAlreadyOn = true;
    updateVideoAlreadyOn(videoAlreadyOn);

    if (videoAction === true) {
      videoAction = false;
      updateVideoAction(videoAction);
    }

    if (islevel === '2') {
      updateMainWindow = true;
      updateUpdateMainWindow(updateMainWindow);
    }

    // update the participants array to reflect the change
    participants.forEach((participant) => {
      if (participant.socketId == socket.id && participant.name == member) {
        participant.videoOn = true;
      }
    });
    updateParticipants(participants);

    transportCreatedVideo = true;
    updateTransportCreatedVideo(transportCreatedVideo);

    // reupdate the screen display
    if (lock_screen) {
      await reorderStreams({
        add: true,
        screenChanged: true,
        parameters: { ...parameters, videoAlreadyOn },
      });
    } else {
      try {
        await reorderStreams({
          add: false,
          screenChanged: true,
          parameters: { ...parameters, videoAlreadyOn },
        });
      } catch { /* Handle error */ }
    }
  } catch (error) {
    try {
      const { showAlert } = parameters;

      showAlert?.({
        message: (error as Error).message,
        type: 'danger',
        duration: 3000,
      });
    } catch { /* Handle error */ }
  }
};
