import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Socket } from 'socket.io-client';
import ParticipantListItem from './ParticipantListItem';
import {
  Participant,
  MuteParticipantsType,
  MessageParticipantsType,
  RemoveParticipantsType,
  CoHostResponsibility,
  ShowAlert,
} from '../../@types/types';

export interface ParticipantListOptions {
  participants: Participant[];
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
  updateParticipants: (participants: Participant[]) => void;
}

/**
 * ParticipantList is a React Native functional component that renders a list of participants.
 * Each participant is displayed using the ParticipantListItem component.
 *
 * @component
 * @param {ParticipantListOptions} props - The properties object for the component.
 * @returns {JSX.Element} The rendered ParticipantList component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { ParticipantList } from 'mediasfu-reactnative-expo';
 * 
 * function App() {
 *   const participants = [
 *     { id: '1', name: 'Alice', muted: false, ... },
 *     { id: '2', name: 'Bob', muted: true, ... },
 *     // more participants
 *   ];
 *   
 *   const handleMute = (participantId) => { ... };
 *   const handleMessage = (participantId) => { ... };
 *   const handleRemove = (participantId) => { ... };
 *   
 *   return (
 *     <ParticipantList
 *       participants={participants}
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
 *       updateParticipants={updateParticipantList}
 *     />
 *   );
 * }
 * 
 * export default App;
 * ```
 */

const ParticipantList: React.FC<ParticipantListOptions> = ({
  participants,
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
  updateParticipants,
}) => (
  <ScrollView>
    {participants.map((participant, index) => (
      <React.Fragment key={participant.id}>
        <ParticipantListItem
          participant={participant}
          isBroadcast={isBroadcast}
          onMuteParticipants={onMuteParticipants}
          onMessageParticipants={onMessageParticipants}
          onRemoveParticipants={onRemoveParticipants}
          socket={socket}
          coHostResponsibility={coHostResponsibility}
          member={member}
          islevel={islevel}
          showAlert={showAlert}
          coHost={coHost}
          roomName={roomName}
          updateIsMessagesModalVisible={updateIsMessagesModalVisible}
          updateDirectMessageDetails={updateDirectMessageDetails}
          updateStartDirectMessage={updateStartDirectMessage}
          participants={participants}
          updateParticipants={updateParticipants}
        />
        {index < participants.length - 1 && <View style={styles.separator} />}
      </React.Fragment>
    ))}
  </ScrollView>
);

export default ParticipantList;

/**
 * Stylesheet for the ParticipantList component.
 */
const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC',
    marginVertical: 5,
  },
});
