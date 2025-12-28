// MainScreenComponent.tsx

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Dimensions,
  ScaledSize,
} from 'react-native';

/**
 * Calculated dimensions for main and secondary components in a split layout.
 * 
 * @interface ComponentSizes
 * 
 * @property {number} mainHeight - Height of the main component in pixels
 * @property {number} otherHeight - Height of the secondary component in pixels
 * @property {number} mainWidth - Width of the main component in pixels
 * @property {number} otherWidth - Width of the secondary component in pixels
 */
export interface ComponentSizes {
  mainHeight: number;
  otherHeight: number;
  mainWidth: number;
  otherWidth: number;
}

/**
 * Configuration options for the MainScreenComponent.
 * 
 * @interface MainScreenComponentOptions
 * 
 * **Content:**
 * @property {React.ReactNode} children - Child components (typically two: main content and secondary content)
 * 
 * **Layout Configuration:**
 * @property {number} mainSize - Percentage size of the main component when stacking (0-100, e.g., 70 means main takes 70% of space)
 * @property {boolean} doStack - Whether to stack components (true = stack, false = side-by-side)
 * 
 * **Dimensions (Responsive):**
 * @property {number} [containerWidthFraction=1] - Fraction of window width to use (0.0 to 1.0)
 * @property {number} [containerHeightFraction=1] - Fraction of window height to use (0.0 to 1.0)
 * @property {number} [defaultFraction=0.94] - Height adjustment fraction when controls are shown
 * 
 * **Control Bar Adjustment:**
 * @property {boolean} showControls - Whether control bar is visible (affects available height)
 * 
 * **State Management:**
 * @property {ComponentSizes} componentSizes - Current calculated sizes for main and secondary components
 * @property {function} updateComponentSizes - Callback invoked when component sizes change (receives ComponentSizes)
 * 
 * **Styling:**
 * @property {object} [style] - Additional custom styles to apply to the container
 * 
 * **Advanced Render Overrides:**
 * @property {function} [renderContent] - Optional custom renderer for content (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Optional custom renderer for outer container (receives defaultContainer and dimensions)
 */
export interface MainScreenComponentOptions {
  children: React.ReactNode;
  mainSize: number;
  doStack: boolean;
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  updateComponentSizes: (sizes: ComponentSizes) => void;
  defaultFraction?: number;
  showControls: boolean;
  componentSizes: ComponentSizes;
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

/**
 * Props for resizable child components within MainScreenComponent.
 * 
 * @interface ResizableChildOptions
 * 
 * @property {number} mainSize - Percentage size of the main component (0-100)
 * @property {boolean} isWideScreen - Whether current screen width qualifies as wide (>= 768px)
 * @property {StyleProp<ViewStyle>} [style] - Optional additional styles for the child component
 */
export interface ResizableChildOptions {
  mainSize: number;
  isWideScreen: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Type guard to determine if a child component conforms to ResizableChildOptions.
 * @param child - The child to check.
 * @returns True if the child is a React element with ResizableChildOptions, false otherwise.
 */
const isResizableChild = (
  child: any,
): child is React.ReactElement<ResizableChildOptions> => (
  child
    && typeof child === 'object'
    && 'props' in child
    && typeof child.props === 'object'
);

export type MainScreenComponentType = (
  options: MainScreenComponentOptions
) => JSX.Element;

/**
 * MainScreenComponent - Responsive split-screen layout with dynamic sizing
 * 
 * MainScreenComponent is a React Native component that manages split-screen layouts
 * with main and secondary content areas. It dynamically calculates component dimensions
 * based on stacking mode, screen size, and percentage allocations, automatically adapting
 * to window resizing and orientation changes.
 * 
 * **Key Features:**
 * - Dynamic split-screen layout (stacked or side-by-side)
 * - Percentage-based size allocation for main component
 * - Automatic dimension calculation with responsive updates
 * - Screen width-based layout switching (narrow screens force stacking)
 * - Control bar height adjustment
 * - Component size state management via callbacks
 * - Window resize/rotation handling
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.mainScreenComponent` to
 * provide a completely custom split-screen layout system.
 * 
 * @component
 * @param {MainScreenComponentOptions} props - Configuration options for the split-screen layout
 * 
 * @returns {JSX.Element} Rendered split-screen container with calculated dimensions
 * 
 * @example
 * // Basic usage - 70/30 vertical split
 * import React, { useState } from 'react';
 * import { MainScreenComponent, ComponentSizes } from 'mediasfu-reactnative-expo';
 * 
 * function SplitScreenMeeting() {
 *   const [sizes, setSizes] = useState<ComponentSizes>({
 *     mainHeight: 0,
 *     otherHeight: 0,
 *     mainWidth: 0,
 *     otherWidth: 0,
 *   });
 * 
 *   return (
 *     <MainScreenComponent
 *       mainSize={70}
 *       doStack={true}
 *       containerWidthFraction={1}
 *       containerHeightFraction={1}
 *       showControls={true}
 *       componentSizes={sizes}
 *       updateComponentSizes={setSizes}
 *     >
 *       <MainVideoGrid />
 *       <ParticipantsList />
 *     </MainScreenComponent>
 *   );
 * }
 * 
 * @example
 * // Side-by-side layout (no stacking)
 * <MainScreenComponent
 *   mainSize={60}
 *   doStack={false}
 *   containerWidthFraction={0.95}
 *   containerHeightFraction={0.9}
 *   showControls={true}
 *   componentSizes={sizes}
 *   updateComponentSizes={setSizes}
 * >
 *   <VideoArea />
 *   <ChatPanel />
 * </MainScreenComponent>
 * 
 * @example
 * // With custom content renderer (add divider)
 * <MainScreenComponent
 *   mainSize={75}
 *   doStack={true}
 *   showControls={true}
 *   componentSizes={sizes}
 *   updateComponentSizes={setSizes}
 *   renderContent={({ defaultContent, dimensions }) => {
 *     const children = React.Children.toArray(defaultContent);
 *     return (
 *       <>
 *         {children[0]}
 *         <View style={{ height: 2, backgroundColor: '#007bff', width: '100%' }} />
 *         {children[1]}
 *       </>
 *     );
 *   }}
 * >
 *   <MainContent />
 *   <SecondaryContent />
 * </MainScreenComponent>
 * 
 * @example
 * // Using uiOverrides for complete layout replacement
 * import { MyCustomSplitScreen } from './MyCustomSplitScreen';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     mainScreenComponent: {
 *       component: MyCustomSplitScreen,
 *       injectedProps: {
 *         animateTransitions: true,
 *         minMainSize: 50,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomSplitScreen.tsx
 * export const MyCustomSplitScreen = (props: MainScreenComponentOptions & { animateTransitions: boolean; minMainSize: number }) => {
 *   const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
 * 
 *   React.useEffect(() => {
 *     const calculateSizes = () => {
 *       const { width, height } = Dimensions.get('window');
 *       const actualMainSize = Math.max(props.mainSize, props.minMainSize);
 *       const mainHeight = props.doStack ? (height * actualMainSize) / 100 : height;
 *       const otherHeight = props.doStack ? height - mainHeight : height;
 *       
 *       props.updateComponentSizes({
 *         mainHeight,
 *         otherHeight,
 *         mainWidth: width,
 *         otherWidth: width,
 *       });
 *       setDimensions({ width, height });
 *     };
 *     
 *     const subscription = Dimensions.addEventListener('change', calculateSizes);
 *     calculateSizes();
 *     return () => subscription?.remove();
 *   }, [props.mainSize, props.doStack]);
 * 
 *   const children = React.Children.toArray(props.children);
 *   return (
 *     <View style={{ flex: 1, flexDirection: props.doStack ? 'column' : 'row' }}>
 *       {children}
 *     </View>
 *   );
 * };
 */

const MainScreenComponent: React.FC<MainScreenComponentOptions> = ({
  children,
  mainSize,
  doStack,
  containerWidthFraction = 1,
  containerHeightFraction = 1,
  updateComponentSizes,
  defaultFraction = 0.94,
  showControls,
  componentSizes,
  style,
  renderContent,
  renderContainer,
}) => {
  const { width: windowWidth, height: windowHeight }: ScaledSize = Dimensions.get('window');

  // Calculate parent dimensions based on fractions and control visibility
  const parentWidth = containerWidthFraction * windowWidth;
  const parentHeight = showControls
    ? containerHeightFraction * windowHeight * defaultFraction
    : containerHeightFraction * windowHeight;

  // Determine if the screen is wide
  let isWideScreen = parentWidth >= 768;

  if (!isWideScreen && parentWidth > 1.5 * parentHeight) {
    isWideScreen = true;
  }

  /**
   * Computes the dimensions for the main and other components based on stacking mode and screen width.
   * @returns {ComponentSizes} The calculated sizes for the components.
   */
  const computeDimensions = (): ComponentSizes => {
    if (doStack) {
      if (isWideScreen) {
        return {
          mainHeight: parentHeight,
          otherHeight: parentHeight,
          mainWidth: Math.floor((mainSize / 100) * parentWidth),
          otherWidth: Math.floor(((100 - mainSize) / 100) * parentWidth),
        };
      }
      return {
        mainHeight: Math.floor((mainSize / 100) * parentHeight),
        otherHeight: Math.floor(((100 - mainSize) / 100) * parentHeight),
        mainWidth: parentWidth,
        otherWidth: parentWidth,
      };
    }
    return {
      mainHeight: parentHeight,
      otherHeight: parentHeight,
      mainWidth: parentWidth,
      otherWidth: parentWidth,
    };
  };

  useEffect(() => {
    const {
      mainHeight, otherHeight, mainWidth, otherWidth,
    } = computeDimensions();
    updateComponentSizes({
      mainHeight, otherHeight, mainWidth, otherWidth,
    });

  }, [parentWidth, parentHeight, mainSize, doStack, isWideScreen]);

  const dimensions = {
    width: parentWidth,
    height: parentHeight,
  };

  const defaultContent = (
    <>
      {/* Render child components with updated dimensions */}
      {React.Children.map(children, (child, index) => {
        if (isResizableChild(child)) {
          const childStyle = doStack
            ? {
              height: index === 0 ? componentSizes.mainHeight : componentSizes.otherHeight,
              width: index === 0 ? componentSizes.mainWidth : componentSizes.otherWidth,
            }
            : {
              height: componentSizes.mainHeight,
              width: componentSizes.mainWidth,
            };

          return React.cloneElement(child, {
            mainSize,
            isWideScreen,
            style: [child.props.style, childStyle],
            key: index,
          });
        }
        return null;
      })}
    </>
  );

  const content = renderContent
    ? renderContent({ defaultContent, dimensions })
    : defaultContent;

  const defaultContainer = (
    <View
      style={[
        styles.screenContainer,
        {
          flexDirection: isWideScreen ? 'row' : 'column',
          width: parentWidth,
          height: parentHeight,
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

export default MainScreenComponent;

/**
 * Stylesheet for the MainScreenComponent.
 */
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
});
