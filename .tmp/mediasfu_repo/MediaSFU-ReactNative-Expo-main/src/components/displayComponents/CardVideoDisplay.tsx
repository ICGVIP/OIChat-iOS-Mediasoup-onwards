import { View, StyleSheet, Platform } from 'react-native';
import {
  RTCView,
} from '../../methods/utils/webrtc/webrtc';
import { EventType, MediaStream } from '../../@types/types';

// Define the CardVideoDisplayOptions interface
export interface CardVideoDisplayOptions {
  remoteProducerId: string;
  eventType: EventType;
  forceFullDisplay: boolean;
  videoStream: MediaStream | null;
  backgroundColor?: string;
  doMirror?: boolean;

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

// Define the CardVideoDisplayType
export type CardVideoDisplayType = (
  options: CardVideoDisplayOptions
) => React.ReactNode;

/**
 * CardVideoDisplay displays a video stream within a card layout, with support for customizable styling and mirroring.
 *
 * This component uses `RTCView` to render a video stream with options to mirror the video, set full display, and apply platform-specific styles.
 *
 * @component
 * @param {CardVideoDisplayOptions} props - Properties for the CardVideoDisplay component.
 * @param {string} props.remoteProducerId - The ID of the remote producer for identification.
 * @param {EventType} props.eventType - The type of event, e.g., meeting or webinar.
 * @param {boolean} props.forceFullDisplay - Whether to force the video to fill the container.
 * @param {MediaStream | null} props.videoStream - The video stream to display.
 * @param {string} [props.backgroundColor='transparent'] - Optional background color for the video container.
 * @param {boolean} [props.doMirror=false] - Option to mirror the video.
 *
 * @returns {JSX.Element} The CardVideoDisplay component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { CardVideoDisplay } from 'mediasfu-reactnative-expo';
 * import { MediaStream } from 'mediasfu-reactnative-expo/dist/types/src/@types/types';
 *
 * function App() {
 *   const videoStream: MediaStream = getVideoStream(); // Assume a MediaStream object is available
 *
 *   return (
 *     <CardVideoDisplay
 *       remoteProducerId="producer123"
 *       eventType="meeting"
 *       forceFullDisplay={true}
 *       videoStream={videoStream}
 *       backgroundColor="black"
 *       doMirror={true}
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */
const CardVideoDisplay: React.FC<CardVideoDisplayOptions> = ({
  forceFullDisplay,
  videoStream,
  backgroundColor = 'transparent',
  doMirror = false,
  style,
  renderContent,
  renderContainer,
}) => {
  /**
   * getRTCViewStyle - Helper function to get styles for RTCView based on platform.
   * @returns {Object} - Styles for RTCView.
   */
  const getRTCViewStyle = (): object => {
    // Add styles based on the forceFullDisplay value
    if (Platform.OS === 'web') {
      const baseStyles: {
        width: string;
        height: string;
        objectFit: string;
        backgroundColor: string;
        transform?: string;
      } = {
        width: forceFullDisplay ? '100%' : 'auto',
        height: '100%',
        objectFit: forceFullDisplay ? 'cover' : 'contain',
        backgroundColor,
      };

      if (doMirror) {
        baseStyles.transform = 'rotateY(180deg)';
      }

      return baseStyles;
    }

    // For non-web platforms, no additional styles needed
    return {};
  };

  const dimensions = { width: 0, height: 0 }; // Video fills container

  const defaultContent = (
    <>
      {Platform.OS === 'web' ? (
        <RTCView stream={videoStream} style={getRTCViewStyle()} />
      ) : (
        <RTCView
          streamURL={videoStream?.toURL()}
          objectFit={forceFullDisplay ? 'cover' : 'contain'}
          mirror={doMirror}
          style={styles.video}
        />
      )}
    </>
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View style={[styles.videoContainer, { backgroundColor }, style]}>
      {content}
    </View>
  );

  return renderContainer 
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    backgroundColor: 'black', // Set a default background color if needed
  },
  video: {
    height: '100%',
  },
});

export default CardVideoDisplay;
