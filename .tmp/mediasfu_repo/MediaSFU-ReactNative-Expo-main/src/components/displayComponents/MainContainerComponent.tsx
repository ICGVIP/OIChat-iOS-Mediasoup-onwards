// MainContainerComponent.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScaledSize,
} from 'react-native';

/**
 * Configuration options for the MainContainerComponent.
 * 
 * @interface MainContainerComponentOptions
 * 
 * **Content:**
 * @property {React.ReactNode} children - Child elements to render inside the container
 * 
 * **Dimensions (Responsive):**
 * @property {number} [containerWidthFraction=1] - Fraction of window width to use (0.0 to 1.0)
 * @property {number} [containerHeightFraction=1] - Fraction of window height to use (0.0 to 1.0)
 * 
 * **Spacing:**
 * @property {number} [marginLeft=0] - Left margin in pixels
 * @property {number} [marginRight=0] - Right margin in pixels
 * @property {number} [marginTop=0] - Top margin in pixels
 * @property {number} [marginBottom=0] - Bottom margin in pixels
 * @property {number} [padding=0] - Internal padding in pixels
 * 
 * **Styling:**
 * @property {string} [backgroundColor='transparent'] - Background color for the container
 * @property {object} [style] - Additional custom styles to apply to the container
 * 
 * **Advanced Render Overrides:**
 * @property {function} [renderContent] - Optional custom renderer for content (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Optional custom renderer for outer container (receives defaultContainer and dimensions)
 */
export interface MainContainerComponentOptions {
  backgroundColor?: string;
  children: React.ReactNode;
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  padding?: number;
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

export type MainContainerComponentType = (
  options: MainContainerComponentOptions
) => JSX.Element;

/**
 * MainContainerComponent - Top-level responsive layout container
 * 
 * MainContainerComponent is a React Native component that provides the primary
 * layout container for the entire meeting interface. It automatically responds
 * to window size changes and calculates dimensions based on fractional values,
 * enabling consistent layouts across different screen sizes and orientations.
 * 
 * **Key Features:**
 * - Responsive dimension calculation based on window size
 * - Fractional width/height support (e.g., 0.9 = 90% of window)
 * - Automatic recalculation on window resize/rotation
 * - Configurable margins and padding
 * - Custom background color support
 * - Advanced render override hooks
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.mainContainerComponent` to
 * provide a completely custom top-level layout container.
 * 
 * @component
 * @param {MainContainerComponentOptions} props - Configuration options for the main container
 * 
 * @returns {JSX.Element} Rendered responsive main container
 * 
 * @example
 * // Basic usage - Full-screen container
 * import React from 'react';
 * import { MainContainerComponent } from 'mediasfu-reactnative-expo';
 * import { Text } from 'react-native';
 * 
 * function MeetingApp() {
 *   return (
 *     <MainContainerComponent backgroundColor="#000000">
 *       <Text style={{ color: 'white' }}>Meeting Content</Text>
 *     </MainContainerComponent>
 *   );
 * }
 * 
 * @example
 * // With fractional dimensions and margins
 * <MainContainerComponent
 *   backgroundColor="#1a1a1a"
 *   containerWidthFraction={0.95}
 *   containerHeightFraction={0.9}
 *   marginLeft={20}
 *   marginRight={20}
 *   marginTop={10}
 *   marginBottom={10}
 *   padding={15}
 * >
 *   <MeetingLayout />
 * </MainContainerComponent>
 * 
 * @example
 * // With custom content renderer (add header/footer)
 * <MainContainerComponent
 *   backgroundColor="white"
 *   renderContent={({ defaultContent, dimensions }) => (
 *     <>
 *       <View style={{ height: 60, backgroundColor: '#007bff' }}>
 *         <Text>Meeting Header</Text>
 *       </View>
 *       {defaultContent}
 *       <View style={{ height: 40, backgroundColor: '#f0f0f0' }}>
 *         <Text>Footer - {dimensions.width}x{dimensions.height}</Text>
 *       </View>
 *     </>
 *   )}
 * >
 *   <MeetingContent />
 * </MainContainerComponent>
 * 
 * @example
 * // Using uiOverrides for complete container replacement
 * import { MyCustomMainContainer } from './MyCustomMainContainer';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     mainContainerComponent: {
 *       component: MyCustomMainContainer,
 *       injectedProps: {
 *         theme: 'dark',
 *         showGrid: true,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomMainContainer.tsx
 * export const MyCustomMainContainer = (props: MainContainerComponentOptions & { theme: string; showGrid: boolean }) => {
 *   return (
 *     <View style={{ 
 *       flex: 1, 
 *       backgroundColor: props.theme === 'dark' ? '#000' : '#fff',
 *       borderWidth: props.showGrid ? 1 : 0,
 *     }}>
 *       {props.children}
 *     </View>
 *   );
 * };
 */

const MainContainerComponent: React.FC<MainContainerComponentOptions> = ({
  backgroundColor = 'transparent',
  children,
  containerWidthFraction = 1,
  containerHeightFraction = 1,
  marginLeft = 0,
  marginRight = 0,
  marginTop = 0,
  marginBottom = 0,
  padding = 0,
  style,
  renderContent,
  renderContainer,
}) => {
  // State to store calculated aspect styles
  const [aspectStyles, setAspectStyles] = useState<{
    height: number;
    width: number;
    maxHeight: number;
    maxWidth: number;
  }>({
    height: Math.floor(containerHeightFraction * Dimensions.get('window').height),
    width: Math.floor(containerWidthFraction * Dimensions.get('window').width),
    maxHeight: Math.floor(containerHeightFraction * Dimensions.get('window').height),
    maxWidth: Math.floor(containerWidthFraction * Dimensions.get('window').width),
  });

  useEffect(() => {
    const updateAspectStyles = ({ window }: { window: ScaledSize; screen: ScaledSize }) => {
      const windowHeight = window.height;
      const windowWidth = window.width;

      setAspectStyles({
        height: Math.floor(containerHeightFraction * windowHeight),
        width: Math.floor(containerWidthFraction * windowWidth),
        maxHeight: Math.floor(containerHeightFraction * windowHeight),
        maxWidth: Math.floor(containerWidthFraction * windowWidth),
      });
    };

    // Initial setup
    const { width, height } = Dimensions.get('window');
    updateAspectStyles({
      window: {
        width, height, scale: 1, fontScale: 1,
      },
      screen: {
        width, height, scale: 1, fontScale: 1,
      },
    });

    // Subscribe to dimension changes
    const subscription = Dimensions.addEventListener('change', updateAspectStyles);

    return () => {
      // Cleanup listener on component unmount
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      } else {
        // For older React Native versions
        subscription.remove();
      }
    };
  }, [
    containerHeightFraction,
    containerWidthFraction,
  ]);

  const dimensions = {
    width: aspectStyles.width,
    height: aspectStyles.height,
  };

  const defaultContent = children;
  const content = renderContent
    ? renderContent({ defaultContent, dimensions })
    : defaultContent;

  const defaultContainer = (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          marginLeft,
          marginRight,
          marginTop,
          marginBottom,
          padding,
          height: aspectStyles.height,
          width: aspectStyles.width,
          maxHeight: aspectStyles.maxHeight,
          maxWidth: aspectStyles.maxWidth,
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

export default MainContainerComponent;

/**
 * Stylesheet for the MainContainerComponent.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
});
