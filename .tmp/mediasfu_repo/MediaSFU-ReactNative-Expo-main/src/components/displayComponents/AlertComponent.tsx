import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';

/**
 * Interface defining the options for the AlertComponent.
 * 
 * @interface AlertComponentOptions
 * 
 * **Display Control:**
 * @property {boolean} visible - Whether the alert is currently visible
 * @property {string} message - Alert message text to display
 * @property {"success" | "danger"} [type="success"] - Alert type determining background color (green/red)
 * @property {number} [duration=4000] - Auto-hide duration in milliseconds (0 = no auto-hide)
 * @property {() => void} [onHide] - Callback when alert is hidden (manually or auto)
 * 
 * **Styling:**
 * @property {string} [textColor="black"] - Color of the message text
 * @property {object} [style] - Custom styles for the alert container
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContent]
 *   Function to wrap or replace the default alert content
 * @property {(options: { defaultContainer: React.ReactNode; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace the entire alert container
 */
export interface AlertComponentOptions {
  visible: boolean;
  message: string;
  type?: 'success' | 'danger'; // Optional prop with 'success' or 'danger' as default values
  duration?: number; // Optional with default value
  onHide?: () => void; // Optional callback function
  textColor?: string; // Optional text color

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

export type AlertComponentType = (options: AlertComponentOptions) => JSX.Element;

/**
 * AlertComponent - Toast-style alert notification with auto-dismiss
 * 
 * AlertComponent is a simple yet effective React Native modal for displaying
 * temporary alert messages. It supports success/danger styling, auto-dismiss
 * with configurable duration, and manual dismissal by tapping the alert.
 * 
 * **Key Features:**
 * - Two alert types (success: green, danger: red)
 * - Auto-dismiss with configurable duration
 * - Manual dismissal by tapping
 * - Customizable text color
 * - Centered overlay presentation
 * - Smooth show/hide transitions
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.alertComponent` to
 * provide a completely custom alert implementation.
 * 
 * @component
 * @param {AlertComponentOptions} props - Configuration options for the AlertComponent
 * 
 * @returns {JSX.Element} Rendered alert overlay
 * 
 * @example
 * // Basic usage - Display success alert with auto-dismiss
 * import React, { useState } from 'react';
 * import { AlertComponent } from 'mediasfu-reactnative-expo';
 * 
 * function App() {
 *   const [alertVisible, setAlertVisible] = useState(false);
 *   
 *   const showSuccessAlert = () => {
 *     setAlertVisible(true);
 *   };
 * 
 *   return (
 *     <>
 *       <Button title="Show Success" onPress={showSuccessAlert} />
 *       <AlertComponent
 *         visible={alertVisible}
 *         message="Operation completed successfully!"
 *         type="success"
 *         duration={3000}
 *         onHide={() => setAlertVisible(false)}
 *         textColor="white"
 *       />
 *     </>
 *   );
 * }
 * 
 * @example
 * // Danger alert with custom duration
 * <AlertComponent
 *   visible={showError}
 *   message="Failed to connect to server. Please try again."
 *   type="danger"
 *   duration={5000}
 *   onHide={() => setShowError(false)}
 *   textColor="white"
 * />
 * 
 * @example
 * // Using uiOverrides for complete alert replacement
 * import { MyCustomAlert } from './MyCustomAlert';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     alertComponent: {
 *       component: MyCustomAlert,
 *       injectedProps: {
 *         position: 'top',
 *         animation: 'slide',
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomAlert.tsx
 * export const MyCustomAlert = (props: AlertComponentOptions & { position: string; animation: string }) => {
 *   return (
 *     <Modal visible={props.visible} transparent>
 *       <View style={{ position: 'absolute', [props.position]: 20 }}>
 *         <Text style={{ color: props.type === 'success' ? 'green' : 'red' }}>
 *           {props.message}
 *         </Text>
 *       </View>
 *     </Modal>
 *   );
 * };
 */

const AlertComponent: React.FC<AlertComponentOptions> = ({
  visible,
  message,
  type = 'success',
  duration = 4000,
  onHide,
  textColor = 'black',
  style,
  renderContent,
  renderContainer,
}) => {
  const [alertType, setAlertType] = useState<'success' | 'danger'>(type);

  useEffect(() => {
    if (type) {
      setAlertType(type);
    }
  }, [type]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (visible) {
      timer = setTimeout(() => {
        if (onHide) {onHide();}
      }, duration);
    }

    return () => {
      if (timer) {clearTimeout(timer);}
    };
  }, [visible, duration, onHide]);

  const handlePress = () => {
    if (onHide) {onHide();}
  };

  const dimensions = { width: 250, height: 0 };

  const defaultContent = (
    <Text style={[styles.modalText, { color: textColor }]}>
      {message}
    </Text>
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handlePress}
    >
      <Pressable style={[styles.centeredView, style]} onPress={handlePress}>
        <View
          style={[
            styles.modalView,
            { backgroundColor: alertType === 'success' ? 'green' : 'red' },
          ]}
        >
          {content}
        </View>
      </Pressable>
    </Modal>
  );

  return renderContainer 
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 250,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AlertComponent;
