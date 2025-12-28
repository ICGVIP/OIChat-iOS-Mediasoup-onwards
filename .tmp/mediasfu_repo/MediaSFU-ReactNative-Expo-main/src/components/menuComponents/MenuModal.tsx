import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; 
import CustomButtons, { CustomButton } from "./CustomButtons";
import MeetingIdComponent from "./MeetingIDComponent";
import MeetingPasscodeComponent from "./MeetingPasscodeComponent";
import ShareButtonsComponent from "./ShareButtonsComponent";
import { getModalPosition } from "../../methods/utils/getModalPosition";
import { EventType } from "../../@types/types";

/**
 * Interface defining the options (props) for the MenuModal component.
 * 
 * MenuModal provides access to meeting information, custom actions, and sharing capabilities.
 * 
 * @interface MenuModalOptions
 * 
 * **Display Control:**
 * @property {boolean} isVisible - Whether the modal is currently visible/open
 * @property {() => void} onClose - Callback function invoked when modal is closed
 * @property {"topRight" | "topLeft" | "bottomRight" | "bottomLeft"} [position="bottomRight"]
 *   Screen position where the modal should appear
 * 
 * **Styling:**
 * @property {string} [backgroundColor="#83c0e9"] - Background color of the modal content area
 * @property {object} [style] - Additional custom styles for the modal container
 * 
 * **Meeting Information:**
 * @property {string} roomName - Name/ID of the current room/meeting
 * @property {string} adminPasscode - Admin passcode for the meeting (displayed to authorized users)
 * @property {string} islevel - User's level/role (e.g., '0'=participant, '1'=moderator, '2'=host)
 * @property {EventType} eventType - Type of event ('conference', 'webinar', 'broadcast', etc.)
 * @property {string} [localLink] - Optional link to the Community Edition server
 * 
 * **Custom Content:**
 * @property {CustomButton[]} [customButtons] - Array of custom action buttons to display
 *   Each button can have custom icon, text, color, and action handler
 * @property {boolean} [shareButtons=true] - Whether to display built-in share buttons
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: JSX.Element; dimensions: { width: number; height: number }}) => JSX.Element} [renderContent]
 *   Function to wrap or replace the default modal content
 * @property {(options: { defaultContainer: JSX.Element; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace the entire modal container
 */
export interface MenuModalOptions {
  /**
   * The background color of the modal content.
   * @default "#83c0e9"
   */
  backgroundColor?: string;

  /**
   * Determines if the modal is visible.
   */
  isVisible: boolean;

  /**
   * Function to call when the modal is closed.
   */
  onClose: () => void;

  /**
   * An array of custom buttons to display in the modal.
   */
  customButtons?: CustomButton[];

  /**
   * Determines if share buttons should be displayed.
   * @default true
   */
  shareButtons?: boolean;

  /**
   * Position of the modal on the screen.
   * Possible values: "topRight", "topLeft", "bottomRight", "bottomLeft"
   * @default "bottomRight"
   */
  position?: "topRight" | "topLeft" | "bottomRight" | "bottomLeft";

  /**
   * The name of the room.
   */
  roomName: string;

  /**
   * The admin passcode for the meeting.
   */
  adminPasscode: string;

  /**
   * The level of the user.
   */
  islevel: string;

  /**
   * The type of event.
   */
  eventType: EventType;

  /**
   * The link to the Commnity Edition server.
   */
  localLink?: string;

  /**
   * Optional custom style for the modal container.
   */
  style?: object;

  /**
   * Custom render function for modal content.
   */
  renderContent?: (options: {
    defaultContent: JSX.Element;
    dimensions: { width: number; height: number };
  }) => JSX.Element;

  /**
   * Custom render function for the modal container.
   */
  renderContainer?: (options: {
    defaultContainer: JSX.Element;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;
}

export type MenuModalType = (options: MenuModalOptions) => JSX.Element;

/**
 * MenuModal - Meeting menu with room info, custom actions, and share options
 * 
 * MenuModal is a comprehensive React Native modal component that displays meeting
 * information (room name, passcode), custom action buttons, and sharing capabilities.
 * It's typically accessed from a menu/hamburger button in the main UI.
 * 
 * **Key Features:**
 * - Meeting ID and passcode display (for authorized users)
 * - Custom action buttons with icons and handlers
 * - Built-in share buttons for inviting participants
 * - Flexible positioning (4 screen corners)
 * - Scrollable content for long lists
 * - Responsive design for different screen sizes
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.menuModalComponent` to provide
 * a completely custom menu modal implementation.
 * 
 * @component
 * @param {MenuModalOptions} props - Configuration options for the MenuModal component
 * 
 * @returns {JSX.Element} Rendered menu modal with meeting info and actions
 * 
 * @example
 * // Basic usage - Display menu modal with default settings
 * import React, { useState } from 'react';
 * import { MenuModal } from 'mediasfu-reactnative-expo';
 *
 * function MeetingControls() {
 *   const [menuVisible, setMenuVisible] = useState(false);
 *   
 *   return (
 *     <>
 *       <Button title="Menu" onPress={() => setMenuVisible(true)} />
 *       <MenuModal
 *         isVisible={menuVisible}
 *         onClose={() => setMenuVisible(false)}
 *         backgroundColor="#83c0e9"
 *         position="bottomRight"
 *         roomName="MeetingRoom123"
 *         adminPasscode="456789"
 *         islevel="2"
 *         eventType="conference"
 *         shareButtons={true}
 *       />
 *     </>
 *   );
 * }
 * 
 * @example
 * // With custom action buttons
 * <MenuModal
 *   isVisible={showMenu}
 *   onClose={() => setShowMenu(false)}
 *   backgroundColor="#1a1a2e"
 *   position="topRight"
 *   roomName="TeamStandup"
 *   adminPasscode="secret123"
 *   islevel="1"
 *   eventType="webinar"
 *   customButtons={[
 *     {
 *       action: () => console.log('Settings clicked'),
 *       show: true,
 *       backgroundColor: '#4CAF50',
 *       icon: 'cog',
 *       text: 'Settings',
 *     },
 *     {
 *       action: () => console.log('Help clicked'),
 *       show: true,
 *       backgroundColor: '#2196F3',
 *       icon: 'question-circle',
 *       text: 'Help',
 *     },
 *   ]}
 *   shareButtons={true}
 *   localLink="https://meet.example.com/room123"
 * />
 * 
 * @example
 * // Using uiOverrides for complete modal replacement
 * import { MyCustomMenuModal } from './MyCustomMenuModal';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     menuModalComponent: {
 *       component: MyCustomMenuModal,
 *       injectedProps: {
 *         theme: 'dark',
 *         compactMode: true,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomMenuModal.tsx
 * export const MyCustomMenuModal = (props: MenuModalOptions & { theme: string; compactMode: boolean }) => {
 *   return (
 *     <Modal visible={props.isVisible} onRequestClose={props.onClose}>
 *       <View style={{ backgroundColor: props.theme === 'dark' ? '#000' : '#fff' }}>
 *         <Text>Room: {props.roomName}</Text>
 *         <Text>Passcode: {props.adminPasscode}</Text>
 *         <Button title="Close" onPress={props.onClose} />
 *       </View>
 *     </Modal>
 *   );
 * };
 */

const MenuModal: React.FC<MenuModalOptions> = ({
  backgroundColor = "#83c0e9",
  isVisible,
  onClose,
  customButtons = [],
  shareButtons = true,
  position = "bottomRight",
  roomName,
  adminPasscode,
  islevel,
  eventType,
  localLink,
  style,
  renderContent,
  renderContainer,
}) => {
  const [modalWidth, setModalWidth] = useState<number>(
    0.7 * Dimensions.get("window").width
  );

  useEffect(() => {
    const updateDimensions = () => {
      let width = 0.7 * Dimensions.get("window").width;
      if (width > 450) {
        width = 450;
      }
      setModalWidth(width);
    };

    const subscribe = Dimensions.addEventListener("change", updateDimensions);
    // Initial call
    updateDimensions();

    return () => {
      subscribe.remove();
    };
  }, []);

  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <>
      {/* Header */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          <FontAwesome5 name="bars" style={styles.icon} /> Menu
        </Text>
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close Menu Modal"
        >
          <FontAwesome5 name="times" style={styles.icon} />
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.hr} />

      <View style={styles.modalBody}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.listGroup}>
            <CustomButtons buttons={customButtons} />

            {/* Separator */}
            <View style={styles.separator} />

            {/* Meeting Passcode - Visible only for level 2 users */}
            {islevel === "2" && (
              <MeetingPasscodeComponent meetingPasscode={adminPasscode} />
            )}

            {/* Meeting ID */}
            <MeetingIdComponent meetingID={roomName} />

            {/* Share Buttons */}
            {shareButtons && (
              <ShareButtonsComponent
                meetingID={roomName}
                eventType={eventType}
                localLink={localLink}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );

  const content = renderContent
    ? renderContent({ defaultContent, dimensions })
    : defaultContent;

  const defaultContainer = (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, getModalPosition({ position })]}>
        <View
          style={[styles.modalContent, { backgroundColor, width: modalWidth }, style]}
        >
          {content}
        </View>
      </View>
    </Modal>
  );

  return renderContainer
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default MenuModal;

/**
 * Stylesheet for the MenuModal component.
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },

  modalContent: {
    height: "70%",
    backgroundColor: "#83c0e9",
    borderRadius: 0,
    padding: 10,
    maxHeight: "70%",
    maxWidth: "75%",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "black",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 5,
  },

  scrollView: {
    flex: 1,
    maxHeight: "100%",
    maxWidth: "100%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },

  closeButton: {
    padding: 5,
  },

  icon: {
    fontSize: 20,
    color: "black",
  },

  hr: {
    height: 1,
    backgroundColor: "black",
    marginVertical: 15,
  },

  modalBody: {
    flex: 1,
  },

  listGroup: {
    margin: 0,
    padding: 0,
  },

  separator: {
    height: 1,
    backgroundColor: "#ffffff",
    marginVertical: 10,
  },
});
