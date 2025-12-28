import { Socket } from 'socket.io-client';
import {
  Participant, Request, ReorderStreamsType, ReorderStreamsParameters, SleepType, ConnectIpsParameters, OnScreenChangesParameters,
  OnScreenChangesType, ConnectIpsType, ConsumeSocket, ConnectLocalIpsType, ConnectLocalIpsParameters,
  CoHostResponsibility,
  WaitingRoomParticipant
} from '../../@types/types';

/**
 * Handles participant management and UI updates for all members.
 * 
 * @param {Object} params - The parameters for the allMembers method.
 * @param {Participant[]} params.members - The array of participant members.
 * @param {Request[]} params.requestss - The array of requests.
 * @param {string} params.coHoste - The co-host identifier.
 * @param {CoHostResponsibility[]} params.coHostRes - The co-host responsibilities.
 * @param {AllMembersParameters} params.parameters - The parameters object for allMembers handling.
 * @param {ConsumeSocket[]} params.consume_sockets - The array of consume sockets.
 * @param {string} params.apiUserName - The API username.
 * @param {string} params.apiKey - The API key.
 * @param {string} params.apiToken - The API token.
 * @returns {Promise<void>} - A promise that resolves when all participant management actions are completed.
 * 
 * @example
 * ```typescript
 * await allMembers({
 *   members: participantList,
 *   requestss: requestList,
 *   coHoste: 'coHostName',
 *   coHostRes: [{ type: 'moderate', allowed: true }],
 *   parameters: allMembersParams,
 *   consume_sockets: [socket1, socket2],
 *   apiUserName: 'userAPI',
 *   apiKey: 'apiKey123',
 *   apiToken: 'tokenXYZ'
 * });
 * ```
 */

export interface AllMembersParameters extends ReorderStreamsParameters, ConnectIpsParameters, OnScreenChangesParameters, ConnectLocalIpsParameters {
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
  hostFirstSwitch: boolean;
  waitingRoomList: WaitingRoomParticipant[];
  islevel: string;
  socket: Socket;

  updateParticipantsAll: (participantsAll: Participant[]) => void;
  updateParticipants: (participants: Participant[]) => void;
  updateRequestList: (requestList: Request[]) => void;
  updateCoHost: (coHost: string) => void;
  updateCoHostResponsibility: (coHostRes: CoHostResponsibility[]) => void;
  updateFirstAll: (firstAll: boolean) => void;
  updateMembersReceived: (membersReceived: boolean) => void;
  updateDeferScreenReceived: (deferScreenReceived: boolean) => void;
  updateShareScreenStarted: (shareScreenStarted: boolean) => void;
  updateHostFirstSwitch: (hostFirstSwitch: boolean) => void;
  updateConsume_sockets: (sockets: ConsumeSocket[]) => void;
  updateRoomRecvIPs: (ips: string[]) => void;
  updateIsLoadingModalVisible: (visible: boolean) => void;
  updateTotalReqWait: (total: number) => void;

  // mediasfu functions
  onScreenChanges: OnScreenChangesType;
  connectIps: ConnectIpsType;
  connectLocalIps?: ConnectLocalIpsType;
  sleep: SleepType;
  reorderStreams: ReorderStreamsType;

  getUpdatedAllParams: () => AllMembersParameters;
  [key: string]: any;
}

export interface AllMembersOptions {
  members: Participant[];
  requestss: Request[];
  coHoste: string;
  coHostRes: CoHostResponsibility[];
  parameters: AllMembersParameters;
  consume_sockets: ConsumeSocket[];
  apiUserName: string;
  apiKey: string;
  apiToken: string;
}


// Export the type definition for the function
export type AllMembersType = (options: AllMembersOptions) => Promise<void>;

/**
 * allMembers - A method for handling various tasks related to participant management and UI updates.
 * @param {Object} params - The parameters passed to the allMembers method.
 * @returns {void} - No return value.
 */
export const allMembers = async ({
  members,
  requestss,
  coHoste,
  coHostRes,
  parameters,
  consume_sockets,
  apiUserName,
  apiKey,
  apiToken,
}: AllMembersOptions): Promise<void> => {
  let {
    participantsAll,
    participants,
    dispActiveNames,
    requestList,
    lock_screen,
    firstAll,
    membersReceived,
    roomRecvIPs,
    deferScreenReceived,
    screenId,
    shareScreenStarted,
    meetingDisplayType,
    hostFirstSwitch,
    waitingRoomList,
    islevel,
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
    updateHostFirstSwitch,
    updateConsume_sockets,
    updateRoomRecvIPs,
    updateIsLoadingModalVisible,
    updateTotalReqWait,

    onScreenChanges,
    connectIps,
    connectLocalIps,
    sleep,
    reorderStreams,
  } = parameters;

  participantsAll = members.map(({ isBanned, isSuspended, name, audioID, videoID }) => ({
    isBanned,
    isSuspended,
    name,
    audioID,
    videoID,
  }));

  updateParticipantsAll(participantsAll);

  participants = members.filter(
    (participant) => !participant.isBanned && !participant.isSuspended
  );

  updateParticipants(participants);

  if (dispActiveNames.length > 0) {
    const dispActiveNames_ = dispActiveNames.filter(
      (name) => !participants.map((participant) => participant.name).includes(name)
    );

    if (dispActiveNames_.length > 0) {
      await reorderStreams({ add: false, screenChanged: true, parameters });
    }
  }

  // check to expect no roomRecvIPs for local instance
  let onLocal = false;
  if (roomRecvIPs.length === 1 && roomRecvIPs[0] === 'none') {
    onLocal = true;
  }


  if (!membersReceived && !onLocal) {
    if (roomRecvIPs.length < 1) {
      let checkIPs = setInterval(async () => {
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

          updateConsume_sockets(sockets_);
          updateRoomRecvIPs(ips_);

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

      updateConsume_sockets(sockets_);
      updateRoomRecvIPs(ips_);
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
  }

  if (onLocal && !membersReceived) {
    if (connectLocalIps) {
      await connectLocalIps({ socket: socket, parameters });
    }
    await sleep({ ms: 100 });
    updateIsLoadingModalVisible(false);
  }

  requestList = requestss.filter((request) =>
    participants.some((participant) => participant.id === request.id)
  );
  updateRequestList(requestList);

  updateTotalReqWait(requestList.length + waitingRoomList.length);

  updateCoHost(coHoste);
  updateCoHostResponsibility(coHostRes);

  if (!lock_screen && !firstAll) {
    await onScreenChanges({ parameters });

    if (meetingDisplayType !== 'all') {
      updateFirstAll(true);
    }
  } else if (islevel === '2' && !hostFirstSwitch) {
    await onScreenChanges({ parameters });
    updateHostFirstSwitch(true);
  }
};
