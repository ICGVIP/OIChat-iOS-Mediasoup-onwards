import { Socket } from 'socket.io-client';
import { ProducerOptions } from 'mediasoup-client/lib/types';
import {
  Participant, PrepopulateUserMediaParameters, ShowAlert, CreateSendTransportParameters, ConnectSendTransportAudioParameters, 
  ResumeSendTransportAudioParameters, PrepopulateUserMediaType, CreateSendTransportType, ConnectSendTransportAudioType, 
  ResumeSendTransportAudioType
} from '../@types/types';
import { MediaStream } from '../methods/utils/webrtc/webrtc';


export interface StreamSuccessAudioParameters extends CreateSendTransportParameters, ConnectSendTransportAudioParameters, ResumeSendTransportAudioParameters, PrepopulateUserMediaParameters {
  socket: Socket;
  participants: Participant[];
  localStream: MediaStream | null;
  transportCreated: boolean;
  transportCreatedAudio: boolean;
  audioAlreadyOn: boolean;
  micAction: boolean;
  audioParams: ProducerOptions;
  localStreamAudio: MediaStream | null;
  defAudioID: string;
  userDefaultAudioInputDevice: string;
  params: ProducerOptions;
  audioParamse?: ProducerOptions;
  aParams: ProducerOptions;
  hostLabel: string;
  islevel: string;
  member: string;
  updateMainWindow: boolean;
  lock_screen: boolean;
  shared: boolean;
  videoAlreadyOn: boolean;
  showAlert?: ShowAlert;

  updateParticipants: (participants: Participant[]) => void;
  updateTransportCreated: (transportCreated: boolean) => void;
  updateTransportCreatedAudio: (transportCreatedAudio: boolean) => void;
  updateAudioAlreadyOn: (audioAlreadyOn: boolean) => void;
  updateMicAction: (micAction: boolean) => void;
  updateAudioParams: (audioParams: ProducerOptions) => void;
  updateLocalStream: (localStream: MediaStream | null) => void;
  updateLocalStreamAudio: (localStreamAudio: MediaStream | null) => void;
  updateDefAudioID: (defAudioID: string) => void;
  updateUserDefaultAudioInputDevice: (userDefaultAudioInputDevice: string) => void;
  updateUpdateMainWindow: (updateMainWindow: boolean) => void;

  // mediasfu functions
  createSendTransport: CreateSendTransportType;
  connectSendTransportAudio: ConnectSendTransportAudioType;
  resumeSendTransportAudio: ResumeSendTransportAudioType;
  prepopulateUserMedia: PrepopulateUserMediaType;

  getUpdatedAllParams: () => StreamSuccessAudioParameters;
  [key: string]: any;
}

export interface StreamSuccessAudioOptions {
  stream: MediaStream;
  parameters: StreamSuccessAudioParameters;
}

// Export the type definition for the function
export type StreamSuccessAudioType = (options: StreamSuccessAudioOptions) => Promise<void>;

/**
 * Handles the successful streaming of audio by setting up the necessary transports and updating the relevant states.
 *
 * @param {StreamSuccessAudioOptions} options - The options for streaming success audio.
 * @param {MediaStream} options.stream - The media stream containing the audio track.
 * @param {Object} options.parameters - The parameters required for setting up the audio stream.
 * @param {Socket} options.parameters.socket - The socket connection for communication.
 * @param {Array<Participant>} options.parameters.participants - The list of participants.
 * @param {MediaStream | null} options.parameters.localStream - The local media stream.
 * @param {boolean} options.parameters.transportCreated - Flag indicating if the transport is created.
 * @param {boolean} options.parameters.transportCreatedAudio - Flag indicating if the audio transport is created.
 * @param {boolean} options.parameters.audioAlreadyOn - Flag indicating if the audio is already on.
 * @param {boolean} options.parameters.micAction - Flag indicating the microphone action.
 * @param {ProducerOptions} options.parameters.audioParams - The audio parameters.
 * @param {MediaStream | null} options.parameters.localStreamAudio - The local audio stream.
 * @param {string} options.parameters.defAudioID - The default audio device ID.
 * @param {string} options.parameters.userDefaultAudioInputDevice - The user default audio input device.
 * @param {ProducerOptions} options.parameters.params - Additional parameters.
 * @param {ProducerOptions} options.parameters.audioParamse - Additional audio parameters.
 * @param {ProducerOptions} options.parameters.aParams - Additional parameters for audio.
 * @param {string} options.parameters.hostLabel - The label of the host.
 * @param {string} options.parameters.islevel - The level of the user.
 * @param {string} options.parameters.member - The member name.
 * @param {boolean} options.parameters.updateMainWindow - Flag indicating if the main window should be updated.
 * @param {boolean} options.parameters.lock_screen - Flag indicating if the screen is locked.
 * @param {boolean} options.parameters.shared - Flag indicating if the screen is shared.
 * @param {boolean} options.parameters.videoAlreadyOn - Flag indicating if the video is already on.
 * @param {Function} options.parameters.showAlert - Function to show alert messages.
 * @param {Function} options.parameters.updateParticipants - Function to update participants.
 * @param {Function} options.parameters.updateTransportCreated - Function to update transport created flag.
 * @param {Function} options.parameters.updateTransportCreatedAudio - Function to update audio transport created flag.
 * @param {Function} options.parameters.updateAudioAlreadyOn - Function to update audio already on flag.
 * @param {Function} options.parameters.updateMicAction - Function to update microphone action flag.
 * @param {Function} options.parameters.updateAudioParams - Function to update audio parameters.
 * @param {Function} options.parameters.updateLocalStream - Function to update local stream.
 * @param {Function} options.parameters.updateLocalStreamAudio - Function to update local audio stream.
 * @param {Function} options.parameters.updateDefAudioID - Function to update default audio device ID.
 * @param {Function} options.parameters.updateUserDefaultAudioInputDevice - Function to update user default audio input device.
 * @param {Function} options.parameters.updateUpdateMainWindow - Function to update main window flag.
 * @param {Function} options.parameters.createSendTransport - Function to create send transport.
 * @param {Function} options.parameters.connectSendTransportAudio - Function to connect send transport audio.
 * @param {Function} options.parameters.resumeSendTransportAudio - Function to resume send transport audio.
 * @param {Function} options.parameters.prepopulateUserMedia - Function to prepopulate user media.
 *
 * @returns {Promise<void>} A promise that resolves when the audio streaming setup is complete.
 *
 * @example
 * const options = {
 *   stream: localStream, // MediaStream object containing the audio track
 *   parameters: {
 *     socket: socketInstance,
 *     participants: participantList,
 *     localStream: null,
 *     transportCreated: false,
 *     transportCreatedAudio: false,
 *     audioAlreadyOn: false,
 *     micAction: false,
 *     audioParams: {},
 *     localStreamAudio: null,
 *     defAudioID: "",
 *     userDefaultAudioInputDevice: "",
 *     params: {},
 *     audioParamse: {},
 *     aParams: {},
 *     hostLabel: "Host",
 *     islevel: "1",
 *     member: "user1",
 *     updateMainWindow: true,
 *     lock_screen: false,
 *     shared: false,
 *     videoAlreadyOn: false,
 *     showAlert: alertFunction,
 *     updateParticipants: updateParticipantsFunction,
 *     updateTransportCreated: updateTransportCreatedFunction,
 *     updateTransportCreatedAudio: updateTransportCreatedAudioFunction,
 *     updateAudioAlreadyOn: updateAudioAlreadyOnFunction,
 *     updateMicAction: updateMicActionFunction,
 *     updateAudioParams: updateAudioParamsFunction,
 *     updateLocalStream: updateLocalStreamFunction,
 *     updateLocalStreamAudio: updateLocalStreamAudioFunction,
 *     updateDefAudioID: updateDefAudioIDFunction,
 *     updateUserDefaultAudioInputDevice: updateUserDefaultAudioInputDeviceFunction,
 *     updateUpdateMainWindow: updateUpdateMainWindowFunction,
 *     createSendTransport: createSendTransportFunction,
 *     connectSendTransportAudio: connectSendTransportAudioFunction,
 *     resumeSendTransportAudio: resumeSendTransportAudioFunction,
 *     prepopulateUserMedia: prepopulateUserMediaFunction,
 *   },
 * };
 * 
 * streamSuccessAudio(options)
 *   .then(() => {
 *     console.log('Audio streaming setup successfully');
 *   })
 *   .catch(error => {
 *     console.error('Error setting up audio streaming:', error);
 *   });
 */

export const streamSuccessAudio = async ({
  stream,
  parameters,
}: StreamSuccessAudioOptions): Promise<void> => {
  let {
    socket,
    participants,
    localStream,
    transportCreated,
    transportCreatedAudio,
    audioAlreadyOn,
    micAction,
    audioParams,
    localStreamAudio,
    defAudioID,
    userDefaultAudioInputDevice,
    params,
    audioParamse,
    aParams,
    hostLabel,
    islevel,
    member,
    updateMainWindow,
    lock_screen,
    shared,
    videoAlreadyOn,
    showAlert,

    // update functions
    updateParticipants,
    updateTransportCreated,
    updateTransportCreatedAudio,
    updateAudioAlreadyOn,
    updateMicAction,
    updateAudioParams,
    updateLocalStream,
    updateLocalStreamAudio,
    updateDefAudioID,
    updateUserDefaultAudioInputDevice,
    updateUpdateMainWindow,

    // mediasfu functions
    createSendTransport,
    connectSendTransportAudio,
    resumeSendTransportAudio,
    prepopulateUserMedia,
  } = parameters;

  localStreamAudio = stream;
  updateLocalStreamAudio(localStreamAudio);

  if (localStream == null) {
    localStream =new MediaStream([localStreamAudio.getAudioTracks()[0]]);
  } else {
    localStream.addTrack(localStreamAudio.getAudioTracks()[0]);
    updateLocalStream(localStream);
  }

  const audioTracked = localStream.getAudioTracks()[0];
  defAudioID = (audioTracked.getSettings() as MediaTrackSettings).deviceId || '';
  userDefaultAudioInputDevice = defAudioID;

  updateDefAudioID(defAudioID);
  updateUserDefaultAudioInputDevice(userDefaultAudioInputDevice);

  try {
    params = aParams;
    audioParamse = { ...params };

    audioParams = {
      track: localStream.getAudioTracks()[0] as any,
      ...audioParamse,
    };
    updateAudioParams(audioParams);

    if (!transportCreated) {
      try {
        await createSendTransport({
          parameters: {
            ...parameters,
            audioParams,
          },
          option: 'audio',
        });
      } catch (error) {
        console.error('Error creating transport:', error);
      }
    } else if (!transportCreatedAudio) {
      await connectSendTransportAudio({
        audioParams,
        parameters,
      });
    } else {
      await resumeSendTransportAudio({ parameters });
    }
  } catch (error: any) {
    if (showAlert) {
      showAlert({
        message: error.message,
        type: 'danger',
        duration: 3000,
      });
    }
  }

  audioAlreadyOn = true;
  updateAudioAlreadyOn(audioAlreadyOn);

  if (micAction === true) {
    micAction = false;
    updateMicAction(micAction);
  }

  participants.forEach((participant) => {
    if (participant.socketId === socket.id && participant.name === member) {
      participant.muted = false;
    }
  });
  updateParticipants(participants);

  transportCreated = true;
  transportCreatedAudio = true;
  updateTransportCreated(transportCreated);
  updateTransportCreatedAudio(transportCreatedAudio);

  if (!videoAlreadyOn && islevel === '2') {
    if (!lock_screen && !shared) {
      updateMainWindow = true;
      updateUpdateMainWindow(updateMainWindow);
      await prepopulateUserMedia({ name: hostLabel, parameters });
      updateMainWindow = false;
      updateUpdateMainWindow(updateMainWindow);
    }
  }
};
