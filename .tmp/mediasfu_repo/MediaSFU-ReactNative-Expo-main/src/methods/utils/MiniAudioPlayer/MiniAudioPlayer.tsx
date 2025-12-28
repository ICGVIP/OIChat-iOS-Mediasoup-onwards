import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

import { RTCView } from '../webrtc/webrtc';

import {
  ReUpdateInterType,
  UpdateParticipantAudioDecibelsType,
  ReUpdateInterParameters,
  BreakoutParticipant,
  Participant,
  MediaStream,
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
  stream: MediaStream | null;
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
 * MiniAudioPlayer component renders audio streams and optional audio waveform visualization.
 * 
 * This component is used to display and play audio for participants who are not currently visible
 * in the main video grid. It supports component override for the MiniAudio visualization component,
 * allowing full customization of the audio waveform display.
 *
 * The component handles:
 * - Audio stream playback through RTCView
 * - Audio level monitoring and decibel calculations
 * - Optional waveform visualization through MiniAudio component
 * - Breakout room audio filtering
 * - Automatic audio level updates
 *
 * @component
 * @param {MiniAudioPlayerOptions} props - The properties for the MiniAudioPlayer component.
 * @param {MediaStream | null} props.stream - The media stream to be played by the audio player.
 *   This should be an audio MediaStream from a remote participant.
 * @param {Consumer} props.consumer - The mediasoup consumer object for consuming media.
 *   Used to access producer information and track state.
 * @param {string} props.remoteProducerId - The ID of the remote producer.
 *   Used to identify which participant's audio is being played.
 * @param {MiniAudioPlayerParameters} props.parameters - The parameters object containing various settings and methods.
 * @param {Function} props.parameters.getUpdatedAllParams - Function to get updated parameters.
 * @param {Function} props.parameters.reUpdateInter - Function to re-update interaction parameters.
 *   Called periodically to update audio levels and UI state.
 * @param {Function} props.parameters.updateParticipantAudioDecibels - Function to update participant audio decibels.
 *   Updates the audio level state for the participant.
 * @param {boolean} props.parameters.breakOutRoomStarted - Flag indicating if the breakout room has started.
 * @param {boolean} props.parameters.breakOutRoomEnded - Flag indicating if the breakout room has ended.
 * @param {Array<BreakoutParticipant>} props.parameters.limitedBreakRoom - Array of limited breakout room participants.
 *   Used to filter audio in breakout room scenarios.
 * 
 * **Component Override:**
 * @param {React.ComponentType} [props.MiniAudioComponent] - An optional component to render for audio visualization.
 *   This component replaces the default MiniAudio component and receives audio stream data for
 *   custom waveform or audio level visualization. If not provided, the default MiniAudio component
 *   (or the one from parameters.miniAudioComponent) is used.
 *   @example
 *   const CustomWaveform = ({ stream, name, participant }) => (
 *     <View style={{ padding: 10, backgroundColor: '#1a1a1a' }}>
 *       <Text style={{ color: '#fff' }}>🎵 {name}</Text>
 *       {/* Custom audio visualization logic *\/}
 *     </View>
 *   );
 * 
 * @param {Object} [props.miniAudioProps] - Additional properties to pass to the MiniAudioComponent.
 *   These props are spread onto the MiniAudio component, allowing for additional customization.
 *
 * @returns {JSX.Element} The rendered MiniAudioPlayer component with audio stream and optional visualization.
 *
 * @example
 * // Basic usage with default MiniAudio component
 * import { MiniAudioPlayer } from 'mediasfu-reactnative-expo';
 *
 * <MiniAudioPlayer
 *   stream={audioStream}
 *   consumer={consumerInstance}
 *   remoteProducerId='producer-123'
 *   parameters={{
 *     getUpdatedAllParams: () => params,
 *     reUpdateInter: ({ name, add, average, parameters }) => {},
 *     updateParticipantAudioDecibels: ({ name, averageLoudness, parameters }) => {},
 *     breakOutRoomStarted: false,
 *     breakOutRoomEnded: false,
 *     limitedBreakRoom: [],
 *   }}
 * />
 *
 * @example
 * // With custom MiniAudio component override
 * import { MiniAudioPlayer } from 'mediasfu-reactnative-expo';
 * import { CustomAudioVisualizer } from './CustomAudioVisualizer';
 *
 * <MiniAudioPlayer
 *   stream={audioStream}
 *   consumer={consumerInstance}
 *   remoteProducerId='producer-123'
 *   parameters={{
 *     getUpdatedAllParams: () => params,
 *     reUpdateInter: ({ name, add, average, parameters }) => {},
 *     updateParticipantAudioDecibels: ({ name, averageLoudness, parameters }) => {},
 *     breakOutRoomStarted: false,
 *     breakOutRoomEnded: false,
 *     limitedBreakRoom: [],
 *   }}
 *   MiniAudioComponent={CustomAudioVisualizer}
 *   miniAudioProps={{ 
 *     showName: true,
 *     waveColor: '#00ff00',
 *     backgroundColor: '#000000'
 *   }}
 * />
 *
 * @example
 * // Using component override from parameters (typical in MediaSFU components)
 * import { MediasfuGeneric } from 'mediasfu-reactnative-expo';
 * import { MyCustomMiniAudio } from './components/MyCustomMiniAudio';
 *
 * <MediasfuGeneric
 *   credentials={credentials}
 *   // MiniAudioPlayer will automatically use this component override
 *   miniAudioComponent={MyCustomMiniAudio}
 * />
 *
 * @example
 * // Advanced: Custom audio visualizer with waveform animation
 * import React from 'react';
 * import { View, Text, Animated, StyleSheet } from 'react-native';
 *
 * const AnimatedAudioVisualizer = ({ stream, name, participant }) => {
 *   const [audioLevel, setAudioLevel] = React.useState(0);
 *   
 *   // Monitor audio level from stream
 *   React.useEffect(() => {
 *     // Audio level monitoring logic here
 *   }, [stream]);
 *
 *   return (
 *     <View style={styles.container}>
 *       <Text style={styles.name}>{name}</Text>
 *       <View style={styles.waveformContainer}>
 *         {[1, 2, 3, 4, 5].map(i => (
 *           <Animated.View 
 *             key={i}
 *             style={[
 *               styles.waveBar,
 *               { height: audioLevel * 40 * Math.random() }
 *             ]}
 *           />
 *         ))}
 *       </View>
 *     </View>
 *   );
 * };
 *
 * <MiniAudioPlayer
 *   stream={audioStream}
 *   consumer={consumerInstance}
 *   remoteProducerId='producer-456'
 *   parameters={parameters}
 *   MiniAudioComponent={AnimatedAudioVisualizer}
 * />
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
