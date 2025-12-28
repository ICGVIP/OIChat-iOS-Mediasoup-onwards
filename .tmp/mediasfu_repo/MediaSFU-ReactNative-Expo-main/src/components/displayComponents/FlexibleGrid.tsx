// FlexibleGrid.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Interface defining the props for the FlexibleGrid component.
 * 
 * FlexibleGrid provides a dynamic grid layout for displaying multiple components
 * with customizable dimensions and aspect ratios.
 * 
 * @interface FlexibleGridOptions
 * 
 * **Grid Configuration:**
 * @property {number} rows - Number of rows in the grid layout
 * @property {number} columns - Number of columns in the grid layout
 * @property {React.ReactNode[]} componentsToRender - Array of components to display in grid cells
 * 
 * **Cell Dimensions:**
 * @property {number} customWidth - Width for each grid cell (in pixels)
 * @property {number} customHeight - Height for each grid cell (in pixels)
 * 
 * **Display Options:**
 * @property {boolean} [showAspect] - Whether to maintain aspect ratio for grid cells
 * @property {string} [backgroundColor="transparent"] - Background color for each grid cell
 * 
 * **Styling:**
 * @property {object} [style] - Custom styles for the grid container
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContent]
 *   Function to wrap or replace the default grid content
 * @property {(options: { defaultContainer: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace the entire grid container
 */
export interface FlexibleGridOptions {
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
  showAspect?: boolean;

  /**
   * Background color for each grid item.
   * @default 'transparent'
   */
  backgroundColor?: string;

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

export type FlexibleGridType = (options: FlexibleGridOptions) => JSX.Element;

/**
 * FlexibleGrid - Dynamic grid layout for displaying multiple components
 * 
 * FlexibleGrid is a responsive React Native component that arranges an array of
 * components in a customizable grid layout. It supports dynamic rows/columns,
 * custom cell dimensions, and aspect ratio preservation.
 * 
 * **Key Features:**
 * - Dynamic row and column configuration
 * - Custom cell dimensions
 * - Aspect ratio preservation option
 * - Background color customization per cell
 * - Responsive layout adjustments
 * - Efficient component rendering
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.flexibleGridComponent` to
 * provide a completely custom grid layout implementation.
 * 
 * @component
 * @param {FlexibleGridOptions} props - Configuration options for the FlexibleGrid component
 * 
 * @returns {JSX.Element} Rendered grid layout with components
 * 
 * @example
 * // Basic usage - 2x2 grid of video cards
 * import React from 'react';
 * import { FlexibleGrid, VideoCard } from 'mediasfu-reactnative-expo';
 * 
 * function ParticipantGrid() {
 *   const participants = [participant1, participant2, participant3, participant4];
 *   
 *   const gridComponents = participants.map((p, idx) => (
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
 *     <FlexibleGrid
 *       customWidth={200}
 *       customHeight={150}
 *       rows={2}
 *       columns={2}
 *       componentsToRender={gridComponents}
 *       backgroundColor="#000"
 *     />
 *   );
 * }
 * 
 * @example
 * // With aspect ratio and custom styling
 * <FlexibleGrid
 *   customWidth={300}
 *   customHeight={225}
 *   rows={3}
 *   columns={3}
 *   componentsToRender={audioCards}
 *   showAspect={true}
 *   backgroundColor="#1a1a2e"
 *   style={{ padding: 10, borderRadius: 8 }}
 * />
 * 
 * @example
 * // Using uiOverrides for complete grid replacement
 * import { MyCustomGrid } from './MyCustomGrid';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     flexibleGridComponent: {
 *       component: MyCustomGrid,
 *       injectedProps: {
 *         gap: 10,
 *         animateTransitions: true,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomGrid.tsx
 * export const MyCustomGrid = (props: FlexibleGridOptions & { gap: number; animateTransitions: boolean }) => {
 *   return (
 *     <View style={{ gap: props.gap }}>
 *       {props.componentsToRender.map((component, idx) => (
 *         <View key={idx} style={{ width: props.customWidth, height: props.customHeight }}>
 *           {component}
 *         </View>
 *       ))}
 *     </View>
 *   );
 * };
 * @param {number} props.columns - Number of columns in the grid.
 * @param {React.ReactNode[]} props.componentsToRender - Array of components or elements to render in the grid.
 * @param {boolean} [props.showAspect=false] - Flag to enable aspect ratio for the grid.
 * @param {string} [props.backgroundColor='transparent'] - Background color for each grid item.
 *
 * @returns {JSX.Element} The rendered FlexibleGrid component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { FlexibleGrid } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *   const components = [
 *     <Text key={1}>Item 1</Text>,
 *     <Text key={2}>Item 2</Text>,
 *     <Text key={3}>Item 3</Text>
 *   ];
 *
 *   return (
 *     <FlexibleGrid
 *       customWidth={100}
 *       customHeight={100}
 *       rows={2}
 *       columns={2}
 *       componentsToRender={components}
 *       showAspect={true}
 *       backgroundColor="lightgray"
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const FlexibleGrid: React.FC<FlexibleGridOptions> = ({
  customWidth,
  customHeight,
  rows,
  columns,
  componentsToRender,
  showAspect = false,
  backgroundColor = 'transparent',
  style,
  renderContent,
  renderContainer,
}) => {
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [columns]);

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
                width: customWidth,
                height: customHeight,
                backgroundColor,
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
    width: customWidth * columns,
    height: customHeight * rows,
  };

  const defaultContent = renderGrid();
  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View key={key} style={[styles.gridContainer, showAspect && styles.aspectContainer, style]}>
      {content}
    </View>
  );

  return renderContainer 
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default FlexibleGrid;

/**
 * Stylesheet for the FlexibleGrid component.
 */
const styles = StyleSheet.create({
  gridContainer: {
    padding: 0,
  },
  aspectContainer: {
    aspectRatio: 1,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  gridItem: {
    flex: 1,
    margin: 1,
    padding: 0,
    borderRadius: 8,
  },
});
