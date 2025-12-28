import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
  ImageStyle,
  Platform,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; 
import { Socket } from "socket.io-client";
import { controlMedia } from "../../consumers/controlMedia";
import { getOverlayPosition } from "../../methods/utils/getOverlayPosition";
import CardVideoDisplay from "./CardVideoDisplay";
import {
  EventType,
  ShowAlert,
  CoHostResponsibility,
  Participant,
  AudioDecibels,
  MediaStream,
  CustomVideoCardType,
} from "../../@types/types";

/**
 * Interface defining the parameters required by the VideoCard component.
 * 
 * These parameters provide the context and state needed for video display,
 * participant management, and media controls.
 * 
 * @interface VideoCardParameters
 * @property {Socket} socket - Socket.io client instance for real-time communication
 * @property {string} roomName - Name/ID of the current room session
 * @property {CoHostResponsibility[]} coHostResponsibility - Array of responsibilities assigned to co-hosts
 * @property {ShowAlert} [showAlert] - Optional function to display alerts/notifications
 * @property {string} coHost - User ID of the co-host
 * @property {Participant[]} participants - Array of all participants in the session
 * @property {string} member - Current user's member ID
 * @property {string} islevel - Current user's level/role (e.g., '0', '1', '2')
 * @property {AudioDecibels[]} audioDecibels - Array of audio level data for waveform visualization
 * @property {() => VideoCardParameters} getUpdatedAllParams - Function to retrieve latest parameter state
 */
export interface VideoCardParameters {
  socket: Socket;
  roomName: string;
  coHostResponsibility: CoHostResponsibility[];
  showAlert?: ShowAlert;
  coHost: string;
  participants: Participant[];
  member: string;
  islevel: string;
  audioDecibels: AudioDecibels[];

  // Function to get updated parameters
  getUpdatedAllParams: () => VideoCardParameters;
  [key: string]: any;
}

/**
 * Interface defining the options for the VideoCard component.
 * 
 * VideoCard displays a participant's video stream with optional controls,
 * info overlay, and audio visualization waveform.
 * 
 * @interface VideoCardOptions
 * 
 * **Core Display Properties:**
 * @property {string} name - Participant's display name
 * @property {string} remoteProducerId - Producer ID for the video stream
 * @property {MediaStream | null} videoStream - Video MediaStream object (null for screenshare or when video is off)
 * @property {Participant} participant - Complete participant object with metadata
 * @property {EventType} eventType - Type of event ('conference', 'webinar', 'broadcast', etc.)
 * @property {boolean} forceFullDisplay - Whether to force fullscreen display mode
 * 
 * **Styling Properties:**
 * @property {StyleProp<ViewStyle>} [customStyle] - Custom styles for the card container
 * @property {object} [style] - Additional style object for the container
 * @property {string} [backgroundColor] - Background color (default: '#2c678f')
 * @property {string} [barColor] - Color of the audio waveform bars (default: 'white')
 * @property {string} [textColor] - Color of text overlays (default: 'white')
 * @property {boolean} [doMirror] - Whether to mirror the video horizontally
 * 
 * **Image/Avatar Properties:**
 * @property {string} [imageSource] - URI for participant's avatar image
 * @property {boolean} [roundedImage] - Whether to display avatar with rounded corners
 * @property {StyleProp<ImageStyle>} [imageStyle] - Custom styles for the avatar image
 * 
 * **Controls & Info Properties:**
 * @property {boolean} [showControls] - Whether to show media control buttons
 * @property {boolean} [showInfo] - Whether to show participant info overlay
 * @property {React.ReactNode} [videoInfoComponent] - Custom component for info overlay
 * @property {React.ReactNode} [videoControlsComponent] - Custom component for controls
 * @property {"topLeft" | "topRight" | "bottomLeft" | "bottomRight"} [controlsPosition] - Position of controls overlay
 * @property {"topLeft" | "topRight" | "bottomLeft" | "bottomRight"} [infoPosition] - Position of info overlay
 * 
 * **Audio Visualization:**
 * @property {AudioDecibels[]} [audioDecibels] - Audio level data for waveform animation
 * 
 * **State Parameters:**
 * @property {VideoCardParameters} parameters - State and context parameters for the card
 * 
 * **Custom UI Override:**
 * @property {CustomVideoCardType} [customVideoCard] - Custom render function for complete card replacement.
 *   When provided, this function receives all VideoCardOptions and returns a custom JSX.Element.
 *   This allows full control over the video card's appearance and behavior.
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContent]
 *   Function to wrap or replace the default card content while preserving container
 * @property {(options: { defaultContainer: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace the entire card container
 */
export interface VideoCardOptions {
  customStyle?: StyleProp<ViewStyle>;
  name: string;
  barColor?: string;
  textColor?: string;
  imageSource?: string;
  roundedImage?: boolean;
  imageStyle?: StyleProp<ImageStyle>;
  remoteProducerId: string;
  eventType: EventType;
  forceFullDisplay: boolean;
  videoStream: MediaStream | null; 
  showControls?: boolean;
  showInfo?: boolean;
  videoInfoComponent?: React.ReactNode;
  videoControlsComponent?: React.ReactNode;
  controlsPosition?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  infoPosition?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  participant: Participant;
  backgroundColor?: string;
  audioDecibels?: AudioDecibels[];
  doMirror?: boolean;
  parameters: VideoCardParameters;
  customVideoCard?: CustomVideoCardType;

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

export type VideoCardType = (options: VideoCardOptions) => JSX.Element;

/**
 * VideoCard - Displays a participant's video stream with controls, info overlay, and audio waveform
 * 
 * VideoCard is a comprehensive React Native component that renders a participant's video feed
 * with real-time audio visualization (animated waveform), optional media controls, and participant
 * information overlay. It supports multiple display modes, custom styling, and flexible positioning.
 * 
 * **Key Features:**
 * - Real-time video stream rendering with MediaStream support
 * - Animated audio waveform visualization based on decibel levels
 * - Optional control buttons for muting/video toggling
 * - Participant info overlay with customizable positioning
 * - Avatar fallback when video is off
 * - Horizontal mirroring support
 * - Responsive layout with force fullscreen mode
 * 
 * **UI Customization - Two-Tier Override System:**
 * 
 * 1. **Custom Render Function** (via `customVideoCard` prop):
 *    Pass a function that receives all VideoCardOptions and returns custom JSX.
 *    Provides complete control over rendering logic and appearance.
 * 
 * 2. **Component Override** (via `uiOverrides.videoCardComponent`):
 *    Replace the entire VideoCard component while preserving MediaSFU's orchestration.
 *    Useful when you want a different component implementation.
 * 
 * **Advanced Render Overrides:**
 * - `renderContent`: Wrap/modify the card's inner content while keeping container
 * - `renderContainer`: Wrap/modify the entire card container
 * 
 * @component
 * @param {VideoCardOptions} props - Configuration options for the VideoCard component
 * 
 * @returns {JSX.Element} Rendered video card with stream, controls, and waveform
 * 
 * @example
 * // Basic usage - Display participant video with default styling
 * import React from 'react';
 * import { VideoCard } from 'mediasfu-reactnative-expo';
 * import { Socket } from 'socket.io-client';
 * 
 * const socket = Socket('https://example.com');
 * 
 * function ParticipantGrid() {
 *   return (
 *     <VideoCard
 *       name="John Doe"
 *       remoteProducerId="producer_123"
 *       eventType="conference"
 *       forceFullDisplay={false}
 *       videoStream={participantStream}
 *       participant={{
 *         name: 'John Doe',
 *         id: '123',
 *         videoOn: true,
 *         muted: false,
 *       }}
 *       parameters={{
 *         socket,
 *         roomName: 'room1',
 *         coHostResponsibility: [],
 *         audioDecibels: [],
 *         participants: [{ name: 'John Doe', id: '123', videoOn: true, muted: false }],
 *         member: '123',
 *         islevel: '1',
 *         coHost: 'coHostId',
 *         getUpdatedAllParams: () => ({ ...params }),
 *       }}
 *       backgroundColor="#2c678f"
 *       showControls={true}
 *       showInfo={true}
 *       barColor="white"
 *       textColor="white"
 *     />
 *   );
 * }
 * 
 * @example
 * // Custom styled video card with mirroring and custom colors
 * <VideoCard
 *   name="Jane Smith"
 *   remoteProducerId="producer_456"
 *   eventType="webinar"
 *   forceFullDisplay={true}
 *   videoStream={selfStream}
 *   participant={currentParticipant}
 *   parameters={sessionParams}
 *   backgroundColor="#1a1a2e"
 *   barColor="#16213e"
 *   textColor="#eaeaea"
 *   doMirror={true}
 *   showControls={true}
 *   showInfo={true}
 *   controlsPosition="bottomRight"
 *   infoPosition="topLeft"
 *   customStyle={{ borderRadius: 12, margin: 8 }}
 * />
 * 
 * @example
 * // Custom video card with custom render function
 * import { View, Text } from 'react-native';
 * 
 * const customVideoCard = (options: VideoCardOptions) => {
 *   const { name, participant, videoStream } = options;
 *   
 *   return (
 *     <View style={{ backgroundColor: '#000', padding: 10 }}>
 *       <Text style={{ color: '#fff', fontSize: 18 }}>{name}</Text>
 *       {videoStream ? (
 *         <Text>Video Active</Text>
 *       ) : (
 *         <Text>Video Off</Text>
 *       )}
 *       {participant.muted && <Text style={{ color: 'red' }}>Muted</Text>}
 *     </View>
 *   );
 * };
 * 
 * <VideoCard
 *   name="Custom Participant"
 *   remoteProducerId="producer_789"
 *   eventType="broadcast"
 *   forceFullDisplay={false}
 *   videoStream={stream}
 *   participant={participant}
 *   parameters={params}
 *   customVideoCard={customVideoCard}
 * />
 * 
 * @example
 * // Using uiOverrides for component-level customization
 * import { MyCustomVideoCard } from './MyCustomVideoCard';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     videoCardComponent: {
 *       component: MyCustomVideoCard,
 *       injectedProps: {
 *         theme: 'dark',
 *         showBorder: true,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomVideoCard.tsx
 * export const MyCustomVideoCard = (props: VideoCardOptions & { theme: string; showBorder: boolean }) => {
 *   return (
 *     <View style={{ 
 *       borderWidth: props.showBorder ? 2 : 0,
 *       borderColor: props.theme === 'dark' ? '#fff' : '#000',
 *     }}>
 *       <Text>{props.name}</Text>
 *       {props.videoStream && <Text>Streaming...</Text>}
 *     </View>
 *   );
 * };
 * 
 * export default App;
 * ```
 */

const VideoCard: React.FC<VideoCardOptions> = ({
  customStyle,
  name,
  barColor = "red",
  textColor = "white",
  remoteProducerId,
  eventType,
  forceFullDisplay,
  videoStream,
  showControls = true,
  showInfo = true,
  videoInfoComponent,
  videoControlsComponent,
  controlsPosition = "topLeft",
  infoPosition = "topRight",
  participant,
  backgroundColor = "#2c678f",
  audioDecibels = [],
  doMirror = false,
  parameters,
  customVideoCard,
  style,
  renderContent,
  renderContainer,
}) => {
  // Initialize waveform animation values
  const [waveformAnimations] = useState<Animated.Value[]>(
    Array.from({ length: 9 }, () => new Animated.Value(0))
  );

  const [showWaveform, setShowWaveform] = useState<boolean>(true);

  /**
   * animateWaveform - Animates the waveform bars using the Animated API.
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
        ])
      )
    );

    Animated.parallel(animations).start();
  };
  /**
   * resetWaveform - Resets all waveform animations to their initial state.
   */
  const resetWaveform = () => {
    waveformAnimations.forEach((animation) => animation.stopAnimation());
    waveformAnimations.forEach((animation) => animation.setValue(0));
  };

  /**
   * getAnimationDuration - Retrieves the duration for a specific waveform animation.
   *
   * @param {number} index - The index of the waveform bar.
   * @returns {number} The duration in milliseconds.
   */
  const getAnimationDuration = (index: number): number => {
    const durations = [474, 433, 407, 458, 400, 427, 441, 419, 487];
    return durations[index] || 400;
  };

  /**
   * Effect to handle waveform animations based on audio decibel levels.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedParams = parameters.getUpdatedAllParams();
      const { audioDecibels, participants } = updatedParams;

      const existingEntry = audioDecibels.find(
        (entry: AudioDecibels) => entry.name === name
      );
      const participantEntry = participants.find(
        (p: Participant) => p.name === name
      );

      if (
        existingEntry &&
        existingEntry.averageLoudness > 127.5 &&
        participantEntry &&
        !participantEntry.muted
      ) {
        animateWaveform();
      } else {
        resetWaveform();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [audioDecibels, name, parameters]);

  /**
   * Effect to show or hide the waveform based on the participant's muted state.
   */
  useEffect(() => {
    if (participant?.muted) {
      resetWaveform();
      setShowWaveform(false);
    } else {
      animateWaveform();
      setShowWaveform(true);
    }
  }, [participant?.muted]);

  /**
   * toggleAudio - Toggles the audio state for the participant.
   */
  const toggleAudio = async () => {
    if (!participant?.muted) {
      const updatedParams = parameters.getUpdatedAllParams();
      await controlMedia({
        participantId: participant.id || "",
        participantName: participant.name,
        type: "audio",
        socket: updatedParams.socket,
        roomName: updatedParams.roomName,
        coHostResponsibility: updatedParams.coHostResponsibility,
        showAlert: updatedParams.showAlert,
        coHost: updatedParams.coHost,
        participants: updatedParams.participants,
        member: updatedParams.member,
        islevel: updatedParams.islevel,
      });
    }
  };

  /**
   * toggleVideo - Toggles the video state for the participant.
   */
  const toggleVideo = async () => {
    if (participant?.videoOn) {
      const updatedParams = parameters.getUpdatedAllParams();
      await controlMedia({
        participantId: participant.id || "",
        participantName: participant.name,
        type: "video",
        socket: updatedParams.socket,
        roomName: updatedParams.roomName,
        coHostResponsibility: updatedParams.coHostResponsibility,
        showAlert: updatedParams.showAlert,
        coHost: updatedParams.coHost,
        participants: updatedParams.participants,
        member: updatedParams.member,
        islevel: updatedParams.islevel,
      });
    }
  };

  /**
   * renderControls - Render video controls based on conditions.
   * @returns {React.Component} - Rendered video controls.
   */
  const renderControls = (): JSX.Element | null => {
    if (!showControls) {
      return null;
    }

    if (videoControlsComponent) {
      return <>{videoControlsComponent}</>;
    }

    // Default controls
    return (
      <View
        style={{
          ...styles.overlayControls,
          ...getOverlayPosition({ position: controlsPosition }),
        }}
      >
        <Pressable style={styles.controlButton} onPress={toggleAudio}>
          <FontAwesome5
            name={participant?.muted ? "microphone-slash" : "microphone"}
            size={16}
            color={participant?.muted ? "red" : "green"}
          />
        </Pressable>
        <Pressable style={styles.controlButton} onPress={toggleVideo}>
          <FontAwesome5
            name={participant?.videoOn ? "video" : "video-slash"}
            size={16}
            color={participant?.videoOn ? "green" : "red"}
          />
        </Pressable>
      </View>
    );
  };

  /**
   * renderInfo - Renders the participant information and waveform.
   *
   * @returns {JSX.Element | null} The rendered info or null.
   */
  const renderInfo = (): JSX.Element | null => {
    if (videoInfoComponent) {
      return <>{videoInfoComponent}</>;
    }

    if (!showInfo) return null;

    return (
      <View
        style={[
          getOverlayPosition({ position: infoPosition }),
          Platform.OS === "web"
            ? showControls
              ? styles.overlayWeb
              : styles.overlayWebAlt
            : styles.overlayMobile,
        ]}
      >
        <View style={styles.nameColumn}>
          <Text style={[styles.nameText, { color: textColor }]}>
            {participant?.name}
          </Text>
        </View>
        {showWaveform && (
          <View
            style={
              Platform.OS === "web" ? styles.waveformWeb : styles.waveformMobile
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
    );
  };

  const dimensions = { width: 100, height: 100 };

  const defaultContent = (
    <>
      {customVideoCard ? (
        customVideoCard({
          participant,
          stream: videoStream,
          width: 100,
          height: 100,
          doMirror,
          showControls,
          showInfo,
          name,
          backgroundColor,
          parameters,
        })
      ) : (
        <>
          {/* Video Display */}
          <CardVideoDisplay
            remoteProducerId={remoteProducerId}
            eventType={eventType}
            forceFullDisplay={forceFullDisplay}
            videoStream={videoStream}
            backgroundColor={backgroundColor}
            doMirror={doMirror}
          />

          {/* Participant Information */}
          {renderInfo()}

          {/* Video Controls */}
          {renderControls()}
        </>
      )}
    </>
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View style={[styles.card, customStyle, { backgroundColor }, style]}>
      {content}
    </View>
  );

  return renderContainer 
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default VideoCard;

/**
 * Stylesheet for the VideoCard component.
 */
const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%",
    margin: 0,
    padding: 0,
    backgroundColor: "#2c678f",
    position: "relative",
    borderWidth: 2,
    borderColor: "black",
    borderStyle: "solid",
  },

  overlayWeb: {
    position: "absolute",
    width: "auto",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  overlayWebAlt: {
    position: "absolute",
    width: "auto",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  overlayMobile: {
    position: "absolute",
    width: "auto",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  overlayControls: {
    flexDirection: "row",
    paddingVertical: 0,
    paddingHorizontal: 0,
    position: "absolute",
  },

  controlButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginRight: 5,
    borderRadius: 5,
  },

  nameColumn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginEnd: 2,
    fontSize: 12,
  },

  nameText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },

  waveformContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 5,
  },

  waveformMobile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingVertical: 5,
    marginLeft: 5,
    maxWidth: "25%",
  },

  waveformWeb: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    padding: 0,
    flexDirection: "row",
    minHeight: "4%",
    maxHeight: "70%",
    width: "100%",
  },

  bar: {
    flex: 1,
    opacity: 0.7,
    marginHorizontal: 1,
  },

  backgroundImage: {
    position: "absolute",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    top: "50%",
    left: "50%",
    transform: [
      { translateY: -40 }, // Half of the height
      { translateX: -40 }, // Half of the width
    ],
  },

  roundedImage: {
    borderRadius: 40, // Fully rounded for a 80x80 image
  },
});
