import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

/**
 * Configuration for a single touch-optimized control button.
 * 
 * @interface ButtonTouch
 * 
 * @property {string} [name] - Button label/name
 * @property {keyof typeof FontAwesome5.glyphMap} [icon] - Icon name from FontAwesome5 glyphMap
 * @property {keyof typeof FontAwesome5.glyphMap} [alternateIcon] - Alternate icon name (shown when active)
 * @property {function} [onPress] - Click handler
 * @property {object} [backgroundColor] - Background colors with default and pressed states
 * @property {boolean} [active] - Whether button is in active state
 * @property {JSX.Element} [alternateIconComponent] - Custom alternate icon component
 * @property {JSX.Element} [iconComponent] - Custom icon component
 * @property {JSX.Element} [customComponent] - Completely custom button component
 * @property {string} [color] - Icon color
 * @property {string} [activeColor] - Icon color when active
 * @property {string} [inActiveColor] - Icon color when inactive
 * @property {boolean} [show] - Whether to show the button
 * @property {boolean} [disabled] - Whether button is disabled
 */
export interface ButtonTouch {
  name?: string;
  icon?: keyof typeof FontAwesome5.glyphMap;
  alternateIcon?: keyof typeof FontAwesome5.glyphMap;
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
  show?: boolean;
  disabled?: boolean;
}

/**
 * Configuration options for the ControlButtonsComponentTouch.
 * 
 * @interface ControlButtonsComponentTouchOptions
 * 
 * **Button Configuration:**
 * @property {ButtonTouch[]} buttons - Array of touch-optimized button configurations
 * 
 * **Absolute Positioning:**
 * @property {'left' | 'right' | 'middle'} [position='left'] - Horizontal screen position
 * @property {'top' | 'bottom' | 'center'} [location='top'] - Vertical screen position
 * @property {'horizontal' | 'vertical'} [direction='horizontal'] - Button arrangement direction
 * 
 * **Display Control:**
 * @property {boolean} [showAspect] - Whether to show the button group overlay
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
export interface ControlButtonsComponentTouchOptions {
  buttons: ButtonTouch[];
  position?: "left" | "right" | "middle";
  location?: "top" | "bottom" | "center";
  direction?: "horizontal" | "vertical";
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

export type ControlButtonsComponentTouchType = (
  options: ControlButtonsComponentTouchOptions
) => JSX.Element;

/**
 * ControlButtonsComponentTouch - Touch-optimized positioned overlay buttons
 * 
 * ControlButtonsComponentTouch is a React Native component specifically optimized
 * for touch interfaces. It renders control buttons in an absolute positioned overlay
 * with enhanced touch targets and press feedback for mobile/tablet devices.
 * 
 * **Key Features:**
 * - Touch-optimized button sizing and spacing
 * - Absolute positioning with 9 screen positions
 * - Horizontal or vertical button arrangement
 * - Active/inactive state visual feedback
 * - Disabled button support
 * - Enhanced press feedback for mobile
 * - Show/hide visibility control
 * - TypeScript-validated icon names
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.controlButtonsComponentTouch` to
 * provide a completely custom touch-optimized control overlay.
 * 
 * @component
 * @param {ControlButtonsComponentTouchOptions} props - Configuration options for touch-optimized buttons
 * 
 * @returns {JSX.Element} Rendered touch-optimized control button overlay
 * 
 * @example
 * // Basic usage - Touch-optimized video controls
 * import React from 'react';
 * import { ControlButtonsComponentTouch, ButtonTouch } from 'mediasfu-reactnative-expo';
 * 
 * function TouchVideoControls() {
 *   const [isPlaying, setIsPlaying] = React.useState(false);
 *   const [isMuted, setIsMuted] = React.useState(false);
 * 
 *   const touchButtons: ButtonTouch[] = [
 *     {
 *       name: 'PlayPause',
 *       icon: 'play',
 *       alternateIcon: 'pause',
 *       active: isPlaying,
 *       onPress: () => setIsPlaying(!isPlaying),
 *       activeColor: '#007bff',
 *       inActiveColor: '#FFFFFF',
 *       show: true,
 *     },
 *     {
 *       name: 'Mute',
 *       icon: 'volume-up',
 *       alternateIcon: 'volume-mute',
 *       active: isMuted,
 *       onPress: () => setIsMuted(!isMuted),
 *       activeColor: '#FF0000',
 *       inActiveColor: '#FFFFFF',
 *       show: true,
 *     },
 *   ];
 * 
 *   return (
 *     <ControlButtonsComponentTouch
 *       buttons={touchButtons}
 *       position="middle"
 *       location="bottom"
 *       direction="horizontal"
 *       showAspect={true}
 *       buttonsContainerStyle={{
 *         backgroundColor: 'rgba(0,0,0,0.6)',
 *         padding: 12,
 *         borderRadius: 24,
 *         gap: 16,
 *       }}
 *     />
 *   );
 * }
 * 
 * @example
 * // Side panel touch buttons
 * <ControlButtonsComponentTouch
 *   buttons={sideButtons}
 *   position="right"
 *   location="center"
 *   direction="vertical"
 *   showAspect={true}
 *   buttonsContainerStyle={{
 *     gap: 16,
 *     padding: 12,
 *     backgroundColor: 'rgba(0,0,0,0.7)',
 *   }}
 * />
 * 
 * @example
 * // With disabled and conditional buttons
 * const buttons: ButtonTouch[] = [
 *   {
 *     name: 'Record',
 *     icon: 'circle',
 *     onPress: startRecording,
 *     disabled: isRecording,
 *     color: '#FF0000',
 *     show: canRecord,
 *   },
 *   {
 *     name: 'Stop',
 *     icon: 'stop',
 *     onPress: stopRecording,
 *     disabled: !isRecording,
 *     color: '#FFFFFF',
 *     show: canRecord,
 *   },
 * ];
 * 
 * <ControlButtonsComponentTouch
 *   buttons={buttons}
 *   position="left"
 *   location="top"
 *   direction="horizontal"
 *   showAspect={true}
 * />
 * 
 * @example
 * // Using uiOverrides for complete touch overlay replacement
 * import { MyCustomTouchButtons } from './MyCustomTouchButtons';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     controlButtonsComponentTouch: {
 *       component: MyCustomTouchButtons,
 *       injectedProps: {
 *         hapticFeedback: true,
 *         minimumTouchSize: 48,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomTouchButtons.tsx
 * export const MyCustomTouchButtons = (props: ControlButtonsComponentTouchOptions & { hapticFeedback: boolean; minimumTouchSize: number }) => {
 *   const handlePress = (button: ButtonTouch) => {
 *     if (props.hapticFeedback && Platform.OS !== 'web') {
 *       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
 *     }
 *     button.onPress?.();
 *   };
 * 
 *   return (
 *     <View style={{ flexDirection: props.direction === 'vertical' ? 'column' : 'row' }}>
 *       {props.buttons.filter(btn => btn.show !== false).map((button, index) => (
 *         <Pressable
 *           key={index}
 *           onPress={() => handlePress(button)}
 *           disabled={button.disabled}
 *           style={{
 *             minWidth: props.minimumTouchSize,
 *             minHeight: props.minimumTouchSize,
 *             justifyContent: 'center',
 *             alignItems: 'center',
 *             opacity: button.disabled ? 0.5 : 1,
 *           }}
 *         >
 *           <FontAwesome5
 *             name={button.active ? button.alternateIcon : button.icon}
 *             size={28}
 *             color={button.active ? button.activeColor : button.inActiveColor || button.color}
 *           />
 *         </Pressable>
 *       ))}
 *     </View>
 *   );
 * };
 */

const ControlButtonsComponentTouch: React.FC<
  ControlButtonsComponentTouchOptions
> = ({
  buttons,
  position = "left",
  location = "top",
  direction = "horizontal",
  buttonsContainerStyle,
  showAspect = false,
  style,
  renderContent,
  renderContainer,
}) => {
  /**
   * getAlignmentStyle - Computes alignment styles based on position, location, and direction.
   * @returns {StyleProp<ViewStyle>} The computed alignment styles.
   */
  const getAlignmentStyle = (): StyleProp<ViewStyle> => {
    const alignmentStyle: ViewStyle = {};

    // Horizontal alignment
    if (position === "left" || position === "right" || position === "middle") {
      alignmentStyle.justifyContent =
        position === "left"
          ? "flex-start"
          : position === "right"
          ? "flex-end"
          : "center";
    }

    // Vertical alignment
    if (location === "top" || location === "bottom" || location === "center") {
      alignmentStyle.alignItems =
        location === "top"
          ? "flex-start"
          : location === "bottom"
          ? "flex-end"
          : "center";
    }

    // Direction of layout
    if (direction === "vertical") {
      alignmentStyle.flexDirection = "column";
    } else {
      alignmentStyle.flexDirection = "row";
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
            ? button.backgroundColor?.pressed ||
              button.backgroundColor?.default ||
              "rgba(255, 255, 255, 0.25)"
            : button.backgroundColor?.default ||
              button.backgroundColor?.pressed ||
              "rgba(255, 255, 255, 0.25)",
          display: button.show ? "flex" : "none",
        },
        direction === "vertical" && styles.verticalButton,
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
              size={20}
              color={button.activeColor || "transparent"}
            />
          ) : null
        ) : button.iconComponent ? (
          button.iconComponent
        ) : button.icon ? (
          <FontAwesome5
            name={button.icon}
            size={20}
            color={button.inActiveColor || "transparent"}
          />
        ) : null
      ) : (
        button.customComponent
      )}
      {button.name && (
        <Text
          style={[
            styles.buttonText,
            { color: button.color || "transparent" },
          ]}
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
        { display: showAspect ? "flex" : "none" },
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    marginVertical: 5,
    zIndex: 9,
    backgroundColor: "transparent",
  },
  buttonContainer: {
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    marginVertical: 5,
    backgroundColor: "transparent",
  },
  verticalButton: {
    flexDirection: "column",
  },
  buttonText: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default ControlButtonsComponentTouch;
