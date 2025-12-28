// ConfirmHereModal.tsx

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Socket } from 'socket.io-client';

/**
 * Configuration options for the ConfirmHereModal component.
 * 
 * @interface ConfirmHereModalOptions
 * 
 * **Modal Control:**
 * @property {boolean} isConfirmHereModalVisible - Controls modal visibility
 * @property {() => void} onConfirmHereClose - Callback when modal is closed (after confirmation or timeout)
 * 
 * **Countdown Configuration:**
 * @property {number} [countdownDuration=120] - Duration in seconds for user to confirm presence before auto-disconnect
 * 
 * **Session Context:**
 * @property {Socket} socket - Primary Socket.io instance for disconnect event emission
 * @property {Socket} [localSocket] - Optional local Socket.io instance for additional disconnect notification
 * @property {string} roomName - Room identifier for disconnect event
 * @property {string} member - Member name/ID to disconnect if no confirmation received
 * 
 * **Customization:**
 * @property {string} [backgroundColor='#83c0e9'] - Modal background color
 * @property {object} [style] - Additional custom styles for modal container
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: JSX.Element; dimensions: { width: number; height: number } }) => JSX.Element} [renderContent] - Custom render function for modal content
 * @property {(options: { defaultContainer: JSX.Element; dimensions: { width: number; height: number } }) => React.ReactNode} [renderContainer] - Custom render function for modal container
 */
export interface ConfirmHereModalOptions {
  isConfirmHereModalVisible: boolean;
  onConfirmHereClose: () => void;
  backgroundColor?: string;
  countdownDuration?: number;
  socket: Socket;
  localSocket?: Socket;
  roomName: string;
  member: string;

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

export type ConfirmHereModalType = (
  options: ConfirmHereModalOptions
) => JSX.Element;

/**
 * ConfirmHereModal - Inactivity detection and presence confirmation dialog
 * 
 * ConfirmHereModal is a React Native component that displays a fullscreen modal
 * asking the user to confirm their presence. If no confirmation is received within
 * the countdown duration, it emits a 'disconnectUser' event via Socket.io to remove
 * the inactive user from the meeting.
 * 
 * **Key Features:**
 * - Fullscreen presence confirmation prompt
 * - Countdown timer with real-time updates
 * - Auto-disconnect on timeout (emits 'disconnectUser' event)
 * - Manual confirmation button ("Yes, I'm here")
 * - Dual socket support (primary + local)
 * - Loading spinner during countdown
 * - Customizable countdown duration
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.confirmHereModal` to
 * provide a completely custom presence confirmation interface.
 * 
 * @component
 * @param {ConfirmHereModalOptions} props - Configuration options
 * 
 * @returns {JSX.Element} Rendered presence confirmation modal
 * 
 * @example
 * ```tsx
 * // Basic usage with default 120-second countdown
 * import React, { useState } from 'react';
 * import { ConfirmHereModal } from 'mediasfu-reactnative-expo';
 * import { io } from 'socket.io-client';
 * 
 * const socket = io('https://your-server.com');
 * const [showConfirmHere, setShowConfirmHere] = useState(false);
 * 
 * return (
 *   <ConfirmHereModal
 *     isConfirmHereModalVisible={showConfirmHere}
 *     onConfirmHereClose={() => setShowConfirmHere(false)}
 *     socket={socket}
 *     roomName="meeting-room-123"
 *     member="user-id-456"
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // With custom countdown duration and styling
 * const localSocket = io('https://local-server.com');
 * 
 * return (
 *   <ConfirmHereModal
 *     isConfirmHereModalVisible={isInactive}
 *     onConfirmHereClose={handleConfirmClose}
 *     countdownDuration={60} // 60 seconds instead of default 120
 *     socket={socketConnection}
 *     localSocket={localSocket}
 *     roomName={roomId}
 *     member={userId}
 *     backgroundColor="#ff6b6b"
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // Using custom UI via uiOverrides
 * const config = {
 *   uiOverrides: {
 *     confirmHereModal: {
 *       component: MyCustomPresenceCheck,
 *       injectedProps: {
 *         theme: 'dark',
 *         warningSound: true,
 *       },
 *     },
 *   },
 * };
 * 
 * return <MyMeetingComponent config={config} />;
 * ```
 */

let countdownInterval: NodeJS.Timeout;

function startCountdown({
  duration,
  onConfirm,
  onUpdateCounter,
  socket,
  localSocket,
  roomName,
  member,
}: {
  duration: number;
  onConfirm: () => void;
  onUpdateCounter: (counter: number) => void;
  socket: Socket;
  localSocket?: Socket;
  roomName: string;
  member: string;
}) {
  let timeRemaining = duration;

  countdownInterval = setInterval(() => {
    timeRemaining--;
    onUpdateCounter(timeRemaining);

    if (timeRemaining <= 0) {
      clearInterval(countdownInterval);
      socket.emit('disconnectUser', {
        member,
        roomName,
        ban: false,
      });

      try {
        if (localSocket && localSocket.id) {
          localSocket.emit("disconnectUser", {
            member: member,
            roomName: roomName,
            ban: false,
          });
        } 
      } catch  {
        // Do nothing
      }
      onConfirm();
    }
  }, 1000);
}

const ConfirmHereModal: React.FC<ConfirmHereModalOptions> = ({
  isConfirmHereModalVisible,
  onConfirmHereClose,
  backgroundColor = '#83c0e9',
  countdownDuration = 120,
  socket,
  roomName,
  member,
  style,
  renderContent,
  renderContainer,
}) => {
  const [counter, setCounter] = useState<number>(countdownDuration);

  const screenWidth = Dimensions.get('window').width;
  let modalWidth = 0.8 * screenWidth;
  if (modalWidth > 400) {
    modalWidth = 400;
  }

  useEffect(() => {
    if (isConfirmHereModalVisible) {
      startCountdown({
        duration: countdownDuration,
        onConfirm: onConfirmHereClose,
        onUpdateCounter: setCounter,
        socket,
        roomName,
        member,
      });
    }
  }, [
    isConfirmHereModalVisible,
    countdownDuration,
    socket,
    roomName,
    member,
    onConfirmHereClose,
  ]);

  const handleConfirmHere = () => {
    setCounter(countdownDuration); // Reset counter if needed
    onConfirmHereClose(); // Close the modal
    // Additional logic if needed
  };

  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <View style={styles.modalBody}>
      {/* Spinner */}
      <ActivityIndicator
        size="large"
        color={'#000000'}
        style={styles.spinnerContainer}
      />

      {/* Modal Content */}
      <Text style={styles.modalTitle}>Are you still there?</Text>
      <Text style={styles.modalMessage}>
        Please confirm if you are still present.
      </Text>
      <Text style={styles.modalCounter}>
        Time remaining: <Text style={styles.counterText}>{counter}</Text>{' '}
        seconds
      </Text>

      {/* Confirm Button */}
      <Pressable onPress={handleConfirmHere} style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Yes</Text>
      </Pressable>
    </View>
  );

  const content = renderContent
    ? renderContent({ defaultContent, dimensions })
    : defaultContent;

  const defaultContainer = (
    <Modal
      transparent
      animationType="slide"
      visible={isConfirmHereModalVisible}
      onRequestClose={onConfirmHereClose}
    >
      <View style={styles.modalContainer}>
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

export default ConfirmHereModal;

/**
 * Stylesheet for the ConfirmHereModal component.
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    height: '60%',
    backgroundColor: '#83c0e9',
    borderRadius: 10,
    padding: 20,
    maxWidth: '80%',
    zIndex: 9,
    elevation: 9,
  },
  modalBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    marginBottom: 20,
  },
  spinnerIcon: {
    fontSize: 50,
    color: 'black',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: 'black',
    marginVertical: 15,
    textAlign: 'center',
  },
  modalCounter: {
    fontSize: 14,
    color: 'black',
    marginBottom: 10,
  },
  counterText: {
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
});
