import {
  Stream, Participant, Transport, PrepopulateUserMediaParameters, PrepopulateUserMediaType, RePortParameters, RePortType,
  ProcessConsumerTransportsParameters, ProcessConsumerTransportsType, ResumePauseStreamsParameters, ResumePauseStreamsType, ReadjustParameters, ReadjustType, AddVideosGridType, AddVideosGridParameters, GetEstimateType, CheckGridType, ResumePauseAudioStreamsParameters, ResumePauseAudioStreamsType, GetEstimateParameters,
  EventType, MediaStream
} from '../@types/types';

export interface DispStreamsParameters extends PrepopulateUserMediaParameters, RePortParameters, ProcessConsumerTransportsParameters, ResumePauseStreamsParameters, ReadjustParameters, ResumePauseAudioStreamsParameters, GetEstimateParameters, AddVideosGridParameters {
  consumerTransports: Transport[];
  streamNames: Stream[];
  audStreamNames: Stream[];
  participants: Participant[];
  ref_participants: Participant[];
  recordingDisplayType: 'video' | 'media' | 'all';
  recordingVideoOptimized: boolean;
  meetingDisplayType: string;
  meetingVideoOptimized: boolean;
  currentUserPage: number;
  hostLabel: string;
  mainHeightWidth: number;
  prevMainHeightWidth: number;
  prevDoPaginate: boolean;
  doPaginate: boolean;
  firstAll: boolean;
  shared: boolean;
  shareScreenStarted: boolean;
  shareEnded: boolean;
  oldAllStreams: (Stream | Participant)[];
  updateMainWindow: boolean;
  remoteProducerId?: string;
  activeNames: string[];
  dispActiveNames: string[];
  p_dispActiveNames: string[];
  nForReadjustRecord: number;
  first_round: boolean;
  lock_screen: boolean;
  chatRefStreams: (Stream | Participant)[];
  eventType: EventType;
  islevel: string;
  localStreamVideo: MediaStream | null;

  breakOutRoomStarted: boolean;
  breakOutRoomEnded: boolean;
  keepBackground: boolean;
  virtualStream: MediaStream | null;

  updateActiveNames: (names: string[]) => void;
  updateDispActiveNames: (names: string[]) => void;
  updateLStreams: (streams: (Stream | Participant)[]) => void;
  updateChatRefStreams: (streams: (Stream | Participant)[]) => void;
  updateNForReadjustRecord: (n: number) => void;
  updateUpdateMainWindow: (value: boolean) => void;
  updateShowMiniView: (value: boolean) => void;

  // mediasfu functions
  prepopulateUserMedia: PrepopulateUserMediaType;
  rePort: RePortType;
  processConsumerTransports: ProcessConsumerTransportsType;
  resumePauseStreams: ResumePauseStreamsType;
  readjust: ReadjustType;
  addVideosGrid: AddVideosGridType;
  getEstimate: GetEstimateType;
  checkGrid: CheckGridType;
  resumePauseAudioStreams: ResumePauseAudioStreamsType;

  getUpdatedAllParams: () => DispStreamsParameters;
  [key: string]: any;
}

export interface DispStreamsOptions {
  lStreams: (Stream | Participant)[];
  ind: number;
  auto?: boolean;
  ChatSkip?: boolean;
  forChatCard?: any;
  forChatID?: any;
  parameters: DispStreamsParameters;
  breakRoom?: number;
  inBreakRoom?: boolean;
}

// Export the type definition for the function
export type DispStreamsType = (options: DispStreamsOptions) => Promise<void>;

/**
 * Function to display streams based on various parameters and conditions.
 *
 * @param {DispStreamsOptions} options - The options object.
 * @param {Array} options.lStreams - List of streams to display.
 * @param {number} options.ind - Index of the current stream.
 * @param {boolean} [options.auto=false] - Flag to indicate if the function should run automatically.
 * @param {boolean} [options.ChatSkip=false] - Flag to indicate if chat should be skipped.
 * @param {string|null} [options.forChatID=null] - ID for chat reference.
 * @param {DispStreamsParameters} options.parameters - Parameters object containing various settings and functions.
 * @param {number} [options.breakRoom=-1] - Break room number.
 * @param {boolean} [options.inBreakRoom=false] - Flag to indicate if in break room.
 *
 * @returns {Promise<void>} A promise that resolves when the function completes.
 *
 * @throws Will log an error if an issue occurs during the display of streams.
 *
 * @example
 * const options = {
 *   lStreams: [stream1, stream2],
 *   ind: 0,
 *   auto: true,
 *   ChatSkip: false,
 *   forChatID: 'chat123',
 *   parameters: {
 *     consumerTransports: [],
 *     streamNames: [],
 *     audStreamNames: [],
 *     participants: [],
 *     ref_participants: [],
 *     recordingDisplayType: 'video',
 *     recordingVideoOptimized: false,
 *     meetingDisplayType: 'video',
 *     meetingVideoOptimized: false,
 *     currentUserPage: 1,
 *     hostLabel: 'Host',
 *     mainHeightWidth: 800,
 *     prevMainHeightWidth: 600,
 *     prevDoPaginate: false,
 *     doPaginate: true,
 *     firstAll: true,
 *     shared: false,
 *     shareScreenStarted: false,
 *     shareEnded: false,
 *     oldAllStreams: [],
 *     updateMainWindow: true,
 *     remoteProducerId: null,
 *     activeNames: [],
 *     dispActiveNames: [],
 *     p_dispActiveNames: [],
 *     nForReadjustRecord: 0,
 *     first_round: false,
 *     lock_screen: false,
 *     chatRefStreams: [],
 *     eventType: 'meeting',
 *     islevel: '1',
 *     localStreamVideo: null,
 *     breakOutRoomStarted: false,
 *     breakOutRoomEnded: false,
 *     keepBackground: false,
 *     virtualStream: null,
 *     updateActiveNames: (names) => console.log('Updated active names:', names),
 *     updateDispActiveNames: (names) => console.log('Updated displayed active names:', names),
 *     updateLStreams: (streams) => console.log('Updated limited streams:', streams),
 *     updateChatRefStreams: (streams) => console.log('Updated chat reference streams:', streams),
 *     updateNForReadjustRecord: (n) => console.log('Updated n for readjustment:', n),
 *     updateUpdateMainWindow: (state) => console.log('Main window updated:', state),
 *     updateShowMiniView: (value) => console.log('Mini view updated:', value),
 *     prepopulateUserMedia: async () => { console.log('your logic')},
 *     rePort: async () => { console.log('your logic')},
 *     processConsumerTransports: async () => { console.log('your logic')},
 *     resumePauseStreams: async () => { console.log('your logic')},
 *     readjust: async () => { console.log('your logic')},
 *     addVideosGrid: async () => { console.log('your logic')},
 *     getEstimate: async () => { console.log('your logic')},
 *     checkGrid: async () => { console.log('your logic')},
 *     resumePauseAudioStreams: async () => { console.log('your logic')},
 *     getUpdatedAllParams: () => { console.log('your logic')},
 *   },
 *   breakRoom: 1,
 *   inBreakRoom: false,
 * };
 * 
 * dispStreams(options)
 *   .then(() => {
 *     console.log('Streams displayed successfully');
 *   })
 *   .catch((error) => {
 *     console.error('Error displaying streams:', error);
 *   });
 */

export async function dispStreams({
  lStreams,
  ind,
  auto = false,
  ChatSkip = false,
  forChatID = null,
  parameters,
  breakRoom = -1,
  inBreakRoom = false,
}: DispStreamsOptions): Promise<void> {
  // Function to display streams

  const { getUpdatedAllParams } = parameters;
  parameters = getUpdatedAllParams();

  let {
    consumerTransports,
    streamNames,
    audStreamNames,
    participants,
    ref_participants,
    recordingDisplayType,
    recordingVideoOptimized,
    meetingDisplayType,
    meetingVideoOptimized,
    currentUserPage,
    hostLabel,
    mainHeightWidth,
    prevMainHeightWidth,
    prevDoPaginate,
    doPaginate,
    firstAll,
    shared,
    shareScreenStarted,
    shareEnded,
    oldAllStreams,
    updateMainWindow,
    remoteProducerId,
    activeNames,
    dispActiveNames,
    p_dispActiveNames,
    nForReadjustRecord,
    first_round,
    lock_screen,
    chatRefStreams,
    eventType,
    islevel,
    localStreamVideo,

    breakOutRoomStarted,
    breakOutRoomEnded,
    keepBackground,
    virtualStream,

    updateActiveNames,
    updateDispActiveNames,
    updateLStreams,
    updateChatRefStreams,
    updateNForReadjustRecord,
    updateUpdateMainWindow,
    updateShowMiniView,

    prepopulateUserMedia,
    rePort,
    processConsumerTransports,
    resumePauseStreams,
    readjust,
    addVideosGrid,
    checkGrid,
    getEstimate,
    resumePauseAudioStreams,
  } = parameters;

  let proceed = true;

  let lStreams_ = lStreams.filter((stream) => stream.producerId !== 'youyou' && stream.producerId !== 'youyouyou');

  lStreams_ = lStreams_.filter((stream) => stream.id !== 'youyou' && stream.id !== 'youyouyou' && stream.name !== 'youyou' && stream.name !== 'youyouyou');

  if (eventType === 'chat') {
    proceed = true;
  } else if (ind === 0 || (islevel !== '2' && currentUserPage === ind)) {
    proceed = false;

    // get the name of every participant in lStreams if stream !null and assign it to activeNames
    lStreams_.forEach((stream) => {
      let checker = false;
      let check_level = 0;

      if (recordingDisplayType === 'video') {
        if (recordingVideoOptimized) {
          if (Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '') {
            checker = true;
            check_level = 0;
          }
        } else if ((Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '')
            || (Object.prototype.hasOwnProperty.call(stream, 'audioID')
              && stream.audioID != null
              && stream.audioID !== '')) {
          checker = true;
          check_level = 1;
        }
      } else if (recordingDisplayType === 'media') {
        if ((Object.prototype.hasOwnProperty.call(stream, 'producerId')
          && stream.producerId != null
          && stream.producerId !== '')
          || (Object.prototype.hasOwnProperty.call(stream, 'audioID')
            && stream.audioID != null
            && stream.audioID !== '')) {
          checker = true;
          check_level = 1;
        }
      } else if ((Object.prototype.hasOwnProperty.call(stream, 'producerId')
          && stream.producerId != null
          && stream.producerId !== '')
          || (Object.prototype.hasOwnProperty.call(stream, 'audioID')
            && stream.audioID != null
            && stream.audioID !== '')
          || (Object.prototype.hasOwnProperty.call(stream, 'name')
            && stream.name !== null
            && stream.name != '')) {
        checker = true;
        check_level = 2;
      }

      let participant;

      if (checker) {
        // find the participant with the same videoID as the stream
        if (check_level == 0) {
          if (Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '') {
            participant = streamNames.find(
              (obj) => obj.producerId === stream.producerId,
            );
          }
        } else if (check_level == 1) {
          // find for either producerId or name
          if (Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '') {
            participant = streamNames.find(
              (obj) => obj.producerId === stream.producerId,
            );
          }
          if (!participant) {
            if (Object.prototype.hasOwnProperty.call(stream, 'audioID')
              && stream.audioID != null
              && stream.audioID !== '') {
              participant = audStreamNames.find(
                (obj) => obj.producerId === stream.audioID,
              );
              if (!participant) {
                participant = ref_participants.find(
                  (obj) => obj.audioID === stream.audioID,
                );
              }
            }
          }
        } else if (check_level == 2) {
          if (Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '') {
            participant = streamNames.find(
              (obj) => obj.producerId === stream.producerId,
            );
          }
          if (!participant) {
            if (Object.prototype.hasOwnProperty.call(stream, 'audioID')
              && stream.audioID != null
              && stream.audioID !== '') {
              participant = audStreamNames.find(
                (obj) => obj.producerId === stream.audioID,
              );
              if (!participant) {
                participant = ref_participants.find(
                  (obj) => obj.audioID === stream.audioID,
                );
              }
            }
          }
          if (!participant) {
            if (Object.prototype.hasOwnProperty.call(stream, 'name')
              && stream.name !== null
              && stream.name != '') {
              participant = ref_participants.find(
                (obj) => obj.name === stream.name,
              );
            }
          }
        }

        // push the name of the participant to activeNames
        if (participant) {
          // if activeNames does not include the name of the participant, push it
          if (participant.name && !activeNames.includes(participant.name)) {
            activeNames.push(participant.name);
          }
        }
      }
    });

    updateActiveNames(activeNames);

    lStreams_.forEach((stream) => {
      let disp_checker = false;
      let disp_check_level = 0;

      if (meetingDisplayType == 'video') {
        if (meetingVideoOptimized) {
          if (Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '') {
            disp_checker = true;
            disp_check_level = 0;
          }
        } else if ((Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '')
            || (Object.prototype.hasOwnProperty.call(stream, 'audioID')
              && stream.audioID != null
              && stream.audioID !== '')) {
          disp_checker = true;
          disp_check_level = 1;
        }
      } else if (meetingDisplayType == 'media') {
        if ((Object.prototype.hasOwnProperty.call(stream, 'producerId')
          && stream.producerId != null
          && stream.producerId !== '')
          || (Object.prototype.hasOwnProperty.call(stream, 'audioID')
            && stream.audioID != null
            && stream.audioID !== '')) {
          disp_checker = true;
          disp_check_level = 1;
        }
      } else if ((Object.prototype.hasOwnProperty.call(stream, 'producerId')
          && stream.producerId != null
          && stream.producerId !== '')
          || (Object.prototype.hasOwnProperty.call(stream, 'audioID')
            && stream.audioID != null
            && stream.audioID !== '')
          || (Object.prototype.hasOwnProperty.call(stream, 'name')
            && stream.name !== null
            && stream.name != '')) {
        disp_checker = true;
        disp_check_level = 2;
      }

      let participant_;

      if (disp_checker) {
        if (disp_check_level == 0) {
          if (Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '') {
            participant_ = streamNames.find(
              (obj) => obj.producerId === stream.producerId,
            );
          }
        } else if (disp_check_level == 1) {
          // find for either producerId or name
          if (Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '') {
            participant_ = streamNames.find(
              (obj) => obj.producerId === stream.producerId,
            );
          }
          if (!participant_) {
            if (Object.prototype.hasOwnProperty.call(stream, 'audioID')
              && stream.audioID != null
              && stream.audioID !== '') {
              participant_ = audStreamNames.find(
                (obj) => obj.producerId === stream.audioID,
              );
              if (!participant_) {
                participant_ = ref_participants.find(
                  (obj) => obj.audioID === stream.audioID,
                );
              }
            }
          }
        } else if (disp_check_level == 2) {
          if (Object.prototype.hasOwnProperty.call(stream, 'producerId')
            && stream.producerId != null
            && stream.producerId !== '') {
            participant_ = streamNames.find(
              (obj) => obj.producerId === stream.producerId,
            );
          }
          if (!participant_) {
            if (Object.prototype.hasOwnProperty.call(stream, 'audioID')
              && stream.audioID != null
              && stream.audioID !== '') {
              participant_ = audStreamNames.find(
                (obj) => obj.producerId === stream.audioID,
              );
              if (!participant_) {
                participant_ = ref_participants.find(
                  (obj) => obj.audioID === stream.audioID,
                );
              }
            }
          }
          if (!participant_) {
            if (Object.prototype.hasOwnProperty.call(stream, 'name')
              && stream.name !== null
              && stream.name != '') {
              participant_ = ref_participants.find(
                (obj) => obj.name === stream.name,
              );
            }
          }
        }
      }

      // push the name of the participant to activeNames
      if (participant_) {
        // if dispActiveNames does not include the name of the participant, push it
        if (participant_.name && !dispActiveNames.includes(participant_.name)) {
          dispActiveNames.push(participant_.name);
          if (!p_dispActiveNames.includes(participant_.name)) {
            proceed = true;
          }
        }
      }
    });

    updateDispActiveNames(dispActiveNames);

    if (lStreams_.length < 1 && (shareScreenStarted || shared || !firstAll)) {
      proceed = true;
    }

    if (shareScreenStarted || shared) {
      // Additional logic
    } else if (prevMainHeightWidth !== mainHeightWidth) {
      updateMainWindow = true;
      updateUpdateMainWindow(updateMainWindow);
    }

    nForReadjustRecord = activeNames.length;
    updateNForReadjustRecord(nForReadjustRecord);
  }

  if (!proceed && auto) {
    if (updateMainWindow && !lock_screen && !shared) {
      await prepopulateUserMedia({ name: hostLabel, parameters });
    } else if (!first_round) {
      await prepopulateUserMedia({ name: hostLabel, parameters });
    }

    if (ind === 0 && eventType !== 'chat') {
      await rePort({ parameters });
    }
    return;
  }

  if (eventType == 'broadcast') {
    lStreams = lStreams_;
    updateLStreams(lStreams);
  } else if (eventType == 'chat') {
    if (forChatID != null) {
      lStreams = chatRefStreams;
      updateLStreams(lStreams);
    } else {
      updateShowMiniView(false);

      if (islevel != '2') {
        const host = participants.find((obj) => obj.islevel === '2');

        if (host) {
          let streame;

          remoteProducerId = host.videoID as string;
          // get the stream from allvideostream with the same id as remoteProducerId

          if (islevel == '2') {
            host.stream = keepBackground && virtualStream
              ? virtualStream
              : localStreamVideo;
          } else {
            streame = oldAllStreams.find(
              (streame) => streame.producerId == remoteProducerId,
            );
            // add streame to lStreams
            if (streame) {
              // remove any stream with name of host.name
              lStreams = lStreams.filter((stream) => stream.name != host.name);

              lStreams.push(streame);
            }
          }
        }
      }

      // remove youyou and youyouyou from lStreams and then put it at the end
      const youyou = lStreams.find((obj) => obj.producerId === 'youyou' || obj.producerId === 'youyouyou');

      lStreams = lStreams.filter((stream) => (
        stream.producerId != 'youyou' && stream.producerId != 'youyouyou'
      ));

      if (youyou) {
        lStreams.push(youyou);
      }

      chatRefStreams = lStreams;

      updateLStreams(lStreams);
      updateChatRefStreams(chatRefStreams);
    }
  }

  const refLength = lStreams.length;

  const [, rows, cols] = getEstimate({ n: refLength, parameters });
  const result = await checkGrid({ rows, cols, actives: refLength }) || [false, 0, 0, 0, 0, 0, 0];
  let [removeAltGrid, numtoaddd, numRows, numCols, , actualRows, lastrowcols] = result;

  if (ChatSkip && eventType === 'chat') {
    numRows = 1;
    numCols = 1;
    actualRows = 1;
  }

  await readjust({ n: lStreams.length, state: ind, parameters });

  const mainGridStreams = lStreams.slice(0, numtoaddd);
  const altGridStreams = lStreams.slice(numtoaddd);

  if (doPaginate || prevDoPaginate !== doPaginate || shared || shareScreenStarted || shareEnded) {
    const lStreams_alt = lStreams_;
    await processConsumerTransports({ consumerTransports, lStreams_: lStreams_alt, parameters });

    try {
      if (breakOutRoomStarted && !breakOutRoomEnded) {
        await resumePauseAudioStreams({ inBreakRoom, breakRoom, parameters });
      } else {
        await resumePauseStreams({ parameters });
      }
    } catch {
      // console.log('Error in resumePauseAudioStreams:', error);
    }

    try {
      if (!breakOutRoomStarted || (breakOutRoomStarted && breakOutRoomEnded)) {
        await resumePauseStreams({ parameters });
      }
    } catch {
      // console.log('Error in resumePauseStreams:', error
    }

    if (shareEnded) {
      shareEnded = false;
    }
  }

  if (ChatSkip && eventType === 'chat') {
    await addVideosGrid({
      mainGridStreams,
      altGridStreams,
      numtoadd: numtoaddd - 1,
      numRows,
      numCols,
      actualRows,
      lastrowcols,
      removeAltGrid,
      parameters,
    });
  } else {
    await addVideosGrid({
      mainGridStreams,
      altGridStreams,
      numtoadd: numtoaddd,
      numRows,
      numCols,
      actualRows,
      lastrowcols,
      removeAltGrid,
      parameters,
    });
  }

  if (updateMainWindow && !lock_screen && !shared) {
    await prepopulateUserMedia({ name: hostLabel, parameters });
  } else if (!first_round) {
    await prepopulateUserMedia({ name: hostLabel, parameters });
  }

  if (ind === 0 && eventType !== 'chat') {
    await rePort({ parameters });
  }
}
