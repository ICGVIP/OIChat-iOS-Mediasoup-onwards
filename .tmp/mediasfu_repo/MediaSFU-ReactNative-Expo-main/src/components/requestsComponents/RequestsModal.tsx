import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Socket } from "socket.io-client";
import RenderRequestComponent, {
  RenderRequestComponentOptions,
} from "./RenderRequestComponent";
import {
  respondToRequests,
  RespondToRequestsType,
} from "../../methods/requestsMethods/respondToRequests";
import { Request } from "../../@types/types";
import { getModalPosition } from "../../methods/utils/getModalPosition";

/**
 * Configuration parameters for requests modal.
 * 
 * @interface RequestsModalParameters
 * 
 * **Utility:**
 * @property {() => { filteredRequestList: Request[] }} getUpdatedAllParams - Function to retrieve latest filtered request list
 * @property {any} [key: string] - Additional dynamic parameters
 */
export interface RequestsModalParameters {
  /**
   * Function to get updated parameters, particularly the filtered request list.
   */
  getUpdatedAllParams: () => { filteredRequestList: Request[] };
  [key: string]: any;
}

/**
 * Configuration options for the RequestsModal component.
 * 
 * @interface RequestsModalOptions
 * 
 * **Modal Control:**
 * @property {boolean} isRequestsModalVisible - Controls modal visibility
 * @property {() => void} onRequestClose - Callback when modal is closed
 * 
 * **Request Management:**
 * @property {number} requestCounter - Current count of pending requests (for badge display)
 * @property {Request[]} requestList - Array of participant requests to display
 * @property {(newRequestList: Request[]) => void} updateRequestList - Updates request list state
 * @property {(text: string) => void} onRequestFilterChange - Handler for filter input changes
 * @property {RespondToRequestsType} [onRequestItemPress] - Handler for accept/reject actions (defaults to respondToRequests)
 * 
 * **Session Context:**
 * @property {string} roomName - Room identifier for request processing
 * @property {Socket} socket - Socket.io instance for real-time request responses
 * 
 * **State Parameters:**
 * @property {RequestsModalParameters} parameters - Additional modal parameters (filtered request list)
 * 
 * **Customization:**
 * @property {'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'} [position='topRight'] - Modal position on screen
 * @property {string} [backgroundColor='#83c0e9'] - Modal background color
 * @property {object} [style] - Additional custom styles for modal container
 * @property {React.FC<RenderRequestComponentOptions>} [renderRequestComponent] - Custom component for rendering each request item (defaults to RenderRequestComponent)
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: JSX.Element; dimensions: { width: number; height: number } }) => JSX.Element} [renderContent] - Custom render function for modal content
 * @property {(options: { defaultContainer: JSX.Element; dimensions: { width: number; height: number } }) => React.ReactNode} [renderContainer] - Custom render function for modal container
 */
export interface RequestsModalOptions {
  /**
   * Flag to control the visibility of the modal.
   */
  isRequestsModalVisible: boolean;

  /**
   * Callback function to handle the closing of the modal.
   */
  onRequestClose: () => void;

  /**
   * Initial count of requests.
   */
  requestCounter: number;

  /**
   * Function to handle the filter input changes.
   */
  onRequestFilterChange: (text: string) => void;

  /**
   * Function to handle the action when a request item is pressed.
   */
  onRequestItemPress?: RespondToRequestsType;

  /**
   * List of requests.
   */
  requestList: Request[];

  /**
   * Function to update the request list.
   */
  updateRequestList: (newRequestList: Request[]) => void;

  /**
   * Name of the room.
   */
  roomName: string;

  /**
   * Socket instance for real-time communication.
   */
  socket: Socket;

  /**
   * Component to render each request item.
   * Defaults to RenderRequestComponent.
   */
  renderRequestComponent?: React.FC<RenderRequestComponentOptions>;

  /**
   * Background color of the modal.
   * Defaults to '#83c0e9'.
   */
  backgroundColor?: string;

  /**
   * Position of the modal on the screen.
   * Possible values: 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'center'.
   * Defaults to 'topRight'.
   */
  position?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center";

  /**
   * Additional parameters for the modal.
   */
  parameters: RequestsModalParameters;

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

export type RequestsModalType = (options: RequestsModalOptions) => JSX.Element;

/**
 * RequestsModal - Participant request management interface
 * 
 * RequestsModal is a React Native component that displays pending participant requests
 * (microphone, video, screenshare) with options to filter, accept, or reject each request.
 * Host users can review and respond to requests in real-time via Socket.io.
 * 
 * **Key Features:**
 * - Scrollable list of participant requests (mic, video, screenshare)
 * - Accept/reject actions for each request
 * - Real-time filtering by participant name or request type
 * - Request counter badge display
 * - Socket.io synchronization for instant responses
 * - Custom request item rendering
 * - Position-configurable modal (5 positions)
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.requestsModal` to
 * provide a completely custom requests management interface.
 * 
 * @component
 * @param {RequestsModalOptions} props - Configuration options
 * 
 * @returns {JSX.Element} Rendered requests modal
 * 
 * @example
 * ```tsx
 * // Basic usage with request handling
 * import React, { useState } from 'react';
 * import { RequestsModal } from 'mediasfu-reactnative-expo';
 * import { io } from 'socket.io-client';
 * 
 * const socket = io('https://your-server.com');
 * const [showRequests, setShowRequests] = useState(false);
 * const [filter, setFilter] = useState('');
 * 
 * const requests = [
 *   { id: '1', name: 'John Doe', icon: 'fa-microphone', username: 'john' },
 *   { id: '2', name: 'Jane Smith', icon: 'fa-video', username: 'jane' },
 *   { id: '3', name: 'Bob Wilson', icon: 'fa-desktop', username: 'bob' },
 * ];
 * 
 * return (
 *   <RequestsModal
 *     isRequestsModalVisible={showRequests}
 *     onRequestClose={() => setShowRequests(false)}
 *     requestCounter={requests.length}
 *     onRequestFilterChange={setFilter}
 *     requestList={requests}
 *     updateRequestList={(newList) => console.log('Updated:', newList)}
 *     roomName="meeting-room-123"
 *     socket={socket}
 *     parameters={{
 *       getUpdatedAllParams: () => ({ filteredRequestList: requests }),
 *     }}
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // With custom positioning and request handling
 * const handleRequestResponse = async (options: RespondToRequestsOptions) => {
 *   await respondToRequests(options);
 *   console.log('Request handled');
 * };
 * 
 * return (
 *   <RequestsModal
 *     isRequestsModalVisible={isVisible}
 *     onRequestClose={handleClose}
 *     requestCounter={pendingCount}
 *     onRequestFilterChange={handleFilterChange}
 *     onRequestItemPress={handleRequestResponse}
 *     requestList={pendingRequests}
 *     updateRequestList={setPendingRequests}
 *     roomName={roomId}
 *     socket={socketConnection}
 *     parameters={requestParams}
 *     position="bottomLeft"
 *     backgroundColor="#2c3e50"
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // Using custom UI via uiOverrides
 * const config = {
 *   uiOverrides: {
 *     requestsModal: {
 *       component: MyCustomRequestsManager,
 *       injectedProps: {
 *         theme: 'dark',
 *         showAutoApprove: true,
 *       },
 *     },
 *   },
 * };
 * 
 * return <MyMeetingComponent config={config} />;
 * ```
 */

const RequestsModal: React.FC<RequestsModalOptions> = ({
  isRequestsModalVisible,
  onRequestClose,
  requestCounter,
  onRequestFilterChange,
  onRequestItemPress = respondToRequests,
  requestList,
  updateRequestList,
  roomName,
  socket,
  renderRequestComponent = RenderRequestComponent,
  backgroundColor = "#83c0e9",
  position = "topRight",
  parameters,
  style,
  renderContent,
  renderContainer,
}) => {
  const [filteredRequestList, setFilteredRequestList] =
    useState<Request[]>(requestList);
  const [localRequestCounter, setLocalRequestCounter] =
    useState<number>(requestCounter);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const { getUpdatedAllParams } = parameters;
    const updatedParams = getUpdatedAllParams();
    setFilteredRequestList(updatedParams.filteredRequestList);
    setLocalRequestCounter(updatedParams.filteredRequestList.length);
  }, [requestList, parameters]);

  const modalWidth = 0.8 * Dimensions.get("window").width > 350 ? 350 : 0.8 * Dimensions.get("window").width;
  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <>
      {/* Header */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          Requests <Text style={styles.badge}>{localRequestCounter}</Text>
        </Text>
        <Pressable onPress={onRequestClose} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color="black" />
        </Pressable>
      </View>

      <View style={styles.separator} />

      {/* Filter Input */}
      <View style={styles.modalBody}>
        <View style={styles.filterContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search ..."
            value={filterText}
            onChangeText={(text) => {
              setFilterText(text);
              onRequestFilterChange(text);
            }}
          />
        </View>
      </View>

      {/* Request List */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.requestList}>
          {filteredRequestList && filteredRequestList.length > 0 ? (
            filteredRequestList.map((requestItem, index) => (
              <View key={index} style={styles.requestItem}>
                {renderRequestComponent({
                  request: requestItem,
                  onRequestItemPress,
                  requestList: filteredRequestList,
                  updateRequestList,
                  roomName,
                  socket,
                })}
              </View>
            ))
          ) : (
            <Text style={styles.noRequestsText}>No requests found.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );

  const content = renderContent
    ? renderContent({ defaultContent, dimensions })
    : defaultContent;

  const defaultContainer = (
    <Modal
      transparent
      animationType="fade"
      visible={isRequestsModalVisible}
      onRequestClose={onRequestClose}
    >
      <View style={[styles.modalContainer, getModalPosition({ position })]}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor, width: modalWidth },
            style,
          ]}
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

export default RequestsModal;

/**
 * Stylesheet for the RequestsModal component.
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 9,
    elevation: 9,
    borderWidth: 2,
    borderColor: "black",
  },
  modalContent: {
    height: "65%",
    backgroundColor: "#fff",
    borderRadius: 0,
    padding: 20,
    maxHeight: "65%",
    maxWidth: "70%",
    zIndex: 9,
    elevation: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
  },
  badge: {
    backgroundColor: "#ffffff",
    color: "#000",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 5,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#ffffff",
    marginVertical: 10,
  },
  filterContainer: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    maxHeight: "100%",
    maxWidth: "100%",
  },
  requestList: {
    flexGrow: 1,
  },
  requestItem: {
    marginBottom: 10,
  },
  noRequestsText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
});
