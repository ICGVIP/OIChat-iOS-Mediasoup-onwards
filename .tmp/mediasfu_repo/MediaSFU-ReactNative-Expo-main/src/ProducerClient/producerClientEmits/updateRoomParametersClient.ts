import { RtpCapabilities } from 'mediasoup-client/lib/types';
import {
  QnHDCons,
  sdCons,
  hdCons,
  fhdCons,
  qhdCons,
  QnHDConsPort,
  sdConsPort,
  hdConsPort,
  fhdConsPort,
  qhdConsPort,
  QnHDConsNeu,
  sdConsNeu,
  hdConsNeu,
  fhdConsNeu,
  qhdConsNeu,
  QnHDFrameRate,
  hdFrameRate,
  fhdFrameRate,
  qhdFrameRate,
} from '../../methods/utils/producer/videoCaptureConstraints'; // Import the video capture constraints from the videoCaptureConstraints.js file

import { hParams as host_Params, HParamsType } from '../../methods/utils/producer/hParams';
import { vParams as video_Params, VParamsType } from '../../methods/utils/producer/vParams';
import { screenParams as screen_Params, ScreenParamsType } from '../../methods/utils/producer/screenParams';
import { aParams as audio_Params, AParamsType } from '../../methods/utils/producer/aParams';
import {
  MeetingRoomParams, VidCons, ShowAlert, ResponseJoinRoom, EventType,
} from '../../@types/types';

export interface UpdateRoomParametersClientParameters {
  rtpCapabilities: RtpCapabilities | null;
  roomRecvIPs: string[];
  meetingRoomParams: MeetingRoomParams | null;
  itemPageLimit: number;
  audioOnlyRoom: boolean;
  addForBasic: boolean;
  screenPageLimit: number;
  shareScreenStarted: boolean;
  shared: boolean;
  targetOrientation: string;
  vidCons: VidCons;
  recordingVideoSupport: boolean;
  frameRate: number;
  adminPasscode: string;
  eventType: EventType;
  youAreCoHost: boolean;
  autoWave: boolean;
  forceFullDisplay: boolean;
  chatSetting: string;
  meetingDisplayType: string;
  audioSetting: string;
  videoSetting: string;
  screenshareSetting: string;
  hParams: HParamsType;
  vParams: VParamsType;
  screenParams: ScreenParamsType;
  aParams: AParamsType;
  islevel: string;
  showAlert?: ShowAlert;
  data: ResponseJoinRoom;
  // update functions
  updateRtpCapabilities: (rtpCapabilities: RtpCapabilities | null) => void;
  updateRoomRecvIPs: (roomRecvIPs: string[]) => void;
  updateMeetingRoomParams: (meetingRoomParams: MeetingRoomParams | null) => void;
  updateItemPageLimit: (limit: number) => void;
  updateAudioOnlyRoom: (isAudioOnly: boolean) => void;
  updateAddForBasic: (addForBasic: boolean) => void;
  updateScreenPageLimit: (limit: number) => void;
  updateVidCons: (cons: VidCons) => void;
  updateFrameRate: (frameRate: number) => void;
  updateAdminPasscode: (passcode: string) => void;
  updateEventType: (eventType: EventType) => void;
  updateYouAreCoHost: (coHost: boolean) => void;
  updateAutoWave: (autoWave: boolean) => void;
  updateForceFullDisplay: (forceFull: boolean) => void;
  updateChatSetting: (setting: string) => void;
  updateMeetingDisplayType: (type: string) => void;
  updateAudioSetting: (setting: string) => void;
  updateVideoSetting: (setting: string) => void;
  updateScreenshareSetting: (setting: string) => void;
  updateHParams: (params: HParamsType) => void;
  updateVParams: (params: VParamsType) => void;
  updateScreenParams: (params: ScreenParamsType) => void;
  updateAParams: (params: AParamsType) => void;
  updateMainHeightWidth: (heightWidth: number) => void;
  updateTargetResolution: (resolution: string) => void;
  updateTargetResolutionHost: (resolution: string) => void;

  // Recording-related update functions
  updateRecordingAudioPausesLimit: (limit: number) => void;
  updateRecordingAudioPausesCount: (count: number) => void;
  updateRecordingAudioSupport: (support: boolean) => void;
  updateRecordingAudioPeopleLimit: (limit: number) => void;
  updateRecordingAudioParticipantsTimeLimit: (limit: number) => void;
  updateRecordingVideoPausesCount: (count: number) => void;
  updateRecordingVideoPausesLimit: (limit: number) => void;
  updateRecordingVideoSupport: (support: boolean) => void;
  updateRecordingVideoPeopleLimit: (limit: number) => void;
  updateRecordingVideoParticipantsTimeLimit: (limit: number) => void;
  updateRecordingAllParticipantsSupport: (support: boolean) => void;
  updateRecordingVideoParticipantsSupport: (support: boolean) => void;
  updateRecordingAllParticipantsFullRoomSupport: (support: boolean) => void;
  updateRecordingVideoParticipantsFullRoomSupport: (support: boolean) => void;
  updateRecordingPreferredOrientation: (orientation: string) => void;
  updateRecordingSupportForOtherOrientation: (support: boolean) => void;
  updateRecordingMultiFormatsSupport: (support: boolean) => void;
  updateRecordingVideoOptions: (options: string) => void;
  updateRecordingAudioOptions: (options: string) => void;
}

export type UpdateRoomParametersClientOptions = {
  parameters: UpdateRoomParametersClientParameters;
};

// Export type definition for the function
export type UpdateRoomParametersClientType = (options: UpdateRoomParametersClientOptions) => void;

/**
 * Updates the room parameters for the client.
 *
 * @param {Object} params - The parameters object.
 * @param {UpdateRoomParametersClientParameters} params.parameters - The parameters to update the room with.
 *
 * @throws Will throw an error if the update process fails.
 *
 * @example
 * updateRoomParametersClient({
 *   parameters: {
 *     screenPageLimit: 10,
 *     shareScreenStarted: true,
 *     shared: false,
 *     hParams: host_Params,
 *     vParams: video_Params,
 *     frameRate: 30,
 *     islevel: "1",
 *     showAlert: (alert) => console.log(alert),
 *     data: {
 *       rtpCapabilities: {},
 *       reason: "Some reason",
 *       secureCode: "1234",
 *       roomRecvIPs: ["192.168.1.1"],
 *       meetingRoomParams: {
 *         itemPageLimit: 5,
 *         type: "conference",
 *         audioSetting: {},
 *         videoSetting: {},
 *         screenshareSetting: {},
 *         chatSetting: {},
 *         mediaType: "video",
 *         targetOrientationHost: "landscape",
 *         targetOrientation: "portrait",
 *         targetResolutionHost: "hd",
 *         targetResolution: "sd",
 *       },
 *       recordingParams: {
 *         recordingAudioPausesLimit: 3,
 *         recordingAudioPausesCount: 1,
 *         recordingAudioSupport: true,
 *         recordingAudioPeopleLimit: 10,
 *         recordingAudioParticipantsTimeLimit: 60,
 *         recordingVideoPausesCount: 2,
 *         recordingVideoPausesLimit: 3,
 *         recordingVideoSupport: true,
 *         recordingVideoPeopleLimit: 5,
 *         recordingVideoParticipantsTimeLimit: 30,
 *         recordingAllParticipantsSupport: true,
 *         recordingVideoParticipantsSupport: true,
 *         recordingAllParticipantsFullRoomSupport: true,
 *         recordingVideoParticipantsFullRoomSupport: true,
 *         recordingPreferredOrientation: "landscape",
 *         recordingSupportForOtherOrientation: true,
 *         recordingMultiFormatsSupport: true,
 *       },
 *     },
 *     updateRtpCapabilities: (capabilities) => {},
 *     updateRoomRecvIPs: (ips) => {},
 *     updateMeetingRoomParams: (params) => {},
 *     updateItemPageLimit: (limit) => {},
 *     updateAudioOnlyRoom: (isAudioOnly) => {},
 *     updateScreenPageLimit: (limit) => {},
 *     updateVidCons: (cons) => {},
 *     updateFrameRate: (rate) => {},
 *     updateAdminPasscode: (passcode) => {},
 *     updateEventType: (type) => {},
 *     updateYouAreCoHost: (isCoHost) => {},
 *     updateAutoWave: (autoWave) => {},
 *     updateForceFullDisplay: (forceFullDisplay) => {},
 *     updateChatSetting: (chatSetting) => {},
 *     updateMeetingDisplayType: (displayType) => {},
 *     updateAudioSetting: (audioSetting) => {},
 *     updateVideoSetting: (videoSetting) => {},
 *     updateScreenshareSetting: (screenshareSetting) => {},
 *     updateHParams: (hParams) => {},
 *     updateVParams: (vParams) => {},
 *     updateScreenParams: (screenParams) => {},
 *     updateAParams: (aParams) => {},
 *     updateRecordingAudioPausesLimit: (limit) => {},
 *     updateRecordingAudioPausesCount: (count) => {},
 *     updateRecordingAudioSupport: (support) => {},
 *     updateRecordingAudioPeopleLimit: (limit) => {},
 *     updateRecordingAudioParticipantsTimeLimit: (timeLimit) => {},
 *     updateRecordingVideoPausesCount: (count) => {},
 *     updateRecordingVideoPausesLimit: (limit) => {},
 *     updateRecordingVideoSupport: (support) => {},
 *     updateRecordingVideoPeopleLimit: (limit) => {},
 *     updateRecordingVideoParticipantsTimeLimit: (timeLimit) => {},
 *     updateRecordingAllParticipantsSupport: (support) => {},
 *     updateRecordingVideoParticipantsSupport: (support) => {},
 *     updateRecordingAllParticipantsFullRoomSupport: (support) => {},
 *     updateRecordingVideoParticipantsFullRoomSupport: (support) => {},
 *     updateRecordingPreferredOrientation: (orientation) => {},
 *     updateRecordingSupportForOtherOrientation: (support) => {},
 *     updateRecordingMultiFormatsSupport: (support) => {},
 *     updateRecordingVideoOptions: (options) => {},
 *     updateRecordingAudioOptions: (options) => {}, 
 *     updateMainHeightWidth: (heightWidth) => {},
 *   }
 * });
 */

export const updateRoomParametersClient = ({ parameters }: UpdateRoomParametersClientOptions): void => {
  try {
    const {
      screenPageLimit,
      shareScreenStarted,
      shared,

      hParams = host_Params,
      vParams = video_Params,
      frameRate,

      islevel,
      showAlert,
      data,

      // updates
      updateRtpCapabilities,
      updateRoomRecvIPs,
      updateMeetingRoomParams,
      updateItemPageLimit,
      updateAudioOnlyRoom,
      updateScreenPageLimit,
      updateVidCons,
      updateFrameRate,
      updateAdminPasscode,
      updateEventType,
      updateYouAreCoHost,
      updateAutoWave,
      updateForceFullDisplay,
      updateChatSetting,
      updateMeetingDisplayType,
      updateAudioSetting,
      updateVideoSetting,
      updateScreenshareSetting,
      updateHParams,
      updateVParams,
      updateScreenParams,
      updateAParams,
      updateTargetResolution,
      updateTargetResolutionHost,

      // Recording updates
      updateRecordingAudioPausesLimit,
      updateRecordingAudioPausesCount,
      updateRecordingAudioSupport,
      updateRecordingAudioPeopleLimit,
      updateRecordingAudioParticipantsTimeLimit,
      updateRecordingVideoPausesCount,
      updateRecordingVideoPausesLimit,
      updateRecordingVideoSupport,
      updateRecordingVideoPeopleLimit,
      updateRecordingVideoParticipantsTimeLimit,
      updateRecordingAllParticipantsSupport,
      updateRecordingVideoParticipantsSupport,
      updateRecordingAllParticipantsFullRoomSupport,
      updateRecordingVideoParticipantsFullRoomSupport,
      updateRecordingPreferredOrientation,
      updateRecordingSupportForOtherOrientation,
      updateRecordingMultiFormatsSupport,
      updateRecordingVideoOptions,
      updateRecordingAudioOptions,
      updateMainHeightWidth,
    } = parameters;

    if (data.rtpCapabilities == null) {
      const reason = data.reason || '';
      showAlert?.({
        message: `Sorry, you are not allowed to join this room. ${reason}`,
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    // Update all values
    updateRtpCapabilities(data.rtpCapabilities);
    updateAdminPasscode(data.secureCode);
    updateRoomRecvIPs(data.roomRecvIPs);
    updateMeetingRoomParams(data.meetingRoomParams);

    // Update recording values
    updateRecordingAudioPausesLimit(data.recordingParams.recordingAudioPausesLimit);
    updateRecordingAudioPausesCount(data.recordingParams.recordingAudioPausesCount!);
    updateRecordingAudioSupport(data.recordingParams.recordingAudioSupport);
    updateRecordingAudioPeopleLimit(data.recordingParams.recordingAudioPeopleLimit);
    updateRecordingAudioParticipantsTimeLimit(data.recordingParams.recordingAudioParticipantsTimeLimit);
    updateRecordingVideoPausesCount(data.recordingParams.recordingVideoPausesCount!);
    updateRecordingVideoPausesLimit(data.recordingParams.recordingVideoPausesLimit);
    updateRecordingVideoSupport(data.recordingParams.recordingVideoSupport);
    updateRecordingVideoPeopleLimit(data.recordingParams.recordingVideoPeopleLimit);
    updateRecordingVideoParticipantsTimeLimit(data.recordingParams.recordingVideoParticipantsTimeLimit);
    updateRecordingAllParticipantsSupport(data.recordingParams.recordingAllParticipantsSupport);
    updateRecordingVideoParticipantsSupport(data.recordingParams.recordingVideoParticipantsSupport);
    updateRecordingAllParticipantsFullRoomSupport(data.recordingParams.recordingAllParticipantsFullRoomSupport);
    updateRecordingVideoParticipantsFullRoomSupport(data.recordingParams.recordingVideoParticipantsFullRoomSupport);
    updateRecordingPreferredOrientation(data.recordingParams.recordingPreferredOrientation);
    updateRecordingSupportForOtherOrientation(data.recordingParams.recordingSupportForOtherOrientation);
    updateRecordingMultiFormatsSupport(data.recordingParams.recordingMultiFormatsSupport);

    // Update other meeting room settings
    updateItemPageLimit(data.meetingRoomParams.itemPageLimit);
    updateEventType(data.meetingRoomParams.type);

    if (data.meetingRoomParams.type == 'chat' && islevel != '2') {
      updateYouAreCoHost(true);
    }

    if (['chat', 'broadcast'].includes(data.meetingRoomParams.type)) {
      updateAutoWave(false);
      updateMeetingDisplayType('all');
      updateForceFullDisplay(true);
      updateChatSetting('allow');
      updateItemPageLimit(2);

      if (['broadcast'].includes(data.meetingRoomParams.type)) {
        updateRecordingVideoOptions('mainScreen');
        updateRecordingAudioOptions('host');
        updateItemPageLimit(1);
      }
    }

    updateAudioSetting(data.meetingRoomParams.audioSetting);
    updateVideoSetting(data.meetingRoomParams.videoSetting);
    updateScreenshareSetting(data.meetingRoomParams.screenshareSetting);
    updateChatSetting(data.meetingRoomParams.chatSetting);

    updateAudioOnlyRoom(data.meetingRoomParams.mediaType != 'video');

    if (data.meetingRoomParams.type == 'conference' && (shared || shareScreenStarted)) {
      updateMainHeightWidth(100);
    } else {
      updateMainHeightWidth(0);
    }

    updateScreenPageLimit(Math.min(data.meetingRoomParams.itemPageLimit, screenPageLimit));

    // Assign media capture constraints based on the user's role and room settings
    const targetOrientation = islevel == '2' ? data.meetingRoomParams.targetOrientationHost : data.meetingRoomParams.targetOrientation;
    const targetResolution = islevel == '2' ? data.meetingRoomParams.targetResolutionHost : data.meetingRoomParams.targetResolution;

    let vidCons: VidCons;
    if (targetOrientation == 'landscape') {
      vidCons = targetResolution == 'hd' ? hdCons : targetResolution == 'fhd' ? fhdCons : targetResolution == 'qhd' ? qhdCons : targetResolution == 'sd' ? sdCons : QnHDCons;
    } else if (targetOrientation == 'neutral') {
      vidCons = targetResolution == 'hd' ? hdConsNeu : targetResolution == 'fhd' ? fhdConsNeu : targetResolution == 'qhd' ? qhdConsNeu : targetResolution == 'sd' ? sdConsNeu : QnHDConsNeu;
    } else {
      vidCons = targetResolution == 'hd' ? hdConsPort : targetResolution == 'fhd' ? fhdConsPort : targetResolution == 'qhd' ? qhdConsPort : targetResolution == 'sd' ? sdConsPort : QnHDConsPort;
    }

    let frameRateValue = frameRate || 10;

    let vParamsValue = { ...vParams };
    let hParamsValue = { ...hParams };

    if (Object.keys(vParamsValue).length == 0) {
      vParamsValue = { ...video_Params };
    }

    if (Object.keys(hParamsValue).length == 0) {
      hParamsValue = { ...host_Params };
    }

    if (targetResolution == 'hd') {
      frameRateValue = hdFrameRate;
      vParamsValue.encodings.forEach((encoding: Partial<VParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 4);
        }
      });

      hParamsValue.encodings.forEach((encoding: Partial<HParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 4);
        }
      });
    } else if (targetResolution == 'QnHD') {
      frameRateValue = QnHDFrameRate;
      vParamsValue.encodings.forEach((encoding: Partial<VParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 0.25);
        }
      });

      hParamsValue.encodings.forEach((encoding: Partial<HParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 0.25);
        }
      });

      if (hParamsValue.codecOptions && hParamsValue.codecOptions.videoGoogleStartBitrate) {
        hParamsValue.codecOptions.videoGoogleStartBitrate = Math.floor(hParamsValue.codecOptions.videoGoogleStartBitrate! * 0.25);
      }
      if (vParamsValue.codecOptions && vParamsValue.codecOptions.videoGoogleStartBitrate) {
        vParamsValue.codecOptions.videoGoogleStartBitrate = Math.floor(vParamsValue.codecOptions.videoGoogleStartBitrate! * 0.25);
      }
    } else if (targetResolution == 'fhd') {
      frameRateValue = fhdFrameRate;
      vParamsValue.encodings.forEach((encoding: Partial<VParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 8);
        }
      });

      hParamsValue.encodings.forEach((encoding: Partial<HParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 8);
        }
      });
    } else if (targetResolution == 'qhd') {
      frameRateValue = qhdFrameRate;
      vParamsValue.encodings.forEach((encoding: Partial<VParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 16);
        }
      });

      hParamsValue.encodings.forEach((encoding: Partial<HParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 16);
        }
      });
    }

    if (data.recordingParams.recordingVideoSupport) {
      vParamsValue.encodings.forEach((encoding: Partial<VParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 1.2);
        }
      });

      hParamsValue.encodings.forEach((encoding: Partial<HParamsType['encodings'][0]>) => {
        if (encoding.maxBitrate) {
          encoding.maxBitrate = Math.floor(encoding.maxBitrate * 1.2);
        }
      });

      if (hParamsValue.codecOptions && hParamsValue.codecOptions.videoGoogleStartBitrate) {
        hParamsValue.codecOptions.videoGoogleStartBitrate = Math.floor(hParamsValue.codecOptions.videoGoogleStartBitrate! * 1.2);
      }
      if (vParamsValue.codecOptions && vParamsValue.codecOptions.videoGoogleStartBitrate) {
        vParamsValue.codecOptions.videoGoogleStartBitrate = Math.floor(vParamsValue.codecOptions.videoGoogleStartBitrate! * 1.2);
      }
    }

    updateVidCons(vidCons);
    updateFrameRate(frameRateValue);
    updateHParams(hParamsValue);
    updateVParams(vParamsValue);
    updateScreenParams(screen_Params);
    updateAParams(audio_Params);
    updateTargetResolution(data.meetingRoomParams.targetResolution);
    updateTargetResolutionHost(data.meetingRoomParams.targetResolutionHost);

  } catch (error) {
    console.log('updateRoomParametersClient error', error);
    if (parameters.showAlert) {
      parameters.showAlert({
        message: (error as Error).message,
        type: 'danger',
        duration: 3000,
      });
    }
  }
};
