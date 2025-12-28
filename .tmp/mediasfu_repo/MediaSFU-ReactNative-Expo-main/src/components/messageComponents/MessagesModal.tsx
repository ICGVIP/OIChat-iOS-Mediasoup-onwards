import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; 
import { Socket } from 'socket.io-client';
import MessagePanel from './MessagePanel';
import { getModalPosition } from '../../methods/utils/getModalPosition';
import { sendMessage, SendMessageOptions } from '../../methods/messageMethods/sendMessage';
import {
  CoHostResponsibility,
  EventType,
  Message,
  Participant,
  ShowAlert,
} from '../../@types/types';

/**
 * Interface defining the props for the MessagesModal component.
 * 
 * MessagesModal provides a tabbed interface for viewing and sending group messages
 * and direct messages with real-time updates.
 * 
 * @interface MessagesModalOptions
 * 
 * **Display Control:**
 * @property {boolean} isMessagesModalVisible - Whether the modal is currently visible
 * @property {() => void} onMessagesClose - Callback when modal is closed
 * @property {"topRight" | "topLeft" | "bottomRight" | "bottomLeft"} [position="topRight"]
 *   Screen position where the modal should appear
 * 
 * **Styling:**
 * @property {string} [backgroundColor="#f5f5f5"] - Background color of the modal
 * @property {string} [activeTabBackgroundColor="#7AD2DCFF"] - Background color of the active tab
 * @property {object} [style] - Additional custom styles for the modal container
 * 
 * **Messages Data:**
 * @property {Message[]} messages - Array of message objects to display (group and direct messages)
 * @property {string} chatSetting - Chat visibility settings ('allow', 'disallow', etc.)
 * 
 * **Message Handling:**
 * @property {(options: SendMessageOptions) => Promise<void>} [onSendMessagePress]
 *   Function to handle sending messages (default: sendMessage)
 * 
 * **Direct Messaging:**
 * @property {boolean} startDirectMessage - Flag to initiate direct message mode
 * @property {Participant | null} directMessageDetails - Target participant for direct message
 * @property {(start: boolean) => void} updateStartDirectMessage - Update direct message mode flag
 * @property {(participant: Participant | null) => void} updateDirectMessageDetails - Set DM recipient
 * 
 * **User Context:**
 * @property {string} member - Current user's username/member ID
 * @property {string} islevel - Current user's level/role ('0'=participant, '1'=moderator, '2'=host)
 * @property {CoHostResponsibility[]} coHostResponsibility - Co-host permissions
 * @property {string} coHost - Co-host user ID
 * 
 * **Session Info:**
 * @property {EventType} eventType - Type of event ('conference', 'webinar', 'broadcast', 'chat')
 * @property {string} roomName - Name/ID of the current room
 * @property {Socket} socket - Socket.io client for real-time communication
 * @property {ShowAlert} [showAlert] - Function to display alerts/notifications
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: JSX.Element; dimensions: { width: number; height: number }}) => JSX.Element} [renderContent]
 *   Function to wrap or replace the default modal content
 * @property {(options: { defaultContainer: JSX.Element; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace the entire modal container
 */
export interface MessagesModalOptions {
  /**
   * Determines if the messages modal is visible.
   */
  isMessagesModalVisible: boolean;

  /**
   * Function to close the messages modal.
   */
  onMessagesClose: () => void;

  /**
   * Function to handle sending messages.
   * Defaults to the imported sendMessage function.
   */
  onSendMessagePress?: (options: SendMessageOptions) => Promise<void>;

  /**
   * Array of message objects to display.
   */
  messages: Message[];

  /**
   * Position of the modal on the screen.
   * Possible values: 'topRight', 'topLeft', 'bottomRight', 'bottomLeft'.
   * @default 'topRight'
   */
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';

  /**
   * Background color of the modal.
   * @default '#f5f5f5'
   */
  backgroundColor?: string;

  /**
   * Background color of the active tab.
   * @default '#7AD2DCFF',
   */
  activeTabBackgroundColor?: string;

  /**
   * Type of the event (e.g., webinar, conference, broadcast, chat).
   */
  eventType: EventType;

  /**
   * Current member's username.
   */
  member: string;

  /**
   * Level of the user.
   */
  islevel: string;

  /**
   * Array of co-host responsibilities.
   */
  coHostResponsibility: CoHostResponsibility[];

  /**
   * Co-host's username.
   */
  coHost: string;

  /**
   * Flag to start a direct message.
   */
  startDirectMessage: boolean;

  /**
   * Details of the direct message.
   */
  directMessageDetails: Participant | null;

  /**
   * Function to update the start direct message flag.
   */
  updateStartDirectMessage: (start: boolean) => void;

  /**
   * Function to update direct message details.
   */
  updateDirectMessageDetails: (participant: Participant | null) => void;

  /**
   * Function to show alerts.
   */
  showAlert?: ShowAlert;

  /**
   * Name of the chat room.
   */
  roomName: string;

  /**
   * Socket object for real-time communication.
   */
  socket: Socket;

  /**
   * Settings for the chat.
   */
  chatSetting: string;

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

export type MessagesModalType = (options: MessagesModalOptions) => JSX.Element;

/**
 * MessagesModal - Chat interface with tabbed group and direct messaging
 * 
 * MessagesModal is a comprehensive React Native modal for real-time chat communication.
 * It provides a tabbed interface with separate views for group messages and direct messages,
 * message composition with input field, and automatic scrolling to new messages.
 * 
 * **Key Features:**
 * - Tabbed interface (Group Chat / Direct Messages)
 * - Real-time message display with timestamps
 * - Message composition with send button
 * - Auto-scroll to latest messages
 * - Direct message targeting to specific participants
 * - Permission-based chat visibility controls
 * - Responsive design with flexible positioning
 * - Message history with sender identification
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.messagesModalComponent` to
 * provide a completely custom messages modal implementation.
 * 
 * @component
 * @param {MessagesModalOptions} props - Configuration options for the MessagesModal component
 * 
 * @returns {JSX.Element} Rendered messages modal with chat interface
 * 
 * @example
 * // Basic usage - Display messages modal with group and direct messages
 * import React, { useState } from 'react';
 * import { MessagesModal } from 'mediasfu-reactnative-expo';
 * import { Socket } from 'socket.io-client';
 * 
 * function ChatControls() {
 *   const [isVisible, setIsVisible] = useState(false);
 *   const [messages, setMessages] = useState([
 *     { sender: 'Alice', message: 'Hello everyone!', timestamp: '10:01', group: true },
 *     { sender: 'Bob', message: 'Hey Alice!', timestamp: '10:02', receivers: ['Alice'], group: false },
 *   ]);
 *   const [startDM, setStartDM] = useState(false);
 *   const [dmDetails, setDmDetails] = useState(null);
 * 
 *   return (
 *     <>
 *       <Button title="Messages" onPress={() => setIsVisible(true)} />
 *       <MessagesModal
 *         isMessagesModalVisible={isVisible}
 *         onMessagesClose={() => setIsVisible(false)}
 *         messages={messages}
 *         eventType="conference"
 *         member="john_doe"
 *         islevel="1"
 *         coHostResponsibility={[{ name: 'chat', value: true }]}
 *         coHost="jane_doe"
 *         startDirectMessage={startDM}
 *         directMessageDetails={dmDetails}
 *         updateStartDirectMessage={setStartDM}
 *         updateDirectMessageDetails={setDmDetails}
 *         roomName="MainRoom"
 *         socket={socketInstance}
 *         chatSetting="allow"
 *       />
 *     </>
 *   );
 * }
 * 
 * @example
 * // With custom styling and positioning
 * <MessagesModal
 *   isMessagesModalVisible={showMessages}
 *   onMessagesClose={() => setShowMessages(false)}
 *   messages={chatMessages}
 *   position="bottomRight"
 *   backgroundColor="#1a1a2e"
 *   activeTabBackgroundColor="#0f3460"
 *   onSendMessagePress={async (options) => {
 *     console.log('Sending:', options.message);
 *     await sendMessage(options);
 *     setMessages([...messages, options.message]);
 *   }}
 *   eventType="webinar"
 *   member="presenter_1"
 *   islevel="2"
 *   coHostResponsibility={[{ name: 'chat', value: true }]}
 *   coHost="moderator_1"
 *   startDirectMessage={false}
 *   directMessageDetails={null}
 *   updateStartDirectMessage={(start) => console.log('Start DM:', start)}
 *   updateDirectMessageDetails={(participant) => console.log('DM to:', participant)}
 *   roomName="WebinarRoom"
 *   socket={socket}
 *   chatSetting="allow"
 * />
 * 
 * @example
 * // Using uiOverrides for complete modal replacement
 * import { MyCustomMessagesModal } from './MyCustomMessagesModal';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     messagesModalComponent: {
 *       component: MyCustomMessagesModal,
 *       injectedProps: {
 *         theme: 'minimal',
 *         showEmojis: true,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomMessagesModal.tsx
 * export const MyCustomMessagesModal = (props: MessagesModalOptions & { theme: string; showEmojis: boolean }) => {
 *   return (
 *     <Modal visible={props.isMessagesModalVisible} onRequestClose={props.onMessagesClose}>
 *       <View style={{ backgroundColor: props.theme === 'minimal' ? '#fff' : '#000' }}>
 *         <Text>Chat Messages</Text>
 *         <ScrollView>
 *           {props.messages.map((msg, idx) => (
 *             <View key={idx}>
 *               <Text>{msg.sender}: {msg.message}</Text>
 *               <Text>{msg.timestamp}</Text>
 *             </View>
 *           ))}
 *         </ScrollView>
 *         {props.showEmojis && <Text>😀 😃 😄</Text>}
 *       </View>
 *     </Modal>
 *   );
 * };
 */

const MessagesModal: React.FC<MessagesModalOptions> = ({
  isMessagesModalVisible,
  onMessagesClose,
  messages,
  onSendMessagePress = sendMessage,
  position = 'topRight',
  backgroundColor = '#f5f5f5',
  activeTabBackgroundColor = '#7AD2DCFF',
  eventType,
  member,
  islevel,
  coHostResponsibility,
  coHost,
  startDirectMessage,
  directMessageDetails,
  updateStartDirectMessage,
  updateDirectMessageDetails,
  showAlert,
  roomName,
  socket,
  chatSetting,
  style,
  renderContent,
  renderContainer,
}) => {
  const screenWidth = Dimensions.get('window').width;
  let modalWidth = 0.8 * screenWidth;
  if (modalWidth > 400) {
    modalWidth = 400;
  }

  const [directMessages, setDirectMessages] = useState<Message[]>([]);
  const [groupMessages, setGroupMessages] = useState<Message[]>([]);
  const activeTab = useRef<string>(
    eventType === 'webinar' || eventType === 'conference' ? 'direct' : 'group',
  );
  const [focusedInput, setFocusedInput] = useState<boolean>(false);
  const [reRender, setReRender] = useState<boolean>(false);

  /**
   * Switches the active tab to 'direct'.
   */
  const switchToDirectTab = () => {
    activeTab.current = 'direct';
    setReRender(!reRender);
  };

  /**
   * Switches the active tab to 'group'.
   */
  const switchToGroupTab = () => {
    activeTab.current = 'group';
    setReRender(!reRender);
  };

  useEffect(() => {
    const chatValue = coHostResponsibility?.find(
      (item: { name: string; value: boolean }) => item.name === 'chat',
    )?.value;

    const populateMessages = () => {
      const directMsgs = messages.filter(
        (message) => !message.group
          && (message.sender === member
            || message.receivers.includes(member)
            || islevel === '2'
            || (coHost === member && chatValue === true)),
      );
      setDirectMessages(directMsgs);

      const groupMsgs = messages.filter((message) => message.group);
      setGroupMessages(groupMsgs);
    };

    if (isMessagesModalVisible) {
      populateMessages();
    }
  }, [
    coHost,
    coHostResponsibility,
    isMessagesModalVisible,
    islevel,
    member,
    messages,
  ]);

  useEffect(() => {
    if (startDirectMessage && directMessageDetails) {
      if (eventType === 'webinar' || eventType === 'conference') {
        activeTab.current = 'direct';
        setFocusedInput(true);
      }
    } else if (eventType === 'broadcast' || eventType === 'chat') {
      activeTab.current = 'group';
    }
  }, [startDirectMessage, directMessageDetails, eventType]);

  useEffect(() => {
    // Force re-render when reRender state changes
  }, [reRender]);

  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <>
      <View style={styles.header}>
        {eventType === 'webinar' || eventType === 'conference' ? (
          <View style={styles.tabsContainer}>
            <Pressable
              onPress={switchToDirectTab}
              style={[
                styles.tab,
                activeTab.current === 'direct' && styles.activeTab,
                activeTab.current === 'direct' && { backgroundColor: activeTabBackgroundColor },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab.current === 'direct' && styles.activeTabText,
                ]}
              >
                Direct
              </Text>
            </Pressable>
            <Pressable
              onPress={switchToGroupTab}
              style={[
                styles.tab,
                activeTab.current === 'group' && styles.activeTab,
                activeTab.current === 'group' && { backgroundColor: activeTabBackgroundColor },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab.current === 'group' && styles.activeTabText,
                ]}
              >
                Group
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Close Button */}
        <Pressable onPress={onMessagesClose} style={styles.closeButton}>
          <FontAwesome5 name="times" size={24} color="black" />
        </Pressable>
      </View>

      <View style={styles.separator} />

      <View style={styles.modalBody}>
        {activeTab.current === 'direct'
          && (eventType === 'webinar' || eventType === 'conference') && (
            <MessagePanel
              messages={directMessages}
              messagesLength={messages.length}
              type="direct"
              onSendMessagePress={onSendMessagePress}
              username={member}
              backgroundColor={backgroundColor}
              focusedInput={focusedInput}
              showAlert={showAlert}
              eventType={eventType}
              member={member}
              islevel={islevel}
              coHostResponsibility={coHostResponsibility}
              coHost={coHost}
              directMessageDetails={directMessageDetails}
              updateStartDirectMessage={updateStartDirectMessage}
              updateDirectMessageDetails={updateDirectMessageDetails}
              roomName={roomName}
              socket={socket}
              chatSetting={chatSetting}
              startDirectMessage={startDirectMessage}
            />
        )}

        {activeTab.current === 'group' && (
          <MessagePanel
            messages={groupMessages}
            messagesLength={messages.length}
            type="group"
            onSendMessagePress={onSendMessagePress}
            username={member}
            backgroundColor={backgroundColor}
            focusedInput={false}
            showAlert={showAlert}
            eventType={eventType}
            member={member}
            islevel={islevel}
            coHostResponsibility={coHostResponsibility}
            coHost={coHost}
            directMessageDetails={directMessageDetails}
            updateStartDirectMessage={updateStartDirectMessage}
            updateDirectMessageDetails={updateDirectMessageDetails}
            roomName={roomName}
            socket={socket}
            chatSetting={chatSetting}
            startDirectMessage={startDirectMessage}
          />
        )}
      </View>
    </>
  );

  const content = renderContent
    ? renderContent({ defaultContent, dimensions })
    : defaultContent;

  const defaultContainer = (
    <Modal
      animationType="fade"
      transparent
      visible={isMessagesModalVisible}
      onRequestClose={onMessagesClose}
    >
      <View style={[styles.modalContainer, getModalPosition({ position })]}>
        <View style={[styles.modalContent, { backgroundColor, width: modalWidth }, style]}>
          {content}
        </View>
      </View>
    </Modal>
  );

  return renderContainer
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default MessagesModal;

/**
 * Stylesheet for the MessagesModal component.
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
    height: '75%',
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    maxHeight: '75%',
    maxWidth: '80%',
    zIndex: 9,
    elevation: 9, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 10,
    borderRadius: 4,
  },
  activeTab: {
    // Additional styles for active tab if needed
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
  },
  activeTabText: {
    color: '#ffffff',
    backgroundColor: '#7AD2DCFF',
    borderRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 5,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
  },
});
