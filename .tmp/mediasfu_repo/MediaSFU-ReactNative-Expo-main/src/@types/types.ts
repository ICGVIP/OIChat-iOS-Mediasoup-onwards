import { Socket } from 'socket.io-client';
import React from 'react';

import {
  Consumer, DtlsParameters, IceCandidate, IceParameters, RtpCapabilities
} from 'mediasoup-client/lib/types';
import { mediaDevices, MediaStreamTrack as MediaStreamTrackType, MediaStream as NativeMediaStream  } from '../methods/utils/webrtc/webrtc';




// //consumers/socketReceiveMethods
export * from '../consumers/socketReceiveMethods/joinConsumeRoom';
export * from '../consumers/socketReceiveMethods/producerClosed';
export * from '../consumers/socketReceiveMethods/newPipeProducer';

// consumers
export * from '../consumers/addVideosGrid';
export * from '../consumers/autoAdjust';
export * from '../consumers/calculateRowsAndColumns';
export * from '../consumers/changeVids';
export * from '../consumers/checkGrid';
export * from '../consumers/checkPermission';
export * from '../consumers/checkScreenShare';
export * from '../consumers/closeAndResize';
export * from '../consumers/compareActiveNames';
export * from '../consumers/compareScreenStates';
export * from '../consumers/connectIps';
export * from '../consumers/connectLocalIps';
export * from '../consumers/connectRecvTransport';
export * from '../consumers/connectSendTransport';
export * from '../consumers/connectSendTransportAudio';
export * from '../consumers/connectSendTransportScreen';
export * from '../consumers/connectSendTransportVideo';
export * from '../consumers/consumerResume';
export * from '../consumers/controlMedia';
export * from '../consumers/createSendTransport';
export * from '../consumers/disconnectSendTransportAudio';
export * from '../consumers/disconnectSendTransportVideo';
export * from '../consumers/disconnectSendTransportScreen';
export * from '../consumers/dispStreams';
export * from '../consumers/generatePageContent';
export * from '../consumers/getEstimate';
export * from '../consumers/getPipedProducersAlt';
export * from '../consumers/getProducersPiped';
export * from '../consumers/getVideos';
export * from '../consumers/mixStreams';
export * from '../consumers/onScreenChanges';
export * from '../consumers/prepopulateUserMedia';
export * from '../consumers/processConsumerTransports';
export * from '../consumers/processConsumerTransportsAudio';
export * from '../consumers/readjust';
export * from '../consumers/receiveAllPipedTransports';
export * from '../consumers/reorderStreams';
export * from '../consumers/rePort';
export * from '../consumers/requestScreenShare';
export * from '../consumers/resumePauseAudioStreams';
export * from '../consumers/resumePauseStreams';
export * from '../consumers/resumeSendTransportAudio';
export * from '../consumers/reUpdateInter';
export * from '../consumers/signalNewConsumerTransport';
export * from '../consumers/startShareScreen';
export * from '../consumers/stopShareScreen';
export * from '../consumers/streamSuccessAudio';
export * from '../consumers/streamSuccessAudioSwitch';
export * from '../consumers/streamSuccessScreen';
export * from '../consumers/streamSuccessVideo';
export * from '../consumers/switchUserAudio';
export * from '../consumers/switchUserVideo';
export * from '../consumers/switchUserVideoAlt';
export * from '../consumers/trigger';
export * from '../consumers/updateMiniCardsGrid';
export * from '../consumers/updateParticipantAudioDecibels';

// Utils
export * from '../methods/utils/producer/aParams';
export * from '../methods/utils/producer/hParams';
export * from '../methods/utils/producer/screenParams';
export * from '../methods/utils/producer/vParams';
export * from '../methods/utils/joinRoomOnMediaSFU';
export * from '../methods/utils/meetingTimer/startMeetingProgressTimer';
export * from '../methods/utils/MiniAudioPlayer/MiniAudioPlayer';
export * from '../methods/utils/formatNumber';
export * from '../methods/utils/generateRandomMessages';
export * from '../methods/utils/generateRandomParticipants';
export * from '../methods/utils/generateRandomPolls';
export * from '../methods/utils/generateRandomRequestList';
export * from '../methods/utils/generateRandomWaitingRoomList';
export * from '../methods/utils/getModalPosition';
export * from '../methods/utils/getOverlayPosition';
export * from '../methods/utils/sleep';
export * from '../methods/utils/validateAlphanumeric';

// Background Methods
export * from '../methods/backgroundMethods/launchBackground';

// Breakout Rooms Methods
export * from '../methods/breakoutRoomsMethods/launchBreakoutRooms';
export * from '../methods/breakoutRoomsMethods/breakoutRoomUpdated';

// Co-Host Methods
export * from '../methods/coHostMethods/launchCoHost';
export * from '../methods/coHostMethods/modifyCoHostSettings';

// Display Settings Methods
export * from '../methods/displaySettingsMethods/launchDisplaySettings';
export * from '../methods/displaySettingsMethods/modifyDisplaySettings';

// Exit Methods
export * from '../methods/exitMethods/launchConfirmExit';
export * from '../methods/exitMethods/confirmExit';

// Media Settings Methods
export * from '../methods/mediaSettingsMethods/launchMediaSettings';

// Menu Methods
export * from '../methods/menuMethods/launchMenuModal';

// Message Methods
export * from '../methods/messageMethods/launchMessages';
export * from '../methods/messageMethods/sendMessage';

// Participants Methods
export * from '../methods/participantsMethods/launchParticipants';
export * from '../methods/participantsMethods/messageParticipants';
export * from '../methods/participantsMethods/muteParticipants';
export * from '../methods/participantsMethods/removeParticipants';

// Polls Methods
export * from '../methods/pollsMethods/handleCreatePoll';
export * from '../methods/pollsMethods/handleEndPoll';
export * from '../methods/pollsMethods/handleVotePoll';
export * from '../methods/pollsMethods/launchPoll';
export * from '../methods/pollsMethods/pollUpdated';

// Recording Methods
export * from '../methods/recordingMethods/checkPauseState';
export * from '../methods/recordingMethods/checkResumeState';
export * from '../methods/recordingMethods/confirmRecording';
export * from '../methods/recordingMethods/launchRecording';
export * from '../methods/recordingMethods/recordPauseTimer';
export * from '../methods/recordingMethods/recordResumeTimer';
export * from '../methods/recordingMethods/recordStartTimer';
export * from '../methods/recordingMethods/recordUpdateTimer';
export * from '../methods/recordingMethods/startRecording';
export * from '../methods/recordingMethods/stopRecording';
export * from '../methods/recordingMethods/updateRecording';

// Requests Methods
export * from '../methods/requestsMethods/launchRequests';
export * from '../methods/requestsMethods/respondToRequests';

// Settings Methods
export * from '../methods/settingsMethods/launchSettings';
export * from '../methods/settingsMethods/modifySettings';

// Stream Methods
export * from '../methods/streamMethods/clickAudio';
export * from '../methods/streamMethods/clickChat';
export * from '../methods/streamMethods/clickScreenShare';
export * from '../methods/streamMethods/clickVideo';
export * from '../methods/streamMethods/switchAudio';
export * from '../methods/streamMethods/switchVideo';
export * from '../methods/streamMethods/switchVideoAlt';

export * from '../methods/utils/meetingTimer/startMeetingProgressTimer';
export * from '../methods/utils/MiniAudioPlayer/MiniAudioPlayer';
export * from '../methods/utils/formatNumber';
export * from '../methods/utils/generateRandomMessages';
export * from '../methods/utils/generateRandomParticipants';
export * from '../methods/utils/generateRandomPolls';
export * from '../methods/utils/generateRandomRequestList';
export * from '../methods/utils/generateRandomWaitingRoomList';
export * from '../methods/utils/getModalPosition';
export * from '../methods/utils/getOverlayPosition';
export * from '../methods/utils/sleep';
export * from '../methods/utils/validateAlphanumeric';

export * from '../methods/waitingMethods/launchWaiting';
export * from '../methods/waitingMethods/respondToWaiting';
export * from '../methods/whiteboardMethods/launchConfigureWhiteboard';
export * from '../methods/whiteboardMethods/captureCanvasStream';


// Producer Client Emits
export * from '../ProducerClient/producerClientEmits/createDeviceClient';
export * from '../ProducerClient/producerClientEmits/joinRoomClient';
export * from '../ProducerClient/producerClientEmits/updateRoomParametersClient';

// Producers Emits
export * from '../producers/producerEmits/joinConRoom';
export * from '../producers/producerEmits/joinRoom';
export * from '../producers/producerEmits/joinLocalRoom';

// Socket Receive Methods
export * from '../producers/socketReceiveMethods/allMembers';
export * from '../producers/socketReceiveMethods/allMembersRest';
export * from '../producers/socketReceiveMethods/allWaitingRoomMembers';
export * from '../producers/socketReceiveMethods/banParticipant';
export * from '../producers/socketReceiveMethods/controlMediaHost';
export * from '../producers/socketReceiveMethods/disconnect';
export * from '../producers/socketReceiveMethods/disconnectUserSelf';
export * from '../producers/socketReceiveMethods/getDomains';
export * from '../producers/socketReceiveMethods/hostRequestResponse';
export * from '../producers/socketReceiveMethods/meetingEnded';
export * from '../producers/socketReceiveMethods/meetingStillThere';
export * from '../producers/socketReceiveMethods/meetingTimeRemaining';
export * from '../producers/socketReceiveMethods/participantRequested';
export * from '../producers/socketReceiveMethods/personJoined';
export * from '../producers/socketReceiveMethods/producerMediaClosed';
export * from '../producers/socketReceiveMethods/producerMediaPaused';
export * from '../producers/socketReceiveMethods/producerMediaResumed';
export * from '../producers/socketReceiveMethods/reInitiateRecording';
export * from '../producers/socketReceiveMethods/receiveMessage';
export * from '../producers/socketReceiveMethods/recordingNotice';
export * from '../producers/socketReceiveMethods/roomRecordParams';
export * from '../producers/socketReceiveMethods/screenProducerId';
export * from '../producers/socketReceiveMethods/startRecords';
export * from '../producers/socketReceiveMethods/stoppedRecording';
export * from '../producers/socketReceiveMethods/timeLeftRecording';
export * from '../producers/socketReceiveMethods/updateConsumingDomains';
export * from '../producers/socketReceiveMethods/updateMediaSettings';
export * from '../producers/socketReceiveMethods/updatedCoHost';
export * from '../producers/socketReceiveMethods/userWaiting';
export * from '../sockets/SocketManager';

// Components
// export * from '../components/backgroundComponents/BackgroundModal';
export * from '../components/breakoutComponents/BreakoutRoomsModal';
export * from '../components/coHostComponents/CoHostModal';
export * from '../components/displayComponents/AlertComponent';
export * from '../components/displayComponents/AudioCard';
export * from '../components/displayComponents/AudioGrid';
export * from '../components/displayComponents/CardVideoDisplay';
export * from '../components/displayComponents/ControlButtonsComponent';
export * from '../components/displayComponents/ControlButtonsAltComponent';
export * from '../components/displayComponents/ControlButtonsComponentTouch';
export * from '../components/displayComponents/FlexibleGrid';
export * from '../components/displayComponents/FlexibleVideo';
export * from '../components/displayComponents/LoadingModal';
export * from '../components/displayComponents/MainAspectComponent';
export * from '../components/displayComponents/MainContainerComponent';
export * from '../components/displayComponents/MainGridComponent';
export * from '../components/displayComponents/MainScreenComponent';
export * from '../components/displayComponents/MeetingProgressTimer';
export * from '../components/displayComponents/MiniAudio';
export * from '../components/displayComponents/MiniCard';
export * from '../components/displayComponents/MiniCardAudio';
export * from '../components/displayComponents/OtherGridComponent';
export * from '../components/displayComponents/Pagination';
export * from '../components/displayComponents/SubAspectComponent';
export * from '../components/displayComponents/VideoCard';
export * from '../components/displaySettingsComponents/DisplaySettingsModal';
export * from '../components/eventSettingsComponents/EventSettingsModal';
export * from '../components/exitComponents/ConfirmExitModal';
export * from '../components/mediaSettingsComponents/MediaSettingsModal';
export * from '../components/menuComponents/MenuModal';
export * from '../components/messageComponents/MessagesModal';
export * from '../components/miscComponents/ConfirmHereModal';
export * from '../components/miscComponents/PreJoinPage';
export * from '../components/miscComponents/ShareEventModal';
export * from '../components/miscComponents/WelcomePage';
export * from '../components/participantsComponents/ParticipantsModal';
export * from '../components/pollsComponents/PollModal';
export * from '../components/recordingComponents/RecordingModal';
export * from '../components/requestsComponents/RequestsModal';
//export * from '../components/screenboardComponents/Screenboard';
//export * from '../components/screenboardComponents/ScreenboardModal';
export * from '../components/waitingComponents/WaitingModal';
//export * from '../components/whiteboardComponents/ConfigureWhiteboardModal';
//export * from '../components/whiteboardComponents/Whiteboard';
export * from '../components/menuComponents/CustomButtons';

// React Native Exclusive
export type Shape = any;
export type SelfieSegmentation = any;
export type MediaDevices = typeof mediaDevices;
export type MediaStream = NativeMediaStream;
export type MediaStreamTrack = MediaStreamTrackType;


export interface Participant {
    id?: string;
    audioID: string;
    videoID: string;
    ScreenID?: string;
    ScreenOn?: boolean;
    islevel?: string;
    isAdmin?: boolean;
    isHost?: boolean; // for Community Edition
    name: string;
    muted?: boolean;
    isBanned?: boolean;
    isSuspended?: boolean; useBoard?: boolean;
    breakRoom?: number | null;
    [key: string]: any;
  }

export interface Stream {
    producerId: string;
    muted?: boolean;
    stream?: MediaStream;
    socket_?: Socket;
    name?: string;
    [key: string]: any;
}

export interface Request {
  id: string;
  icon: string;
  name?: string;
  username?: string;
  [key: string]: any;
}

export interface RequestResponse {
  id: string;
  icon?: string;
  name?: string;
  username?: string;
  action?: string;
  type?: string;
  [key: string]: any;
}

export interface Transport {
  producerId: string;
  consumer: Consumer;
  socket_: Socket;
  serverConsumerTransportId: string;
  [key: string]: any;
}

export interface ScreenState {
    mainScreenPerson?: string;
    mainScreenProducerId?: string;
    mainScreenFilled: boolean;
    adminOnMainScreen: boolean;
}

export interface GridSizes {
  gridWidth?: number;
  gridHeight?: number;
  altGridWidth?: number;
  altGridHeight?: number;
}

export interface ComponentSizes {
  mainWidth: number;
  mainHeight: number;
  otherWidth: number;
  otherHeight: number;
}

export interface AudioDecibels {
  name: string;
  averageLoudness: number
}

export type ShowAlert = (options: { message: string; type: 'success' | 'danger'; duration?: number }) =>  void;

export interface CoHostResponsibility {
  name: string;
  value: boolean;
  dedicated: boolean;
}

export interface VidCons {
  width: number | { ideal?: number, max?: number, min?: number };
  height: number | { ideal?: number, max?: number, min?: number };
}

export type Settings = [string, string, string, string];

export interface Message {
  sender: string;
  receivers: string[];
  message: string;
  timestamp: string;
  group: boolean;
}

export type MainSpecs = {
  mediaOptions: string;
  audioOptions: string;
  videoOptions: string;
  videoType: string;
  videoOptimized: boolean;
  recordingDisplayType: 'video' | 'media' | 'all';
  addHLS: boolean;
};

export type DispSpecs = {
  nameTags: boolean;
  backgroundColor: string;
  nameTagsColor: string;
  orientationVideo: string;
};

export type TextSpecs = {
  addText: boolean;
  customText?: string;
  customTextPosition?: string;
  customTextColor?: string;
};

export interface UserRecordingParams {
  mainSpecs: MainSpecs;
  dispSpecs: DispSpecs;
  textSpecs?: TextSpecs;
}

export type AltDomains = {
  [key: string]: string;
};

export type RequestPermissionAudioType = () => Promise<string>;
export type RequestPermissionCameraType = () => Promise<string>;

export type ControlsPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export type InfoPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface Poll {
  id: string;
  question: string;
  type: string;
  options: string[];
  votes: number[];
  status: string;
  voters?: Record<string, number>;
  [key: string]: any;
}

export interface WaitingRoomParticipant {
  name: string;
  id: string;
}

export interface ModalPositionStyle {
  justifyContent: string;
  alignItems: string;
}

export interface OverlayPositionStyle {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export type EventType = 'conference' | 'webinar' | 'chat' | 'broadcast' | 'none';

export interface PollUpdatedData {
  polls?: Poll[];
  poll: Poll;
  status: string;
}

export interface BreakoutParticipant {
  name: string;
  breakRoom?: number | null;
}

export interface BreakoutRoomUpdatedData {
  forHost?: boolean;
  newRoom?: number;
  members?: Participant[];
  breakoutRooms?: BreakoutParticipant[][];
  status?: string;
}

export interface ConsumeSocket {
  [ip: string]: Socket;
}

export interface WhiteboardUser {
  name: string;
  useBoard: boolean;
}

export interface ShapePayload {
  type: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  thickness: number;
  lineType: string;
  [key: string]: any;
}

export interface Shapes {
  action: string;
  payload: ShapePayload;
}
export interface WhiteboardData {
  shapes: Shapes[];
  redoStack: Shapes[];
  undoStack: Shapes[];
  useImageBackground: boolean;
}

export type SeedData = {
  member?: string;
  host?: string;
  eventType?: EventType;
  participants?: Participant[];
  messages?: Message[];
  polls?: Poll[];
  breakoutRooms?: BreakoutParticipant[][];
  requests?: Request[];
  waitingList?: WaitingRoomParticipant[];
  whiteboardUsers?: WhiteboardUser[];
};

export interface MeetingRoomParams {
  itemPageLimit: number; // Limit for items per page
  mediaType: 'audio' | 'video'; // Type of media, could be audio or video
  addCoHost: boolean; // Whether co-hosts can be added
  targetOrientation: 'landscape' | 'neutral' | 'portrait'; // Target orientation, landscape, neutral, or portrait
  targetOrientationHost: 'landscape' | 'neutral' | 'portrait'; // Host's target orientation, landscape, neutral, or portrait
  targetResolution: 'qhd'| 'fhd' | 'hd' | 'sd' | 'QnHD'; // Target resolution for participants
  targetResolutionHost: 'qhd'| 'fhd' | 'hd' | 'sd' | 'QnHD'; // Target resolution for host
  type: EventType; // Room type: chat, conference, webinar, or broadcast
  audioSetting: 'allow' | 'approval' | 'disallow'; // Audio setting: allow, approval, or disallow
  videoSetting: 'allow' | 'approval' | 'disallow'; // Video setting: allow, approval, or disallow
  screenshareSetting: 'allow' | 'approval' | 'disallow'; // Screenshare setting: allow, approval, or disallow
  chatSetting: 'allow' | 'disallow'; // Chat setting: allow or disallow
}

export interface RecordingParams {
  recordingAudioPausesLimit: number; // Limit on audio recording pauses
  recordingAudioSupport: boolean; // Whether audio recording is supported
  recordingAudioPeopleLimit: number; // Maximum number of people for audio recording
  recordingAudioParticipantsTimeLimit: number; // Time limit for audio participants in recording

  recordingVideoPausesLimit: number; // Limit on video recording pauses
  recordingVideoSupport: boolean; // Whether video recording is supported
  recordingVideoPeopleLimit: number; // Maximum number of people for video recording
  recordingVideoParticipantsTimeLimit: number; // Time limit for video participants in recording

  recordingAllParticipantsSupport: boolean; // Whether recording all participants is supported
  recordingVideoParticipantsSupport: boolean; // Whether video recording for participants is supported
  recordingAllParticipantsFullRoomSupport: boolean; // Support for recording the entire room for all participants
  recordingVideoParticipantsFullRoomSupport: boolean; // Support for recording the full room for video participants

  recordingPreferredOrientation: 'landscape' | 'portrait'; // Preferred recording orientation
  recordingSupportForOtherOrientation: boolean; // Support for orientations other than the preferred one
  recordingMultiFormatsSupport: boolean; // Support for multiple recording formats
  recordingHLSSupport: boolean; // Whether HLS recording is supported

  recordingAudioPausesCount?: number; // Number of audio recording pauses
  recordingVideoPausesCount?: number; // Number of video recording pauses
}

export interface CreateRoomOptions {
  action: 'create' | 'join'; // Either 'create' or 'join' based on the requirement
  meetingID: string; // The meeting ID, initially an empty string
  duration: number; // Duration of the meeting in minutes
  capacity: number; // Max number of participants allowed
  userName: string; // Username of the room host
  scheduledDate: number; // Unix timestamp (in milliseconds) for the scheduled date
  secureCode: string; // Secure code for the room host
  eventType: 'conference' | 'webinar' | 'chat' | 'broadcast'; // Type of event
  recordOnly: boolean; // Whether the room is for recording only
  eventStatus: 'active' | 'inactive'; // Status of the event
  startIndex: number; // Start index for pagination or data fetch
  pageSize: number; // Number of items per page
  safeRoom: boolean; // Whether the room is a safe room
  autoStartSafeRoom: boolean; // Automatically start the safe room feature
  safeRoomAction: 'warn' | 'kick' | 'ban'; // Action for the safe room
  dataBuffer: boolean; // Whether to return data buffer
  bufferType: 'images' | 'audio' | 'all'; // Type of buffer data
  supportSIP: boolean; // Whether to support SIP
  directionSIP: 'inbound' | 'outbound' | 'both'; // Direction of SIP
  preferPCMA: boolean; // Whether to prefer PCMA codec for SIP
}


export interface CreateMediaSFURoomOptions {
  action: 'create'; // 'create' action
  duration: number; // Duration of the meeting in minutes
  capacity: number; // Max number of participants allowed
  userName: string; // Username of the room host
  scheduledDate?: number; // Unix timestamp (in milliseconds) for the scheduled date
  secureCode?: string; // Secure code for the room host
  eventType?: 'conference' | 'webinar' | 'chat' | 'broadcast'; // Type of event
  meetingRoomParams?: MeetingRoomParams; // Object containing parameters related to the meeting room
  recordingParams?: RecordingParams; // Object containing parameters related to recording
  recordOnly?: boolean; // Whether the room is for media production only (egress)
  safeRoom?: boolean; // Whether the room is a safe room
  autoStartSafeRoom?: boolean; // Automatically start the safe room feature
  safeRoomAction?: 'warn' | 'kick' | 'ban'; // Action for the safe room
  dataBuffer?: boolean; // Whether to return data buffer
  bufferType?: 'images' | 'audio' | 'all'; // Type of buffer data
  supportSIP?: boolean; // Whether to support SIP
  directionSIP?: 'inbound' | 'outbound' | 'both'; // Direction of SIP
  preferPCMA?: boolean; // Whether to prefer PCMA codec for SIP
}

export interface JoinMediaSFURoomOptions {
  action: 'join'; // 'join' action
  meetingID: string; // The meeting ID
  userName: string; // Username of the room host
}

export interface ResponseJoinLocalRoom {
  rtpCapabilities?: RtpCapabilities | null; // Object containing the RTP capabilities
  isHost: boolean; // Indicates whether the user joining the room is the host.
  eventStarted: boolean; // Indicates whether the event has started.
  isBanned: boolean; // Indicates whether the user is banned from the room.
  hostNotJoined: boolean; // Indicates whether the host has not joined the room.
  eventRoomParams: MeetingRoomParams; // Object containing parameters related to the meeting room.
  recordingParams: RecordingParams; // Object containing parameters related to recording.
  secureCode: string; // Secure code (host password) associated with the host of the room.
  mediasfuURL: string; // Media SFU URL
  apiKey: string; // API key
  apiUserName: string; // API username
  allowRecord: boolean; // Indicates whether recording is allowed.
}


export interface ResponseJoinRoom {
  rtpCapabilities?: RtpCapabilities | null; // Object containing the RTP capabilities
  success: boolean; // Indicates whether the operation (joining the room) was successful.
  roomRecvIPs: string[]; // Array of strings containing information about the domains that must be connected to in order to receive media.
  meetingRoomParams: MeetingRoomParams; // Object containing parameters related to the meeting room.
  recordingParams: RecordingParams; // Object containing parameters related to recording.
  secureCode: string; // Secure code (host password) associated with the host of the room.
  recordOnly: boolean; // Indicates whether the room is for recording only.
  isHost: boolean; // Indicates whether the user joining the room is the host.
  safeRoom: boolean; // Indicates whether the room is a safe room.
  autoStartSafeRoom: boolean; // Indicates whether the safe room will automatically start.
  safeRoomStarted: boolean; // Indicates whether the safe room has started.
  safeRoomEnded: boolean; // Indicates whether the safe room has ended.
  reason?: string; // Reason for the success or failure of the operation.
  banned?: boolean; // Indicates whether the user is banned from the room.
  suspended?: boolean; // Indicates whether the user is suspended from the room.
  noAdmin?: boolean; // Indicates whether the room has no host in it.
}

export interface AllMembersData {
  members: Participant[]; // Array of objects containing information about all the members in the room.
  requests: Request[]; // Array of objects containing information about the requests.
  coHost?: string; // The co-host information.
  coHostResponsibilities: CoHostResponsibility[]; // Array of objects containing information about the co-host responsibilities.
}

export interface AllMembersRestData {
  members: Participant[]; // Array of objects containing information about all the members in the room.
  settings: Settings; // Array of strings containing information about the settings.
  coHost?: string; // The co-host information.
  coHostResponsibilities: CoHostResponsibility[]; // Array of objects containing information about the co-host responsibilities.
}

export interface UserWaitingData {
  name: string; // Name of the user waiting to join the room.
}

export interface AllWaitingRoomMembersData {
  waitingParticipants?: WaitingRoomParticipant[]; // Array of objects containing information about the participants waiting to join the room.
  waitingParticipantss?: WaitingRoomParticipant[];
}

export interface BanData {
  name: string; // Name of the user to ban.
}

export interface UpdatedCoHostData {
  coHost: string; // The co-host information.
  coHostResponsibilities: CoHostResponsibility[]; // Array of objects containing information about the co-host responsibilities.
}

export interface ParticipantRequestedData {
  userRequest: Request; // Object containing information about the user request.
}

export interface ScreenProducerIdData {
  producerId: string; // The producer ID of the screen.
}

export interface UpdateMediaSettingsData {
  settings: Settings; // Array of strings containing information about the settings.
}

export interface ProducerMediaPausedData {
  producerId: string; // The producer ID of the media that was paused.
  kind: 'audio';
  name: string; // The name of the media that was paused.
}

export interface ProducerMediaResumedData {
  kind: 'audio';
  name: string; // The name of the media that was resumed.
}

export interface ProducerMediaClosedData {
  producerId: string; // The producer ID of the media that was stopped.
  kind: 'audio' | 'video' | 'screenshare';
  name: string; // The name of the media that was stopped.
}

export interface ControlMediaHostData {
  type: 'all' | 'audio' | 'video' | 'screenshare'; // The type of media to control.
}

export interface ReceiveMessageData {
  message: Message; // Object containing information about the message.
}

export interface MeetingTimeRemainingData {
  timeRemaining: number; // The time remaining for the meeting.
}

export interface MeetingStillThereData {
  timeRemaining: number; // The time remaining for the meeting.
}

export interface UpdateConsumingDomainsData {
  domains: string[]; // Array of strings containing information about the domains to consume media from.
  alt_domains: AltDomains; // Object containing information about the alternative domains to consume media from.
}

export interface RecordingNoticeData {
  state: string; // The state of the recording.
  userRecordingParam: UserRecordingParams; // Object containing information about the user recording parameters.
  pauseCount: number; // The number of times the recording was paused.
  timeDone: number; // The time the recording was paused.
}

export interface TimeLeftRecordingData {
  timeLeft: number; // The time left for recording.
}

export interface StoppedRecordingData {
  state: string; // The state of the recording.
  reason?: string; // The reason for stopping the recording.
}

export interface HostRequestResponseData {
  requestResponse: RequestResponse; // Object containing information about the request response.
}

export interface SafeRoomNoticeData {
 state: string; // The state of the safe room.
}

export interface UnSafeData {
  time: number; // The time the room was unsafe.
  evidence: ImageData; // The evidence for the room being unsafe.
}

export interface UnsafeAlertData {
  name: string; // The name of the user who triggered the unsafe alert.
}

export interface DataBufferNotice {
  state: string; // The state of the data buffer.
}

export interface AudioData {
  audioBuffer: AudioBuffer; // The audio buffer.
}

export interface ImageData {
  jpegBuffer: ImageData; // The JPEG buffer.
}

export interface WhiteboardUpdatedData {
  status: 'started' | 'ended'; // The status of the whiteboard.
  whiteboardUsers: WhiteboardUser[]; // Array of objects containing information about the whiteboard users.
  members: Participant[]; // Array of objects containing information about the members.
  whiteboardData: WhiteboardData; // Object containing information about the whiteboard data.
}

export interface WhiteboardActionData {
  action: string; // The action to be performed on the whiteboard.
  payload: ShapePayload; // Object containing information about the shape payload.
}

export type CreateWebRTCTransportResponse = {
  id: string;
  dtlsParameters: DtlsParameters;
  iceCandidates: IceCandidate[];
  iceParameters: IceParameters;
  error?: string;
};

// Custom Component Builder Types for React Native
export interface CustomVideoCardOptions {
  participant: Participant;
  stream: MediaStream | null;
  width: number;
  height: number;
  imageSize?: number;
  doMirror?: boolean;
  showControls?: boolean;
  showInfo?: boolean;
  name?: string;
  backgroundColor?: string;
  onVideoPress?: () => void;
  parameters?: any;
}

export interface CustomAudioCardOptions {
  name: string;
  barColor: string;
  textColor: string;
  imageSource?: string;
  roundedImage?: boolean;
  imageStyle?: any;
  parameters?: any;
}

export interface CustomMiniCardOptions {
  initials: string;
  fontSize: number;
  customStyle?: any;
  name: string;
  showVideoIcon?: boolean;
  showAudioIcon?: boolean;
  imageSource?: string;
  roundedImage?: boolean;
  imageStyle?: any;
  parameters?: any;
}

export interface CustomPreJoinPageOptions {
  localLink?: string;
  connectMediaSFU?: boolean;
  parameters: any;
  credentials?: { apiUserName: string; apiKey: string };
  returnUI?: boolean;
  noUIPreJoinOptions?: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;
  createMediaSFURoom?: any;
  joinMediaSFURoom?: any;
}

// Custom Component Builder Function Types
export type CustomVideoCardType = (options: CustomVideoCardOptions) => JSX.Element;
export type CustomAudioCardType = (options: CustomAudioCardOptions) => JSX.Element;
export type CustomMiniCardType = (options: CustomMiniCardOptions) => JSX.Element;
export type CustomPreJoinPageType = (options: CustomPreJoinPageOptions) => JSX.Element;

// Custom Full UI Component Type
export type CustomComponentType = React.FC<{ parameters: any }>;

// Override helper types (from overrideHelpers.tsx)
export type { CustomComponentOverride, CustomFunctionOverride } from '../components/mediasfuComponents/overrideHelpers';

/**
 * MediasfuUICustomOverrides interface
 * 
 * Comprehensive UI override map for all MediaSFU components and helper functions.
 * Each key accepts a CustomComponentOverride<Props> or CustomFunctionOverride<Fn>
 * allowing you to fully replace or wrap default implementations.
 * 
 * @example
 * ```tsx
 * import { MediasfuUICustomOverrides } from './types';
 * 
 * const uiOverrides: MediasfuUICustomOverrides = {
 *   mainContainer: {
 *     render: (props) => (
 *       <View style={{ borderWidth: 4, borderColor: 'purple' }}>
 *         <MainContainerComponent {...props} />
 *       </View>
 *     )
 *   },
 *   consumerResume: {
 *     wrap: (original) => async (params) => {
 *       const start = Date.now();
 *       const result = await original(params);
 *       console.log('Consumer resume took:', Date.now() - start, 'ms');
 *       return result;
 *     }
 *   }
 * };
 * ```
 */
export interface MediasfuUICustomOverrides {
  // Layout & control surfaces
  mainContainer?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  mainAspect?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  mainScreen?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  mainGrid?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  subAspect?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  otherGrid?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  flexibleGrid?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  flexibleGridAlt?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  flexibleVideo?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  audioGrid?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  pagination?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  controlButtons?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  controlButtonsAlt?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  controlButtonsTouch?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  
  // Participant cards & widgets
  videoCard?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  audioCard?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  miniCard?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  miniAudio?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  meetingProgressTimer?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  miniAudioPlayer?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  
  // Modals & dialogs
  loadingModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  alert?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  menuModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  eventSettingsModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  requestsModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  waitingRoomModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  coHostModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  mediaSettingsModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  participantsModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  messagesModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  displaySettingsModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  confirmExitModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  confirmHereModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  shareEventModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  recordingModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  pollModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  backgroundModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  breakoutRoomsModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  configureWhiteboardModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  whiteboard?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  screenboard?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  screenboardModal?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  
  // Entry flows
  welcomePage?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  preJoinPage?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  customMenuButtonsRenderer?: import('../components/mediasfuComponents/overrideHelpers').CustomComponentOverride<any>;
  
  // Function overrides
  consumerResume?: import('../components/mediasfuComponents/overrideHelpers').CustomFunctionOverride<any>;
  addVideosGrid?: import('../components/mediasfuComponents/overrideHelpers').CustomFunctionOverride<any>;
}


