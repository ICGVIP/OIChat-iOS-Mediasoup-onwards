// OtherGridComponent.tsx

import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import MeetingProgressTimer from './MeetingProgressTimer';

/**
 * Configuration options for the OtherGridComponent.
 * 
 * @interface OtherGridComponentOptions
 * 
 * **Content:**
 * @property {React.ReactNode} children - Child components to render inside the other grid (typically secondary video participants)
 * 
 * **Dimensions:**
 * @property {number | string} width - Width of the grid container (number in pixels or string with units)
 * @property {number | string} height - Height of the grid container (number in pixels or string with units)
 * 
 * **Display Control:**
 * @property {boolean} [showAspect=true] - Whether to show the grid container (false hides the entire grid)
 * 
 * **Meeting Progress Timer:**
 * @property {boolean} showTimer - Whether to display the meeting progress timer overlay
 * @property {string} meetingProgressTime - Time string to display on the timer (e.g., "12:34", "01:05:23")
 * @property {string} [timeBackgroundColor='rgba(0,0,0,0.5)'] - Background color for the timer overlay
 * 
 * **Styling:**
 * @property {string} backgroundColor - Background color for the grid container
 * @property {object} [style] - Additional custom styles to apply to the container
 * 
 * **Advanced Render Overrides:**
 * @property {function} [renderContent] - Optional custom renderer for grid content (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Optional custom renderer for outer container (receives defaultContainer and dimensions)
 */
export interface OtherGridComponentOptions {
  backgroundColor: string;
  children: React.ReactNode;
  width: number | string;
  height: number | string;
  showAspect?: boolean;
  timeBackgroundColor?: string;
  showTimer: boolean;
  meetingProgressTime: string;
  style?: object;
  renderContent?: (options: {
    defaultContent: React.ReactNode;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;
  renderContainer?: (options: {
    defaultContainer: React.ReactNode;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;
}

export type OtherGridComponentType = React.FC<OtherGridComponentOptions>;

/**
 * OtherGridComponent - Secondary video grid with meeting timer
 * 
 * OtherGridComponent is a React Native component that provides a secondary grid
 * container for additional video participants (typically used when the main grid
 * is full). It includes bordered styling and an optional meeting progress timer overlay.
 * 
 * **Key Features:**
 * - Fixed-dimension bordered grid container
 * - Meeting progress timer overlay
 * - Visibility controls for grid and timer
 * - Custom background colors
 * - Flexible width/height (numeric or string values)
 * - Advanced render override hooks
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.otherGridComponent` to
 * provide a completely custom secondary grid layout.
 * 
 * @component
 * @param {OtherGridComponentOptions} props - Configuration options for the other grid
 * 
 * @returns {JSX.Element} Rendered secondary grid with optional timer overlay
 * 
 * @example
 * // Basic usage - Secondary video grid with timer
 * import React from 'react';
 * import { OtherGridComponent } from 'mediasfu-reactnative-expo';
 * 
 * function SecondaryVideoGrid() {
 *   return (
 *     <OtherGridComponent
 *       backgroundColor="#2c2c2c"
 *       width={300}
 *       height={400}
 *       showAspect={true}
 *       showTimer={true}
 *       meetingProgressTime="00:15:32"
 *       timeBackgroundColor="rgba(0, 0, 0, 0.6)"
 *     >
 *       <FlexibleGrid componentsToRender={overflowParticipants} />
 *     </OtherGridComponent>
 *   );
 * }
 * 
 * @example
 * // Without timer overlay and custom styling
 * <OtherGridComponent
 *   backgroundColor="#1a1a1a"
 *   width="80%"
 *   height={500}
 *   showTimer={false}
 *   meetingProgressTime=""
 *   style={{ borderRadius: 8, borderWidth: 2, borderColor: '#007bff' }}
 * >
 *   <SecondaryParticipantGrid />
 * </OtherGridComponent>
 * 
 * @example
 * // With custom content renderer (add participant count)
 * <OtherGridComponent
 *   backgroundColor="black"
 *   width={350}
 *   height={450}
 *   showTimer={true}
 *   meetingProgressTime="01:23:45"
 *   renderContent={({ defaultContent, dimensions }) => (
 *     <>
 *       <View style={{ 
 *         position: 'absolute', 
 *         top: 10, 
 *         right: 10, 
 *         zIndex: 100,
 *         backgroundColor: 'rgba(0,0,0,0.7)',
 *         padding: 5,
 *         borderRadius: 4,
 *       }}>
 *         <Text style={{ color: 'white', fontSize: 12 }}>
 *           {overflowCount} more participants
 *         </Text>
 *       </View>
 *       {defaultContent}
 *     </>
 *   )}
 * >
 *   <OverflowGrid />
 * </OtherGridComponent>
 * 
 * @example
 * // Using uiOverrides for complete grid replacement
 * import { MyCustomOtherGrid } from './MyCustomOtherGrid';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     otherGridComponent: {
 *       component: MyCustomOtherGrid,
 *       injectedProps: {
 *         showBorder: true,
 *         borderStyle: 'dashed',
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomOtherGrid.tsx
 * export const MyCustomOtherGrid = (props: OtherGridComponentOptions & { showBorder: boolean; borderStyle: string }) => {
 *   return (
 *     <View style={{ 
 *       width: typeof props.width === 'number' ? props.width : undefined,
 *       height: typeof props.height === 'number' ? props.height : undefined,
 *       backgroundColor: props.backgroundColor,
 *       borderWidth: props.showBorder ? 2 : 0,
 *       borderStyle: props.borderStyle as any,
 *       borderColor: '#007bff',
 *       position: 'relative',
 *     }}>
 *       {props.children}
 *       {props.showTimer && (
 *         <View style={{ 
 *           position: 'absolute', 
 *           top: 5, 
 *           left: 5,
 *           backgroundColor: props.timeBackgroundColor || 'rgba(0,0,0,0.5)',
 *           padding: 4,
 *           borderRadius: 4,
 *         }}>
 *           <Text style={{ color: 'white', fontSize: 10 }}>
 *             {props.meetingProgressTime}
 *           </Text>
 *         </View>
 *       )}
 *     </View>
 *   );
 * };
 */

const OtherGridComponent: React.FC<OtherGridComponentOptions> = ({
  backgroundColor,
  children,
  width,
  height,
  showAspect = true,
  timeBackgroundColor = 'rgba(0,0,0,0.5)', // Default value if not provided
  showTimer,
  meetingProgressTime,
  style,
  renderContent,
  renderContainer,
}) => {
  const dimensions = {
    width: typeof width === 'number' ? width : 0,
    height: typeof height === 'number' ? height : 0,
  };

  const defaultContent = (
    <>
      <MeetingProgressTimer
        meetingProgressTime={meetingProgressTime}
        initialBackgroundColor={timeBackgroundColor}
        showTimer={showTimer}
        position="topRight"
      />
      <View style={styles.childrenContainer}>
        {children}
      </View>
    </>
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View style={[styles.otherGridContainer, {
      backgroundColor, width: width as number, height: height as number, display: showAspect ? 'flex' : 'none',
    }, style]}
    >
      {content}
    </View>
  );

  return renderContainer 
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default OtherGridComponent;

/**
 * Stylesheet for the OtherGridComponent.
 */
const styles = StyleSheet.create({
  otherGridContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
    borderStyle: 'solid',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#ffffff', // Default background color
  },

  childrenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    // Add additional styling if necessary
  },
});
