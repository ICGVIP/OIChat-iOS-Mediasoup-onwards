// SubAspectComponent.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Dimensions,
  ScaledSize,
} from 'react-native';

/**
 * Configuration options for the SubAspectComponent.
 * 
 * @interface SubAspectComponentOptions
 * 
 * **Content:**
 * @property {React.ReactNode} children - Child components to render inside the sub-aspect container
 * 
 * **Dimensions (Responsive):**
 * @property {number} [containerWidthFraction=1.0] - Fraction of window width to use (0.0 to 1.0)
 * @property {number} [containerHeightFraction=1.0] - Fraction of window height to use (0.0 to 1.0)
 * @property {number} [defaultFractionSub=0.0] - Additional height adjustment fraction when controls are visible
 * 
 * **Display Control:**
 * @property {boolean} [showControls=true] - Whether controls are visible (affects height calculation with defaultFractionSub)
 * 
 * **Styling:**
 * @property {string} backgroundColor - Background color for the sub-aspect container
 * @property {object} [style] - Additional custom styles to apply to the container
 * 
 * **Advanced Render Overrides:**
 * @property {function} [renderContent] - Optional custom renderer for content (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Optional custom renderer for outer container (receives defaultContainer and dimensions)
 */
export interface SubAspectComponentOptions {
  backgroundColor: string;
  children: React.ReactNode;
  showControls?: boolean;
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  defaultFractionSub?: number;
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

export type SubAspectComponentType = (options: SubAspectComponentOptions) => JSX.Element;

/**
 * SubAspectComponent - Secondary responsive container for auxiliary content
 * 
 * SubAspectComponent is a React Native component that provides a responsive
 * sub-container typically used for secondary content areas (e.g., chat panels,
 * participant lists, control bars). It calculates dimensions based on window size
 * and control visibility, automatically adjusting on resize/rotation.
 * 
 * **Key Features:**
 * - Responsive dimension calculation with fractional sizing
 * - Control visibility-based height adjustment
 * - Automatic window resize/rotation handling
 * - Custom background color support
 * - Flexible positioning for auxiliary content
 * - Advanced render override hooks
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.subAspectComponent` to
 * provide a completely custom secondary container.
 * 
 * @component
 * @param {SubAspectComponentOptions} props - Configuration options for the sub-aspect container
 * 
 * @returns {JSX.Element} Rendered responsive sub-aspect container
 * 
 * @example
 * // Basic usage - Bottom control bar area
 * import React from 'react';
 * import { SubAspectComponent } from 'mediasfu-reactnative-expo';
 * 
 * function ControlBarArea() {
 *   return (
 *     <SubAspectComponent
 *       backgroundColor="#2c2c2c"
 *       showControls={true}
 *       containerWidthFraction={1.0}
 *       containerHeightFraction={0.1}
 *       defaultFractionSub={0}
 *     >
 *       <ControlButtons />
 *     </SubAspectComponent>
 *   );
 * }
 * 
 * @example
 * // Side panel with custom sizing
 * <SubAspectComponent
 *   backgroundColor="#f5f5f5"
 *   showControls={true}
 *   containerWidthFraction={0.25}
 *   containerHeightFraction={0.8}
 *   defaultFractionSub={0.05}
 * >
 *   <ParticipantsSidebar />
 * </SubAspectComponent>
 * 
 * @example
 * // With custom content renderer (add header)
 * <SubAspectComponent
 *   backgroundColor="white"
 *   containerWidthFraction={0.3}
 *   containerHeightFraction={0.7}
 *   renderContent={({ defaultContent, dimensions }) => (
 *     <>
 *       <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
 *         <Text style={{ fontWeight: 'bold' }}>Chat Panel</Text>
 *       </View>
 *       {defaultContent}
 *     </>
 *   )}
 * >
 *   <ChatMessages />
 * </SubAspectComponent>
 * 
 * @example
 * // Using uiOverrides for complete sub-aspect replacement
 * import { MyCustomSubAspect } from './MyCustomSubAspect';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     subAspectComponent: {
 *       component: MyCustomSubAspect,
 *       injectedProps: {
 *         collapsible: true,
 *         minHeight: 50,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomSubAspect.tsx
 * export const MyCustomSubAspect = (props: SubAspectComponentOptions & { collapsible: boolean; minHeight: number }) => {
 *   const [collapsed, setCollapsed] = React.useState(false);
 *   const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
 * 
 *   React.useEffect(() => {
 *     const updateDimensions = () => {
 *       const { width, height } = Dimensions.get('window');
 *       const containerHeight = collapsed ? props.minHeight : height * (props.containerHeightFraction || 1);
 *       setDimensions({ 
 *         width: width * (props.containerWidthFraction || 1), 
 *         height: containerHeight,
 *       });
 *     };
 *     const subscription = Dimensions.addEventListener('change', updateDimensions);
 *     updateDimensions();
 *     return () => subscription?.remove();
 *   }, [collapsed, props.containerWidthFraction, props.containerHeightFraction]);
 * 
 *   return (
 *     <View style={{ 
 *       width: dimensions.width, 
 *       height: dimensions.height, 
 *       backgroundColor: props.backgroundColor,
 *     }}>
 *       {props.collapsible && (
 *         <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
 *           <Text>{collapsed ? '▲ Expand' : '▼ Collapse'}</Text>
 *         </TouchableOpacity>
 *       )}
 *       {!collapsed && props.children}
 *     </View>
 *   );
 * };
 */

const SubAspectComponent: React.FC<SubAspectComponentOptions> = ({
  backgroundColor,
  children,
  showControls = true,
  containerWidthFraction = 1.0, // Default to full width if not provided
  containerHeightFraction = 1.0, // Default to full height if not provided
  defaultFractionSub = 0.0,
  style,
  renderContent,
  renderContainer,
}) => {
  // Calculate sub-aspect fraction based on showControls
  const subAspectFraction = showControls ? defaultFractionSub : 0.0;

  // State to store calculated aspect styles
  const [aspectStyles, setAspectStyles] = useState<StyleProp<ViewStyle>>({
    height: showControls
      ? containerHeightFraction * Dimensions.get('window').height * subAspectFraction
      : 0,
    width: containerWidthFraction
      ? containerWidthFraction * Dimensions.get('window').width
      : Dimensions.get('window').width,
    display: showControls ? 'flex' : 'none',
  });

  /**
   * Updates the aspect styles based on current window dimensions and props.
   *
   * @param {ScaledSize} window - The new window dimensions.
   */
  const updateAspectStyles = (window: ScaledSize) => {
    setAspectStyles({
      height: showControls
        ? containerHeightFraction * window.height * subAspectFraction
        : 0,
      width: containerWidthFraction
        ? containerWidthFraction * window.width
        : window.width,
      display: showControls ? 'flex' : 'none',
    });
  };


  // Effect to handle dimension changes
  useEffect(() => {
    // Handler for dimension changes
    const handleChange = ({ window }: { window: ScaledSize }) => {
      updateAspectStyles(window);
    };

    // Initial setup
    const initialWindow = Dimensions.get('window');
    updateAspectStyles(initialWindow);

    // Add event listener for dimension changes
    const subscription = Dimensions.addEventListener('change', handleChange);

    // Cleanup listener on component unmount
    return () => {
      if (subscription?.remove) {
        subscription.remove();
      } else {
        // For React Native versions < 0.65
        subscription.remove();
      }
    };
    // Dependencies include all props that affect aspect styles
  }, [
    showControls,
    containerWidthFraction,
    containerHeightFraction,
    defaultFractionSub,
    subAspectFraction,
  ]);

  // Extract dimensions from aspectStyles
  const styleObj = aspectStyles as ViewStyle;
  const dimensions = {
    width: typeof styleObj.width === 'number' ? styleObj.width : 0,
    height: typeof styleObj.height === 'number' ? styleObj.height : 0,
  };

  const defaultContent = children;
  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View
      style={[
        styles.subAspectContainer,
        { backgroundColor },
        aspectStyles,
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

export default SubAspectComponent;

/**
 * Stylesheet for the SubAspectComponent.
 */
const styles = StyleSheet.create({
  subAspectContainer: {
    position: 'absolute',
    bottom: 0,
    margin: 0,
    backgroundColor: 'blue',
    overflow: 'hidden',
    flex: 1,
  },
});
