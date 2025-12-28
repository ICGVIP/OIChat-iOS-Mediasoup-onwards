// CustomButtons.tsx

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  TextStyle,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * Interface defining the structure of each custom button.
 */
export interface CustomButton {
  /**
   * Function to be called when the button is pressed.
   */
  action: () => void;

  /**
   * Determines if the button should be displayed.
   */
  show: boolean;

  /**
   * The background color of the button.
   * @default 'transparent'
   */
  backgroundColor?: string;

  /**
   * Determines if the button should be disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * The name of the FontAwesome5 icon to be displayed on the button.
   */
  icon?: string;

  /**
   * The style to be applied to the icon.
   */
  iconStyle?: StyleProp<TextStyle>;

  /**
   * The text to be displayed on the button.
   */
  text?: string;

  /**
   * The style to be applied to the text.
   */
  textStyle?: StyleProp<TextStyle>;

  /**
   * A custom component to be rendered inside the button instead of icon and text.
   */
  customComponent?: React.ReactNode;
}

/**
 * Interface defining the props for the CustomButtons component.
 */
export interface CustomButtonsOptions {
  /**
   * An array of button configurations to be rendered.
   */
  buttons: CustomButton[];
}

export type CustomButtonsType = (options: CustomButtonsOptions) => JSX.Element;

/**
 * CustomButtons renders a list of customizable buttons, each with configurable actions, icons, and display options.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { CustomButtons } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *   return (
 *     <CustomButtons
 *       buttons={[
 *         {
 *           action: () => console.log('Confirm pressed'),
 *           show: true,
 *           backgroundColor: '#4CAF50',
 *           icon: 'check-circle',
 *           text: 'Confirm',
 *           textStyle: { color: 'white', fontWeight: 'bold' },
 *         },
 *         {
 *           action: () => console.log('Delete pressed'),
 *           show: true,
 *           backgroundColor: '#F44336',
 *           icon: 'trash',
 *           text: 'Delete',
 *           textStyle: { color: 'white' },
 *         },
 *         {
 *           action: () => console.log('Disabled pressed'),
 *           show: true,
 *           disabled: true,
 *           backgroundColor: '#9E9E9E',
 *           text: 'Disabled',
 *         },
 *       ]}
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const CustomButtons: React.FC<CustomButtonsOptions> = ({ buttons }) => (
  <View style={styles.customButtonsContainer}>
    {buttons.map((button, index) => (
      <Pressable
        key={index}
        onPress={button.action}
        style={[
          styles.customButton,
          {
            backgroundColor: button.backgroundColor || 'transparent',
            display: button.show ? 'flex' : 'none',
            opacity: button.disabled ? 0.6 : 1,
          },
        ]}
        disabled={button.disabled}
        accessibilityRole="button"
        accessibilityLabel={button.text || 'Custom Button'}
      >
        <View style={styles.buttonContent}>
          {button.icon ? (
            <>
              <FontAwesome5
                name={button.icon}
                style={[styles.customButtonIcon, button.iconStyle]}
              />
              {button.text && (
              <Text style={[styles.customButtonText, button.textStyle]}>
                {button.text}
              </Text>
              )}
            </>
          ) : button.customComponent ? (
            button.customComponent
          ) : null}
        </View>
      </Pressable>
    ))}
  </View>
);

export default CustomButtons;

/**
 * Stylesheet for the CustomButtons component.
 */
const styles = StyleSheet.create({
  customButtonsContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customButton: {
    width: '100%',
    marginVertical: 15,
    padding: 15,
    borderRadius: 6,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Elevation for Android
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  customButtonIcon: {
    fontSize: 20,
    color: '#000000', // Default color for the button icon
    marginRight: 4,
  },
  customButtonText: {
    color: '#000000', // Default color for the button text
  },
});
