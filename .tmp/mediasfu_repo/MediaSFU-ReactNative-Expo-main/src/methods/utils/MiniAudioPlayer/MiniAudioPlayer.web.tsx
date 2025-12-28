import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { RTCView } from '../webrtc/webrtc';

import {
  ReUpdateInterType,
  UpdateParticipantAudioDecibelsType,
  ReUpdateInterParameters,
  BreakoutParticipant,
  Participant,
  MediaStream as MediaStreamType,
} from '../../../@types/types';
import { Consumer } from 'mediasoup-client/lib/types';

export interface MiniAudioPlayerParameters extends ReUpdateInterParameters {
  breakOutRoomStarted: boolean;
  breakOutRoomEnded: boolean;
  limitedBreakRoom: BreakoutParticipant[];

  // mediasfu functions
  reUpdateInter: ReUpdateInterType;
  updateParticipantAudioDecibels: UpdateParticipantAudioDecibelsType;

  getUpdatedAllParams: () => MiniAudioPlayerParameters;
  [key: string]: any;
}

export interface MiniAudioPlayerOptions {
  stream: MediaStreamType | null;
  remoteProducerId: string;
  consumer: Consumer;
  parameters: MiniAudioPlayerParameters;
  MiniAudioComponent?: React.ComponentType<any>;
  miniAudioProps?: Record<string, any>;
}

export type MiniAudioPlayerType = (
  options: MiniAudioPlayerOptions
) => JSX.Element;

/**
 * MiniAudioPlayer component for Web - Renders audio streams with optional waveform visualization.
 * 
 * Platform-specific implementation optimized for web browsers. Supports component override
 * for the MiniAudio visualization component, enabling custom audio waveform displays.
 *
 * @component
 * @platform web
 * @param {MiniAudioPlayerOptions} props - The properties for the MiniAudioPlayer component.
 * @param {MediaStream | null} props.stream - The media stream to be played by the audio player.
 * @param {Consumer} props.consumer - The consumer object for consuming media.
 * @param {string} props.remoteProducerId - The ID of the remote producer.
 * @param {MiniAudioPlayerParameters} props.parameters - The parameters object containing various settings and methods.
 * @param {React.ComponentType} [props.MiniAudioComponent] - Optional component override for audio visualization.
 *   Replaces the default MiniAudio component with your custom visualization component.
 * @param {Object} [props.miniAudioProps] - Additional properties to pass to the MiniAudioComponent.
 *
 * @returns {JSX.Element} The rendered MiniAudioPlayer component optimized for web browsers.
 * 
 * @see {@link MiniAudioPlayer} for complete documentation and usage examples.
 *
 * @example
 * ```tsx
 * // Import and use MiniAudioPlayer in a React component
 * import { MiniAudioPlayer } from 'mediasfu-reactnative-expo';
 *
 * const WaveformVisualizer = ({ stream }: { stream: MediaStream }) => (
 *   <canvas width='300' height='50' />
 * );
 *
 * const App = () => {
 *   const stream = useMediaStream(); // Custom hook to get MediaStream
 *   const parameters = {
 *     // Mocked parameters with required functions
 *     getUpdatedAllParams: () => updatedParameters,
 *     reUpdateInter: () => {},
 *     updateParticipantAudioDecibels: () => {},
 *     breakOutRoomStarted: false,
 *     breakOutRoomEnded: false,
 *     limitedBreakRoom: [],
 *   };
 *
 *   return (
 *     <MiniAudioPlayer
 *       stream={stream}
 *       consumer={consumer}
 *       remoteProducerId='producer123'
 *       parameters={parameters}
 *       MiniAudioComponent={WaveformVisualizer}
 *       miniAudioProps={{ color: 'blue' }}
 *     />
 *   );
 * };
 * ```
 */

const MiniAudioPlayer: React.FC<MiniAudioPlayerOptions> = ({
  stream,
  remoteProducerId,
  consumer,
  parameters,
  MiniAudioComponent,
  miniAudioProps,
}) => {
  const { getUpdatedAllParams } = parameters;

  parameters = getUpdatedAllParams();
  const {
    reUpdateInter,
    updateParticipantAudioDecibels,
    breakOutRoomStarted,
    breakOutRoomEnded,
    limitedBreakRoom,
  } = parameters;

  const parameterMiniAudioComponent = parameters
    .miniAudioComponent as React.ComponentType<any> | undefined;
  const resolvedMiniAudioComponent =
    MiniAudioComponent ?? parameterMiniAudioComponent;

  const [showWaveModal, setShowWaveModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const autoWaveCheck = useRef<boolean>(false);

  useEffect(() => {
    if (stream) {
      let consLow: boolean = false;
      let averageLoudness: number = 128;

      const intervalId = setInterval(() => {
        try {
          const receiver = consumer.rtpReceiver;
          receiver?.getStats().then((stats) => {
            stats.forEach((report) => {
              if (
                report.type === 'inbound-rtp' &&
                report.kind === 'audio' &&
                report.audioLevel
              ) {
                averageLoudness = 127.5 + report.audioLevel * 127.5;
              }
            });
          });
        } catch {
          // Do nothing
        }


        const updatedParams = getUpdatedAllParams();
        let {
          eventType,
          meetingDisplayType,
          shared,
          shareScreenStarted,
          dispActiveNames,
          adminNameStream,
          participants,
          activeSounds,
          autoWave,
          updateActiveSounds,
          paginatedStreams,
          currentUserPage,
        } = updatedParams;

        const participant = participants.find(
          (obj: Participant) => obj.audioID === remoteProducerId
        );

        let audioActiveInRoom = true;
        if (participant) {
          if (breakOutRoomStarted && !breakOutRoomEnded) {
            if (
              participant.name &&
              !limitedBreakRoom
                .map((obj) => obj.name)
                .includes(participant.name)
            ) {
              audioActiveInRoom = false;
            }
          }
        }

        if (meetingDisplayType !== 'video') {
          autoWaveCheck.current = true;
        }
        if (shared || shareScreenStarted) {
          autoWaveCheck.current = false;
        }

        if (participant) {
          setIsMuted(participant.muted ?? false);

          if (eventType !== 'chat' && eventType !== 'broadcast') {
            updateParticipantAudioDecibels({
              name: participant.name ?? '',
              averageLoudness,
              audioDecibels: updatedParams.audioDecibels,
              updateAudioDecibels: updatedParams.updateAudioDecibels,
            });
          }

          const inPage =
            paginatedStreams[currentUserPage]?.findIndex(
              (obj: any) => obj.name === participant.name
            ) ?? -1;

          if (
            participant.name &&
            !dispActiveNames.includes(participant.name) &&
            inPage == -1
          ) {
            autoWaveCheck.current = false;
            if (!adminNameStream) {
              const adminParticipant = participants.find(
                (obj: any) => obj.islevel == '2'
              );
              adminNameStream = adminParticipant ? adminParticipant.name : '';
            }

            if (participant.name == adminNameStream) {
              autoWaveCheck.current = true;
            }
          } else {
            autoWaveCheck.current = true;
          }

          if (
            participant.videoID ||
            autoWaveCheck.current ||
            (breakOutRoomStarted && !breakOutRoomEnded && audioActiveInRoom)
          ) {
            setShowWaveModal(false);

            if (averageLoudness > 127.5) {
              if (
                participant.name &&
                !activeSounds.includes(participant.name)
              ) {
                activeSounds.push(participant.name);
                consLow = false;

                if (!(shareScreenStarted || shared) || participant.videoID) {
                  if (
                    eventType !== 'chat' &&
                    eventType !== 'broadcast' &&
                    participant.name
                  ) {
                    reUpdateInter({
                      name: participant.name ?? '',
                      add: true,
                      average: averageLoudness,
                      parameters: updatedParams,
                    });
                  }
                }
              }
            } else if (
              participant.name &&
              activeSounds.includes(participant.name) &&
              consLow
            ) {
              activeSounds.splice(activeSounds.indexOf(participant.name), 1);
              if (!(shareScreenStarted || shared) || participant.videoID) {
                if (
                  eventType !== 'chat' &&
                  eventType !== 'broadcast' &&
                  participant.name
                ) {
                  reUpdateInter({
                    name: participant.name ?? '',
                    average: averageLoudness,
                    parameters: updatedParams,
                  });
                }
              }
            } else {
              consLow = true;
            }
          } else if (averageLoudness > 127.5) {
            if (!autoWave) {
              setShowWaveModal(false);
            } else {
              setShowWaveModal(true);
            }

            if (participant.name && !activeSounds.includes(participant.name)) {
              activeSounds.push(participant.name);
            }
            if ((shareScreenStarted || shared) && !participant.videoID) {
              /* empty */
            } else if (
              eventType != 'chat' &&
              eventType != 'broadcast' &&
              participant.name
            ) {
              reUpdateInter({
                name: participant.name,
                add: true,
                average: averageLoudness,
                parameters: updatedParams,
              });
            }
          } else {
            setShowWaveModal(false);
            if (participant.name && activeSounds.includes(participant.name)) {
              activeSounds.splice(activeSounds.indexOf(participant.name), 1);
            }
            if ((shareScreenStarted || shared) && !participant.videoID) {
              /* empty */
            } else if (
              eventType != 'chat' &&
              eventType != 'broadcast' &&
              participant.name
            ) {
              reUpdateInter({
                name: participant.name,
                average: averageLoudness,
                parameters: updatedParams,
              });
            }
          }

          updateActiveSounds(activeSounds);
        } else {
          setShowWaveModal(false);
          setIsMuted(true);
        }
      }, 2000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [stream]);

  const renderMiniAudioComponent = (): JSX.Element | null => {
    if (resolvedMiniAudioComponent) {
      const MiniAudioComponentToRender = resolvedMiniAudioComponent;
      return (
        <MiniAudioComponentToRender
          showWaveform={showWaveModal}
          visible={showWaveModal && !isMuted}
          {...miniAudioProps}
        />
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* RTCView for displaying the audio stream */}
      {!isMuted && stream && Platform.OS === 'web' ? (
        <RTCView stream={stream} style={styles.audioPlayer} />
      ) : !isMuted && stream ? (
        <RTCView streamURL={stream?.toURL()} style={styles.audioPlayer} />
      ) : null}
      {renderMiniAudioComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 9,
    zIndex: 9,
  },
  audioPlayer: {
    width: 0,
    height: 0,
  },
});

export default MiniAudioPlayer;
