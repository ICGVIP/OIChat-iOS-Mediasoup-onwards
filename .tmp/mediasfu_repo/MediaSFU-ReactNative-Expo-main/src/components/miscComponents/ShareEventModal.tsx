// ShareEventModal.tsx
import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getModalPosition } from '../../methods/utils/getModalPosition';
import MeetingIdComponent from '../menuComponents/MeetingIDComponent';
import MeetingPasscodeComponent from '../menuComponents/MeetingPasscodeComponent';
import ShareButtonsComponent from '../menuComponents/ShareButtonsComponent';
import { EventType } from '../../@types/types';

/**
 * Configuration options for the ShareEventModal component.
 * 
 * @interface ShareEventModalOptions
 * 
 * **Modal Control:**
 * @property {boolean} isShareEventModalVisible - Controls modal visibility
 * @property {() => void} onShareEventClose - Callback when modal is closed
 * 
 * **Meeting Information:**
 * @property {string} roomName - Room/meeting name to be shared with participants
 * @property {string} [adminPasscode] - Admin passcode for host access (shown only to hosts)
 * @property {EventType} eventType - Type of event ('chat', 'broadcast', 'conference', 'webinar')
 * 
 * **User Context:**
 * @property {string} [islevel] - User level ('0'=participant, '1'=co-host, '2'=host) - determines which credentials are shown
 * 
 * **Sharing Options:**
 * @property {boolean} [shareButtons=true] - Whether to display social share buttons (copy link, QR code, etc.)
 * @property {string} [localLink] - Optional local server link for sharing
 * 
 * **Customization:**
 * @property {'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'} [position='topRight'] - Modal position on screen
 * @property {string} [backgroundColor='rgba(255, 255, 255, 0.25)'] - Modal background color
 * @property {object} [style] - Additional custom styles for modal container
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: JSX.Element; dimensions: { width: number; height: number } }) => JSX.Element} [renderContent] - Custom render function for modal content
 * @property {(options: { defaultContainer: JSX.Element; dimensions: { width: number; height: number } }) => React.ReactNode} [renderContainer] - Custom render function for modal container
 */
export interface ShareEventModalOptions {
  /**
   * Background color of the modal content.
   * Defaults to 'rgba(255, 255, 255, 0.25)'.
   */
  backgroundColor?: string;

  /**
   * Flag to control the visibility of the modal.
   */
  isShareEventModalVisible: boolean;

  /**
   * Callback function to handle the closing of the modal.
   */
  onShareEventClose: () => void;

  /**
   * Flag to control the visibility of share buttons.
   * Defaults to true.
   */
  shareButtons?: boolean;

  /**
   * Position of the modal on the screen.
   * Possible values: 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'center'.
   * Defaults to 'topRight'.
   */
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';

  /**
   * The name of the room to be shared.
   */
  roomName: string;

  /**
   * The admin passcode for the meeting.
   */
  adminPasscode?: string;

  /**
   * The level of the user.
   */
  islevel?: string;

  /**
   * The type of the event.
   */
  eventType: EventType;
  
  /**
   * The link to the local server.
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

export type ShareEventModalType = (options: ShareEventModalOptions) => JSX.Element;

/**
 * ShareEventModal - Meeting credentials and invitation sharing interface
 * 
 * ShareEventModal is a React Native component that displays meeting credentials
 * (room name, meeting ID, passcode) with social sharing buttons. It allows hosts
 * to share meeting access information via copy link, QR code, email, and other methods.
 * 
 * **Key Features:**
 * - Meeting ID display with copy functionality
 * - Passcode display (admin passcode shown only to hosts)
 * - Social share buttons (copy link, QR code, email, etc.)
 * - Event type-specific formatting
 * - Local/custom link support
 * - Position-configurable modal (5 positions)
 * - Scrollable content for long credentials
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.shareEventModal` to
 * provide a completely custom sharing interface.
 * 
 * @component
 * @param {ShareEventModalOptions} props - Configuration options
 * 
 * @returns {JSX.Element} Rendered share event modal
 * 
 * @example
 * ```tsx
 * // Basic usage for host sharing
 * import React, { useState } from 'react';
 * import { ShareEventModal } from 'mediasfu-reactnative-expo';
 * 
 * const [showShare, setShowShare] = useState(false);
 * 
 * return (
 *   <ShareEventModal
 *     isShareEventModalVisible={showShare}
 *     onShareEventClose={() => setShowShare(false)}
 *     roomName="meeting-room-123"
 *     adminPasscode="host-pass-456"
 *     islevel="2" // Host - shows admin passcode
 *     eventType="conference"
 *     shareButtons={true}
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // Participant view without admin passcode
 * return (
 *   <ShareEventModal
 *     isShareEventModalVisible={isVisible}
 *     onShareEventClose={handleClose}
 *     roomName="webinar-room-789"
 *     islevel="0" // Participant - no admin passcode shown
 *     eventType="webinar"
 *     position="center"
 *     backgroundColor="rgba(255, 255, 255, 0.9)"
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // With custom local link
 * return (
 *   <ShareEventModal
 *     isShareEventModalVisible={showModal}
 *     onShareEventClose={closeModal}
 *     roomName={roomId}
 *     adminPasscode={hostPass}
 *     islevel={userLevel}
 *     eventType="broadcast"
 *     localLink="https://custom-domain.com/join"
 *     shareButtons={true}
 *     position="bottomRight"
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // Using custom UI via uiOverrides
 * const config = {
 *   uiOverrides: {
 *     shareEventModal: {
 *       component: MyCustomShareModal,
 *       injectedProps: {
 *         theme: 'dark',
 *         showQRCode: true,
 *       },
 *     },
 *   },
 * };
 * 
 * return <MyMeetingComponent config={config} />;
 * ```
 */

const ShareEventModal: React.FC<ShareEventModalOptions> = ({
  backgroundColor = 'rgba(255, 255, 255, 0.25)',
  isShareEventModalVisible,
  onShareEventClose,
  shareButtons = true,
  position = 'topRight',
  roomName,
  adminPasscode,
  islevel,
  eventType,
  localLink,
  style,
  renderContent,
  renderContainer,
}) => {
  const screenWidth = Dimensions.get('window').width;
  let modalWidth = 0.8 * screenWidth;
  if (modalWidth > 350) {
    modalWidth = 350;
  }

  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <>
      <View style={styles.modalHeader}>
        <Pressable onPress={onShareEventClose} style={styles.closeButton}>
          <FontAwesome name="times" style={styles.icon} />
        </Pressable>
      </View>

      <View style={styles.separator} />

      {/* Modal Body */}
      <View style={styles.modalBody}>
        <ScrollView contentContainerStyle={styles.bodyContainer}>
          {/* Conditionally render MeetingPasscodeComponent based on islevel */}
          {islevel === '2' && adminPasscode && (
            <View style={styles.componentContainer}>
              <MeetingPasscodeComponent meetingPasscode={adminPasscode} />
            </View>
          )}

          {/* Meeting ID */}
          <View style={styles.componentContainer}>
            <MeetingIdComponent meetingID={roomName} />
          </View>

          {/* Share Buttons */}
          {shareButtons && (
            <View style={styles.componentContainer}>
              <ShareButtonsComponent
                meetingID={roomName}
                eventType={eventType}
                localLink={localLink}
              />
            </View>
          )}
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
      visible={isShareEventModalVisible}
      onRequestClose={onShareEventClose}
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

export default ShareEventModal;

/**
 * Stylesheet for the ShareEventModal component.
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 9,
    elevation: 9,
  },
  modalContent: {
    height: '40%',
    backgroundColor: '#83c0e9',
    borderRadius: 10,
    padding: 10,
    maxHeight: '40%',
    maxWidth: '80%',
    zIndex: 9,
    elevation: 9,
    marginBottom: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  icon: {
    fontSize: 20,
    color: '#000000',
  },
  separator: {
    height: 1,
    backgroundColor: '#000000',
    marginVertical: 5,
  },
  bodyContainer: {
    paddingBottom: 10,
  },
  componentContainer: {
    marginBottom: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalBody: {
    flex: 1,
  },
});
