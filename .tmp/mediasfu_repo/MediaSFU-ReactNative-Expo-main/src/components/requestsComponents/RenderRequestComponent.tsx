// RenderRequestComponent.tsx

import React from 'react';
import {
  View, Text, Pressable, StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Socket } from 'socket.io-client';
import { Request, RespondToRequestsType } from '../../@types/types';

export interface RenderRequestComponentOptions {
  /**
   * The request object containing details of the request.
   */
  request: Request;

  /**
   * Function to handle the action when a request item is pressed.
   */
  onRequestItemPress: RespondToRequestsType;

  /**
   * The list of all requests.
   */
  requestList: Request[];

  /**
   * Function to update the request list.
   */
  updateRequestList: (newRequestList: Request[]) => void;

  /**
   * The name of the room.
   */
  roomName: string;

  /**
   * The socket instance for real-time communication.
   */
  socket: Socket;
}

/**
 * RenderRequestComponent displays a single request item in a list, providing actions to accept or reject the request.
 * It uses FontAwesome icons to represent different request types.
 *
 * @component
 * @param {RenderRequestComponentOptions} props - The properties for the RenderRequestComponent.
 * @returns {JSX.Element} The rendered RenderRequestComponent.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { RenderRequestComponent } from 'mediasfu-reactnative-expo';
 *
 * const request = {
 *   id: 1,
 *   name: 'Request to share screen',
 *   icon: 'fa-desktop',
 * };
 *
 * function handleRequestAction(action) {
 *   console.log(`Request ${action}`);
 * }
 *
 * const requestList = [request];
 *
 * function App() {
 *   return (
 *     <RenderRequestComponent
 *       request={request}
 *       onRequestItemPress={handleRequestAction}
 *       requestList={requestList}
 *       updateRequestList={(newRequestList) => console.log(newRequestList)}
 *       roomName="MainRoom"
 *       socket={socketInstance}
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */


const RenderRequestComponent: React.FC<RenderRequestComponentOptions> = ({
  request,
  onRequestItemPress,
  requestList,
  updateRequestList,
  roomName,
  socket,
}) => {
  /**
   * Maps the request.icon to the corresponding FontAwesome icon name.
   */
  const keyMap: { [key: string]: keyof typeof FontAwesome.glyphMap } = {
    'fa-microphone': 'microphone',
    'fa-desktop': 'desktop',
    'fa-video': 'video-camera',
    'fa-comments': 'comments',
  };

  /**
   * Handles the action when a request is accepted or rejected.
   *
   * @param action - The action taken ('accepted' or 'rejected').
   */
  const handleRequestAction = (action: string) => {
    onRequestItemPress({
      request,
      updateRequestList,
      requestList,
      action,
      roomName,
      socket,
    });
  };

  return (
    <View style={styles.requestRow}>
      {/* Request Name */}
      <View style={styles.requestNameContainer}>
        <Text style={styles.requestNameText}>{request.name}</Text>
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <FontAwesome name={keyMap[request.icon]} size={24} color="black" />
      </View>

      {/* Accept Button */}
      <Pressable
        onPress={() => handleRequestAction('accepted')}
        style={styles.actionButton}
      >
        <FontAwesome name="check" size={24} color="green" />
      </Pressable>

      {/* Reject Button */}
      <Pressable
        onPress={() => handleRequestAction('rejected')}
        style={styles.actionButton}
      >
        <FontAwesome name="times" size={24} color="red" />
      </Pressable>
    </View>
  );
};

export default RenderRequestComponent;

/**
 * Stylesheet for the RenderRequestComponent.
 */
const styles = StyleSheet.create({
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  requestNameContainer: {
    flex: 5,
  },
  requestNameText: {
    fontSize: 14,
    color: '#000000',
  },
  iconContainer: {
    flex: 2,
    alignItems: 'center',
  },
  actionButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
