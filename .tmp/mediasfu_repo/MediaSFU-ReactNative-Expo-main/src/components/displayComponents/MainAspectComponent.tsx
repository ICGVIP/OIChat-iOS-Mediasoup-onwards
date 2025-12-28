// MainAspectComponent.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScaledSize,
} from 'react-native';

/**
 * Configuration options for the MainAspectComponent.
 * 
 * @interface MainAspectComponentOptions
 * 
 * **Content:**
 * @property {React.ReactNode} children - Child components to render inside the aspect container
 * 
 * **Dimensions (Responsive):**
 * @property {number} [containerWidthFraction=1] - Fraction of window width to use (0.0 to 1.0)
 * @property {number} [containerHeightFraction=1] - Fraction of window height to use (0.0 to 1.0)
 * @property {number} [defaultFraction=0.94] - Height adjustment fraction when controls are shown (applies to height calculation)
 * 
 * **Control Bar Adjustment:**
 * @property {boolean} [showControls=true] - Whether control bar is visible (adjusts available height using defaultFraction)
 * 
 * **Screen Size Callbacks:**
 * @property {function} updateIsWideScreen - Callback invoked when wide screen state changes (width >= 768px)
 * @property {function} updateIsMediumScreen - Callback invoked when medium screen state changes (576px <= width < 768px)
 * @property {function} updateIsSmallScreen - Callback invoked when small screen state changes (width < 576px)
 * 
 * **Styling:**
 * @property {string} [backgroundColor='transparent'] - Background color for the aspect container
 * @property {object} [style] - Additional custom styles to apply to the container
 * 
 * **Advanced Render Overrides:**
 * @property {function} [renderContent] - Optional custom renderer for content (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Optional custom renderer for outer container (receives defaultContainer and dimensions)
 */
export interface MainAspectComponentOptions {
  backgroundColor?: string;
  children: React.ReactNode;
  showControls?: boolean;
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  defaultFraction?: number;
  updateIsWideScreen: (isWide: boolean) => void;
  updateIsMediumScreen: (isMedium: boolean) => void;
  updateIsSmallScreen: (isSmall: boolean) => void;
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

export type MainAspectComponentType = (
  options: MainAspectComponentOptions
) => JSX.Element;

/**
 * MainAspectComponent - Responsive container with screen size detection
 * 
 * MainAspectComponent is a React Native component that dynamically adjusts its
 * dimensions based on window size and provides real-time screen size state updates
 * (wide/medium/small). It automatically recalculates dimensions on window resize
 * and adjusts available height when control bars are visible.
 * 
 * **Key Features:**
 * - Responsive dimension calculation based on window size
 * - Automatic screen size classification (wide >= 768px, medium 576-767px, small < 576px)
 * - Height adjustment for control bar visibility
 * - Real-time window resize/rotation handling
 * - Screen size state callbacks for adaptive UI
 * - Custom fractional sizing support
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.mainAspectComponent` to
 * provide a completely custom aspect-aware container.
 * 
 * @component
 * @param {MainAspectComponentOptions} props - Configuration options for the aspect container
 * 
 * @returns {JSX.Element} Rendered responsive aspect container
 * 
 * @example
 * // Basic usage - Full-screen with control bar adjustment
 * import React from 'react';
 * import { MainAspectComponent } from 'mediasfu-reactnative-expo';
 * 
 * function ResponsiveMeetingLayout() {
 *   const [isWide, setIsWide] = React.useState(false);
 *   const [isMedium, setIsMedium] = React.useState(false);
 *   const [isSmall, setIsSmall] = React.useState(false);
 * 
 *   return (
 *     <MainAspectComponent
 *       backgroundColor="#000000"
 *       showControls={true}
 *       containerWidthFraction={1}
 *       containerHeightFraction={1}
 *       defaultFraction={0.94}
 *       updateIsWideScreen={setIsWide}
 *       updateIsMediumScreen={setIsMedium}
 *       updateIsSmallScreen={setIsSmall}
 *     >
 *       {isWide && <WideScreenLayout />}
 *       {isMedium && <MediumScreenLayout />}
 *       {isSmall && <SmallScreenLayout />}
 *     </MainAspectComponent>
 *   );
 * }
 * 
 * @example
 * // Custom fractions without control bar adjustment
 * <MainAspectComponent
 *   backgroundColor="white"
 *   showControls={false}
 *   containerWidthFraction={0.85}
 *   containerHeightFraction={0.9}
 *   updateIsWideScreen={(isWide) => console.log('Wide:', isWide)}
 *   updateIsMediumScreen={(isMedium) => console.log('Medium:', isMedium)}
 *   updateIsSmallScreen={(isSmall) => console.log('Small:', isSmall)}
 * >
 *   <MeetingContent />
 * </MainAspectComponent>
 * 
 * @example
 * // With custom content renderer (add breakpoint indicator)
 * <MainAspectComponent
 *   backgroundColor="#f0f0f0"
 *   showControls={true}
 *   updateIsWideScreen={setIsWide}
 *   updateIsMediumScreen={setIsMedium}
 *   updateIsSmallScreen={setIsSmall}
 *   renderContent={({ defaultContent, dimensions }) => (
 *     <>
 *       <View style={{ position: 'absolute', top: 5, right: 5, zIndex: 100 }}>
 *         <Text>
 *           {dimensions.width >= 768 ? 'Wide' : dimensions.width >= 576 ? 'Medium' : 'Small'}
 *           ({dimensions.width}x{dimensions.height})
 *         </Text>
 *       </View>
 *       {defaultContent}
 *     </>
 *   )}
 * >
 *   <ResponsiveGrid />
 * </MainAspectComponent>
 * 
 * @example
 * // Using uiOverrides for complete aspect container replacement
 * import { MyCustomAspectContainer } from './MyCustomAspectContainer';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     mainAspectComponent: {
 *       component: MyCustomAspectContainer,
 *       injectedProps: {
 *         customBreakpoints: { wide: 1024, medium: 640 },
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomAspectContainer.tsx
 * export const MyCustomAspectContainer = (props: MainAspectComponentOptions & { customBreakpoints: { wide: number; medium: number } }) => {
 *   const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
 * 
 *   React.useEffect(() => {
 *     const updateDimensions = () => {
 *       const { width, height } = Dimensions.get('window');
 *       setDimensions({ width, height });
 *       props.updateIsWideScreen(width >= props.customBreakpoints.wide);
 *       props.updateIsMediumScreen(width >= props.customBreakpoints.medium && width < props.customBreakpoints.wide);
 *       props.updateIsSmallScreen(width < props.customBreakpoints.medium);
 *     };
 *     const subscription = Dimensions.addEventListener('change', updateDimensions);
 *     updateDimensions();
 *     return () => subscription?.remove();
 *   }, []);
 * 
 *   return (
 *     <View style={{ width: dimensions.width, height: dimensions.height, backgroundColor: props.backgroundColor }}>
 *       {props.children}
 *     </View>
 *   );
 * };
 */

const MainAspectComponent: React.FC<MainAspectComponentOptions> = ({
  backgroundColor = 'transparent',
  children,
  showControls = true,
  containerWidthFraction = 1,
  containerHeightFraction = 1,
  defaultFraction = 0.94,
  updateIsWideScreen,
  updateIsMediumScreen,
  updateIsSmallScreen,
  style,
  renderContent,
  renderContainer,
}) => {
  const [aspectStyles, setAspectStyles] = useState<{
    height: number;
    width: number;
  }>({
    height: showControls
      ? Math.floor(containerHeightFraction * Dimensions.get('window').height * defaultFraction)
      : Math.floor(containerHeightFraction * Dimensions.get('window').height),
    width: Math.floor(containerWidthFraction * Dimensions.get('window').width),
  });

  useEffect(() => {
    const updateAspectStyles = ({ window }: { window: ScaledSize; screen: ScaledSize }) => {
      const windowHeight = window.height;
      const windowWidth = window.width;

      const parentWidth = Math.floor(containerWidthFraction * windowWidth);
      const parentHeight = showControls
        ? Math.floor(containerHeightFraction * windowHeight * defaultFraction)
        : Math.floor(containerHeightFraction * windowHeight);

      let isWideScreen = parentWidth >= 768;
      const isMediumScreen = parentWidth >= 576 && parentWidth < 768;
      const isSmallScreen = parentWidth < 576;

      if (!isWideScreen && parentWidth > 1.5 * parentHeight) {
        isWideScreen = true;
      }

      updateIsWideScreen(isWideScreen);
      updateIsMediumScreen(isMediumScreen);
      updateIsSmallScreen(isSmallScreen);

      setAspectStyles({
        height: showControls
          ? Math.floor(containerHeightFraction * windowHeight * defaultFraction)
          : Math.floor(containerHeightFraction * windowHeight),
        width: Math.floor(containerWidthFraction * windowWidth),
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
      if (subscription?.remove) {
        subscription.remove();
      } else {
        // For older React Native versions
        subscription.remove();
      }
    };
  }, [
    showControls,
    containerHeightFraction,
    containerWidthFraction,
    defaultFraction,
    updateIsWideScreen,
    updateIsMediumScreen,
    updateIsSmallScreen,
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
        styles.aspectContainer,
        {
          backgroundColor,
          height: aspectStyles.height,
          width: aspectStyles.width,
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

export default MainAspectComponent;

/**
 * Stylesheet for the MainAspectComponent.
 */
const styles = StyleSheet.create({
  aspectContainer: {
    flex: 1,
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  },
});
