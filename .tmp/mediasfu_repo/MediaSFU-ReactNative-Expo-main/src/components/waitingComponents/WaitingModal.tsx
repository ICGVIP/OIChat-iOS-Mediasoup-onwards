// WaitingRoomModal.tsx

import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Socket } from "socket.io-client";
import { getModalPosition } from "../../methods/utils/getModalPosition";
import {
  respondToWaiting,
  RespondToWaitingType,
} from "../../methods/waitingMethods/respondToWaiting";
import { WaitingRoomParticipant } from "../../@types/types";

export interface WaitingRoomModalParameters {
  filteredWaitingRoomList: WaitingRoomParticipant[];

  /**
   * Function to get updated parameters, particularly the filtered waiting room list.
   */
  getUpdatedAllParams: () => WaitingRoomModalParameters;
  [key: string]: any;
}

export interface WaitingRoomModalOptions {
  /**
   * Flag to control the visibility of the modal.
   */
  isWaitingModalVisible: boolean;

  /**
   * Callback function to handle the closing of the modal.
   */
  onWaitingRoomClose: () => void;

  /**
   * Initial count of participants in the waiting room.
   */
  waitingRoomCounter: number;

  /**
   * Function to handle changes in the search input.
   */
  onWaitingRoomFilterChange: (filter: string) => void;

  /**
   * List of participants in the waiting room.
   */
  waitingRoomList: WaitingRoomParticipant[];

  /**
   * Function to update the waiting room list.
   */
  updateWaitingList: (updatedList: WaitingRoomParticipant[]) => void;

  /**
   * Name of the room.
   */
  roomName: string;

  /**
   * Socket instance for real-time communication.
   */
  socket: Socket;

  /**
   * Position of the modal on the screen.
   * Possible values: 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'center'.
   * Defaults to 'topRight'.
   */
  position?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center";

  /**
   * Background color of the modal.
   * Defaults to '#83c0e9'.
   */
  backgroundColor?: string;

  /**
   * Additional parameters for the modal.
   */
  parameters: WaitingRoomModalParameters;

  /**
   * Function to handle participant item press.
   * Defaults to respondToWaiting.
   */
  onWaitingRoomItemPress?: RespondToWaitingType;

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

export type WaitingRoomModalType = (
  options: WaitingRoomModalOptions
) => JSX.Element;

/**
 * WaitingRoomModal is a React Native functional component that displays a modal containing a list of participants who are waiting to join a room. Users can filter, accept, or reject participants from the waiting list.
 *
 * @component
 * @param {WaitingRoomModalOptions} props - The properties for the WaitingRoomModal component.
 * @returns {JSX.Element} The rendered WaitingRoomModal component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { WaitingRoomModal } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *   const waitingRoomList = [
 *     { id: 1, name: 'John Doe' },
 *     { id: 2, name: 'Jane Smith' },
 *   ];
 *
 *   const handleWaitingRoomItemPress = ({ participantId, type }) => {
 *     console.log(`Participant ID ${participantId} was ${type ? 'accepted' : 'rejected'}`);
 *   };
 *
 *   return (
 *     <WaitingRoomModal
 *       isWaitingModalVisible={true}
 *       onWaitingRoomClose={() => console.log('Modal closed')}
 *       waitingRoomCounter={waitingRoomList.length}
 *       onWaitingRoomFilterChange={(filter) => console.log('Filter applied:', filter)}
 *       waitingRoomList={waitingRoomList}
 *       updateWaitingList={(updatedList) => console.log('Updated list:', updatedList)}
 *       roomName="Main Room"
 *       socket={socketInstance}
 *       onWaitingRoomItemPress={handleWaitingRoomItemPress}
 *       backgroundColor="#83c0e9"
 *       position="topRight"
 *       parameters={{
 *         getUpdatedAllParams: () => ({ filteredWaitingRoomList: waitingRoomList }),
 *       }}
 *     />
 *   );
 * }
 * export default App;
 * ```
 */


const WaitingRoomModal: React.FC<WaitingRoomModalOptions> = ({
  isWaitingModalVisible,
  onWaitingRoomClose,
  waitingRoomCounter,
  onWaitingRoomFilterChange,
  waitingRoomList,
  updateWaitingList,
  roomName,
  socket,
  onWaitingRoomItemPress = respondToWaiting,
  position = "topRight",
  backgroundColor = "#83c0e9",
  parameters,
  style,
  renderContent,
  renderContainer,
}) => {
  const screenWidth: number = Dimensions.get("window").width;
  let modalWidth: number = 0.8 * screenWidth;

  if (modalWidth > 400) {
    modalWidth = 400;
  }

  const [filteredWaitingRoomList, setFilteredWaitingRoomList] =
    useState<WaitingRoomParticipant[]>(waitingRoomList);
  const [waitingRoomCounter_s, setWaitingRoomCounter_s] =
    useState<number>(waitingRoomCounter);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const { getUpdatedAllParams } = parameters;
    const updatedParams = getUpdatedAllParams();
    setFilteredWaitingRoomList(updatedParams.filteredWaitingRoomList);
    setWaitingRoomCounter_s(updatedParams.filteredWaitingRoomList.length);
  }, [waitingRoomList, parameters]);

  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <>
      {/* Header */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          Waiting <Text style={styles.badge}>{waitingRoomCounter_s}</Text>
        </Text>
        <Pressable onPress={onWaitingRoomClose} style={styles.closeButton}>
          <FontAwesome name="times" size={24} color="black" />
        </Pressable>
      </View>

      <View style={styles.separator} />

      {/* Search Input */}

      <View style={styles.modalBody}>
        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Search ..."
            value={filterText}
            onChangeText={(text) => {
              setFilterText(text);
              onWaitingRoomFilterChange(text);
            }}
          />
        </View>

        {/* Waiting List */}
        <ScrollView style={styles.scrollView}>
          <View>
            {filteredWaitingRoomList &&
            filteredWaitingRoomList.length > 0 ? (
              filteredWaitingRoomList.map((participant, index) => (
                <View key={index} style={styles.waitingItem}>
                  <View style={styles.participantName}>
                    <Text style={styles.participantText}>
                      {participant.name}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    {/* Accept Button */}
                    <Pressable
                      style={styles.acceptButton}
                      onPress={() =>
                        onWaitingRoomItemPress({
                          participantId: participant.id,
                          participantName: participant.name,
                          updateWaitingList,
                          waitingList: waitingRoomList,
                          roomName,
                          type: true, // accepted
                          socket,
                        })
                      }
                    >
                      <FontAwesome name="check" size={24} color="green" />
                    </Pressable>

                    {/* Reject Button */}
                    <Pressable
                      style={styles.rejectButton}
                      onPress={() =>
                        onWaitingRoomItemPress({
                          participantId: participant.id,
                          participantName: participant.name,
                          updateWaitingList,
                          waitingList: waitingRoomList,
                          roomName,
                          type: false, // rejected
                          socket,
                        })
                      }
                    >
                      <FontAwesome name="times" size={24} color="red" />
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noParticipantsText}>
                No participants found.
              </Text>
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
      visible={isWaitingModalVisible}
      onRequestClose={onWaitingRoomClose}
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

export default WaitingRoomModal;

/**
 * Stylesheet for the WaitingRoomModal component.
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 9,
    elevation: 9,
    borderWidth: 2,
    borderColor: "black",
  },
  modalContent: {
    height: "65%",
    backgroundColor: "#83c0e9",
    borderRadius: 10,
    padding: 15,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 9,
    elevation: 9,
    borderWidth: 2,
    borderColor: "black",
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
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 5,
    fontSize: 14,
  },
  modalBody: {
    flex: 1,
  },
  closeButton: {
    padding: 5,
    marginRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#000000",
    marginVertical: 10,
  },
  formGroup: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    color: "black",
  },
  scrollView: {
    flexGrow: 1,
    maxHeight: "100%",
    maxWidth: "100%",
  },
  waitingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  participantName: {
    flex: 5,
  },
  participantText: {
    fontSize: 16,
    color: "black",
  },
  actionButtons: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  acceptButton: {
    padding: 5,
  },
  rejectButton: {
    padding: 5,
  },
  noParticipantsText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
    marginTop: 20,
  },
});
