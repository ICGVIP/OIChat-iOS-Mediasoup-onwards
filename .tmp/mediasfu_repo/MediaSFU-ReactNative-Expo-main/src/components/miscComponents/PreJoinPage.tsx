import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Orientation from "react-native-orientation-locker";
import { Socket } from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConnectSocketType,
  ShowAlert,
  ConnectLocalSocketType,
  ResponseLocalConnection,
  ResponseLocalConnectionData,
  RecordingParams,
  MeetingRoomParams,
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
} from "../../@types/types";
import RNPickerSelect from "react-native-picker-select";
import { checkLimitsAndMakeRequest } from "../../methods/utils/checkLimitsAndMakeRequest";
import { createRoomOnMediaSFU } from "../../methods/utils/createRoomOnMediaSFU";
import { CreateRoomOnMediaSFUType, JoinRoomOnMediaSFUType, joinRoomOnMediaSFU } from "../../methods/utils/joinRoomOnMediaSFU";

/**
 * Interface defining the parameters for joining a local event room.
 */
export interface JoinLocalEventRoomParameters {
  eventID: string;
  userName: string;
  secureCode?: string;
  videoPreference?: string | null;
  audioPreference?: string | null;
  audioOutputPreference?: string | null;
}

/**
 * Interface defining the options for joining a local event room.
 */
export interface JoinLocalEventRoomOptions {
  joinData: JoinLocalEventRoomParameters;
  link?: string;
}

/**
 * Interface defining the response structure when creating or joining a local room.
 */
export interface CreateLocalRoomParameters {
  eventID: string;
  duration: number;
  capacity: number;
  userName: string;
  scheduledDate: Date;
  secureCode: string;
  waitRoom?: boolean;
  recordingParams?: RecordingParams;
  eventRoomParams?: MeetingRoomParams;
  videoPreference?: string | null;
  audioPreference?: string | null;
  audioOutputPreference?: string | null;
  mediasfuURL?: string;
}

/**
 * Interface defining the response structure when joining a local room.
 */
export interface CreateLocalRoomOptions {
  createData: CreateLocalRoomParameters;
  link?: string;
}

/**
 * Interface defining the response structure when creating or joining a local room.
 */
export interface CreateJoinLocalRoomResponse {
  success: boolean;
  secret: string;
  reason?: string;
  url?: string;
}

/**
 * Configuration parameters for PreJoinPage component.
 * 
 * @interface PreJoinPageParameters
 * 
 * **Branding:**
 * @property {string} [imgSrc='https://mediasfu.com/images/logo192.png'] - Logo image URL
 * 
 * **Connection Management:**
 * @property {ConnectSocketType} connectSocket - Function to establish MediaSFU Socket.io connection
 * @property {ConnectLocalSocketType} [connectLocalSocket] - Function to establish local server Socket.io connection (Community Edition)
 * @property {(socket: Socket) => void} updateSocket - Updates MediaSFU socket instance
 * @property {(socket: Socket) => void} [updateLocalSocket] - Updates local socket instance
 * 
 * **State Updates:**
 * @property {(visible: boolean) => void} updateIsLoadingModalVisible - Controls loading modal visibility
 * @property {(validated: boolean) => void} updateValidated - Updates validation state after successful connection
 * @property {(apiUserName: string) => void} updateApiUserName - Updates API username
 * @property {(apiToken: string) => void} updateApiToken - Updates API token
 * @property {(link: string) => void} updateLink - Updates event link
 * @property {(roomName: string) => void} updateRoomName - Updates room name
 * @property {(member: string) => void} updateMember - Updates participant name
 * 
 * **User Feedback:**
 * @property {ShowAlert} [showAlert] - Alert display function for validation errors
 */
export interface PreJoinPageParameters {
  /**
   * Source URL for the logo image.
   * Defaults to 'https://mediasfu.com/images/logo192.png' if not provided.
   */
  imgSrc?: string;

  /**
   * Function to display alert messages.
   */
  showAlert?: ShowAlert;

  /**
   * Function to toggle the visibility of the loading modal.
   */
  updateIsLoadingModalVisible: (visible: boolean) => void;

  /**
   * Function to establish a socket connection.
   */
  connectSocket: ConnectSocketType;

  /**
   * Function to establish a socket connection to a local server.
   */
  connectLocalSocket?: ConnectLocalSocketType;

  /**
   * Function to update the socket instance in the parent state.
   */
  updateSocket: (socket: Socket) => void;

  /**
   * Function to update the socket instance in the parent state.
   */
  updateLocalSocket?: (socket: Socket) => void;

  /**
   * Function to update the validation state in the parent.
   */
  updateValidated: (validated: boolean) => void;

  /**
   * Function to update the API username in the parent state.
   */
  updateApiUserName: (apiUserName: string) => void;

  /**
   * Function to update the API token in the parent state.
   */
  updateApiToken: (apiToken: string) => void;

  /**
   * Function to update the event link in the parent state.
   */
  updateLink: (link: string) => void;

  /**
   * Function to update the room name in the parent state.
   */
  updateRoomName: (roomName: string) => void;

  /**
   * Function to update the member name in the parent state.
   */
  updateMember: (member: string) => void;
}

/**
 * Interface defining the credentials.
 */
export interface Credentials {
  apiUserName: string;
  apiKey: string;
}

/**
 * Configuration options for the PreJoinPage component.
 * 
 * @interface PreJoinPageOptions
 * 
 * **Server Configuration:**
 * @property {string} [localLink] - Local server URL for Community Edition deployment
 * @property {boolean} [connectMediaSFU=true] - Whether to allow connection to MediaSFU cloud servers
 * 
 * **Authentication:**
 * @property {Credentials} [credentials] - User API credentials (apiUserName, apiKey) for MediaSFU
 * 
 * **State Parameters:**
 * @property {PreJoinPageParameters} parameters - Pre-join page configuration and state handlers
 * 
 * **Programmatic Mode (No UI):**
 * @property {boolean} [returnUI=false] - Whether to render UI (false = headless mode)
 * @property {CreateMediaSFURoomOptions | JoinMediaSFURoomOptions} [noUIPreJoinOptions] - Options for headless room creation/join
 * @property {CreateRoomOnMediaSFUType} [createMediaSFURoom] - Custom room creation function
 * @property {JoinRoomOnMediaSFUType} [joinMediaSFURoom] - Custom room join function
 */
export interface PreJoinPageOptions {
  /**
   * link to the local server (Community Edition)
   */
  localLink?: string;

  /**
   * Determines if the user is allowed to connect to the MediaSFU server.
   */
  connectMediaSFU?: boolean;

  /**
   * Parameters required by the PreJoinPage component.
   */
  parameters: PreJoinPageParameters;

  /**
   * Optional user credentials. Defaults to predefined credentials if not provided.
   */
  credentials?: Credentials;

  /**
   * Flag to determine if the component should return the UI.
   */
  returnUI?: boolean;

  /**
   * Options for creating/joining a room without UI.
   */
  noUIPreJoinOptions?: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;

  /**
   * Function to create a room on MediaSFU.
   */
  createMediaSFURoom?: CreateRoomOnMediaSFUType;

  /**
   * Function to join a room on MediaSFU.
   */
  joinMediaSFURoom?: JoinRoomOnMediaSFUType;
}

export type PreJoinPageType = (options: PreJoinPageOptions) => JSX.Element;

/**
 * PreJoinPage - Room creation/join interface with media preview
 * 
 * PreJoinPage is a React Native component that provides the entry point for creating
 * new meeting rooms or joining existing ones. It offers two modes:
 * 1. **UI Mode**: Full interface with room configuration options
 * 2. **Headless Mode**: Programmatic room creation/join without UI
 * 
 * **Key Features:**
 * - Create new rooms with custom settings (duration, capacity, event type)
 * - Join existing rooms by event ID
 * - Media device preview (camera/microphone)
 * - Recording configuration options
 * - Waiting room and secure code settings
 * - Local (Community Edition) and cloud (MediaSFU) server support
 * - Headless/programmatic mode for automated workflows
 * - Input validation and error feedback
 * - Persistent storage of preferences
 * 
 * **Room Configuration Options:**
 * - Event type (chat, broadcast, webinar, conference)
 * - Duration (up to 24 hours)
 * - Participant capacity
 * - Recording parameters (videoParticipants, videoOptions, etc.)
 * - Waiting room enable/disable
 * - Secure access codes
 * 
 * **UI Customization:**
 * The PreJoinPage layout and styling are fixed but can be customized by creating
 * a custom pre-join component and using it instead of this default one.
 * 
 * @component
 * @param {PreJoinPageOptions} props - Configuration options
 * 
 * @returns {JSX.Element} Rendered pre-join page or null (headless mode)
 * 
 * @example
 * ```tsx
 * // Basic usage with UI
 * import React, { useState } from 'react';
 * import { PreJoinPage } from 'mediasfu-reactnative-expo';
 * import { connectSocket } from './sockets/SocketManager';
 * 
 * function App() {
 *   const [socket, setSocket] = useState(null);
 *   const [validated, setValidated] = useState(false);
 * 
 *   const parameters = {
 *     imgSrc: 'https://example.com/logo.png',
 *     showAlert: ({ message, type }) => alert(message),
 *     updateIsLoadingModalVisible: setLoading,
 *     connectSocket: connectSocket,
 *     updateSocket: setSocket,
 *     updateValidated: setValidated,
 *     updateApiUserName: setApiUserName,
 *     updateApiToken: setApiToken,
 *     updateLink: setLink,
 *     updateRoomName: setRoomName,
 *     updateMember: setMember,
 *   };
 * 
 *   const credentials = {
 *     apiUserName: 'your-api-username',
 *     apiKey: 'your-api-key',
 *   };
 * 
 *   if (validated) {
 *     return <MeetingRoom socket={socket} />;
 *   }
 * 
 *   return (
 *     <PreJoinPage
 *       parameters={parameters}
 *       credentials={credentials}
 *       connectMediaSFU={true}
 *     />
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Headless mode - programmatic room creation
 * const headlessOptions = {
 *   action: 'create',
 *   capacity: 50,
 *   duration: 60, // minutes
 *   eventType: 'webinar',
 *   userName: 'Host Name',
 *   recordingParams: {
 *     recordingVideoParticipantsFullRoomSupport: true,
 *     recordingAllParticipantsSupport: false,
 *   },
 * };
 * 
 * return (
 *   <PreJoinPage
 *     parameters={parameters}
 *     credentials={credentials}
 *     returnUI={false}
 *     noUIPreJoinOptions={headlessOptions}
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // Community Edition (local server)
 * return (
 *   <PreJoinPage
 *     parameters={parameters}
 *     localLink="http://localhost:3000"
 *     connectMediaSFU={false}
 *   />
 * );
 *
 *
 * export default App;
 * ```
 */

const PreJoinPage: React.FC<PreJoinPageOptions> = ({
  localLink = "",
  connectMediaSFU = true,
  parameters,
  credentials,
  returnUI = false,
  noUIPreJoinOptions,
  createMediaSFURoom = createRoomOnMediaSFU,
  joinMediaSFURoom = joinRoomOnMediaSFU,
}) => {
  // State variables
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [eventType, setEventType] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [eventID, setEventID] = useState<string>("");
  const [error, setError] = useState<string>("");
  const pending = useRef(false);

  const localConnected = useRef(false);
  const localData = useRef<ResponseLocalConnectionData | undefined>(undefined);
  const initSocket = useRef<Socket | undefined>(undefined);

  const {
    showAlert,
    updateIsLoadingModalVisible,
    connectLocalSocket,
    updateSocket,
    updateValidated,
    updateApiUserName,
    updateApiToken,
    updateLink,
    updateRoomName,
    updateMember,
  } = parameters;

  const handleCreateRoom = async () => {
    if (pending.current) {
      return;
    }
    pending.current = true;
    let payload = {} as CreateMediaSFURoomOptions;
    if (returnUI) {
      if (!name || !duration || !eventType || !capacity) {
        setError("Please fill all the fields.");
        return;
      }
      payload = {
        action: "create",
        duration: parseInt(duration),
        capacity: parseInt(capacity),
        eventType: eventType as "chat" | "broadcast" | "webinar" | "conference",
        userName: name,
        recordOnly: false,
      };
    } else {
      if (
        noUIPreJoinOptions &&
        "action" in noUIPreJoinOptions &&
        noUIPreJoinOptions.action === "create"
      ) {
        payload = noUIPreJoinOptions as CreateMediaSFURoomOptions;
      } else {
        pending.current = false;
        throw new Error(
          "Invalid options provided for creating a room without UI."
        );
      }
    }

    updateIsLoadingModalVisible(true);

    if (localLink.length > 0) {
      const secureCode =
        Math.random().toString(30).substring(2, 14) +
        Math.random().toString(30).substring(2, 14);
      let eventID =
        new Date().getTime().toString(30) +
        new Date().getUTCMilliseconds() +
        Math.floor(10 + Math.random() * 99).toString();
      eventID = "m" + eventID;
      const eventRoomParams = localData.current?.meetingRoomParams_;
      eventRoomParams!.type = eventType as
        | "chat"
        | "broadcast"
        | "webinar"
        | "conference";

      const createData: CreateLocalRoomParameters = {
        eventID: eventID,
        duration: payload.duration,
        capacity: payload.capacity,
        userName: payload.userName,
        scheduledDate: new Date(),
        secureCode: secureCode,
        waitRoom: false,
        recordingParams: localData.current?.recordingParams_,
        eventRoomParams: eventRoomParams,
        videoPreference: null,
        audioPreference: null,
        audioOutputPreference: null,
        mediasfuURL: "",
      };

      // socket in main window is required and for no local room, no use of initSocket
      // for local room, initSocket becomes the local socket, and localSocket is the connection to MediaSFU (if connectMediaSFU is true)
      // else localSocket is the same as initSocket

      if (
        connectMediaSFU &&
        initSocket.current &&
        localData.current &&
        localData.current.apiUserName &&
        localData.current.apiKey
      ) {
        // Store references to prevent race conditions
        const apiUserName = localData.current.apiUserName;
        const apiKey = localData.current.apiKey;
        
        // Build a unique identifier for this create request
        const roomIdentifier = `local_create_${payload.userName}_${payload.duration}_${payload.capacity}`;
        const pendingKey = `prejoin_pending_${roomIdentifier}`;
        const PENDING_TIMEOUT = 30 * 1000; // 30 seconds

        // Check pending status to prevent duplicate requests
        try {
          const pendingRequest = await AsyncStorage.getItem(pendingKey);
          if (pendingRequest) {
            const pendingData = JSON.parse(pendingRequest);
            const timeSincePending = Date.now() - (pendingData?.timestamp ?? 0);
            if (timeSincePending < PENDING_TIMEOUT) {
              pending.current = false;
              updateIsLoadingModalVisible(false);
              setError('Room creation already in progress');
              return;
            } else {
              // Stale lock, clear it
              await AsyncStorage.removeItem(pendingKey).catch(() => {});
            }
          }
        } catch {
          // Ignore AsyncStorage read/JSON errors
        }

        // Mark request as pending
        try {
          await AsyncStorage.setItem(
            pendingKey,
            JSON.stringify({
              timestamp: Date.now(),
              payload: {
                action: 'create',
                userName: payload.userName,
                duration: payload.duration,
                capacity: payload.capacity,
              },
            })
          );

          // Auto-clear the pending flag after timeout to avoid stale locks
          setTimeout(() => {
            AsyncStorage.removeItem(pendingKey).catch(() => {});
          }, PENDING_TIMEOUT);
        } catch {
          // Ignore AsyncStorage write errors
        }
        
        payload.recordOnly = true; // allow production to mediasfu only; no consumption
        
        try {
          const response = await roomCreator({
            payload,
            apiUserName: apiUserName,
            apiKey: apiKey,
            validate: false,
          });
          
          // Clear pending status on completion
          try { 
            await AsyncStorage.removeItem(pendingKey); 
          } catch { 
            /* ignore */ 
          }
          
          if (
            response &&
            response.success &&
            response.data &&
            "roomName" in response.data
          ) {
            createData.eventID = response.data.roomName;
            createData.secureCode = response.data.secureCode || "";
            createData.mediasfuURL = response.data.publicURL;
            await createLocalRoom({
              createData: createData,
              link: response.data.link,
            });
          } else {
            pending.current = false;
            updateIsLoadingModalVisible(false);
            setError(`Unable to create room on MediaSFU.`);
          }
        } catch (error) {
          // Clear pending status on error
          try { 
            await AsyncStorage.removeItem(pendingKey); 
          } catch { 
            /* ignore */ 
          }
          pending.current = false;
          updateIsLoadingModalVisible(false);
          setError(`Unable to create room on MediaSFU. ${error}`);
        }
      } else {
        try {
          updateSocket(initSocket.current!);
          await createLocalRoom({ createData: createData });
          pending.current = false;
        } catch (error) {
          pending.current = false;
          updateIsLoadingModalVisible(false);
          setError(`Unable to create room. ${error}`);
        }
      }
    } else {
      // Build a unique identifier for this create request (non-local)
      const roomIdentifier = `mediasfu_create_${payload.userName}_${payload.duration}_${payload.capacity}`;
      const pendingKey = `prejoin_pending_${roomIdentifier}`;
      const PENDING_TIMEOUT = 30 * 1000; // 30 seconds

      // Check pending status to prevent duplicate requests
      try {
        const pendingRequest = await AsyncStorage.getItem(pendingKey);
        if (pendingRequest) {
          const pendingData = JSON.parse(pendingRequest);
          const timeSincePending = Date.now() - (pendingData?.timestamp ?? 0);
          if (timeSincePending < PENDING_TIMEOUT) {
            pending.current = false;
            updateIsLoadingModalVisible(false);
            setError('Room creation already in progress');
            return;
          } else {
            // Stale lock, clear it
            await AsyncStorage.removeItem(pendingKey).catch(() => {});
          }
        }
      } catch {
        // Ignore AsyncStorage read/JSON errors
      }

      // Mark request as pending
      try {
        await AsyncStorage.setItem(
          pendingKey,
          JSON.stringify({
            timestamp: Date.now(),
            payload: {
              action: 'create',
              userName: payload.userName,
              duration: payload.duration,
              capacity: payload.capacity,
            },
          })
        );

        // Auto-clear the pending flag after timeout to avoid stale locks
        setTimeout(() => {
          AsyncStorage.removeItem(pendingKey).catch(() => {});
        }, PENDING_TIMEOUT);
      } catch {
        // Ignore AsyncStorage write errors
      }

      try {
        await roomCreator({
          payload,
          apiUserName: credentials.apiUserName,
          apiKey: credentials.apiKey,
          validate: true,
        });
        
        // Clear pending status on completion
        try { 
          await AsyncStorage.removeItem(pendingKey); 
        } catch { 
          /* ignore */ 
        }
        
        pending.current = false;
      } catch (error) {
        // Clear pending status on error
        try { 
          await AsyncStorage.removeItem(pendingKey); 
        } catch { 
          /* ignore */ 
        }
        pending.current = false;
        updateIsLoadingModalVisible(false);
        setError(`Unable to create room. ${error}`);
      }
    }
  };

  const handleJoinRoom = async () => {
    if (pending.current) {
      return;
    }
    pending.current = true;
    let payload = {} as JoinMediaSFURoomOptions;
    if (returnUI) {
      if (!name || !eventID) {
        setError("Please fill all the fields.");
        return;
      }

      payload = {
        action: "join",
        meetingID: eventID,
        userName: name,
      };
    } else {
      if (
        noUIPreJoinOptions &&
        "action" in noUIPreJoinOptions &&
        noUIPreJoinOptions.action === "join"
      ) {
        payload = noUIPreJoinOptions as JoinMediaSFURoomOptions;
      } else {
        throw new Error(
          "Invalid options provided for joining a room without UI."
        );
      }
    }

    if (localLink.length > 0 && !localLink.includes("mediasfu.com")) {
      const joinData: JoinLocalEventRoomParameters = {
        eventID: payload.meetingID,
        userName: payload.userName,
        secureCode: "",
        videoPreference: null,
        audioPreference: null,
        audioOutputPreference: null,
      };

      await joinLocalRoom({ joinData: joinData });
      pending.current = false;
      return;
    }

    updateIsLoadingModalVisible(true);

    const response = await joinMediaSFURoom({
      payload,
      apiUserName: credentials.apiUserName,
      apiKey: credentials.apiKey,
      localLink: localLink,
    });
    if (response.success && response.data && "roomName" in response.data) {
      await checkLimitsAndMakeRequest({
        apiUserName: response.data.roomName,
        apiToken: response.data.secret,
        link: response.data.link,
        userName: payload.userName,
        parameters: parameters,
      });
      setError("");
      pending.current = false;
    } else {
      pending.current = false;
      updateIsLoadingModalVisible(false);
      setError(
        `Unable to join room. ${
          response.data
            ? "error" in response.data
              ? response.data.error
              : ""
            : ""
        }`
      );
    }
  };

  const joinLocalRoom = async ({
    joinData,
    link = localLink,
  }: JoinLocalEventRoomOptions) => {
    initSocket.current?.emit(
      "joinEventRoom",
      joinData,
      (response: CreateJoinLocalRoomResponse) => {
        if (response.success) {
          updateSocket(initSocket.current!);
          updateApiUserName(localData.current?.apiUserName || "");
          updateApiToken(response.secret);
          updateLink(link);
          updateRoomName(joinData.eventID);
          updateMember(joinData.userName);
          updateIsLoadingModalVisible(false);
          updateValidated(true);
        } else {
          updateIsLoadingModalVisible(false);
          setError(`Unable to join room. ${response.reason}`);
        }
      }
    );
  };

  const createLocalRoom = async ({
    createData,
    link = localLink,
  }: CreateLocalRoomOptions) => {
    initSocket.current?.emit(
      "createRoom",
      createData,
      (response: CreateJoinLocalRoomResponse) => {
        if (response.success) {
          updateSocket(initSocket.current!);
          updateApiUserName(localData.current?.apiUserName || "");
          updateApiToken(response.secret);
          updateLink(link);
          updateRoomName(createData.eventID);
          // local needs islevel updated from here
          // we update member as `userName` + "_2" and split it in the room
          updateMember(createData.userName + "_2");
          updateIsLoadingModalVisible(false);
          updateValidated(true);
        } else {
          updateIsLoadingModalVisible(false);
          setError(`Unable to create room. ${response.reason}`);
        }
      }
    );
  };

  const roomCreator = async ({
    payload,
    apiUserName,
    apiKey,
    validate = true,
  }: {
    payload: any;
    apiUserName: string;
    apiKey: string;
    validate?: boolean;
  }) => {
    const response = await createMediaSFURoom({
      payload,
      apiUserName: apiUserName,
      apiKey: apiKey,
      localLink: localLink,
    });
    if (response.success && response.data && "roomName" in response.data) {
      await checkLimitsAndMakeRequest({
        apiUserName: response.data.roomName,
        apiToken: response.data.secret,
        link: response!.data.link,
        userName: payload.userName,
        parameters: parameters,
        validate: validate,
      });
      return response;
    } else {
      updateIsLoadingModalVisible(false);
      setError(
        `Unable to create room. ${
          response.data
            ? "error" in response.data
              ? response.data.error
              : ""
            : ""
        }`
      );
    }
  };

  const checkProceed = async ({
    returnUI,
    noUIPreJoinOptions,
  }: {
    returnUI: boolean;
    noUIPreJoinOptions: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;
  }) => {
    if (!returnUI && noUIPreJoinOptions) {
      if (
        "action" in noUIPreJoinOptions &&
        noUIPreJoinOptions.action === "create"
      ) {
        // update all the required parameters and call
        const createOptions: CreateMediaSFURoomOptions =
          noUIPreJoinOptions as CreateMediaSFURoomOptions;
        if (
          !createOptions.userName ||
          !createOptions.duration ||
          !createOptions.eventType ||
          !createOptions.capacity
        ) {
          throw new Error(
            "Please provide all the required parameters: userName, duration, eventType, capacity"
          );
        }

        await handleCreateRoom();
      } else if (
        "action" in noUIPreJoinOptions &&
        noUIPreJoinOptions.action === "join"
      ) {
        // update all the required parameters and call
        const joinOptions: JoinMediaSFURoomOptions =
          noUIPreJoinOptions as JoinMediaSFURoomOptions;
        if (!joinOptions.userName || !joinOptions.meetingID) {
          throw new Error(
            "Please provide all the required parameters: userName, meetingID"
          );
        }

        await handleJoinRoom();
      } else {
        throw new Error(
          "Invalid options provided for creating/joining a room without UI."
        );
      }
    }
  };

  useEffect(() => {
    if (
      localLink.length > 0 &&
      !localConnected.current &&
      !initSocket.current
    ) {
      try {
        connectLocalSocket?.({ link: localLink })
          .then((response: ResponseLocalConnection | undefined) => {
            localData.current = response!.data;
            initSocket.current = response!.socket;
            localConnected.current = true;

            if (!returnUI && noUIPreJoinOptions) {
              checkProceed({ returnUI, noUIPreJoinOptions });
            }
          })
          .catch((error) => {
            showAlert?.({
              message: `Unable to connect to ${localLink}. ${error}`,
              type: "danger",
              duration: 3000,
            });
          });
      } catch {
        showAlert?.({
          message: `Unable to connect to ${localLink}. Something went wrong.`,
          type: "danger",
          duration: 3000,
        });
      }
    } else if (localLink.length === 0 && !initSocket.current) {
      if (!returnUI && noUIPreJoinOptions) {
        checkProceed({ returnUI, noUIPreJoinOptions });
      }
    }
  }, []);

  const handleToggleMode = () => {
    setIsCreateMode(!isCreateMode);
    setError("");
  };

  /**
   * Locks the orientation to portrait mode when the component mounts and unlocks on unmount.
   */
  useEffect(() => {
    Orientation.lockToPortrait();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  if (!returnUI) {
    return <></>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={[
            styles.container,
            Platform.OS === "web" && { maxWidth: 600, alignSelf: "center" },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri:
                  parameters.imgSrc ||
                  "https://mediasfu.com/images/logo192.png",
              }}
              style={styles.logoImage}
            />
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            {isCreateMode ? (
              <>
                <TextInput
                  style={styles.inputField}
                  placeholder="Display Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Display Name"
                  placeholderTextColor="gray"
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Duration (minutes)"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Duration (minutes)"
                  placeholderTextColor="gray"
                />

                <RNPickerSelect
                  onValueChange={(value: string) => {
                    setEventType(value);
                  }}
                  items={[
                    { label: "Chat", value: "chat" },
                    { label: "Broadcast", value: "broadcast" },
                    { label: "Webinar", value: "webinar" },
                    { label: "Conference", value: "conference" },
                  ]}
                  value={eventType}
                  style={pickerSelectStyles}
                  placeholder={{
                    label: "Select Event Type",
                    value: "",
                    color: "gray",
                  }}
                  useNativeAndroidPickerStyle={false}
                />
                <View style={styles.gap} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Room Capacity"
                  value={capacity}
                  onChangeText={setCapacity}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Room Capacity"
                  placeholderTextColor="gray"
                />
                <Pressable
                  style={styles.actionButton}
                  onPress={handleCreateRoom}
                  accessibilityRole="button"
                  accessibilityLabel="Create Room"
                >
                  <Text style={styles.actionButtonText}>Create Room</Text>
                </Pressable>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.inputField}
                  placeholder="Display Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Display Name"
                  placeholderTextColor="gray"
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Event ID"
                  value={eventID}
                  onChangeText={setEventID}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Event ID"
                  placeholderTextColor="gray"
                />
                <Pressable
                  style={styles.actionButton}
                  onPress={handleJoinRoom}
                  accessibilityRole="button"
                  accessibilityLabel="Join Room"
                >
                  <Text style={styles.actionButtonText}>Join Room</Text>
                </Pressable>
              </>
            )}
            {error !== "" && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* OR Separator */}
          <View style={styles.orContainer}>
            <Text style={styles.orText}>OR</Text>
          </View>

          {/* Toggle Mode Button */}
          <View style={styles.toggleContainer}>
            <Pressable
              style={styles.toggleButton}
              onPress={handleToggleMode}
              accessibilityRole="button"
              accessibilityLabel={
                isCreateMode ? "Switch to Join Mode" : "Switch to Create Mode"
              }
            >
              <Text style={styles.toggleButtonText}>
                {isCreateMode ? "Switch to Join Mode" : "Switch to Create Mode"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PreJoinPage;

/**
 * Stylesheet for the PreJoinPage component.
 */
const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#53C6E0",
    paddingVertical: 10,
    maxHeight: "100%",
  },
  container: {
    flex: 1,
    paddingHorizontal: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  inputField: {
    height: 40,
    width: "100%",
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: "black",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  toggleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButton: {
    backgroundColor: "black",
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  orText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  gap: {
    marginBottom: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 5,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "black",
    paddingRight: 20,
  },
  inputAndroid: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "black",
    paddingRight: 20,
  },
  inputWeb: {
    height: 30,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "black",
    paddingRight: 20,
  },
  placeholder: {
    color: "gray",
  },
});
