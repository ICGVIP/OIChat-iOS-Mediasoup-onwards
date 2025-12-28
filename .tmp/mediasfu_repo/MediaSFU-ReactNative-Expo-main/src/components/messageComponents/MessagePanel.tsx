import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import { Socket } from 'socket.io-client';
import { SendMessageOptions } from '../../methods/messageMethods/sendMessage';
import {
  CoHostResponsibility,
  EventType,
  Message,
  Participant,
  ShowAlert,
} from '../../@types/types';

/**
 * Interface defining the props for the MessagePanel component.
 */
export interface MessagePanelOptions {
  /**
   * Array of messages to display.
   */
  messages: Message[];

  /**
   * Total number of messages.
   */
  messagesLength: number;

  /**
   * Type of the message panel ('direct' or 'group').
   */
  type: 'direct' | 'group';

  /**
   * Username of the current user.
   */
  username: string;

  /**
   * Function to handle sending messages.
   */
  onSendMessagePress: (options: SendMessageOptions) => Promise<void>;

  /**
   * Background color of the message panel.
   * @default '#f5f5f5'
   */
  backgroundColor?: string;

  /**
   * Indicates if the input field is focused.
   */
  focusedInput: boolean;

  /**
   * Function to show alerts.
   */
  showAlert?: ShowAlert;

  /**
   * Type of the event.
   */
  eventType: EventType;

  /**
   * Username of the member.
   */
  member: string;

  /**
   * Level of the user.
   */
  islevel: string;

  /**
   * Flag to start a direct message.
   */
  startDirectMessage: boolean;

  /**
   * Function to update the start direct message flag.
   */
  updateStartDirectMessage: (start: boolean) => void;

  /**
   * Details of the direct message.
   */
  directMessageDetails: Participant | null;

  /**
   * Function to update direct message details.
   */
  updateDirectMessageDetails: (participant: Participant | null) => void;

  /**
   * Array of co-host responsibilities.
   */
  coHostResponsibility: CoHostResponsibility[];

  /**
   * Username of the co-host.
   */
  coHost: string;

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
}

/**
 * MessagePanel component renders a panel for displaying and sending messages.
 *
 * @component
 * @param {MessagePanelOptions} props - The properties for the MessagePanel component.
 * @returns {JSX.Element} The rendered MessagePanel component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { MessagePanel } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *   const messages = [
 *     { sender: 'Alice', message: 'Hello!', timestamp: '10:00', receivers: [], group: true },
 *     { sender: 'Bob', message: 'Hi Alice!', timestamp: '10:01', receivers: [], group: true },
 *   ];
 *
 *   const handleSendMessage = async (options) => {
 *     // Logic to handle message sending
 *     console.log('Message sent:', options);
 *   };
 *
 *   return (
 *     <MessagePanel
 *       messages={messages}
 *       messagesLength={messages.length}
 *       type="group"
 *       username="john_doe"
 *       onSendMessagePress={handleSendMessage}
 *       backgroundColor="#f5f5f5"
 *       focusedInput={true}
 *       eventType="conference"
 *       member="john_doe"
 *       islevel="1"
 *       startDirectMessage={false}
 *       updateStartDirectMessage={(start) => console.log('Start Direct Message:', start)}
 *       directMessageDetails={null}
 *       updateDirectMessageDetails={(participant) => console.log('Direct Message Participant:', participant)}
 *       coHostResponsibility={[{ name: 'chat', value: true }]}
 *       coHost="jane_doe"
 *       roomName="MainRoom"
 *       socket={socketInstance}
 *       chatSetting="default"
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const MessagePanel: React.FC<MessagePanelOptions> = ({
  messages,
  messagesLength,
  type,
  username,
  onSendMessagePress,
  backgroundColor = '#f5f5f5',
  focusedInput,
  showAlert,
  eventType,
  member,
  islevel,
  startDirectMessage,
  updateStartDirectMessage,
  directMessageDetails,
  updateDirectMessageDetails,
  coHostResponsibility,
  coHost,
  roomName,
  socket,
  chatSetting,
}) => {
  const inputRef = useRef<TextInput | null>(null);

  const [replyInfo, setReplyInfo] = useState<{
    text: string;
    username: string;
  } | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [directMessageText, setDirectMessageText] = useState<string>('');
  const [groupMessageText, setGroupMessageText] = useState<string>('');

  /**
   * Handles changes in the message input field.
   * @param {string} text - The text input value.
   */
  const handleTextInputChange = (text: string) => {
    if (type === 'direct') {
      setDirectMessageText(text);
    } else {
      setGroupMessageText(text);
    }
  };

  /**
   * Opens the reply input field for a specific sender.
   * @param {string} senderId - The username of the message sender.
   */

  const openReplyInput = (senderId: string) => {
    const replyInfoContainer = {
      text: 'Replying to: ',
      username: senderId,
    };

    setReplyInfo(replyInfoContainer);
    setSenderId(senderId);
  };

  /**
   * Handles the sending of messages.
   */
  const handleSendButton = async () => {
    const message = type === 'direct' ? directMessageText : groupMessageText;

    if (!message) {
      showAlert?.({
        message: 'Please enter a message',
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    if (message.length > 350) {
      showAlert?.({
        message: 'Message is too long',
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    if (message.trim() === '') {
      showAlert?.({
        message: 'Message is not valid.',
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    if (type === 'direct' && !senderId && islevel === '2') {
      showAlert?.({
        message: 'Please select a message to reply to',
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    try {
      await onSendMessagePress({
        message,
        receivers: type === 'direct' ? [senderId!] : [],
        group: type === 'group',
        messagesLength,
        member,
        sender: username,
        islevel,
        showAlert,
        coHostResponsibility,
        coHost,
        roomName,
        socket,
        chatSetting,
      });

      if (type === 'direct') {
        setDirectMessageText('');
      } else {
        setGroupMessageText('');
      }

      if (inputRef.current) {
        inputRef.current.clear();
      }

      if (replyInfo) {
        setReplyInfo(null);
        setSenderId(null);
      }

      if (focusedInput) {
        updateDirectMessageDetails(null);
        updateStartDirectMessage(false);
      }
    } catch {
      showAlert?.({
        message: 'Failed to send message.',
        type: 'danger',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (startDirectMessage && directMessageDetails && focusedInput) {
      inputRef.current?.focus();
      const replyInfoContainer = {
        text: 'Replying to: ',
        username: directMessageDetails.name,
      };
      setReplyInfo(replyInfoContainer);
      setSenderId(directMessageDetails.name);
    } else {
      setReplyInfo(null);
      if (inputRef.current) {
        inputRef.current.clear();
      }
    }
  }, [directMessageDetails, focusedInput, startDirectMessage]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.messagesContainer}>
      {messages.map((message, index) => (
        <View key={index} style={styles.messageWrapper}>
          <View
            style={[
              styles.messageContainer,
              message.sender === username
                ? styles.selfMessage
                : styles.otherMessage,
            ]}
          >
            <View style={styles.messageHeader}>
              {message.sender === username && !message.group && (
                <Text style={styles.receiverText}>
                  To: {message.receivers.join(', ')}
                </Text>
              )}
              <Text style={styles.senderText}>
                {message.sender === username ? '' : message.sender}
              </Text>
              <Text style={styles.timestampText}>{message.timestamp}</Text>
              {message.sender !== username && !message.group && (
                <Pressable
                  style={styles.replyButton}
                  onPress={() => openReplyInput(message.sender)}
                >
                  <FontAwesome5 name="reply" size={12} color="black" />
                </Pressable>
              )}
            </View>
            <View
              style={[
                message.sender === member
                  ? styles.contentSelf
                  : styles.contentOther,
              ]}
            >
              <Text style={styles.messageText}>{message.message}</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Reply Info */}
      {replyInfo && (
        <View style={styles.replyInfoContainer}>
          <Text style={styles.replyText}>{replyInfo.text}</Text>
          <Text style={styles.replyUsername}>{replyInfo.username}</Text>
        </View>
      )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={
            focusedInput && startDirectMessage && directMessageDetails
              ? inputRef
              : null
          }
          style={styles.input}
          placeholder={
            type === 'direct'
              ? focusedInput && startDirectMessage && directMessageDetails
                ? `Send a direct message to ${directMessageDetails.name}`
                : 'Select a message to reply to'
              : eventType === 'chat'
              ? 'Send a message'
              : 'Send a message to everyone'
          }
          maxLength={350}
          multiline
          onChangeText={handleTextInputChange}
          value={type === 'direct' ? directMessageText : groupMessageText}
          placeholderTextColor="gray"
        />
        <Pressable style={styles.sendButton} onPress={handleSendButton}>
          <FontAwesome5 name="paper-plane" size={16} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export default MessagePanel;

/**
 * Stylesheet for the MessagePanel component.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageWrapper: {
    marginBottom: 5,
  },
  messageContainer: {
    maxWidth: 200,
    padding: 5,
    borderRadius: 10,
  },
  selfMessage: {
    flexDirection: 'column',
    alignSelf: 'flex-end',
    marginBottom: 5,
  },
  otherMessage: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  receiverText: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 8,
    marginLeft: 6,
  },
  senderText: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 8,
    marginRight: 10,
  },
  timestampText: {
    fontSize: 8,
    color: '#999999',
  },
  replyButton: {
    padding: 2,
    marginLeft: 5,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  messageContent: {
    paddingTop: 5,
  },
  messageText: {
    color: 'black',
    fontSize: 12,
    maxWidth: 300,
  },
  replyInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    backgroundColor: '#e6e6e6',
    borderRadius: 5,
    marginBottom: 1,
  },
  replyText: {
    fontWeight: 'bold',
    marginRight: 2,
    fontSize: 8,
  },
  replyUsername: {
    color: 'red',
    fontSize: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    borderTopWidth: 1,
    borderColor: '#cccccc',
    paddingTop: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#ffffff',
    color: 'black',
    fontSize: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#83c0e9',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSelf: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 10,
  },
  contentOther: {
    backgroundColor: '#1ce5c7',
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 10,
  },
});
