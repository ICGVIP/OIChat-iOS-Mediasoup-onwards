import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; 

/**
 * Configuration for a single alternate control button.
 * 
 * @interface AltButton
 * 
 * @property {string} [name] - Button label/name
 * @property {string} [icon] - Icon name (FontAwesome5)
 * @property {string} [alternateIcon] - Alternate icon name (shown when active)
 * @property {function} [onPress] - Click handler
 * @property {object} [backgroundColor] - Background colors with default and pressed states
 * @property {boolean} [active] - Whether button is in active state
 * @property {JSX.Element} [alternateIconComponent] - Custom alternate icon component
 * @property {JSX.Element} [iconComponent] - Custom icon component
 * @property {JSX.Element} [customComponent] - Completely custom button component
 * @property {string} [color] - Icon color
 * @property {string} [inActiveColor] - Icon color when inactive
 * @property {boolean} [show] - Whether to show the button
 */
export interface AltButton {
  name?: string;
  icon?: string;
  alternateIcon?: string;
  onPress?: () => void;
  backgroundColor?: {
    default?: string;
    pressed?: string;
  };
  active?: boolean;
  alternateIconComponent?: JSX.Element;
  iconComponent?: JSX.Element;
  customComponent?: JSX.Element;
  color?: string;
  inActiveColor?: string;
  show?: boolean;
}

/**
 * Configuration options for the ControlButtonsAltComponent.
 * 
 * @interface ControlButtonsAltComponentOptions
 * 
 * **Button Configuration:**
 * @property {AltButton[]} buttons - Array of button configurations
 * 
 * **Absolute Positioning:**
 * @property {'left' | 'right' | 'middle'} [position='left'] - Horizontal screen position
 * @property {'top' | 'bottom' | 'center'} [location='top'] - Vertical screen position
 * @property {'horizontal' | 'vertical'} [direction='horizontal'] - Button arrangement direction
 * 
 * **Display Control:**
 * @property {boolean} [showAspect=false] - Whether to show the button group overlay
 * 
 * **Styling:**
 * @property {StyleProp<ViewStyle>} [buttonsContainerStyle] - Custom styles for buttons container
 * @property {object} [style] - Additional custom styles for outer container
 * 
 * **Custom Icons:**
 * @property {JSX.Element} [alternateIconComponent] - Global alternate icon component
 * @property {JSX.Element} [iconComponent] - Global icon component
 * 
 * **Advanced Render Overrides:**
 * @property {function} [renderContent] - Optional custom renderer for button content (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Optional custom renderer for outer container (receives defaultContainer and dimensions)
 */
export interface ControlButtonsAltComponentOptions {
  buttons: AltButton[];
  position?: 'left' | 'right' | 'middle';
  location?: 'top' | 'bottom' | 'center';
  direction?: 'horizontal' | 'vertical';
  buttonsContainerStyle?: StyleProp<ViewStyle>;
  alternateIconComponent?: JSX.Element;
  iconComponent?: JSX.Element;
  showAspect?: boolean;
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

export type ControlButtonsAltComponentType = (
  options: ControlButtonsAltComponentOptions
) => React.ReactNode;

/**
 * ControlButtonsAltComponent - Absolutely positioned overlay control buttons
 * 
 * ControlButtonsAltComponent is a React Native component that renders control buttons
 * in an absolute positioned overlay (typically for video controls, settings, etc.).
 * It supports flexible positioning (9 positions: corners, edges, center) and can be
 * shown/hidden dynamically.
 * 
 * **Key Features:**
 * - Absolute positioning with 9 screen positions
 * - Horizontal or vertical button arrangement
 * - Active/inactive state visual feedback
 * - Show/hide visibility control
 * - Custom icon support
 * - Overlay z-index management
 * - Press feedback animations
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.controlButtonsAltComponent` to
 * provide a completely custom positioned control overlay.
 * 
 * @component
 * @param {ControlButtonsAltComponentOptions} props - Configuration options for the overlay buttons
 * 
 * @returns {React.ReactNode} Rendered positioned control button overlay
 * 
 * @example
 * // Basic usage - Top-right overlay buttons
 * import React from 'react';
 * import { ControlButtonsAltComponent, AltButton } from 'mediasfu-reactnative-expo';
 * 
 * function VideoOverlayControls() {
 *   const [showSettings, setShowSettings] = React.useState(false);
 * 
 *   const overlayButtons: AltButton[] = [
 *     {
 *       name: 'Settings',
 *       icon: 'cog',
 *       onPress: () => setShowSettings(!showSettings),
 *       active: showSettings,
 *       color: '#FFFFFF',
 *       show: true,
 *     },
 *     {
 *       name: 'Fullscreen',
 *       icon: 'expand',
 *       onPress: () => console.log('Toggle fullscreen'),
 *       color: '#FFFFFF',
 *       show: true,
 *     },
 *   ];
 * 
 *   return (
 *     <ControlButtonsAltComponent
 *       buttons={overlayButtons}
 *       position="right"
 *       location="top"
 *       direction="vertical"
 *       showAspect={true}
 *     />
 *   );
 * }
 * 
 * @example
 * // Bottom-center horizontal buttons
 * <ControlButtonsAltComponent
 *   buttons={bottomControls}
 *   position="middle"
 *   location="bottom"
 *   direction="horizontal"
 *   showAspect={true}
 *   buttonsContainerStyle={{
 *     backgroundColor: 'rgba(0,0,0,0.7)',
 *     padding: 8,
 *     borderRadius: 8,
 *   }}
 * />
 * 
 * @example
 * // Conditional visibility with custom styling
 * <ControlButtonsAltComponent
 *   buttons={menuButtons}
 *   position="right"
 *   location="center"
 *   direction="vertical"
 *   showAspect={isMenuVisible}
 *   buttonsContainerStyle={{
 *     gap: 12,
 *     padding: 10,
 *     backgroundColor: 'rgba(0,0,0,0.8)',
 *     borderRadius: 12,
 *   }}
 * />
 * 
 * @example
 * // Using uiOverrides for complete overlay replacement
 * import { MyCustomOverlayButtons } from './MyCustomOverlayButtons';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     controlButtonsAltComponent: {
 *       component: MyCustomOverlayButtons,
 *       injectedProps: {
 *         fadeInOut: true,
 *         autoHideDelay: 3000,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomOverlayButtons.tsx
 * export const MyCustomOverlayButtons = (props: ControlButtonsAltComponentOptions & { fadeInOut: boolean; autoHideDelay: number }) => {
 *   const [opacity, setOpacity] = React.useState(props.showAspect ? 1 : 0);
 * 
 *   React.useEffect(() => {
 *     if (props.fadeInOut) {
 *       setOpacity(props.showAspect ? 1 : 0);
 *     }
 *   }, [props.showAspect]);
 * 
 *   const positionStyle = {
 *     position: 'absolute' as const,
 *     [props.location === 'top' ? 'top' : props.location === 'bottom' ? 'bottom' : 'top']: props.location === 'center' ? '50%' : 10,
 *     [props.position === 'left' ? 'left' : props.position === 'right' ? 'right' : 'left']: props.position === 'middle' ? '50%' : 10,
 *   };
 * 
 *   return (
 *     <View style={{ ...positionStyle, opacity, flexDirection: props.direction === 'vertical' ? 'column' : 'row' }}>
 *       {props.buttons.filter(btn => btn.show !== false).map((button, index) => (
 *         <Pressable key={index} onPress={button.onPress}>
 *           <FontAwesome5 name={button.active ? button.alternateIcon : button.icon} size={24} color={button.color} />
 *         </Pressable>
 *       ))}
 *     </View>
 *   );
 * };
 */

const ControlButtonsAltComponent: React.FC<ControlButtonsAltComponentOptions> = ({
  buttons,
  position = 'left',
  location = 'top',
  direction = 'horizontal',
  buttonsContainerStyle,
  showAspect = false,
  style,
  renderContent,
  renderContainer,
}) => {
  /**
   * getAlignmentStyle - Computes alignment styles based on position, location, and direction.
   * @returns {StyleProp<ViewStyle>} - The computed alignment styles.
   */
  const getAlignmentStyle = (): StyleProp<ViewStyle> => {
    const alignmentStyle: ViewStyle = {};

    // Horizontal alignment
    if (position === 'left' || position === 'right' || position === 'middle') {
      alignmentStyle.justifyContent = position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center';
    }

    // Vertical alignment
    if (location === 'top' || location === 'bottom' || location === 'center') {
      alignmentStyle.alignItems = location === 'top' ? 'flex-start' : location === 'bottom' ? 'flex-end' : 'center';
    }

    // Direction of layout
    if (direction === 'vertical') {
      alignmentStyle.flexDirection = 'column';
    } else {
      alignmentStyle.flexDirection = 'row';
    }

    return alignmentStyle;
  };

  const dimensions = { width: 0, height: 0 };

  const defaultContent = buttons.map((button, index) => (
    <Pressable
      key={index}
      style={({ pressed }) => [
        styles.buttonContainer,
        {
          backgroundColor: pressed
            ? button.backgroundColor?.pressed || '#444'
            : button.backgroundColor?.default || 'transparent',
        },
        direction === 'vertical' && styles.verticalButton,
      ]}
      onPress={button.onPress}
    >
      {button.icon ? (
        button.active ? (
          button.alternateIconComponent ? (
            button.alternateIconComponent
          ) : button.alternateIcon ? (
            <FontAwesome5
              name={button.alternateIcon}
              size={14}
              color={button.inActiveColor || '#ffffff'}
            />
          ) : null
        ) : button.iconComponent ? (
          button.iconComponent
        ) : button.icon ? (
          <FontAwesome5
            name={button.icon}
            size={14}
            color={button.inActiveColor || '#ffffff'}
          />
        ) : null
      ) : (
        button.customComponent
      )}
      {button.name && (
        <Text style={[styles.buttonText, { color: button.color || '#ffffff' }]}>
          {button.name}
        </Text>
      )}
    </Pressable>
  ));

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <View
      style={[
        styles.container,
        getAlignmentStyle(),
        buttonsContainerStyle,
        { display: showAspect ? 'flex' : 'none' },
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    elevation: 9,
    zIndex: 9,
  },
  buttonContainer: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  verticalButton: {
    flexDirection: 'column',
  },
  buttonText: {
    fontSize: 12,
    marginTop: 5,
  } as TextStyle,
});

export default ControlButtonsAltComponent;
