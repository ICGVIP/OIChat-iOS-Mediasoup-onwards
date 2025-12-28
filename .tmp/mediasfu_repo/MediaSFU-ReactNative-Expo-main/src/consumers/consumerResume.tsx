import React from 'react';
import { Socket } from 'socket.io-client';
import MiniAudioPlayer from '../methods/utils/MiniAudioPlayer/MiniAudioPlayer';
import MiniAudio from '../components/displayComponents/MiniAudio';
import VideoCard from '../components/displayComponents/VideoCard';
import AudioCard from '../components/displayComponents/AudioCard';
import MiniCard from '../components/displayComponents/MiniCard';
import {
  ReorderStreamsType,
  ReorderStreamsParameters,
  Participant,
  PrepopulateUserMediaType,
  PrepopulateUserMediaParameters,
  Stream,
  MiniAudioPlayerParameters,
  EventType,
  MediaStream as MediaStreamType,
} from '../@types/types';
import { MediaStream as NativeMediaStream, MediaStreamTrack } from '../methods/utils/webrtc/webrtc';
import { Consumer } from 'mediasoup-client/lib/types';


export interface ConsumerResumeParameters
  extends ReorderStreamsParameters,
    PrepopulateUserMediaParameters,
    MiniAudioPlayerParameters {
  nStream: MediaStreamType | null;
  allAudioStreams: (Stream | Participant)[];
  allVideoStreams: (Stream | Participant)[];
  streamNames: Stream[];
  audStreamNames: Stream[];
  updateMainWindow: boolean;
  shared: boolean;
  shareScreenStarted: boolean;
  screenId?: string;
  participants: Participant[];
  eventType: EventType;
  meetingDisplayType: string;
  mainScreenFilled: boolean;
  first_round: boolean;
  lock_screen: boolean;
  oldAllStreams: (Stream | Participant)[];
  adminVidID?: string;
  mainHeightWidth: number;
  member: string;
  audioOnlyStreams: JSX.Element[];
  gotAllVids: boolean;
  defer_receive: boolean;
  firstAll: boolean;
  remoteScreenStream: Stream[];
  hostLabel: string;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  videoCardComponent?: React.ComponentType<React.ComponentProps<typeof VideoCard>>;
  audioCardComponent?: React.ComponentType<React.ComponentProps<typeof AudioCard>>;
  miniCardComponent?: React.ComponentType<React.ComponentProps<typeof MiniCard>>;
  miniAudioComponent?: React.ComponentType<React.ComponentProps<typeof MiniAudio>>;
  miniAudioPlayerComponent?: React.ComponentType<React.ComponentProps<typeof MiniAudioPlayer>>;

  updateUpdateMainWindow: (value: boolean) => void;
  updateAllAudioStreams: (value: (Stream | Participant)[]) => void;
  updateAllVideoStreams: (value: (Stream | Participant)[]) => void;
  updateStreamNames: (value: Stream[]) => void;
  updateAudStreamNames: (value: Stream[]) => void;
  updateNStream: (value: MediaStreamType | null) => void;
  updateMainHeightWidth: (value: number) => void;
  updateLock_screen: (value: boolean) => void;
  updateFirstAll: (value: boolean) => void;
  updateRemoteScreenStream: (value: Stream[]) => void;
  updateOldAllStreams: (value: (Stream | Participant)[]) => void;
  updateAudioOnlyStreams: (value: JSX.Element[]) => void;
  updateShareScreenStarted: (value: boolean) => void;
  updateGotAllVids: (value: boolean) => void;
  updateScreenId: (value: string) => void;
  updateDefer_receive: (value: boolean) => void;

  // mediasfu functions
  reorderStreams: ReorderStreamsType;
  prepopulateUserMedia: PrepopulateUserMediaType;
  getUpdatedAllParams: () => ConsumerResumeParameters;
  [key: string]: any;
}

interface ResumeParams {
  id: string;
  producerId: string;
  kind: string;
  rtpParameters: any;
}

export interface ConsumerResumeOptions {
  track: MediaStreamTrack;
  kind: string;
  remoteProducerId: string;
  params: ResumeParams;
  parameters: ConsumerResumeParameters;
  nsock: Socket;
  consumer: Consumer;
}

// export the type definition for the function
export type ConsumerResumeType = (
  options: ConsumerResumeOptions
) => Promise<void>;

/**
 * Resumes a consumer transport by handling the provided track and updating the application state.
 * 
 * This function manages the resumption of media consumer transports (audio/video/screen) and updates
 * the UI accordingly. It supports custom UI components through both custom render functions and
 * component overrides, particularly for the MiniAudioPlayer component.
 *
 * Key responsibilities:
 * - Creates MediaStream from received track
 * - Updates stream arrays (audio, video, screen)
 * - Triggers UI updates through reorderStreams and prepopulateUserMedia
 * - Handles MiniAudioPlayer rendering for off-screen audio participants
 * - Manages consumer transport state
 *
 * @function
 * @async
 * @param {ConsumerResumeOptions} options - The options for resuming the consumer.
 * @param {MediaStreamTrack} options.track - The media stream track to resume (audio or video).
 * @param {string} options.remoteProducerId - The ID of the remote producer.
 * @param {ResumeParams} options.params - The parameters required for resuming the consumer.
 * @param {string} options.params.id - Consumer ID.
 * @param {string} options.params.producerId - Producer ID.
 * @param {string} options.params.kind - Media kind ('audio' or 'video').
 * @param {Object} options.params.rtpParameters - RTP parameters for the consumer.
 * @param {ConsumerResumeParameters} options.parameters - The parameters for updating the state.
 * @param {Socket} options.nsock - The socket instance for communication.
 * @param {Consumer} options.consumer - The consumer instance to resume.
 * 
 * **State Parameters:**
 * @param {MediaStream|null} options.parameters.nStream - New stream being processed.
 * @param {Array<Stream|Participant>} options.parameters.allAudioStreams - All audio streams in the session.
 * @param {Array<Stream|Participant>} options.parameters.allVideoStreams - All video streams in the session.
 * @param {Array<Stream>} options.parameters.streamNames - Named video streams.
 * @param {Array<Stream>} options.parameters.audStreamNames - Named audio streams.
 * @param {boolean} options.parameters.updateMainWindow - Whether to update main window.
 * @param {boolean} options.parameters.shared - Whether screen sharing is active.
 * @param {boolean} options.parameters.shareScreenStarted - Whether screen share has started.
 * @param {string} [options.parameters.screenId] - ID of screen sharing participant.
 * @param {Array<Participant>} options.parameters.participants - All session participants.
 * @param {EventType} options.parameters.eventType - Event type ('chat', 'broadcast', 'conference', 'webinar').
 * @param {string} options.parameters.meetingDisplayType - Display type ('video', 'media', 'all').
 * @param {boolean} options.parameters.mainScreenFilled - Whether main screen is occupied.
 * @param {boolean} options.parameters.first_round - Whether this is the first round of streaming.
 * @param {boolean} options.parameters.lock_screen - Whether screen is locked.
 * @param {Array<Stream|Participant>} options.parameters.oldAllStreams - Previous stream state.
 * @param {string} [options.parameters.adminVidID] - Admin's video ID.
 * @param {number} options.parameters.mainHeightWidth - Main screen dimensions.
 * @param {string} options.parameters.member - Current user's name.
 * @param {Array<JSX.Element>} options.parameters.audioOnlyStreams - Audio-only stream components.
 * @param {boolean} options.parameters.gotAllVids - Whether all videos have been received.
 * @param {boolean} options.parameters.defer_receive - Whether to defer receiving streams.
 * @param {boolean} options.parameters.firstAll - Whether this is first all-streams update.
 * @param {Array<Stream>} options.parameters.remoteScreenStream - Remote screen share streams.
 * @param {boolean} options.parameters.hostLabel - Host label visibility.
 * @param {boolean} options.parameters.whiteboardStarted - Whether whiteboard is active.
 * @param {boolean} options.parameters.whiteboardEnded - Whether whiteboard has ended.
 * @param {string} [options.parameters.recordingDisplayType] - Recording display type.
 * @param {string} options.parameters.recordingVideoOptimized - Recording optimization setting.
 * @param {Array<Object>} options.parameters.consumerTransports - Consumer transport array.
 * @param {string} options.parameters.islevel - User's participation level.
 * @param {MediaStream|null} options.parameters.localStreamVideo - Local video stream.
 * 
 * **Custom UI & Component Overrides:**
 * @param {React.ComponentType} [options.parameters.miniAudioComponent] - Component override for MiniAudio.
 *   This component is rendered within MiniAudioPlayer when an audio-only participant is not visible
 *   on the main grid. Use this to customize the mini audio player's waveform visualization.
 *   @example
 *   const CustomMiniAudio = ({ stream, name }) => (
 *     <View><Text>🎵 {name}</Text></View>
 *   );
 * 
 * @param {React.ComponentType} [options.parameters.videoCardComponent] - Component override for VideoCard.
 * @param {React.ComponentType} [options.parameters.audioCardComponent] - Component override for AudioCard.
 * @param {React.ComponentType} [options.parameters.miniCardComponent] - Component override for MiniCard.
 * @param {CustomVideoCardType} [options.parameters.customVideoCard] - Custom render function for video cards.
 * @param {CustomAudioCardType} [options.parameters.customAudioCard] - Custom render function for audio cards.
 * @param {CustomMiniCardType} [options.parameters.customMiniCard] - Custom render function for mini cards.
 *
 * **Callback Functions:**
 * @param {Function} options.parameters.updateNStream - Update new stream state.
 * @param {Function} options.parameters.updateAllAudioStreams - Update all audio streams.
 * @param {Function} options.parameters.updateAllVideoStreams - Update all video streams.
 * @param {Function} options.parameters.updateStreamNames - Update named video streams.
 * @param {Function} options.parameters.updateAudStreamNames - Update named audio streams.
 * @param {Function} options.parameters.updateUpdateMainWindow - Update main window state.
 * @param {Function} options.parameters.updateAudioOnlyStreams - Update audio-only components.
 * @param {Function} options.parameters.updateGotAllVids - Update all videos received state.
 * @param {Function} options.parameters.updateDefer_receive - Update defer receive state.
 * @param {Function} options.parameters.updateFirstAll - Update first all state.
 * @param {Function} options.parameters.updateRemoteScreenStream - Update remote screen streams.
 * @param {Function} options.parameters.updateOldAllStreams - Update previous streams state.
 * @param {Function} options.parameters.updateConsumerTransports - Update consumer transports.
 * @param {Function} options.parameters.reorderStreams - Function to reorder stream display.
 * @param {Function} options.parameters.prepopulateUserMedia - Function to populate user media grid.
 * @param {Function} options.parameters.getUpdatedAllParams - Get updated parameters.
 *
 * @returns {Promise<void>} A promise that resolves when the consumer is successfully resumed.
 *
 * @throws {Error} Throws an error if the resumption fails or if there is an issue with the parameters.
 *
 * @example
 * // Basic usage
 * import { consumerResume } from 'mediasfu-reactnative-expo';
 *
 * await consumerResume({
 *   track: audioTrack,
 *   remoteProducerId: 'producer-123',
 *   params: {
 *     id: 'consumer-456',
 *     producerId: 'producer-123',
 *     kind: 'audio',
 *     rtpParameters: rtpParams,
 *   },
 *   consumer: consumerInstance,
 *   nsock: socketInstance,
 *   parameters: {
 *     eventType: 'conference',
 *     participants: allParticipants,
 *     // ... other required parameters
 *   },
 * });
 *
 * @example
 * // With custom MiniAudio component for off-screen audio visualization
 * import { consumerResume } from 'mediasfu-reactnative-expo';
 * import { CustomMiniAudio } from './components/CustomMiniAudio';
 *
 * await consumerResume({
 *   track: audioTrack,
 *   remoteProducerId: 'producer-123',
 *   params: {
 *     id: 'consumer-456',
 *     producerId: 'producer-123',
 *     kind: 'audio',
 *     rtpParameters: rtpParams,
 *   },
 *   consumer: consumerInstance,
 *   nsock: socketInstance,
 *   parameters: {
 *     miniAudioComponent: CustomMiniAudio, // Custom audio waveform component
 *     eventType: 'conference',
 *     participants: allParticipants,
 *     // ... other parameters
 *   },
 * });
 *
 * @example
 * // With full component override suite
 * import { consumerResume } from 'mediasfu-reactnative-expo';
 *
 * await consumerResume({
 *   track: videoTrack,
 *   remoteProducerId: 'producer-789',
 *   params: {
 *     id: 'consumer-101',
 *     producerId: 'producer-789',
 *     kind: 'video',
 *     rtpParameters: rtpParams,
 *   },
 *   consumer: consumerInstance,
 *   nsock: socketInstance,
 *   parameters: {
 *     audioOnlyStreams: [],
 *     gotAllVids: false,
 *     defer_receive: false,
 *     firstAll: false,
 *     remoteScreenStream: [],
 *     hostLabel: 'host',
 *     whiteboardStarted: false,
 *     whiteboardEnded: false,
 *     updateUpdateMainWindow: (value) => { console.log('updated')},
 *     updateAllAudioStreams: (streams) => { console.log('updated')},
 *     updateAllVideoStreams: (streams) => { console.log('updated')},
 *     updateStreamNames: (streams) => { console.log('updated')},
 *     updateAudStreamNames: (streams) => { console.log('updated')},
 *     updateNStream: (stream) => { console.log('updated')},
 *     updateMainHeightWidth: (value) => { console.log('updated')},
 *     updateLock_screen: (value) => { console.log('updated')},
 *     updateFirstAll: (value) => { console.log('updated')},
 *     updateRemoteScreenStream: (streams) => { console.log('updated')},
 *     updateOldAllStreams: (streams) => { console.log('updated')},
 *     updateAudioOnlyStreams: (streams) => { console.log('updated')},
 *     updateShareScreenStarted: (value) => { console.log('updated')},
 *     updateGotAllVids: (value) => { console.log('updated')},
 *     updateScreenId: (id) => { console.log('updated')},
 *     updateDefer_receive: (value) => { console.log('updated')},
 *     reorderStreams: (params) => { console.log('reordered') }
 *     prepopulateUserMedia: (params) => { console.log('prepopulated') },
 *   },
 *   nsock: socketInstance,
 * };
 * 
 * consumerResume(options)
 *   .then(() => {
 *     console.log('Consumer resumed successfully');
 *   })
 *   .catch((error) => {
 *     console.error('Error resuming consumer:', error);
 *   });
 */


export const consumerResume = async ({
  track,
  remoteProducerId,
  params,
  parameters,
  nsock,
  consumer,
}: ConsumerResumeOptions): Promise<void> => {
  try {
    // Get updated parameters
    parameters = parameters.getUpdatedAllParams();

    // Destructure parameters
    let {
      nStream,
      allAudioStreams,
      allVideoStreams,
      streamNames,
      audStreamNames,
      updateMainWindow,
      shared,
      shareScreenStarted,
      screenId,
      participants,
      eventType,
      meetingDisplayType,
      mainScreenFilled,
      first_round,
      lock_screen,
      oldAllStreams,

      adminVidID,
      mainHeightWidth,
      member,
      audioOnlyStreams,
      gotAllVids,
      defer_receive,
      firstAll,
      remoteScreenStream,
      hostLabel,
      whiteboardStarted,
      whiteboardEnded,
      videoCardComponent,
      audioCardComponent,
      miniCardComponent,
      miniAudioComponent,
      miniAudioPlayerComponent,
      
      updateUpdateMainWindow,
      updateAllAudioStreams,
      updateAllVideoStreams,
      updateStreamNames,
      updateAudStreamNames,
      updateNStream,
      updateMainHeightWidth,
      updateLock_screen,
      updateFirstAll,
      updateRemoteScreenStream,
      updateOldAllStreams,
      updateAudioOnlyStreams,
      updateShareScreenStarted,
      updateGotAllVids,
      updateScreenId,
      updateDefer_receive,

      // mediasfu functions
      reorderStreams,
      prepopulateUserMedia,
    } = parameters;

    const MiniAudioComponentToUse = miniAudioComponent ?? MiniAudio;
    const MiniAudioPlayerComponentToUse = miniAudioPlayerComponent ?? MiniAudioPlayer;

    if (params.kind === 'audio') {
      // Audio resumed

      // Check if the participant with audioID == remoteProducerId has a valid videoID
      const participant = participants.filter(
        (p) => p.audioID === remoteProducerId,
      );
      const name__ = participant.length > 0 ? participant[0].name || '' : '';

      if (name__ === member) return;

      // find any participants with ScreenID not null and ScreenOn == true
      const screenParticipant_alt = participants.filter(
        (participant) => participant.ScreenID != null
          && participant.ScreenOn == true
          && participant.ScreenID != '',
      );
      if (screenParticipant_alt.length > 0) {
        screenId = screenParticipant_alt[0].ScreenID;
        updateScreenId(screenId!);
        if (!shared) {
          shareScreenStarted = true;
          updateShareScreenStarted(shareScreenStarted);
        }
      } else if (whiteboardStarted && !whiteboardEnded) {
        // Whiteboard is active
      } else {
        screenId = '';
        updateScreenId(screenId);
        updateShareScreenStarted(false);
      }

      // Media display and UI update to prioritize audio/video
      nStream = new NativeMediaStream([track]);
      updateNStream(nStream);

      // Create MiniAudioPlayer track
      const nTrack = (
        <MiniAudioPlayerComponentToUse
          stream={nStream}
          remoteProducerId={remoteProducerId}
          parameters={parameters}
          consumer={consumer}
          MiniAudioComponent={MiniAudioComponentToUse}
          miniAudioProps={{
            customStyle: { backgroundColor: 'gray' },
            name: name__,
            showWaveform: true,
            overlayPosition: 'topRight',
            barColor: 'white',
            textColor: 'white',
            imageSource: 'https://mediasfu.com/images/logo192.png',
            roundedImage: true,
            imageStyle: {},
          }}
        />
      );

      // Add to audioOnlyStreams array
      audioOnlyStreams.push(nTrack);
      updateAudioOnlyStreams(audioOnlyStreams);

      // Add to allAudioStreams array; add producerId, stream
      allAudioStreams = [
        ...allAudioStreams,
        { producerId: remoteProducerId, stream: nStream },
      ];
      updateAllAudioStreams(allAudioStreams);

      let name;

      try {
        name = participant[0].name;
      } catch {
        name = '';
      }

      if (name) {
        // Add to audStreamNames array; add producerId, name
        audStreamNames = [
          ...audStreamNames,
          { producerId: remoteProducerId, name: name__ },
        ];
        updateAudStreamNames(audStreamNames);

        if (!mainScreenFilled && participant[0].islevel === '2') {
          updateMainWindow = true;
          updateUpdateMainWindow(updateMainWindow);
          await prepopulateUserMedia({
            name: hostLabel,
            parameters: { ...parameters, audStreamNames, allAudioStreams, videoCardComponent, audioCardComponent, miniCardComponent },
          });
          updateMainWindow = false;
          updateUpdateMainWindow(updateMainWindow);
        }
      } else {
        return;
      }

      // Checks for display type and updates the UI
      let checker;
      let alt_checker = false;

      if (meetingDisplayType == 'video') {
        checker = participant[0].videoID != null
          && participant[0].videoID != ''
          && participant[0].videoID != undefined;
      } else {
        checker = true;
        alt_checker = true;
      }

      if (checker) {
        if (shareScreenStarted || shared) {
          if (!alt_checker) {
            await reorderStreams({
              parameters: { ...parameters, audStreamNames, allAudioStreams },
            });
          }
        } else if (alt_checker && meetingDisplayType != 'video') {
          await reorderStreams({
            add: false,
            screenChanged: true,
            parameters: { ...parameters, audStreamNames, allAudioStreams },
          });
        }
      }
    } else {
      // Video resumed
      nStream = new NativeMediaStream([track]);
      updateNStream(nStream);

      // find any participants with ScreenID not null and ScreenOn == true
      const screenParticipant_alt = participants.filter(
        (participant) => participant.ScreenID != null
          && participant.ScreenOn == true
          && participant.ScreenID != '',
      );
      if (screenParticipant_alt.length > 0) {
        screenId = screenParticipant_alt[0].ScreenID;
        updateScreenId(screenId!);
        if (!shared) {
          shareScreenStarted = true;
          updateShareScreenStarted(shareScreenStarted);
        }
      } else if (whiteboardStarted && !whiteboardEnded) {
        // Whiteboard is active
      } else {
        screenId = '';
        updateScreenId(screenId);
        updateShareScreenStarted(false);
      }

      // Check for display type and update the UI
      if (remoteProducerId == screenId) {
        // Put on main screen for screen share
        updateMainWindow = true;
        updateUpdateMainWindow(updateMainWindow);
        remoteScreenStream = [
          { producerId: remoteProducerId, stream: nStream },
        ];
        updateRemoteScreenStream(remoteScreenStream);

        if (eventType == 'conference') {
          if (shared || shareScreenStarted) {
            if (mainHeightWidth == 0) {
              updateMainHeightWidth(84);
            }
          } else if (mainHeightWidth > 0) {
            updateMainHeightWidth(0);
          }
        }

        if (!lock_screen) {
          await prepopulateUserMedia({ name: hostLabel, parameters: { ...parameters, videoCardComponent, audioCardComponent, miniCardComponent } });
          await reorderStreams({
            add: false,
            screenChanged: true,
            parameters: { ...parameters, remoteScreenStream, allVideoStreams },
          });
        } else if (!first_round) {
          await prepopulateUserMedia({
            name: hostLabel,
            parameters: {
              ...parameters,
              remoteScreenStream,
              allVideoStreams,
              videoCardComponent,
              audioCardComponent,
              miniCardComponent,
            },
          });
          await reorderStreams({
            add: false,
            screenChanged: true,
            parameters: {
              ...parameters,
              remoteScreenStream,
              allVideoStreams,
            },
          });
        }

        lock_screen = true;
        updateLock_screen(lock_screen);
        firstAll = true;
        updateFirstAll(firstAll);
      } else {
        // Non-screen share video resumed

        // Operations to add video to the UI (either main screen or mini screen)
        parameters = parameters.getUpdatedAllParams();

        // Get the name of the participant with videoID == remoteProducerId
        const participant = participants.filter(
          (participant) => participant.videoID == remoteProducerId,
        );

        if (
          participant.length > 0
          && participant[0].name != null
          && participant[0].name != ''
          && participant[0].name != undefined
          && participant[0].name !== member
        ) {
          allVideoStreams = [
            ...allVideoStreams,
            { producerId: remoteProducerId, stream: nStream, socket_: nsock },
          ];
          updateAllVideoStreams(allVideoStreams);
        }

        if (participant.length > 0) {
          const { name } = participant[0];
          streamNames = [
            ...streamNames,
            { producerId: remoteProducerId, name: name || '' },
          ];
          updateStreamNames(streamNames);
        }

        // If not screenshare, filter out the stream that belongs to the participant with isAdmin = true and islevel == '2' (host)
        // Find the ID of the participant with isAdmin = true and islevel == '2'
        if (!shareScreenStarted) {
          const admin = participants.filter(
            (participant) => (participant.isAdmin == true || participant.isHost == true) && participant.islevel == '2'
          );
          // Remove video stream with producerId == admin.id
          // Get the videoID of the admin

          if (admin.length > 0) {
            adminVidID = admin[0].videoID;

            if (adminVidID != null && adminVidID != '') {
              let oldAllStreams_: (Stream | Participant)[] = [];
              // Check if the length of allVideoStreams is > 0
              if (oldAllStreams.length > 0) {
                oldAllStreams_ = oldAllStreams;
              }

              oldAllStreams = allVideoStreams.filter(
                (streame) => streame.producerId == adminVidID,
              );
              updateOldAllStreams(oldAllStreams);

              if (oldAllStreams.length < 1) {
                oldAllStreams = oldAllStreams_;
                updateOldAllStreams(oldAllStreams);
              }

              allVideoStreams = allVideoStreams.filter(
                (streame) => streame.producerId != adminVidID,
              );
              updateAllVideoStreams(allVideoStreams);

              if (remoteProducerId == adminVidID) {
                updateMainWindow = true;
              }
            }

            gotAllVids = true;
            updateGotAllVids(gotAllVids);
          }
        } else {
          // Check if the videoID is either that of the admin or that of the screen participant
          const screenParticipant = participants.filter(
            (participant) => participant.ScreenID == screenId,
          );

          // See if producerId is that of admin videoID or screenParticipant videoID
          let adminVidID;

          let screenParticipantVidID;
          if (screenParticipant.length > 0) {
            screenParticipantVidID = screenParticipant[0].videoID;
          }

          if (
            (adminVidID != null && adminVidID != '')
            || (screenParticipantVidID != null && screenParticipantVidID != '')
          ) {
            if (
              adminVidID == remoteProducerId
              || screenParticipantVidID == remoteProducerId
            ) {
              await reorderStreams({
                parameters: { ...parameters, allVideoStreams },
              });
              return;
            }
          }
        }

        // Update the UI
        if (lock_screen || shared) {
          defer_receive = true;
          updateDefer_receive(defer_receive);

          if (!first_round) {
            await reorderStreams({
              add: false,
              screenChanged: true,
              parameters: { ...parameters, allVideoStreams },
            });
          }
        } else {
          await reorderStreams({
            add: false,
            screenChanged: true,
            parameters: { ...parameters, allVideoStreams },
          });
        }
      }
    }
  } catch (error) {
    console.log('consumerResume error', error);
    // throw error;
  }
};
