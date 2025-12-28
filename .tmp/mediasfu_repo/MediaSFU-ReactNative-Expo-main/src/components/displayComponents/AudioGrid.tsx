// AudioGrid.tsx

import React from 'react';
import {
  View,
} from 'react-native';

/**
 * Configuration options for the AudioGrid component.
 * 
 * @interface AudioGridOptions
 * 
 * **Grid Content:**
 * @property {React.ReactNode[]} componentsToRender - Array of React components (typically AudioCard instances) to display in the grid
 * 
 * **Styling:**
 * @property {object} [style] - Optional custom styles for the grid container (merged with default styles)
 * 
 * **Advanced Render Overrides:**
 * @property {function} [renderContent] - Optional custom renderer for grid content (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Optional custom renderer for the outer container (receives defaultContainer and dimensions)
 */
export interface AudioGridOptions {
  componentsToRender: React.ReactNode[];
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

export type AudioGridType = (options: AudioGridOptions) => React.ReactNode;

/**
 * AudioGrid - Flexible layout container for audio-only participant displays
 * 
 * AudioGrid is a React Native component that organizes multiple audio participant
 * cards into a vertical stacked layout. It's typically used to display participants
 * who are not sharing video, showing their avatar, name, and audio waveform.
 * 
 * **Key Features:**
 * - Vertical stacking of audio participant cards
 * - Flexible z-index management for overlays
 * - Custom styling support
 * - Advanced render override hooks
 * - Efficient rendering of large participant lists
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.audioGridComponent` to
 * provide a completely custom audio participant grid layout.
 * 
 * @component
 * @param {AudioGridOptions} props - Configuration options for the AudioGrid component
 * 
 * @returns {JSX.Element} Rendered audio grid with participant cards
 * 
 * @example
 * // Basic usage - Display audio-only participants
 * import React from 'react';
 * import { AudioGrid, AudioCard } from 'mediasfu-reactnative-expo';
 * 
 * function AudioParticipantsList() {
 *   const audioParticipants = [
 *     { name: 'Alice', audioProducerId: 'audio1', muted: false },
 *     { name: 'Bob', audioProducerId: 'audio2', muted: true },
 *     { name: 'Charlie', audioProducerId: 'audio3', muted: false },
 *   ];
 * 
 *   const audioCards = audioParticipants.map((participant, index) => (
 *     <AudioCard
 *       key={participant.audioProducerId}
 *       name={participant.name}
 *       barColor="red"
 *       textColor="white"
 *       imageSource={participant.avatar}
 *       roundedImage={true}
 *       imageStyle={{ width: 50, height: 50 }}
 *     />
 *   ));
 * 
 *   return <AudioGrid componentsToRender={audioCards} />;
 * }
 * 
 * @example
 * // With custom styling
 * <AudioGrid
 *   componentsToRender={audioCards}
 *   style={{
 *     backgroundColor: '#f0f0f0',
 *     padding: 10,
 *     borderRadius: 8,
 *   }}
 * />
 * 
 * @example
 * // With custom content renderer (add separator lines)
 * <AudioGrid
 *   componentsToRender={audioCards}
 *   renderContent={({ defaultContent }) => (
 *     <>
 *       {React.Children.map(defaultContent, (child, index) => (
 *         <React.Fragment key={index}>
 *           {child}
 *           {index < audioCards.length - 1 && (
 *             <View style={{ height: 1, backgroundColor: '#e0e0e0' }} />
 *           )}
 *         </React.Fragment>
 *       ))}
 *     </>
 *   )}
 * />
 * 
 * @example
 * // Using uiOverrides for complete grid replacement
 * import { MyCustomAudioGrid } from './MyCustomAudioGrid';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     audioGridComponent: {
 *       component: MyCustomAudioGrid,
 *       injectedProps: {
 *         gridLayout: 'masonry',
 *         itemSpacing: 12,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomAudioGrid.tsx
 * export const MyCustomAudioGrid = (props: AudioGridOptions & { gridLayout: string; itemSpacing: number }) => {
 *   return (
 *     <View style={{ flexDirection: 'column', gap: props.itemSpacing }}>
 *       {props.componentsToRender.map((component, index) => (
 *         <View key={index} style={{ padding: props.itemSpacing }}>
 *           {component}
 *         </View>
 *       ))}
 *     </View>
 *   );
 * };
 */

const AudioGrid: React.FC<AudioGridOptions> = ({ 
  componentsToRender,
  style,
  renderContent,
  renderContainer,
}) => {
  /**
   * renderGrid - Renders componentsToRender array into a grid.
   * @returns {React.ReactNode[]} - An array of React components rendered in the grid.
   */
  const renderGrid = (): React.ReactNode[] => {
    const renderedComponents = [];

    for (let index = 0; index < componentsToRender.length; index++) {
      const component = componentsToRender[index];
      renderedComponents.push(<View style={{ zIndex: 9 }} key={index}>{component}</View>);
    }

    return renderedComponents;
  };

  const dimensions = { width: 0, height: 0 }; // AudioGrid doesn't have fixed dimensions

  const defaultContent = renderGrid();
  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View style={[{ zIndex: 9 }, style]}>{content}</View>
  );

  return renderContainer 
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default AudioGrid;
