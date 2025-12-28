// AudioCard.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Pressable,
  Platform,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import { Socket } from 'socket.io-client';
import { getOverlayPosition } from '../../methods/utils/getOverlayPosition';
import MiniCard from './MiniCard';
import { controlMedia } from '../../consumers/controlMedia';
import {
  ControlsPosition,
  InfoPosition,
  Participant,
  ControlMediaOptions,
  AudioDecibels,
  CoHostResponsibility,
  ShowAlert,
  CustomAudioCardType,
} from '../../@types/types';

/**
 * Interface defining the parameters required by the AudioCard component.
 * 
 * These parameters provide the context and state needed for audio display,
 * participant management, and media controls.
 * 
 * @interface AudioCardParameters
 * @property {AudioDecibels[]} audioDecibels - Array of audio level data for all participants (used for waveform visualization)
 * @property {Participant[]} participants - Array of all participants in the session
 * @property {Socket} socket - Socket.io client instance for real-time communication
 * @property {CoHostResponsibility[]} coHostResponsibility - Array of responsibilities assigned to co-hosts
 * @property {string} roomName - Name/ID of the current room session
 * @property {ShowAlert} [showAlert] - Optional function to display alerts/notifications
 * @property {string} coHost - User ID of the co-host
 * @property {string} islevel - Current user's level/role (e.g., '0', '1', '2')
 * @property {string} member - Current user's member ID
 * @property {string} eventType - Type of event ('conference', 'webinar', 'broadcast', etc.)
 * @property {() => AudioCardParameters} getUpdatedAllParams - Function to retrieve latest parameter state
 */
export interface AudioCardParameters {
  audioDecibels: AudioDecibels[];
  participants: Participant[];
  socket: Socket;
  coHostResponsibility: CoHostResponsibility[];
  roomName: string;
  showAlert?: ShowAlert;
  coHost: string;
  islevel: string;
  member: string;
  eventType: string;

  // mediasfu functions
  getUpdatedAllParams(): AudioCardParameters;
}

/**
 * Interface defining the options for the AudioCard component.
 * 
 * AudioCard displays a participant in audio-only mode with waveform visualization,
 * participant info, and optional media controls.
 * 
 * @interface AudioCardOptions
 * 
 * **Core Display Properties:**
 * @property {string} name - Participant's display name
 * @property {Participant} participant - Complete participant object with metadata
 * @property {AudioDecibels} [audioDecibels] - Audio level data for this participant's waveform
 * 
 * **Styling Properties:**
 * @property {StyleProp<ViewStyle>} [customStyle] - Custom styles for the card container
 * @property {object} [style] - Additional style object for the container
 * @property {string} [backgroundColor] - Background color (default: '#2c678f')
 * @property {string} [barColor] - Color of the audio waveform bars (default: 'red')
 * @property {string} [textColor] - Color of text overlays (default: 'white')
 * 
 * **Image/Avatar Properties:**
 * @property {string} [imageSource] - URI for participant's avatar image
 * @property {boolean} [roundedImage] - Whether to display avatar with rounded corners (default: false)
 * @property {StyleProp<ImageStyle>} [imageStyle] - Custom styles for the avatar image
 * 
 * **Controls & Info Properties:**
 * @property {boolean} [showControls] - Whether to show media control buttons (default: true)
 * @property {boolean} [showInfo] - Whether to show participant info overlay (default: true)
 * @property {React.ReactNode} [videoInfoComponent] - Custom component for info overlay
 * @property {React.ReactNode} [videoControlsComponent] - Custom component for controls
 * @property {ControlsPosition} [controlsPosition] - Position of controls overlay (default: 'topLeft')
 * @property {InfoPosition} [infoPosition] - Position of info overlay (default: 'bottomLeft')
 * 
 * **Media Control:**
 * @property {(options: ControlMediaOptions) => Promise<void>} [controlUserMedia] - Function to control user media settings (default: controlMedia)
 * 
 * **State Parameters:**
 * @property {AudioCardParameters} parameters - State and context parameters for the card
 * 
 * **Custom UI Override:**
 * @property {CustomAudioCardType} [customAudioCard] - Custom render function for complete card replacement.
 *   When provided, this function receives all AudioCardOptions and returns custom JSX.Element.
 *   This allows full control over the audio card's appearance and behavior.
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContent]
 *   Function to wrap or replace the default card content while preserving container
 * @property {(options: { defaultContainer: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace the entire card container
 */
export interface AudioCardOptions {
  controlUserMedia?: (options: ControlMediaOptions) => Promise<void>;
  customStyle?: StyleProp<ViewStyle>;
  name: string;
  barColor?: string;
  textColor?: string;
  imageSource?: string;
  roundedImage?: boolean;
  imageStyle?: StyleProp<ImageStyle>;
  showControls?: boolean;
  showInfo?: boolean;
  videoInfoComponent?: React.ReactNode;
  videoControlsComponent?: React.ReactNode;
  controlsPosition?: ControlsPosition;
  infoPosition?: InfoPosition;
  participant: Participant;
  backgroundColor?: string;
  audioDecibels?: AudioDecibels;
  parameters: AudioCardParameters;
  customAudioCard?: CustomAudioCardType;

  /**
   * Optional custom style to apply to the container.
   */
  style?: object;

  /**
   * Optional function to render custom content, receiving the default content and dimensions.
   */
  renderContent?: (options: {
    defaultContent: React.ReactNode;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;

  /**
   * Optional function to render a custom container, receiving the default container and dimensions.
   */
  renderContainer?: (options: {
    defaultContainer: React.ReactNode;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;
}

export type AudioCardType = (options: AudioCardOptions) => JSX.Element;

/**
 * AudioCard - Displays a participant in audio-only mode with waveform and controls
 * 
 * AudioCard is a specialized React Native component for displaying participants in
 * audio-only scenarios. It renders an avatar/image with an animated audio waveform,
 * participant info overlay, and optional media control buttons. The component is ideal
 * for audio-focused events, participants with video off, or compact grid layouts.
 * 
 * **Key Features:**
 * - Animated audio waveform visualization based on real-time decibel levels
 * - Avatar/image display with optional rounded corners
 * - Optional control buttons for muting/video toggling
 * - Participant info overlay with customizable positioning
 * - Fallback to MiniCard for compact display
 * - Responsive layout with custom styling support
 * 
 * **UI Customization - Two-Tier Override System:**
 * 
 * 1. **Custom Render Function** (via `customAudioCard` prop):
 *    Pass a function that receives all AudioCardOptions and returns custom JSX.
 *    Provides complete control over rendering logic and appearance.
 * 
 * 2. **Component Override** (via `uiOverrides.audioCardComponent`):
 *    Replace the entire AudioCard component while preserving MediaSFU's orchestration.
 *    Useful when you want a different component implementation.
 * 
 * **Advanced Render Overrides:**
 * - `renderContent`: Wrap/modify the card's inner content while keeping container
 * - `renderContainer`: Wrap/modify the entire card container
 * 
 * @component
 * @param {AudioCardOptions} props - Configuration options for the AudioCard component
 * 
 * @returns {JSX.Element} Rendered audio card with waveform, avatar, and controls
 * 
 * @example
 * // Basic usage - Display participant audio card with default styling
 * import React from 'react';
 * import { AudioCard } from 'mediasfu-reactnative-expo';
 * import { Socket } from 'socket.io-client';
 * 
 * const socket = Socket('https://example.com');
 * 
 * function AudioParticipantGrid() {
 *   return (
 *     <AudioCard
 *       name="Alice Johnson"
 *       participant={{
 *         name: 'Alice Johnson',
 *         id: '456',
 *         videoOn: false,
 *         muted: false,
 *         audioID: 'audio_123',
 *       }}
 *       audioDecibels={{ name: 'Alice Johnson', averageLoudness: 50 }}
 *       parameters={{
 *         audioDecibels: [{ name: 'Alice Johnson', averageLoudness: 50 }],
 *         participants: [{ name: 'Alice Johnson', id: '456', videoOn: false, muted: false }],
 *         socket,
 *         coHostResponsibility: [],
 *         roomName: 'room1',
 *         coHost: 'coHostId',
 *         islevel: '1',
 *         member: '456',
 *         eventType: 'conference',
 *         getUpdatedAllParams: () => ({ ...params }),
 *       }}
 *       backgroundColor="#2c678f"
 *       barColor="red"
 *       textColor="white"
 *       showControls={true}
 *       showInfo={true}
 *     />
 *   );
 * }
 * 
 * @example
 * // Custom styled audio card with avatar and custom colors
 * <AudioCard
 *   name="Bob Wilson"
 *   participant={currentParticipant}
 *   audioDecibels={{ name: 'Bob Wilson', averageLoudness: 65 }}
 *   parameters={sessionParams}
 *   backgroundColor="#1a1a2e"
 *   barColor="#0f3460"
 *   textColor="#e94560"
 *   imageSource="https://example.com/avatar/bob.jpg"
 *   roundedImage={true}
 *   showControls={true}
 *   showInfo={true}
 *   controlsPosition="bottomRight"
 *   infoPosition="topLeft"
 *   customStyle={{ borderRadius: 12, margin: 8, borderWidth: 2, borderColor: '#e94560' }}
 * />
 * 
 * @example
 * // Custom audio card with custom render function
 * import { View, Text, Animated } from 'react-native';
 * 
 * const customAudioCard = (options: AudioCardOptions) => {
 *   const { name, participant, audioDecibels } = options;
 *   const volume = audioDecibels?.averageLoudness || 0;
 *   
 *   return (
 *     <View style={{ backgroundColor: '#000', padding: 15, borderRadius: 10 }}>
 *       <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{name}</Text>
 *       <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
 *         <Text style={{ color: '#888' }}>Volume: </Text>
 *         <View style={{ width: volume * 2, height: 5, backgroundColor: volume > 50 ? 'green' : 'yellow' }} />
 *       </View>
 *       {participant.muted && (
 *         <Text style={{ color: 'red', marginTop: 5 }}>🔇 Muted</Text>
 *       )}
 *     </View>
 *   );
 * };
 * 
 * <AudioCard
 *   name="Custom Audio Participant"
 *   participant={participant}
 *   audioDecibels={audioData}
 *   parameters={params}
 *   customAudioCard={customAudioCard}
 * />
 * 
 * @example
 * // Using uiOverrides for component-level customization
 * import { MyCustomAudioCard } from './MyCustomAudioCard';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     audioCardComponent: {
 *       component: MyCustomAudioCard,
 *       injectedProps: {
 *         theme: 'neon',
 *         showWaveform: true,
 *         animationSpeed: 'fast',
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomAudioCard.tsx
 * export const MyCustomAudioCard = (props: AudioCardOptions & { theme: string; showWaveform: boolean; animationSpeed: string }) => {
 *   const waveformColor = props.theme === 'neon' ? '#00ff00' : '#ff0000';
 *   
 *   return (
 *     <View style={{ padding: 10 }}>
 *       <Text style={{ color: waveformColor }}>{props.name}</Text>
 *       {props.showWaveform && (
 *         <Text>Audio Level: {props.audioDecibels?.averageLoudness || 0}</Text>
 *       )}
 *     </View>
 *   );
 * };
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { AudioCard } from 'mediasfu-reactnative-expo';
 * import { io } from 'socket.io-client';
 *
 * function App() {
 *   const socket = io('http://localhost:3000');
 *   
 *   return (
 *     <AudioCard
 *       name="John Doe"
 *       barColor="blue"
 *       textColor="white"
 *       imageSource="https://example.com/image.jpg"
 *       showControls={true}
 *       showInfo={true}
 *       participant={{ name: "John Doe", muted: false, videoOn: true }}
 *       parameters={{
 *         audioDecibels: [{ name: "John Doe", averageLoudness: 128 }],
 *         participants: [{ name: "John Doe" }],
 *         socket,
 *         coHostResponsibility: [],
 *         roomName: "Room 1",
 *         coHost: "Admin",
 *         islevel: "1",
 *         member: "12345",
 *         eventType: "meeting",
 *         showAlert: ({ message, type }) => console.log(message, type),
 *         getUpdatedAllParams: () => ({}),
 *       }}
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const AudioCard: React.FC<AudioCardOptions> = ({
  controlUserMedia = controlMedia,
  customStyle,
  name,
  barColor = 'red',
  textColor = 'white',
  imageSource,
  roundedImage = false,
  imageStyle,
  showControls = true,
  showInfo = true,
  videoInfoComponent,
  videoControlsComponent,
  controlsPosition = 'topLeft',
  infoPosition = 'bottomLeft',
  participant,
  backgroundColor,
  audioDecibels,
  parameters,
  customAudioCard,
  style,
  renderContent,
  renderContainer,
}) => {
  // State for animated waveform bars
  const [waveformAnimations] = useState<Animated.Value[]>(
    Array.from({ length: 9 }, () => new Animated.Value(0)),
  );

  const [showWaveform, setShowWaveform] = useState<boolean>(true);
  const { getUpdatedAllParams } = parameters;
  parameters = getUpdatedAllParams();

  useEffect(() => {
    // Interval to check audio decibels and participant status every second
    const interval = setInterval(() => {
      const { audioDecibels, participants } = parameters;

      const existingEntry = audioDecibels?.find((entry) => entry.name === name);
      const updatedParticipant = participants?.find((p) => p.name === name);

      // Conditions to animate or reset waveform
      if (
        existingEntry &&
        existingEntry.averageLoudness > 127.5 &&
        updatedParticipant &&
        !updatedParticipant.muted
      ) {
        animateWaveform();
      } else {
        resetWaveform();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [audioDecibels]);

  useEffect(() => {
    if (participant?.muted) {
      setShowWaveform(false);
      resetWaveform();
    } else {
      setShowWaveform(true);
    }
  }, [participant?.muted]);

  /**
   * animateWaveform - Starts the animation for each waveform bar.
   */
  const animateWaveform = () => {
    const animations = waveformAnimations.map((animation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: getAnimationDuration(index),
            useNativeDriver: false,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: getAnimationDuration(index),
            useNativeDriver: false,
          }),
        ]),
      ),
    );

    Animated.parallel(animations).start();
  };

  /**
   * resetWaveform - Resets all waveform animations.
   */
  const resetWaveform = () => {
    waveformAnimations.forEach((animation) => animation.stopAnimation());
    waveformAnimations.forEach((animation) => animation.setValue(0));
  };

  /**
   * getAnimationDuration - Returns the duration for a given waveform bar index.
   * @param index - The index of the waveform bar.
   * @returns The duration in milliseconds.
   */
  const getAnimationDuration = (index: number): number => {
    const durations = [474, 433, 407, 458, 400, 427, 441, 419, 487];
    return durations[index] || 500;
  };

  /**
   * toggleAudio - Toggles the audio state of the participant.
   */
  const toggleAudio = async () => {
    if (!participant?.muted) {
      await controlUserMedia({
        participantId: participant.id || '',
        participantName: participant.name,
        type: 'audio',
        socket: parameters.socket,
        coHostResponsibility: parameters.coHostResponsibility,
        roomName: parameters.roomName,
        showAlert: parameters.showAlert,
        coHost: parameters.coHost,
        islevel: parameters.islevel,
        member: parameters.member,
        participants: parameters.participants,
      });
    }
  };

  /**
   * toggleVideo - Toggles the video state of the participant.
   */
  const toggleVideo = async () => {
    if (participant?.videoOn) {
      await controlUserMedia({
        participantId: participant.id || '',
        participantName: participant.name,
        type: 'video',
        socket: parameters.socket,
        coHostResponsibility: parameters.coHostResponsibility,
        roomName: parameters.roomName,
        showAlert: parameters.showAlert,
        coHost: parameters.coHost,
        islevel: parameters.islevel,
        member: parameters.member,
        participants: parameters.participants,
      });
    }
  };

  /**
   * renderControls - Renders the control buttons for audio and video.
   * @returns The control buttons JSX.Element or a custom component.
   */
  const renderControls = (): JSX.Element | null => {
    if (!showControls) {
      return null;
    }

    // Use custom videoControlsComponent if provided
    if (videoControlsComponent) {
      return <>{videoControlsComponent}</>;
    }

    // Default controls
    return (
      <View style={styles.overlayControls}>
        <Pressable style={styles.controlButton} onPress={toggleAudio}>
          <FontAwesome5
            name={participant?.muted ? 'microphone-slash' : 'microphone'}
            size={14}
            color={participant?.muted ? 'red' : 'green'}
          />
        </Pressable>

        <Pressable style={styles.controlButton} onPress={toggleVideo}>
          <FontAwesome5
            name={participant?.videoOn ? 'video' : 'video-slash'}
            size={14}
            color={participant?.videoOn ? 'green' : 'red'}
          />
        </Pressable>
      </View>
    );
  };

  const dimensions = { width: 0, height: 0 };

  const defaultContent = (
    <>
      {customAudioCard ? (
        customAudioCard({
          name,
          barColor: barColor || 'red',
          textColor: textColor || 'white',
          imageSource,
          roundedImage,
          imageStyle,
          parameters,
        })
      ) : (
        <>
          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              style={[
                styles.backgroundImage as ImageStyle,
                roundedImage ? (styles.roundedImage as ImageStyle) : undefined,
                imageStyle as ImageStyle,
              ]}
              resizeMode="cover"
            />
          ) : (
            <MiniCard
              initials={name}
              fontSize={20}
              customStyle={{
                borderWidth: parameters.eventType !== 'broadcast' ? 2 : 0,
                borderColor:
                  parameters.eventType !== 'broadcast' ? 'black' : 'transparent',
              }}
            />
          )}

          {/* Participant Info and Waveform */}
          {videoInfoComponent ||
            (showInfo && (
              <View
                style={[
                  getOverlayPosition({ position: infoPosition }),
                  Platform.OS === 'web'
                    ? showControls
                      ? styles.overlayWeb
                      : styles.overlayWebAlt
                    : styles.overlayMobile,
                ]}
              >
                <View style={styles.nameColumn}>
                  <Text style={[styles.nameText, { color: textColor }]}>
                    {name}
                  </Text>
                </View>
                {showWaveform && (
                  <View
                    style={
                      Platform.OS === 'web'
                        ? styles.waveformWeb
                        : styles.waveformMobile
                    }
                  >
                    {waveformAnimations.map((animation, index) => (
                      <Animated.View
                        key={index}
                        style={[
                          styles.bar,
                          {
                            height: animation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 14],
                            }),
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            ))}

          {/* Control Buttons */}
          {videoControlsComponent ||
            (showControls && (
              <View
                style={[
                  styles.overlayControls,
                  getOverlayPosition({ position: controlsPosition }),
                ]}
              >
                {renderControls()}
              </View>
            ))}
        </>
      )}
    </>
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View
      style={[
        styles.card,
        customStyle,
        { backgroundColor: backgroundColor || '#2c678f' },
        style,
      ]}
    >
      {content}
    </View>
  );

  return renderContainer 
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default AudioCard;

// Stylesheet with TypeScript typings
const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    backgroundColor: '#2c678f',
    borderWidth: 2,
    borderColor: 'black',
    position: 'relative',
  },
  backgroundImage: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    top: '50%',
    left: '50%',
    transform: [
      { translateY: -40 }, // Half of the height
      { translateX: -40 }, // Half of the width
    ],
  },
  roundedImage: {
    borderRadius: 16,
  },
  overlayMobile: {
    position: 'absolute',
    width: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlayWeb: {
    position: 'absolute',
    width: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlayWebAlt: {
    position: 'absolute',
    width: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlayControls: {
    flexDirection: 'row',
    paddingVertical: 0,
    paddingHorizontal: 0,
    position: 'absolute',
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginEnd: 5,
    fontSize: 12,
    borderRadius: 4,
  },
  nameColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginEnd: 2,
    fontSize: 12,
  },
  nameText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  waveformWeb: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 0,
    flexDirection: 'row',
    minHeight: '4%',
    maxHeight: '70%',
    width: '100%',
  },
  waveformMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 5,
    marginLeft: 5,
    maxWidth: '25%',
  },
  bar: {
    flex: 1,
    opacity: 0.7,
    marginHorizontal: 1,
  },
});
