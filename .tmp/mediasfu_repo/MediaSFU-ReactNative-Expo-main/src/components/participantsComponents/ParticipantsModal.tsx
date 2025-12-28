// ParticipantsModal.tsx

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Socket } from 'socket.io-client';
import { getModalPosition } from '../../methods/utils/getModalPosition';
import ParticipantList from './ParticipantList';
import ParticipantListOthers from './ParticipantListOthers';
import { muteParticipants } from '../../methods/participantsMethods/muteParticipants';
import { messageParticipants } from '../../methods/participantsMethods/messageParticipants';
import { removeParticipants } from '../../methods/participantsMethods/removeParticipants';
import {
  CoHostResponsibility,
  EventType,
  Participant,
  ShowAlert,
} from '../../@types/types';

/**
 * Interface defining the parameters for the ParticipantsModal component.
 * 
 * @interface ParticipantsModalParameters
 * 
 * **Display Settings:**
 * @property {"topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center"} [position] - Modal position on screen
 * @property {string} [backgroundColor] - Background color of the modal
 * 
 * **Participant Data:**
 * @property {Participant[]} participants - Array of all participants in the session
 * @property {Participant[]} filteredParticipants - Filtered list based on search/filter criteria
 * @property {number} participantsCounter - Total count of participants
 * 
 * **User Context:**
 * @property {CoHostResponsibility[]} coHostResponsibility - Co-host permissions and responsibilities
 * @property {string} coHost - Co-host user ID
 * @property {string} member - Current user's member ID
 * @property {string} islevel - Current user's level/role ('0'=participant, '1'=moderator, '2'=host)
 * 
 * **Session Info:**
 * @property {EventType} eventType - Type of event ('conference', 'webinar', 'broadcast', etc.)
 * @property {Socket} socket - Socket.io client for real-time communication
 * @property {string} roomName - Name/ID of the current room
 * @property {ShowAlert} [showAlert] - Function to display alerts/notifications
 * 
 * **State Update Functions:**
 * @property {(isVisible: boolean) => void} updateIsMessagesModalVisible - Toggle messages modal visibility
 * @property {(participant: Participant | null) => void} updateDirectMessageDetails - Set direct message recipient
 * @property {(start: boolean) => void} updateStartDirectMessage - Initiate direct message flow
 * @property {(participants: Participant[]) => void} updateParticipants - Update participants list
 * 
 * **Utility:**
 * @property {() => ParticipantsModalParameters} getUpdatedAllParams - Get latest parameter state
 */
export interface ParticipantsModalParameters {
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
  backgroundColor?: string;
  coHostResponsibility: CoHostResponsibility[];
  coHost: string;
  member: string;
  islevel: string;
  participants: Participant[];
  eventType: EventType;
  filteredParticipants: Participant[];
  socket: Socket;
  showAlert?: ShowAlert;
  roomName: string;
  updateIsMessagesModalVisible: (isVisible: boolean) => void;
  updateDirectMessageDetails: (participant: Participant | null) => void;
  updateStartDirectMessage: (start: boolean) => void;
  updateParticipants: (participants: Participant[]) => void;

  // mediasfu functions
  getUpdatedAllParams: () => ParticipantsModalParameters;
  [key: string]: any;
}

/**
 * Interface defining the options for the ParticipantsModal component.
 * 
 * @interface ParticipantsModalOptions
 * 
 * **Display Control:**
 * @property {boolean} isParticipantsModalVisible - Whether the modal is currently visible
 * @property {() => void} onParticipantsClose - Callback when modal is closed
 * @property {"topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center"} [position] - Modal position
 * @property {string} [backgroundColor] - Modal background color
 * 
 * **Participant Management:**
 * @property {(filter: string) => void} onParticipantsFilterChange - Callback for search/filter changes
 * @property {number} participantsCounter - Total participant count for display
 * 
 * **Action Handlers:**
 * @property {typeof muteParticipants} [onMuteParticipants] - Function to mute participants (default: muteParticipants)
 * @property {typeof messageParticipants} [onMessageParticipants] - Function to message participants (default: messageParticipants)
 * @property {typeof removeParticipants} [onRemoveParticipants] - Function to remove participants (default: removeParticipants)
 * 
 * **Custom Renderers:**
 * @property {React.ComponentType<any>} [RenderParticipantList] - Custom component for main participant list
 * @property {React.ComponentType<any>} [RenderParticipantListOthers] - Custom component for other participants list
 * 
 * **State Parameters:**
 * @property {ParticipantsModalParameters} parameters - State and context parameters
 * 
 * **Advanced Render Overrides:**
 * @property {object} [style] - Custom styles for modal container
 * @property {(options: { defaultContent: JSX.Element; dimensions: { width: number; height: number }}) => JSX.Element} [renderContent]
 *   Function to wrap or replace modal content
 * @property {(options: { defaultContainer: JSX.Element; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace modal container
 */
export interface ParticipantsModalOptions {
  isParticipantsModalVisible: boolean;
  onParticipantsClose: () => void;
  onParticipantsFilterChange: (filter: string) => void;
  participantsCounter: number;
  onMuteParticipants?: typeof muteParticipants;
  onMessageParticipants?: typeof messageParticipants;
  onRemoveParticipants?: typeof removeParticipants;
  RenderParticipantList?: React.ComponentType<any>;
  RenderParticipantListOthers?: React.ComponentType<any>;
  parameters: ParticipantsModalParameters;
  backgroundColor?: string;
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';

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

export type ParticipantsModalType = (
  options: ParticipantsModalOptions
) => JSX.Element;

/**
 * ParticipantsModal - Participant list with search, filtering, and management actions
 * 
 * ParticipantsModal is a comprehensive React Native modal for viewing and managing
 * session participants. It provides search/filter functionality, participant lists
 * (segmented by role/type), and action buttons for muting, messaging, or removing
 * participants based on user permissions.
 * 
 * **Key Features:**
 * - Real-time participant list with count display
 * - Search/filter functionality for finding participants
 * - Segmented lists (main participants vs. others)
 * - Permission-based actions (mute, message, remove)
 * - Role-based visibility (host, co-host, participant)
 * - Custom renderers for participant list items
 * - Responsive design with flexible positioning
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.participantsModalComponent` to
 * provide a completely custom participants modal implementation.
 * 
 * @component
 * @param {ParticipantsModalOptions} props - Configuration options for the ParticipantsModal component
 * 
 * @returns {JSX.Element} Rendered participants modal with list and management actions
 * 
 * @example
 * // Basic usage - Display participants modal with default settings
 * import React, { useState } from 'react';
 * import { ParticipantsModal } from 'mediasfu-reactnative-expo';
 * import { Socket } from 'socket.io-client';
 * 
 * function MeetingControls() {
 *   const [isModalVisible, setIsModalVisible] = useState(false);
 *   const [participants, setParticipants] = useState([
 *     { name: 'Alice', id: '1', islevel: '1', muted: false },
 *     { name: 'Bob', id: '2', islevel: '1', muted: true },
 *   ]);
 *   
 *   const participantsParameters = {
 *     position: 'topRight',
 *     backgroundColor: '#83c0e9',
 *     coHostResponsibility: [{ name: 'participants', value: true }],
 *     coHost: 'JaneDoe',
 *     member: 'JohnDoe',
 *     islevel: '2',
 *     participants,
 *     eventType: 'conference',
 *     filteredParticipants: participants,
 *     socket: socketInstance,
 *     roomName: 'MainRoom',
 *     updateIsMessagesModalVisible: (visible) => console.log('Messages:', visible),
 *     updateDirectMessageDetails: (participant) => console.log('DM:', participant),
 *     updateStartDirectMessage: (start) => console.log('Start DM:', start),
 *     updateParticipants: setParticipants,
 *     getUpdatedAllParams: () => participantsParameters,
 *   };
 * 
 *   return (
 *     <>
 *       <Button title="Participants" onPress={() => setIsModalVisible(true)} />
 *       <ParticipantsModal
 *         isParticipantsModalVisible={isModalVisible}
 *         onParticipantsClose={() => setIsModalVisible(false)}
 *         onParticipantsFilterChange={(filter) => console.log('Filter:', filter)}
 *         participantsCounter={participants.length}
 *         parameters={participantsParameters}
 *       />
 *     </>
 *   );
 * }
 * 
 * @example
 * // With custom action handlers and positioning
 * <ParticipantsModal
 *   isParticipantsModalVisible={showParticipants}
 *   onParticipantsClose={() => setShowParticipants(false)}
 *   onParticipantsFilterChange={(filter) => handleFilterChange(filter)}
 *   participantsCounter={filteredParticipants.length}
 *   onMuteParticipants={async (options) => {
 *     console.log('Custom mute logic');
 *     await muteParticipants(options);
 *   }}
 *   onMessageParticipants={(options) => {
 *     console.log('Messaging participant:', options.participant.name);
 *     messageParticipants(options);
 *   }}
 *   onRemoveParticipants={async (options) => {
 *     if (confirm('Remove participant?')) {
 *       await removeParticipants(options);
 *     }
 *   }}
 *   parameters={{
 *     ...participantsParameters,
 *     position: 'center',
 *     backgroundColor: '#1a1a2e',
 *   }}
 *   backgroundColor="#1a1a2e"
 *   position="center"
 * />
 * 
 * @example
 * // Using uiOverrides for complete modal replacement
 * import { MyCustomParticipantsModal } from './MyCustomParticipantsModal';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     participantsModalComponent: {
 *       component: MyCustomParticipantsModal,
 *       injectedProps: {
 *         theme: 'compact',
 *         showAvatars: true,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomParticipantsModal.tsx
 * export const MyCustomParticipantsModal = (props: ParticipantsModalOptions & { theme: string; showAvatars: boolean }) => {
 *   return (
 *     <Modal visible={props.isParticipantsModalVisible} onRequestClose={props.onParticipantsClose}>
 *       <View>
 *         <Text>Participants ({props.participantsCounter})</Text>
 *         {props.parameters.participants.map(p => (
 *           <View key={p.id}>
 *             {props.showAvatars && <Image source={{ uri: p.avatar }} />}
 *             <Text>{p.name}</Text>
 *           </View>
 *         ))}
 *       </View>
 *     </Modal>
 *   );
 * };
 */

const ParticipantsModal: React.FC<ParticipantsModalOptions> = ({
  isParticipantsModalVisible,
  onParticipantsClose,
  onParticipantsFilterChange,
  participantsCounter,
  onMuteParticipants = muteParticipants,
  onMessageParticipants = messageParticipants,
  onRemoveParticipants = removeParticipants,
  RenderParticipantList = ParticipantList,
  RenderParticipantListOthers = ParticipantListOthers,
  position = 'topRight',
  backgroundColor = '#83c0e9',
  parameters,
  style,
  renderContent,
  renderContainer,
}) => {
  const {
    coHostResponsibility,
    coHost,
    member,
    islevel,
    showAlert,
    participants,
    roomName,
    eventType,
    socket,
    updateIsMessagesModalVisible,
    updateDirectMessageDetails,
    updateStartDirectMessage,
    updateParticipants,
  } = parameters;

  const [participantList, setParticipantList] = useState<Participant[]>(participants);
  const [participantsCounter_s, setParticipantsCounter_s] = useState<number>(participantsCounter);
  const [filterText, setFilterText] = useState<string>('');

  const screenWidth = Dimensions.get('window').width;
  let modalWidth = 0.8 * screenWidth;
  if (modalWidth > 400) {
    modalWidth = 400;
  }

  let participantsValue = false;
  try {
    participantsValue = coHostResponsibility?.find(
      (item: { name: string; value: boolean }) => item.name === 'participants',
    )?.value ?? false;
  } catch {
    // Default to false if not found
  }

  useEffect(() => {
    const updatedParams = parameters.getUpdatedAllParams();
    setParticipantList(updatedParams.filteredParticipants);
    setParticipantsCounter_s(updatedParams.filteredParticipants.length);
  }, [participants, parameters]);

  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <ScrollView style={styles.scrollView}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          Participants
          {' '}
          <Text style={styles.badge}>{participantsCounter_s}</Text>
        </Text>
        <Pressable
          onPress={onParticipantsClose}
          style={styles.closeButton}
        >
          <FontAwesome name="times" size={24} color="black" />
        </Pressable>
      </View>

      <View style={styles.separator} />
      <View style={styles.modalBody}>
        {/* Search Input */}
        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Search ..."
            value={filterText}
            onChangeText={(text) => {
              setFilterText(text);
              onParticipantsFilterChange(text);
            }}
          />
        </View>

        {/* Participant List */}

        {(participantList && islevel === '2')
        || (coHost === member && participantsValue === true) ? (
          <RenderParticipantList
            participants={participantList}
            isBroadcast={eventType === 'broadcast'}
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
            updateParticipants={updateParticipants}
          />
          ) : participantList ? (
            <RenderParticipantListOthers
              participants={participantList}
              coHost={coHost}
              member={member}
            />
          ) : (
            <Text style={styles.noParticipantsText}>No participants</Text>
          )}
      </View>
    </ScrollView>
  );

  const content = renderContent
    ? renderContent({ defaultContent, dimensions })
    : defaultContent;

  const defaultContainer = (
    <Modal
      transparent
      animationType="slide"
      visible={isParticipantsModalVisible}
      onRequestClose={onParticipantsClose}
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

export default ParticipantsModal;

/**
 * Stylesheet for the ParticipantsModal component.
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
    height: '65%',
    backgroundColor: '#83c0e9',
    borderRadius: 10,
    padding: 15,
    maxHeight: '65%',
    maxWidth: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 9,
    zIndex: 9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 5,
    fontSize: 14,
  },
  closeButton: {
    padding: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#000000',
    marginVertical: 10,
  },
  modalBody: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 10,
  },
  input: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 20,
    backgroundColor: 'white',
  },
  scrollView: {
    flexGrow: 1,
  },
  waitingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  participantName: {
    flex: 5,
  },
  participantText: {
    fontSize: 16,
    color: 'black',
  },
  actionButtons: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  acceptButton: {
    padding: 5,
  },
  rejectButton: {
    padding: 5,
  },
  noParticipantsText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,
    marginTop: 20,
  },
});
