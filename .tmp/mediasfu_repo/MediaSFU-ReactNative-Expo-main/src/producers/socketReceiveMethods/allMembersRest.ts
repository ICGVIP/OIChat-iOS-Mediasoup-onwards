import { Socket } from 'socket.io-client';
import {
  Participant, CoHostResponsibility, OnScreenChangesType, OnScreenChangesParameters, Request, ConnectIpsParameters,
  ReorderStreamsParameters, ConnectIpsType, SleepType, ReorderStreamsType, Settings, ConsumeSocket, ConnectLocalIpsType, ConnectLocalIpsParameters,
} from '../../@types/types';
export interface AllMembersRestParameters extends OnScreenChangesParameters, ConnectIpsParameters, ReorderStreamsParameters, ConnectLocalIpsParameters {
  participantsAll: Participant[];
  participants: Participant[];
  dispActiveNames: string[];
  requestList: Request[];
  coHost: string;
  coHostResponsibility: CoHostResponsibility[];
  lock_screen: boolean;
  firstAll: boolean;
  membersReceived: boolean;
  roomRecvIPs: string[];
  deferScreenReceived: boolean;
  screenId?: string;
  shareScreenStarted: boolean;
  meetingDisplayType: string;
  audioSetting: string
  videoSetting: string;
  screenshareSetting: string;
  chatSetting: string;
  socket: Socket;

  updateParticipantsAll: (participantsAll: Participant[]) => void;
  updateParticipants: (participants: Participant[]) => void;
  updateRequestList: (requestList: Request[]) => void;
  updateCoHost: (coHost: string) => void;
  updateCoHostResponsibility: (coHostResponsibility: CoHostResponsibility[]) => void;
  updateFirstAll: (firstAll: boolean) => void;
  updateMembersReceived: (membersReceived: boolean) => void;
  updateDeferScreenReceived: (deferScreenReceived: boolean) => void;
  updateShareScreenStarted: (shareScreenStarted: boolean) => void;
  updateAudioSetting: (audioSetting: string) => void;
  updateVideoSetting: (videoSetting: string) => void;
  updateScreenshareSetting: (screenshareSetting: string) => void;
  updateChatSetting: (chatSetting: string) => void;
  updateConsume_sockets: (consume_sockets: ConsumeSocket[]) => void;
  updateRoomRecvIPs: (ips: string[]) => void;
  updateIsLoadingModalVisible: (visible: boolean) => void;

  // mediasfu functions
  onScreenChanges: OnScreenChangesType;
  connectIps: ConnectIpsType;
  connectLocalIps?: ConnectLocalIpsType;
  sleep: SleepType;
  reorderStreams: ReorderStreamsType;

  getUpdatedAllParams: () => AllMembersRestParameters;
  [key: string]: any;
}

export interface AllMembersRestOptions {
  members: Participant[];
  settings: Settings;
  coHoste?: string;
  coHostRes?: CoHostResponsibility[];
  parameters: AllMembersRestParameters;
  consume_sockets: ConsumeSocket[];
  apiUserName: string;
  apiKey: string;
  apiToken: string;
}

// Export the type definition for the function
export type AllMembersRestType = (options: AllMembersRestOptions) => Promise<void>;

/**
 * Handles the reception and processing of all members' data.
 * 
 * @param {Object} options - The options for the function.
 * @param {Array} options.members - The list of members.
 * @param {Settings} options.settings - The settings for audio, video, screenshare, and chat.
 * @param {string} [options.coHoste] - Optional co-host information.
 * @param {CoHostResponsibility[]} [options.coHostRes] - Optional co-host responsibility information.
 * @param {AllMembersRestParameters} options.parameters - The parameters for the function.
 * @param {ConsumeSocket[]} options.consume_sockets - The sockets to consume.
 * @param {string} options.apiUserName - The API username.
 * @param {string} options.apiKey - The API key.
 * @param {string} options.apiToken - The API token.
 * 
 * @returns {Promise<void>} A promise that resolves when the function completes.
 * 
 * @example
 * ```typescript
 * await allMembersRest({
 *   members: memberList,
 *   settings: { audio: 'on', video: 'on', screenshare: 'off', chat: 'on' },
 *   coHoste: 'coHostName',
 *   coHostRes: [{ type: 'moderate', allowed: true }],
 *   parameters: allParams,
 *   consume_sockets: [socket1, socket2],
 *   apiUserName: 'apiUser',
 *   apiKey: 'apiKey123',
 *   apiToken: 'tokenXYZ'
 * });
 * ```
 */

export const allMembersRest = async ({
  members,
  settings,
  coHoste,
  coHostRes,
  parameters,
  consume_sockets,
  apiUserName,
  apiKey,
  apiToken,
}: AllMembersRestOptions): Promise<void> => {
  let {
    participantsAll,
    participants,
    dispActiveNames,
    requestList,
    coHost,
    coHostResponsibility,
    lock_screen,
    firstAll,
    membersReceived,
    roomRecvIPs,
    deferScreenReceived,
    screenId,
    shareScreenStarted,
    meetingDisplayType,
    audioSetting,
    videoSetting,
    screenshareSetting,
    chatSetting,
    socket,

    updateParticipantsAll,
    updateParticipants,
    updateRequestList,
    updateCoHost,
    updateCoHostResponsibility,
    updateFirstAll,
    updateMembersReceived,
    updateDeferScreenReceived,
    updateShareScreenStarted,
    updateAudioSetting,
    updateVideoSetting,
    updateScreenshareSetting,
    updateChatSetting,
    updateConsume_sockets,
    updateRoomRecvIPs,
    updateIsLoadingModalVisible,

    onScreenChanges,
    connectIps,
    connectLocalIps,
    sleep,
    reorderStreams,
  } = parameters;

  // Filter out banned and suspended participants
  participantsAll = members.map((participant) => ({
    isBanned: participant.isBanned,
    isSuspended: participant.isSuspended,
    name: participant.name,
    audioID: participant.audioID,
    videoID: participant.videoID,
  }));

  updateParticipantsAll(participantsAll);

  participants = members.filter(
    (participant) => !participant.isBanned && !participant.isSuspended
  );
  updateParticipants(participants);

  // Update UI if dispActiveNames contains participants not in the participants array
  if (dispActiveNames.length > 0) {
    const dispActiveNames_ = dispActiveNames.filter(
      (name) => !participants.some((participant) => participant.name === name)
    );
    if (dispActiveNames_.length > 0 && membersReceived) {
      await reorderStreams({ add: false, screenChanged: true, parameters });
    }
  }

  // check to expect no roomRecvIPs for local instance
  let onLocal = false;
  if (roomRecvIPs.length === 1 && roomRecvIPs[0] === 'none') {
    onLocal = true;
  }

  // Check for roomRecvIPs and connect to the server
  if (!onLocal && !membersReceived) {
    if (!membersReceived) {
      if (roomRecvIPs.length < 1) {
        const checkIPs = setInterval(async () => {
          if (roomRecvIPs.length > 0) {
            clearInterval(checkIPs);

            if (deferScreenReceived && screenId) {
              shareScreenStarted = true;
              updateShareScreenStarted(shareScreenStarted);
            }

            const [sockets_, ips_] = await connectIps({
              consume_sockets,
              remIP: roomRecvIPs,
              parameters,
              apiUserName,
              apiKey,
              apiToken,
            });

            if (sockets_ && ips_) {
              updateConsume_sockets(sockets_);
              updateRoomRecvIPs(ips_);
            }

            membersReceived = true;
            updateMembersReceived(membersReceived);

            await sleep({ ms: 250 });
            updateIsLoadingModalVisible(false);
            deferScreenReceived = false;
            updateDeferScreenReceived(deferScreenReceived);
          }
        }, 10);
      } else {
        const [sockets_, ips_] = await connectIps({
          consume_sockets,
          remIP: roomRecvIPs,
          parameters,
          apiUserName,
          apiKey,
          apiToken,
        });

        if (sockets_ && ips_) {
          updateConsume_sockets(sockets_);
          updateRoomRecvIPs(ips_);
        }
        membersReceived = true;
        updateMembersReceived(membersReceived);

        if (deferScreenReceived && screenId) {
          shareScreenStarted = true;
          updateShareScreenStarted(shareScreenStarted);
        }

        await sleep({ ms: 250 });
        updateIsLoadingModalVisible(false);
        deferScreenReceived = false;
        updateDeferScreenReceived(deferScreenReceived);
      }
    } else {
      if (screenId) {
        const host = participants.find(
          (participant) => participant.ScreenID === screenId && participant.ScreenOn === true
        );
        if (deferScreenReceived && screenId && host) {
          shareScreenStarted = true;
          updateShareScreenStarted(shareScreenStarted);
        }
      }
    }
  }

  if (onLocal) {
    if (connectLocalIps) {
      await connectLocalIps({ socket: socket, parameters });
    }
    await sleep({ ms: 100 });
    updateIsLoadingModalVisible(false);
  }

  // Filter requests based on participants
  requestList = requestList.filter((request) =>
    participants.some((participant) => participant.id === request.id)
  );
  updateRequestList(requestList);

  coHost = coHoste!;
  updateCoHost(coHost);
  coHostResponsibility = coHostRes!;
  updateCoHostResponsibility(coHostResponsibility);

  // Handle screen changes if necessary
  if (!lock_screen && !firstAll) {
    await onScreenChanges({ parameters });
    if (meetingDisplayType !== 'all') {
      firstAll = true;
      updateFirstAll(firstAll);
    }
  }

  try {
    if (membersReceived) {
      audioSetting = settings[0];
      videoSetting = settings[1];
      screenshareSetting = settings[2];
      chatSetting = settings[3];

      updateAudioSetting(audioSetting);
      updateVideoSetting(videoSetting);
      updateScreenshareSetting(screenshareSetting);
      updateChatSetting(chatSetting);
    }
  } catch {
    /* empty */
  }
};
