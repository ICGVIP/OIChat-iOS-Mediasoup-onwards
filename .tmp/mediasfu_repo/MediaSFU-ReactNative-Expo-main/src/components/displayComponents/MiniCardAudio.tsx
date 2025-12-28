import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StyleProp,
  ViewStyle,
  ImageStyle,
  Animated,
} from 'react-native';
import { getOverlayPosition } from '../../methods/utils/getOverlayPosition';

/**
 * Enum for Overlay Positions.
 */
type OverlayPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

/**
 * Interface defining the props for the MiniCardAudio component.
 */
export interface MiniCardAudioOptions {
  /**
   * Custom styles to apply to the card.
   */
  customStyle?: StyleProp<ViewStyle>;

  /**
   * The name to display on the card.
   */
  name: string;

  /**
   * Flag to show or hide the waveform animation.
   */
  showWaveform: boolean;

  /**
   * Position of the overlay on the card.
   * @default 'topLeft'
   */
  overlayPosition?: OverlayPosition;

  /**
   * The color of the waveform bars.
   * @default 'white'
   */
  barColor?: string;

  /**
   * The color of the text.
   * @default 'white'
   */
  textColor?: string;

  /**
   * The source URI for the background image.
   */
  imageSource?: string;

  /**
   * Flag to apply rounded corners to the image.
   * @default false
   */
  roundedImage?: boolean;

  /**
   * Custom styles to apply to the image.
   */
  imageStyle?: StyleProp<ImageStyle>;

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

export type MiniCardAudioType = (options: MiniCardAudioOptions) => JSX.Element;

/**
 * MiniCardAudio displays an audio card with optional waveform animation and custom styling options.
 *
 * This component supports showing an animated waveform, an image, and custom positioning for the overlay. It is designed
 * for displaying audio-related information in a visually appealing, customizable way.
 *
 * @component
 * @param {MiniCardAudioOptions} props - Configuration options for the MiniCardAudio component.
 * @param {StyleProp<ViewStyle>} [props.customStyle] - Custom styles for the card container.
 * @param {string} props.name - The name displayed on the audio card.
 * @param {boolean} props.showWaveform - Toggles the waveform animation display.
 * @param {OverlayPosition} [props.overlayPosition='topLeft'] - Position of the overlay on the card.
 * @param {string} [props.barColor='white'] - Color of the waveform bars.
 * @param {string} [props.textColor='white'] - Color of the displayed name text.
 * @param {string} [props.imageSource] - URI for the background image.
 * @param {boolean} [props.roundedImage=false] - Determines if the image should have rounded corners.
 * @param {StyleProp<ImageStyle>} [props.imageStyle] - Custom styles for the background image.
 *
 * @returns {JSX.Element} The MiniCardAudio component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { MiniCardAudio } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *   return (
 *     <MiniCardAudio
 *       name="Alice Johnson"
 *       showWaveform={true}
 *       overlayPosition="bottomRight"
 *       barColor="blue"
 *       textColor="white"
 *       imageSource="https://example.com/profile.jpg"
 *       roundedImage={true}
 *       customStyle={{ width: 100, height: 100 }}
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const MiniCardAudio: React.FC<MiniCardAudioOptions> = ({
  customStyle,
  name,
  showWaveform,
  overlayPosition = 'topLeft',
  barColor = 'white',
  textColor = 'white',
  imageSource,
  roundedImage = false,
  imageStyle,
  style,
  renderContent,
  renderContainer,
}) => {
  // Initialize waveform animation values
  const [waveformAnimations] = useState<Animated.Value[]>(
    Array.from({ length: 9 }, () => new Animated.Value(0)),
  );

  // Reference to store interval IDs (if using setInterval)
  // Not recommended in React Native; using Animated API instead

  /**
   * Animates the waveform bars using the Animated API.
   */
  const animateWaveform = () => {
    const animations = waveformAnimations.map((animation, index) => Animated.loop(
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
    ));

    Animated.parallel(animations).start();
  };

  /**
   * Resets the waveform animations to their initial state.
   */
  const resetWaveform = () => {
    waveformAnimations.forEach((animation) => {
      animation.setValue(0);
      animation.stopAnimation();
    });
  };

  /**
   * Retrieves the animation duration for a specific bar.
   * @param index - The index of the waveform bar.
   * @returns number - The duration in milliseconds.
   */
  const getAnimationDuration = (index: number): number => {
    const durations = [474, 433, 407, 458, 400, 427, 441, 419, 487];
    return durations[index] || 400;
  };

  useEffect(() => {
    if (showWaveform) {
      animateWaveform();
    } else {
      resetWaveform();
    }

    // Cleanup animations on component unmount or when showWaveform changes
    return () => {
      resetWaveform();
    };

  }, [showWaveform]);

  const dimensions = { width: 0, height: 0 }; // Percentage-based sizing

  const defaultContent = (
    <>
      {imageSource && (
        <Image
          source={{ uri: imageSource }}
          style={[
            styles.backgroundImage,
            roundedImage && styles.roundedImage,
            imageStyle,
          ]}
          resizeMode="cover"
        />
      )}
      <View style={[getOverlayPosition({ position: overlayPosition }), styles.overlayContainer]}>
        <View style={styles.nameColumn}>
          <Text style={[styles.nameText, { color: textColor }]}>{name}</Text>
        </View>
        {showWaveform && (
          <View style={styles.waveformContainer}>
            {waveformAnimations.map((animation, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.bar,
                  {
                    height: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 16],
                    }),
                    backgroundColor: barColor,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </>
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View style={[styles.card, customStyle, style]}>
      {content}
    </View>
  );

  return renderContainer 
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default MiniCardAudio;

/**
 * Stylesheet for the MiniCardAudio component.
 */
const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    backgroundColor: '#2c678f',
    borderRadius: 10,
    overflow: 'hidden',
  },
  overlayContainer: {
    position: 'absolute',
    // Additional positioning handled by getOverlayPositionStyle
  },
  nameColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginEnd: 2,
    borderRadius: 5,
  },
  nameText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 5,
  },
  bar: {
    width: 4,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  backgroundImage: {
    width: '60%',
    height: '60%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundedImage: {
    borderRadius: 50, // Fully rounded
  },
});
