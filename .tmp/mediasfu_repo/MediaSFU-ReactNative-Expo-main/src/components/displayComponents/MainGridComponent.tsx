// MainGridComponent.tsx

import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import MeetingProgressTimer from './MeetingProgressTimer';

/**
 * Configuration options for the MainGridComponent.
 * 
 * @interface MainGridComponentOptions
 * 
 * **Content:**
 * @property {React.ReactNode} children - Child components to render inside the main grid (typically video/audio participant cards)
 * 
 * **Dimensions:**
 * @property {number} width - Width of the grid container in pixels
 * @property {number} height - Height of the grid container in pixels
 * 
 * **Display Control:**
 * @property {boolean} [showAspect=true] - Whether to show the grid container (false hides the entire grid)
 * 
 * **Meeting Progress Timer:**
 * @property {boolean} [showTimer=true] - Whether to display the meeting progress timer overlay
 * @property {string} meetingProgressTime - Time string to display on the timer (e.g., "12:34", "01:05:23")
 * @property {string} [timeBackgroundColor='transparent'] - Background color for the timer overlay
 * 
 * **Styling:**
 * @property {string} backgroundColor - Background color for the grid container
 * @property {object} [style] - Additional custom styles to apply to the container
 * 
 * **Advanced Render Overrides:**
 * @property {function} [renderContent] - Optional custom renderer for grid content (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Optional custom renderer for outer container (receives defaultContainer and dimensions)
 */
export interface MainGridComponentOptions {
  children: React.ReactNode;
  backgroundColor: string;
  height: number;
  width: number;
  showAspect?: boolean;
  timeBackgroundColor?: string;
  showTimer?: boolean;
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

export type MainGridComponentType = (options: MainGridComponentOptions) => JSX.Element;

/**
 * MainGridComponent - Primary video grid container with meeting timer
 * 
 * MainGridComponent is a React Native component that provides the main layout
 * container for video participant grids. It includes an optional meeting progress
 * timer overlay and centers child content within a defined area.
 * 
 * **Key Features:**
 * - Fixed-dimension grid container
 * - Centered content layout
 * - Meeting progress timer overlay
 * - Visibility controls for grid and timer
 * - Custom background colors
 * - Advanced render override hooks
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.mainGridComponent` to
 * provide a completely custom main grid layout.
 * 
 * @component
 * @param {MainGridComponentOptions} props - Configuration options for the main grid
 * 
 * @returns {JSX.Element} Rendered main grid with optional timer overlay
 * 
 * @example
 * // Basic usage - Video grid with timer
 * import React from 'react';
 * import { MainGridComponent } from 'mediasfu-reactnative-expo';
 * 
 * function VideoMeetingGrid() {
 *   return (
 *     <MainGridComponent
 *       backgroundColor="#1a1a1a"
 *       height={600}
 *       width={800}
 *       showAspect={true}
 *       showTimer={true}
 *       meetingProgressTime="00:15:32"
 *       timeBackgroundColor="rgba(0, 0, 0, 0.5)"
 *     >
 *       <FlexibleGrid componentsToRender={participantVideos} />
 *     </MainGridComponent>
 *   );
 * }
 * 
 * @example
 * // Without timer overlay
 * <MainGridComponent
 *   backgroundColor="black"
 *   height={500}
 *   width={700}
 *   showTimer={false}
 *   meetingProgressTime=""
 * >
 *   <GridContent />
 * </MainGridComponent>
 * 
 * @example
 * // With custom content renderer (add overlay watermark)
 * <MainGridComponent
 *   backgroundColor="#000"
 *   height={720}
 *   width={1280}
 *   showTimer={true}
 *   meetingProgressTime="01:23:45"
 *   renderContent={({ defaultContent, dimensions }) => (
 *     <>
 *       {defaultContent}
 *       <View style={{ 
 *         position: 'absolute', 
 *         bottom: 20, 
 *         right: 20,
 *         opacity: 0.5,
 *       }}>
 *         <Text style={{ color: 'white' }}>Company Watermark</Text>
 *       </View>
 *     </>
 *   )}
 * >
 *   <VideoGrid />
 * </MainGridComponent>
 * 
 * @example
 * // Using uiOverrides for complete grid replacement
 * import { MyCustomMainGrid } from './MyCustomMainGrid';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     mainGridComponent: {
 *       component: MyCustomMainGrid,
 *       injectedProps: {
 *         showBorder: true,
 *         borderColor: '#007bff',
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomMainGrid.tsx
 * export const MyCustomMainGrid = (props: MainGridComponentOptions & { showBorder: boolean; borderColor: string }) => {
 *   return (
 *     <View style={{ 
 *       width: props.width, 
 *       height: props.height,
 *       backgroundColor: props.backgroundColor,
 *       borderWidth: props.showBorder ? 2 : 0,
 *       borderColor: props.borderColor,
 *       justifyContent: 'center',
 *       alignItems: 'center',
 *     }}>
 *       {props.children}
 *       {props.showTimer && (
 *         <View style={{ position: 'absolute', top: 10, left: 10 }}>
 *           <Text style={{ color: 'white' }}>{props.meetingProgressTime}</Text>
 *         </View>
 *       )}
 *     </View>
 *   );
 * };
 */

const MainGridComponent: React.FC<MainGridComponentOptions> = ({
  children,
  backgroundColor,
  height,
  width,
  showAspect = true,
  timeBackgroundColor = 'transparent',
  showTimer = true,
  meetingProgressTime,
  style,
  renderContent,
  renderContainer,
}) => {
  const dimensions = { width, height };

  const defaultContent = (
    <>
      {showTimer && (
        <MeetingProgressTimer
          meetingProgressTime={meetingProgressTime}
          initialBackgroundColor={timeBackgroundColor}
          showTimer={showTimer}
        />
      )}
      {children}
    </>
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View
      style={[
        styles.maingridContainer,
        {
          backgroundColor,
          height,
          width,
          display: showAspect ? 'flex' : 'none',
        },
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

export default MainGridComponent;

/**
 * Stylesheet for the MainGridComponent.
 */
const styles = StyleSheet.create({
  maingridContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: 4,
  },
});
