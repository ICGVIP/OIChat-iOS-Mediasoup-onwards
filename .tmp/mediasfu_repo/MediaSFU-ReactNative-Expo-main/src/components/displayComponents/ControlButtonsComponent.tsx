// ControlButtonsComponent.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";

/**
 * Configuration for a single control button.
 * 
 * @interface Button
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
 * @property {string} [activeColor] - Icon color when active
 * @property {string} [inActiveColor] - Icon color when inactive
 * @property {boolean} [disabled] - Whether button is disabled
 * @property {boolean} [show] - Whether to show the button
 */
export interface Button {
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
  activeColor?: string;
  inActiveColor?: string;
  disabled?: boolean;
  show?: boolean;
}

/**
 * Configuration options for the ControlButtonsComponent.
 * 
 * @interface ControlButtonsComponentOptions
 * 
 * **Button Configuration:**
 * @property {Button[]} buttons - Array of button configurations
 * 
 * **Layout:**
 * @property {'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'} [alignment='flex-start'] - Button alignment within container
 * @property {boolean} [vertical=false] - Whether to arrange buttons vertically (true) or horizontally (false)
 * 
 * **Styling:**
 * @property {string} [buttonColor] - Default color for button icons
 * @property {object} [buttonBackgroundColor] - Background colors with default and pressed states
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
export interface ControlButtonsComponentOptions {
  buttons: Button[];
  buttonColor?: string;
  buttonBackgroundColor?: {
    default?: string;
    pressed?: string;
  };
  alignment?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  vertical?: boolean;
  buttonsContainerStyle?: StyleProp<ViewStyle>;
  alternateIconComponent?: JSX.Element;
  iconComponent?: JSX.Element;
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

export type ControlButtonsComponentType = (
  options: ControlButtonsComponentOptions
) => JSX.Element;

/**
 * ControlButtonsComponent - Flexible control button bar for meeting actions
 * 
 * ControlButtonsComponent is a React Native component that renders a customizable
 * row or column of control buttons (mute, video, screen share, etc.). Each button
 * supports active/inactive states, custom icons, disabled states, and press feedback.
 * 
 * **Key Features:**
 * - Horizontal or vertical button arrangement
 * - Active/inactive state visual feedback
 * - Custom icon support (FontAwesome5 or custom components)
 * - Pressed state animations
 * - Disabled button handling
 * - Flexible alignment options
 * - Show/hide individual buttons
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.controlButtonsComponent` to
 * provide a completely custom control button bar.
 * 
 * @component
 * @param {ControlButtonsComponentOptions} props - Configuration options for the control buttons
 * 
 * @returns {JSX.Element} Rendered control button bar
 * 
 * @example
 * // Basic usage - Horizontal button bar
 * import React from 'react';
 * import { ControlButtonsComponent, Button } from 'mediasfu-reactnative-expo';
 * 
 * function MeetingControls() {
 *   const [isMuted, setIsMuted] = React.useState(false);
 *   const [isVideoOff, setIsVideoOff] = React.useState(false);
 * 
 *   const buttons: Button[] = [
 *     {
 *       name: 'Mic',
 *       icon: 'microphone',
 *       alternateIcon: 'microphone-slash',
 *       active: isMuted,
 *       onPress: () => setIsMuted(!isMuted),
 *       activeColor: '#FF0000',
 *       inActiveColor: '#FFFFFF',
 *     },
 *     {
 *       name: 'Video',
 *       icon: 'video',
 *       alternateIcon: 'video-slash',
 *       active: isVideoOff,
 *       onPress: () => setIsVideoOff(!isVideoOff),
 *       activeColor: '#FF0000',
 *       inActiveColor: '#FFFFFF',
 *     },
 *     {
 *       name: 'Leave',
 *       icon: 'phone',
 *       onPress: () => console.log('Leave meeting'),
 *       backgroundColor: { default: '#FF0000', pressed: '#CC0000' },
 *       color: '#FFFFFF',
 *     },
 *   ];
 * 
 *   return (
 *     <ControlButtonsComponent
 *       buttons={buttons}
 *       alignment="center"
 *       buttonBackgroundColor={{ default: '#333333', pressed: '#555555' }}
 *       vertical={false}
 *     />
 *   );
 * }
 * 
 * @example
 * // Vertical button bar with custom styling
 * <ControlButtonsComponent
 *   buttons={controlButtons}
 *   alignment="flex-start"
 *   vertical={true}
 *   buttonsContainerStyle={{
 *     gap: 10,
 *     padding: 8,
 *     backgroundColor: 'rgba(0,0,0,0.7)',
 *     borderRadius: 8,
 *   }}
 * />
 * 
 * @example
 * // With custom icon components
 * const customButtons: Button[] = [
 *   {
 *     name: 'Custom',
 *     customComponent: <MyCustomButtonComponent />,
 *     onPress: () => console.log('Custom pressed'),
 *   },
 *   {
 *     name: 'Icon',
 *     iconComponent: <CustomIcon name="custom" />,
 *     alternateIconComponent: <CustomIcon name="custom-alt" />,
 *     active: isActive,
 *     onPress: toggleActive,
 *   },
 * ];
 * 
 * <ControlButtonsComponent
 *   buttons={customButtons}
 *   alignment="space-evenly"
 * />
 * 
 * @example
 * // Using uiOverrides for complete control bar replacement
 * import { MyCustomControlButtons } from './MyCustomControlButtons';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     controlButtonsComponent: {
 *       component: MyCustomControlButtons,
 *       injectedProps: {
 *         theme: 'modern',
 *         showLabels: true,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomControlButtons.tsx
 * export const MyCustomControlButtons = (props: ControlButtonsComponentOptions & { theme: string; showLabels: boolean }) => {
 *   return (
 *     <View style={{ flexDirection: props.vertical ? 'column' : 'row', gap: 12 }}>
 *       {props.buttons.filter(btn => btn.show !== false).map((button, index) => (
 *         <Pressable
 *           key={index}
 *           onPress={button.onPress}
 *           disabled={button.disabled}
 *           style={{
 *             padding: 12,
 *             borderRadius: props.theme === 'modern' ? 24 : 8,
 *             backgroundColor: button.active ? '#007bff' : '#e0e0e0',
 *           }}
 *         >
 *           {button.customComponent || (
 *             <FontAwesome5
 *               name={button.active ? button.alternateIcon : button.icon}
 *               size={20}
 *               color={button.active ? button.activeColor : button.inActiveColor}
 *             />
 *           )}
 *           {props.showLabels && <Text>{button.name}</Text>}
 *         </Pressable>
 *       ))}
 *     </View>
 *   );
 * };
 */

const ControlButtonsComponent: React.FC<ControlButtonsComponentOptions> = ({
  buttons,
  buttonBackgroundColor,
  alignment = 'flex-start',
  vertical = false,
  buttonsContainerStyle,
  style,
  renderContent,
  renderContainer,
}) => {
  /**
   * getAlignmentStyle - Computes alignment styles based on alignment prop.
   * @returns {StyleProp<ViewStyle>} The computed alignment styles.
   */
  const getAlignmentStyle = (): StyleProp<ViewStyle> => {
    const alignmentStyle: ViewStyle = {};

    switch (alignment) {
      case 'center':
        alignmentStyle.justifyContent = 'center';
        break;
      case 'flex-end':
        alignmentStyle.justifyContent = 'flex-end';
        break;
      case 'space-between':
        alignmentStyle.justifyContent = 'space-between';
        break;
      case 'space-around':
        alignmentStyle.justifyContent = 'space-around';
        break;
      case 'space-evenly':
        alignmentStyle.justifyContent = 'space-evenly';
        break;
      case 'flex-start':
      default:
        alignmentStyle.justifyContent = 'flex-start';
        break;
    }

    return alignmentStyle;
  };

  const dimensions = { width: 0, height: 0 }; // Dynamic sizing based on button count

  const defaultContent = buttons.map((button, index) => (
    <Pressable
      key={index}
      style={({ pressed }) => [
        styles.buttonContainer,
        {
          backgroundColor: pressed
            ? buttonBackgroundColor?.pressed || '#444'
            : buttonBackgroundColor?.default || 'transparent',
        },
        vertical && styles.verticalButton,
      ]}
      onPress={button.onPress}
      disabled={button.disabled}
    >
      {button.icon ? (
        button.active ? (
          button.alternateIconComponent ? (
            button.alternateIconComponent
          ) : button.alternateIcon ? (
            <FontAwesome5
              name={button.alternateIcon}
              size={24}
              color={button.activeColor || '#ffffff'}
            />
          ) : null
        ) : button.iconComponent ? (
          button.iconComponent
        ) : button.icon ? (
          <FontAwesome5
            name={button.icon}
            size={24}
            color={button.inActiveColor || '#ffffff'}
          />
        ) : null
      ) : (
        button.customComponent
      )}
      {button.name && (
        <Text
          style={[styles.buttonText, { color: button.color || '#ffffff' }]}
        >
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
        { display: 'flex'},
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
    flexDirection: 'row',
    marginVertical: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  verticalButton: {
    flexDirection: 'column',
  },
  buttonText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default ControlButtonsComponent;
