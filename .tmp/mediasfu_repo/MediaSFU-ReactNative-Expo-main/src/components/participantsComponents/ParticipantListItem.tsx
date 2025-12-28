import React from 'react';
import {
  View, Text, Pressable, StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Socket } from 'socket.io-client';
import {
  Participant,
  MuteParticipantsType,
  MessageParticipantsType,
  RemoveParticipantsType,
  ShowAlert,
  CoHostResponsibility,
} from '../../@types/types';

export interface ParticipantListItemOptions {
  participant: Participant;
  isBroadcast: boolean;
  onMuteParticipants: MuteParticipantsType;
  onMessageParticipants: MessageParticipantsType;
  onRemoveParticipants: RemoveParticipantsType;
  socket: Socket;
  coHostResponsibility: CoHostResponsibility[];
  member: string;
  islevel: string;
  showAlert?: ShowAlert;
  coHost: string;
  roomName: string;
  updateIsMessagesModalVisible: (isVisible: boolean) => void;
  updateDirectMessageDetails: (participant: Participant | null) => void;
  updateStartDirectMessage: (start: boolean) => void;
  participants: Participant[];
  updateParticipants: (participants: Participant[]) => void;
}

/**
 * ParticipantListItem is a React Native functional component that represents a single participant
 * in the participant list. It provides actions to mute, message, and remove the participant.
 *
 * @component
 * @param {ParticipantListItemOptions} props - The properties object for the component.
 * @returns {JSX.Element} The rendered ParticipantListItem component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { ParticipantListItem } from 'mediasfu-reactnative-expo';
 * 
 * function App() {
 *   const participant = {
 *     id: '123',
 *     name: 'John Doe',
 *     muted: false,
 *     islevel: '1',
 *     // other participant properties
 *   };
 *   
 *   return (
 *     <ParticipantListItem
 *       participant={participant}
 *       isBroadcast={false}
 *       onMuteParticipants={handleMute}
 *       onMessageParticipants={handleMessage}
 *       onRemoveParticipants={handleRemove}
 *       socket={socketInstance}
 *       coHostResponsibility={coHostResponsibilities}
 *       member="JohnDoe"
 *       islevel="2"
 *       showAlert={showAlertFunction}
 *       coHost="JaneDoe"
 *       roomName="MainRoom"
 *       updateIsMessagesModalVisible={updateModalVisibility}
 *       updateDirectMessageDetails={updateDMDetails}
 *       updateStartDirectMessage={startDM}
 *       participants={participantsArray}
 *       updateParticipants={updateParticipantList}
 *     />
 *   );
 * }
 * 
 * export default App;
 * ```
 */

const ParticipantListItem: React.FC<ParticipantListItemOptions> = ({
  participant,
  isBroadcast,
  onMuteParticipants,
  onMessageParticipants,
  onRemoveParticipants,
  socket,
  coHostResponsibility,
  member,
  islevel,
  showAlert,
  coHost,
  roomName,
  updateIsMessagesModalVisible,
  updateDirectMessageDetails,
  updateStartDirectMessage,
  participants,
  updateParticipants,
}) => {
  /**
   * Determines the appropriate icon based on the participant's mute status.
   * @returns {string} The icon name.
   */
  const getIconName = (): keyof typeof FontAwesome.glyphMap => (participant.muted ? 'microphone-slash' : 'microphone');

  /**
   * Determines the color of the dot based on the participant's mute status.
   * @returns {string} The color code.
   */
  const getDotColor = (): string => (participant.muted ? 'red' : 'green');

  /**
   * Handles the mute/unmute action for the participant.
   */
  const handleMute = () => {
    onMuteParticipants({
      socket,
      coHostResponsibility,
      participant,
      member,
      islevel,
      showAlert,
      coHost,
      roomName,
    });
  };

  /**
   * Handles the message action for the participant.
   */
  const handleMessage = () => {
    onMessageParticipants({
      coHostResponsibility,
      participant,
      member,
      islevel,
      showAlert,
      coHost,
      updateIsMessagesModalVisible,
      updateDirectMessageDetails,
      updateStartDirectMessage,
    });
  };

  /**
   * Handles the remove action for the participant.
   */
  const handleRemove = () => {
    onRemoveParticipants({
      coHostResponsibility,
      participant,
      member,
      islevel,
      showAlert,
      coHost,
      participants,
      socket,
      roomName,
      updateParticipants,
    });
  };

  return (
    <View style={styles.container}>
      {/* Participant Name */}
      <View style={styles.nameContainer}>
        <Text style={styles.nameText}>
          {participant.islevel === '2'
            ? `${participant.name} (host)`
            : participant.name}
        </Text>
      </View>

      {/* Dot Indicator */}
      {!isBroadcast && (
        <>
          <View style={styles.dotContainer}>
            <FontAwesome name="dot-circle-o" size={20} color={getDotColor()} />
          </View>

          {/* Mute/Unmute Button */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleMute}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: pressed ? '#0056b3' : '#007bff',
                },
              ]}
              accessibilityLabel={`${participant.muted ? 'Unmute' : 'Mute'} ${
                participant.name
              }`}
              accessibilityRole="button"
            >
              <FontAwesome name={getIconName()} size={20} color="white" />
            </Pressable>
          </View>

          {/* Message Button */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleMessage}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: pressed ? '#0056b3' : '#007bff',
                },
              ]}
              accessibilityLabel={`Message ${participant.name}`}
              accessibilityRole="button"
            >
              <FontAwesome name="comment" size={20} color="white" />
            </Pressable>
          </View>
        </>
      )}

      {/* Remove Button */}
      <View style={styles.removeButtonContainer}>
        <Pressable
          onPress={handleRemove}
          style={({ pressed }) => [
            styles.removeButton,
            {
              backgroundColor: pressed ? '#c82333' : '#dc3545',
            },
          ]}
          accessibilityLabel={`Remove ${participant.name}`}
          accessibilityRole="button"
        >
          <FontAwesome name="trash" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

export default ParticipantListItem;

/**
 * Stylesheet for the ParticipantListItem component.
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nameContainer: {
    flex: 4,
  },
  nameText: {
    fontSize: 16,
    color: '#000000',
  },
  dotContainer: {
    flex: 1,
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 2,
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
  },
  removeButtonContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  removeButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});
