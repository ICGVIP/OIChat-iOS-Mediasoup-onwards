// FlexibleVideo.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MediaStream } from '../../@types/types';

/**
 * Interface defining the props for the FlexibleVideo component.
 * 
 * FlexibleVideo provides a video grid layout with optional screen sharing
 * overlay and annotation capabilities.
 * 
 * @interface FlexibleVideoOptions
 * 
 * **Grid Configuration:**
 * @property {number} rows - Number of rows in the video grid
 * @property {number} columns - Number of columns in the video grid
 * @property {React.ReactNode[]} componentsToRender - Array of video components to display
 * 
 * **Cell Dimensions:**
 * @property {number} customWidth - Width for each grid cell (in pixels)
 * @property {number} customHeight - Height for each grid cell (in pixels)
 * 
 * **Display Options:**
 * @property {boolean} showAspect - Whether to maintain aspect ratio for grid cells
 * @property {string} [backgroundColor="transparent"] - Background color for each grid cell
 * 
 * **Screen Sharing & Annotation:**
 * @property {React.ReactNode} [Screenboard] - Optional screenboard component to overlay on the grid
 * @property {boolean} [annotateScreenStream=false] - Whether to enable screen stream annotation
 * @property {MediaStream} [localStreamScreen] - Local screen MediaStream for annotation
 * 
 * **Styling:**
 * @property {object} [style] - Custom styles for the video grid container
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContent]
 *   Function to wrap or replace the default video grid content
 * @property {(options: { defaultContainer: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace the entire video grid container
 */
export interface FlexibleVideoOptions {
  /**
   * Custom width for each grid item.
   */
  customWidth: number;

  /**
   * Custom height for each grid item.
   */
  customHeight: number;

  /**
   * Number of rows in the grid.
   */
  rows: number;

  /**
   * Number of columns in the grid.
   */
  columns: number;

  /**
   * Array of React components or elements to render in the grid.
   */
  componentsToRender: React.ReactNode[];

  /**
   * Flag indicating whether to show the aspect ratio.
   */
  showAspect: boolean;

  /**
   * Background color for each grid item.
   * @default 'transparent'
   */
  backgroundColor?: string;

  /**
   * Screenboard component to overlay on the video grid.
   */
  Screenboard?: React.ReactNode;

  /**
   * Flag to annotate the screen stream.
   * @default false
   */
  annotateScreenStream?: boolean;

  /**
   * The local screen stream to use for annotation.
   */
  localStreamScreen?: MediaStream;

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

export type FlexibleVideoType = (options: FlexibleVideoOptions) => JSX.Element

/**
 * FlexibleVideo - Video grid layout with screen sharing and annotation support
 * 
 * FlexibleVideo is a specialized React Native component for displaying video streams
 * in a flexible grid layout. It extends FlexibleGrid with additional support for
 * screen sharing overlays and real-time annotation capabilities.
 * 
 * **Key Features:**
 * - Dynamic video grid with custom rows/columns
 * - Aspect ratio preservation for video streams
 * - Screen sharing overlay (Screenboard) support
 * - Real-time screen annotation capabilities
 * - Custom cell dimensions and background colors
 * - Efficient video stream rendering
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.flexibleVideoComponent` to
 * provide a completely custom video grid implementation.
 * 
 * @component
 * @param {FlexibleVideoOptions} props - Configuration options for the FlexibleVideo component
 * 
 * @returns {JSX.Element} Rendered video grid with optional screen sharing overlay
 * 
 * @example
 * // Basic usage - 2x2 video grid
 * import React from 'react';
 * import { FlexibleVideo, VideoCard } from 'mediasfu-reactnative-expo';
 *
 * function VideoGrid() {
 *   const participants = [p1, p2, p3, p4];
 *   
 *   const videoComponents = participants.map((p, idx) => (
 *     <VideoCard
 *       key={idx}
 *       name={p.name}
 *       participant={p}
 *       videoStream={p.stream}
 *       parameters={sessionParams}
 *     />
 *   ));
 *
 *   return (
 *     <FlexibleVideo
 *       customWidth={400}
 *       customHeight={300}
 *       rows={2}
 *       columns={2}
 *       componentsToRender={videoComponents}
 *       showAspect={true}
 *       backgroundColor="#000"
 *     />
 *   );
 * }
 * 
 * @example
 * // With screen sharing annotation
 * <FlexibleVideo
 *   customWidth={800}
 *   customHeight={600}
 *   rows={1}
 *   columns={1}
 *   componentsToRender={[screenShareVideo]}
 *   showAspect={true}
 *   backgroundColor="#1a1a2e"
 *   Screenboard={<ScreenboardComponent />}
 *   annotateScreenStream={true}
 *   localStreamScreen={localScreenStream}
 * />
 * 
 * @example
 * // Using uiOverrides for complete video grid replacement
 * import { MyCustomVideoGrid } from './MyCustomVideoGrid';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     flexibleVideoComponent: {
 *       component: MyCustomVideoGrid,
 *       injectedProps: {
 *         layout: 'spotlight',
 *         transition: 'smooth',
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomVideoGrid.tsx
 * export const MyCustomVideoGrid = (props: FlexibleVideoOptions & { layout: string; transition: string }) => {
 *   return (
 *     <View style={{ flex: 1 }}>
 *       {props.layout === 'spotlight' ? (
 *         <View style={{ flex: 1 }}>{props.componentsToRender[0]}</View>
 *       ) : (
 *         props.componentsToRender.map((component, idx) => (
 *           <View key={idx} style={{ width: props.customWidth, height: props.customHeight }}>
 *             {component}
 *           </View>
 *         ))
 *       )}
 *       {props.Screenboard}
 *     </View>
 *   );
 * };
 */

const FlexibleVideo: React.FC<FlexibleVideoOptions> = ({
  customWidth,
  customHeight,
  rows,
  columns,
  componentsToRender,
  showAspect = false,
  backgroundColor = 'transparent',
  Screenboard,
  annotateScreenStream = false,
  localStreamScreen,
  style,
  renderContent,
  renderContainer,
}) => {
  const [key, setKey] = useState<number>(0);
  const [cardWidth, setCardWidth] = useState<number>(customWidth);
  const [cardHeight, setCardHeight] = useState<number>(customHeight);
  const [, setCardTop] = useState<number>(0);
  const [cardLeft, setCardLeft] = useState<number>(0);
  const [canvasLeft, setCanvasLeft] = useState<number>(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [columns]);

  useEffect(() => {
    if (annotateScreenStream && localStreamScreen) {
      const videoTrack = localStreamScreen.getVideoTracks()[0];
      const videoSettings: MediaTrackSettings = videoTrack.getSettings();
      const videoHeight = videoSettings.height || customHeight;
      const videoWidth = videoSettings.width || customWidth;

      setCardWidth(videoWidth);
      setCardHeight(videoHeight);
      setCardTop(Math.floor((customHeight - videoHeight) / 2));
      setCardLeft(Math.floor((customWidth - videoWidth) / 2));
      setCanvasLeft(cardLeft < 0 ? cardLeft : 0);
    } else {
      setCardWidth(customWidth);
      setCardHeight(customHeight);
      setCardTop(0);
      setCardLeft(0);
      setCanvasLeft(0);
    }
  }, [
    customWidth,
    customHeight,
    localStreamScreen,
    annotateScreenStream,
    cardLeft,
  ]);

  /**
   * Renders the grid layout based on the number of rows and columns.
   *
   * @returns {React.ReactNode[]} Array of React elements representing the grid.
   */
  const renderGrid = (): React.ReactNode[] => {
    const grid: React.ReactNode[] = [];

    for (let row = 0; row < rows; row++) {
      const rowComponents: React.ReactNode[] = [];

      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        const component = componentsToRender[index];

        rowComponents.push(
          <View
            key={col}
            style={[
              styles.gridItem,
              {
                width: cardWidth,
                height: cardHeight,
                backgroundColor,
                margin: 1,
                padding: 0,
                borderRadius: 0,
                left: cardLeft,
              },
            ]}
          >
            {component}
          </View>,
        );
      }

      grid.push(
        <View key={row} style={styles.rowContainer}>
          {rowComponents}
        </View>,
      );
    }

    return grid;
  };

  const dimensions = {
    width: cardWidth * columns,
    height: cardHeight * rows,
  };

  const defaultContent = (
    <>
      {renderGrid()}
      {Screenboard && (
        <View
          style={[
            styles.screenboardOverlay,
            {
              top: 0,
              left: canvasLeft,
              width: cardWidth,
              height: cardHeight,
              backgroundColor: 'rgba(0, 0, 0, 0.005)',
              zIndex: 2,
            },
          ]}
        >
          {Screenboard}
        </View>
      )}
    </>
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View
      key={key}
      style={[
        styles.gridContainer,
        {
          padding: 0,
          flex: 1,
          margin: 0,
          position: 'relative',
          display: showAspect ? 'flex' : 'none',
          maxWidth: customWidth,
          overflow: 'hidden',
          left: cardLeft > 0 ? cardLeft : 0,
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

export default FlexibleVideo;

/**
 * Stylesheet for the FlexibleVideo component.
 */
const styles = StyleSheet.create({
  gridContainer: {
    // Additional container styles can be added here if needed
  },
  rowContainer: {
    flexDirection: 'row',
  },
  gridItem: {
    flex: 1,
    margin: 1,
    padding: 0,
    borderRadius: 0,
  },
  screenboardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    // width and height are set dynamically via inline styles
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    zIndex: 2,
    // Additional overlay styles can be added here
  },
});
