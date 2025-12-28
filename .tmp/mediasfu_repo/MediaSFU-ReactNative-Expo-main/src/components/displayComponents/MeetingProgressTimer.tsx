import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

/**
 * Configuration options for the MeetingProgressTimer component.
 * 
 * @interface MeetingProgressTimerOptions
 * 
 * **Timer Display:**
 * @property {string} meetingProgressTime - Current elapsed meeting time (format: "HH:MM" or "MM:SS")
 * @property {boolean} [showTimer=true] - Controls timer visibility
 * 
 * **Positioning:**
 * @property {'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'} [position='topLeft'] - Timer badge position on screen
 * 
 * **Styling:**
 * @property {string} [initialBackgroundColor='green'] - Background color of the timer badge
 * @property {StyleProp<TextStyle>} [textStyle] - Additional custom styles for timer text
 */
export interface MeetingProgressTimerOptions {
  /**
   * The current progress time of the meeting to be displayed.
   */
  meetingProgressTime: string;

  /**
   * The initial background color of the timer.
   * @default 'green'
   */
  initialBackgroundColor?: string;

  /**
   * The position of the timer on the screen.
   * @default 'topLeft'
   */
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

  /**
   * Additional styles to apply to the timer text.
   */
  textStyle?: StyleProp<TextStyle>;

  /**
   * Flag to determine whether the timer should be displayed.
   * @default true
   */
  showTimer?: boolean;
}

/**
 * Type defining the possible positions for the timer.
 */
const positions: Record<
  'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
  StyleProp<ViewStyle>
> = {
  topLeft: { position: 'absolute', top: 10, left: 10 },
  topRight: { position: 'absolute', top: 10, right: 10 },
  bottomLeft: { position: 'absolute', bottom: 10, left: 10 },
  bottomRight: { position: 'absolute', bottom: 10, right: 10 },
};

export type MeetingProgressTimerType = (options: MeetingProgressTimerOptions) => JSX.Element;

/**
 * MeetingProgressTimer - Elapsed meeting time display badge
 * 
 * MeetingProgressTimer is a React Native component that displays the elapsed time
 * of a meeting in a colored badge positioned at one of four screen corners. The timer
 * updates automatically as the meeting progresses and is commonly overlaid on video grids.
 * 
 * **Key Features:**
 * - Real-time elapsed meeting time display
 * - Four corner positioning options
 * - Customizable badge background color
 * - Customizable text styling
 * - Show/hide toggle
 * - Compact badge design
 * - Absolute positioning for overlay
 * 
 * **UI Customization:**
 * This component's styling can be customized via the provided props. For complete
 * replacement, the parent grid component can be overridden via uiOverrides.
 * 
 * @component
 * @param {MeetingProgressTimerOptions} props - Configuration options
 * 
 * @returns {JSX.Element} Rendered meeting progress timer badge
 * 
 * @example
 * ```tsx
 * // Basic usage with default green badge
 * import React, { useState, useEffect } from 'react';
 * import { MeetingProgressTimer } from 'mediasfu-reactnative-expo';
 * 
 * const [elapsedTime, setElapsedTime] = useState('00:00');
 * 
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     // Update elapsed time logic
 *     setElapsedTime(calculateElapsed());
 *   }, 1000);
 *   return () => clearInterval(interval);
 * }, []);
 * 
 * return (
 *   <MeetingProgressTimer
 *     meetingProgressTime={elapsedTime}
 *     position="topLeft"
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // With custom styling and positioning
 * return (
 *   <MeetingProgressTimer
 *     meetingProgressTime="15:30"
 *     initialBackgroundColor="#e74c3c"
 *     position="bottomRight"
 *     textStyle={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}
 *     showTimer={true}
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // Conditional display based on meeting state
 * const [showTimer, setShowTimer] = useState(false);
 * 
 * return (
 *   <MeetingProgressTimer
 *     meetingProgressTime={meetingTime}
 *     position="topRight"
 *     showTimer={meetingStarted && showTimer}
 *     initialBackgroundColor="#27ae60"
 *   />
 * );
 * ```
 */

const MeetingProgressTimer: React.FC<MeetingProgressTimerOptions> = ({
  meetingProgressTime,
  initialBackgroundColor = 'green',
  position = 'topLeft',
  textStyle,
  showTimer = true,
}) => (
  <View style={[styles.badgeContainer, positions[position]]}>
    {showTimer && (
    <View
      style={[
        styles.progressTimer,
        { backgroundColor: initialBackgroundColor },
      ]}
    >
      <Text style={[styles.progressTimerText, textStyle]}>
        {meetingProgressTime}
      </Text>
    </View>
    )}
  </View>
);

export default MeetingProgressTimer;

/**
 * Stylesheet for the MeetingProgressTimer component.
 */
const styles = StyleSheet.create({
  badgeContainer: {
    padding: 5,
    elevation: 6,
    zIndex: 6,
  },
  progressTimer: {
    paddingVertical: 1,
    paddingHorizontal: 2,
    borderRadius: 5,
    backgroundColor: 'green',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    // Elevation for Android
    color: 'white',
  },
  progressTimerText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
