import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Button,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera'; 
import { FontAwesome5 } from '@expo/vector-icons';
import Orientation from 'react-native-orientation-locker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Socket } from 'socket.io-client';
import { ConnectSocketType } from '../../sockets/SocketManager';
import { ShowAlert } from '../../@types/types'; 

const MAX_ATTEMPTS = 10; // Maximum number of unsuccessful attempts before rate limiting
const RATE_LIMIT_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

/**
 * Configuration parameters for WelcomePage component.
 * 
 * @interface WelcomePageParameters
 * 
 * **Branding:**
 * @property {string} [imgSrc='https://mediasfu.com/images/logo192.png'] - Logo image URL
 * 
 * **Connection Management:**
 * @property {ConnectSocketType} connectSocket - Function to establish Socket.io connection
 * @property {(socket: Socket) => void} updateSocket - Updates socket instance in parent state
 * 
 * **State Updates:**
 * @property {(visible: boolean) => void} updateIsLoadingModalVisible - Controls loading modal visibility
 * @property {(validated: boolean) => void} updateValidated - Updates validation state after successful connection
 * @property {(apiUserName: string) => void} updateApiUserName - Updates API username (event ID)
 * @property {(apiToken: string) => void} updateApiToken - Updates API token (secret key)
 * @property {(link: string) => void} updateLink - Updates event link/URL
 * @property {(roomName: string) => void} updateRoomName - Updates room name
 * @property {(userName: string) => void} updateMember - Updates participant name
 * 
 * **User Feedback:**
 * @property {ShowAlert} [showAlert] - Alert display function for validation errors and feedback
 */
export interface WelcomePageParameters {
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
   * Function to update the socket instance in the parent state.
   */
  updateSocket: (socket: Socket) => void;

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
  updateMember: (userName: string) => void;
}

/**
 * Configuration options for the WelcomePage component.
 * 
 * @interface WelcomePageOptions
 * 
 * **State Parameters:**
 * @property {WelcomePageParameters} parameters - Welcome page configuration and state handlers
 */
export interface WelcomePageOptions {
  /**
   * Parameters required by the WelcomePage component.
   */
  parameters: WelcomePageParameters;
}

export type WelcomePageType = (options: WelcomePageOptions) => JSX.Element;

/**
 * WelcomePage - Event credentials entry and validation screen
 * 
 * WelcomePage is a React Native component that provides the initial entry point for
 * joining MediaSFU events. Users can enter credentials manually (event ID, secret, name)
 * or scan a QR code to auto-fill. It validates credentials, handles rate limiting,
 * and establishes the Socket.io connection before proceeding to the meeting.
 * 
 * **Key Features:**
 * - Manual credential entry (Event ID, Secret, Name, optional Link)
 * - QR code scanning for auto-fill
 * - Camera permission handling
 * - Rate limiting (10 attempts per 3 hours)
 * - Socket.io connection establishment
 * - Persistent storage of attempt counts
 * - Loading state management
 * - Input validation and error feedback
 * - Support for custom event links
 * 
 * **UI Customization:**
 * The WelcomePage layout and styling are fixed but can be customized by creating
 * a custom welcome page component and using it instead of this default one.
 * 
 * @component
 * @param {WelcomePageOptions} props - Configuration options
 * 
 * @returns {JSX.Element} Rendered welcome page
 * 
 * @example
 * ```tsx
 * // Basic usage in main app component
 * import React, { useState } from 'react';
 * import { WelcomePage } from 'mediasfu-reactnative-expo';
 * import { connectSocket } from './sockets/SocketManager';
 * 
 * function App() {
 *   const [socket, setSocket] = useState(null);
 *   const [validated, setValidated] = useState(false);
 *   const [credentials, setCredentials] = useState({});
 * 
 *   const parameters = {
 *     imgSrc: 'https://example.com/logo.png',
 *     showAlert: ({ message, type }) => alert(message),
 *     updateIsLoadingModalVisible: setLoading,
 *     connectSocket: connectSocket,
 *     updateSocket: setSocket,
 *     updateValidated: setValidated,
 *     updateApiUserName: (name) => setCredentials(prev => ({ ...prev, apiUserName: name })),
 *     updateApiToken: (token) => setCredentials(prev => ({ ...prev, apiToken: token })),
 *     updateLink: (link) => setCredentials(prev => ({ ...prev, link })),
 *     updateRoomName: (room) => setCredentials(prev => ({ ...prev, roomName: room })),
 *     updateMember: (member) => setCredentials(prev => ({ ...prev, member })),
 *   };
 * 
 *   if (validated) {
 *     return <MeetingRoom socket={socket} credentials={credentials} />;
 *   }
 * 
 *   return <WelcomePage parameters={parameters} />;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // With custom branding and alert handler
 * const customParameters = {
 *   imgSrc: 'https://mybrand.com/logo.png',
 *   showAlert: ({ message, type, duration }) => {
 *     Toast.show({ text: message, type, duration });
 *   },
 *   // ... other handlers
 * };
 * 
 * return <WelcomePage parameters={customParameters} />;
 * ```
 */

const WelcomePage: React.FC<WelcomePageOptions> = ({ parameters }) => {
  // State variables for input fields
  const [name, setName] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [eventID, setEventID] = useState<string>('');
  const [link, setLink] = useState<string>('');

  // State variables for QR Code Scanner
  const [isScannerVisible, setScannerVisible] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);


  // Destructure parameters
  const {
    showAlert,
    updateIsLoadingModalVisible,
    connectSocket,
    updateSocket,
    updateValidated,
    updateApiUserName,
    updateApiToken,
    updateLink,
    updateRoomName,
    updateMember,
  } = parameters;

  /**
   * Requests camera permissions for QR Code Scanner.
   */
  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status !== 'granted') {
      showAlert?.({
        message: 'Please allow camera access to scan QR code.',
        type: 'danger',
        duration: 3000,
      });
    }
  };

  /**
   * Checks rate limits and makes a socket connection request.
   */
  const checkLimitsAndMakeRequest = async ({
    apiUserName,
    apiToken,
    link,
    apiKey = '',
    userName,
  }: {
    apiUserName: string;
    apiToken: string;
    link: string;
    apiKey?: string;
    userName: string;
  }) => {
    const TIMEOUT_DURATION = 10000; // 10 seconds

    try {
      // Retrieve unsuccessful attempts and last request timestamp from AsyncStorage
      let unsuccessfulAttempts = parseInt(
        (await AsyncStorage.getItem('unsuccessfulAttempts')) || '0',
      );
      const lastRequestTimestamp = parseInt(
        (await AsyncStorage.getItem('lastRequestTimestamp')) || '0',
      );

      // Check if user has exceeded maximum attempts
      if (unsuccessfulAttempts >= MAX_ATTEMPTS) {
        if (Date.now() - lastRequestTimestamp < RATE_LIMIT_DURATION) {
          showAlert?.({
            message: 'Too many unsuccessful attempts. Please try again later.',
            type: 'danger',
            duration: 3000,
          });
          await AsyncStorage.setItem(
            'lastRequestTimestamp',
            Date.now().toString(),
          );
          return;
        }
        // Reset unsuccessful attempts after rate limit duration
        unsuccessfulAttempts = 0;
        await AsyncStorage.setItem(
          'unsuccessfulAttempts',
          unsuccessfulAttempts.toString(),
        );
        await AsyncStorage.setItem(
          'lastRequestTimestamp',
          Date.now().toString(),
        );
      }

      // Show loading modal
      updateIsLoadingModalVisible(true);

      // Attempt to connect to socket with a timeout
      const socketPromise = connectSocket({
        apiUserName,
        apiKey,
        apiToken,
        link,
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_DURATION)
      );

      const socket = await Promise.race([socketPromise, timeoutPromise]);

      if (socket && socket.id) {
        // Successful connection
        unsuccessfulAttempts = 0;
        await AsyncStorage.setItem(
          'unsuccessfulAttempts',
          unsuccessfulAttempts.toString(),
        );
        await AsyncStorage.setItem(
          'lastRequestTimestamp',
          Date.now().toString(),
        );

        // Update parent state with socket and user details
        updateSocket(socket);
        updateApiUserName(apiUserName);
        updateApiToken(apiToken);
        updateLink(link);
        updateRoomName(apiUserName);
        updateMember(userName);
        updateValidated(true);
      } else {
        // Unsuccessful connection
        unsuccessfulAttempts += 1;
        await AsyncStorage.setItem(
          'unsuccessfulAttempts',
          unsuccessfulAttempts.toString(),
        );
        await AsyncStorage.setItem(
          'lastRequestTimestamp',
          Date.now().toString(),
        );
        updateIsLoadingModalVisible(false);

        if (unsuccessfulAttempts >= MAX_ATTEMPTS) {
          showAlert?.({
            message: 'Too many unsuccessful attempts. Please try again later.',
            type: 'danger',
            duration: 3000,
          });
        } else {
          showAlert?.({
            message: 'Invalid credentials.',
            type: 'danger',
            duration: 3000,
          });
        }
      }
    } catch (error) {
      // Handle errors during connection
      console.error('Error connecting to socket:', error);
      showAlert?.({
        message: 'Unable to connect. Check your credentials and try again.',
        type: 'danger',
        duration: 3000,
      });

      // Increment unsuccessful attempts
      let unsuccessfulAttempts = parseInt(
        (await AsyncStorage.getItem('unsuccessfulAttempts')) || '0',
      );
      unsuccessfulAttempts += 1;
      await AsyncStorage.setItem(
        'unsuccessfulAttempts',
        unsuccessfulAttempts.toString(),
      );
      await AsyncStorage.setItem(
        'lastRequestTimestamp',
        Date.now().toString(),
      );
      updateIsLoadingModalVisible(false);
    }
  };

  /**
   * Validates if a string contains only alphanumeric characters.
   * @param {string} str - The string to validate.
   * @returns {boolean} True if valid, else false.
   */
  const validateAlphanumeric = (str: string): boolean => {
    if (str.length === 0) return true; // Allow empty string (for secret)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(str);
  };

  /**
   * Handles changes in the event display name input field.
   * @param {string} text - The new text input value.
   */
  const handleNameChange = (text: string) => {
    if (text.length <= 12 && validateAlphanumeric(text)) {
      setName(text);
    }
  };

  /**
   * Handles changes in the event token (secret) input field.
   * @param {string} text - The new text input value.
   */
  const handleSecretChange = (text: string) => {
    if (text.length <= 64 && validateAlphanumeric(text)) {
      setSecret(text);
    }
  };

  /**
   * Handles changes in the event ID input field.
   * @param {string} text - The new text input value.
   */
  const handleEventIDChange = (text: string) => {
    if (text.length <= 32 && validateAlphanumeric(text)) {
      setEventID(text);
    }
  };

  /**
   * Handles confirmation action when the user presses the Confirm button.
   */
  const handleConfirm = async () => {
    updateIsLoadingModalVisible(true);

    // Check if all fields are filled
    if (
      name.length === 0 ||
      secret.length === 0 ||
      eventID.length === 0 ||
      link.length === 0
    ) {
      showAlert?.({
        message: 'Please fill all the fields.',
        type: 'danger',
        duration: 3000,
      });

      updateIsLoadingModalVisible(false);
      return;
    }

    // Validate inputs
    if (
      !validateAlphanumeric(name) ||
      !validateAlphanumeric(secret) ||
      !validateAlphanumeric(eventID) ||
      !link.includes('mediasfu.com') ||
      eventID.toLowerCase().startsWith('d')
    ) {
      showAlert?.({
        message: 'Please enter valid details.',
        type: 'danger',
        duration: 3000,
      });

      updateIsLoadingModalVisible(false);
      return;
    }

    if (
      secret.length !== 64 ||
      name.length > 12 ||
      name.length < 2 ||
      eventID.length > 32 ||
      eventID.length < 8 ||
      link.length < 12
    ) {
      showAlert?.({
        message: 'Please enter valid details.',
        type: 'danger',
        duration: 3000,
      });

      updateIsLoadingModalVisible(false);
      return;
    }

    // Make the request to connect to the socket
    await checkLimitsAndMakeRequest({
      apiUserName: eventID,
      apiToken: secret,
      link,
      userName: name,
    });

    updateIsLoadingModalVisible(false);
  };

  /**
   * Handles the QR Code scanning result.
   * @param {object} param0 - The scanned data object.
   */
  const handleBarCodeScanned = ({
    data,
  }: {
    data: string;
  }) => {
    setScannedData(data);
    setScanned(true);
  };

  /**
   * Handles changes in scanned data.
   */
  useEffect(() => {
    const processScannedData = async () => {
      if (scannedData) {
        try {
          const data = scannedData.trim();
          const parts = data.split(';');

          if (parts.length === 5) {
            const [userName, link_, userSecret, passWord, meetingID] = parts;

            // Validate scanned data
            if (
              userName.length === 0 ||
              link_.length === 0 ||
              userSecret.length === 0 ||
              passWord.length === 0 ||
              meetingID.length === 0
            ) {
              showAlert?.({
                message: 'Invalid scanned data.',
                type: 'danger',
                duration: 3000,
              });
              return;
            }

            if (
              !validateAlphanumeric(userName) ||
              !validateAlphanumeric(userSecret) ||
              !validateAlphanumeric(passWord) ||
              !validateAlphanumeric(meetingID)
            ) {
              showAlert?.({
                message: 'Invalid scanned data.',
                type: 'danger',
                duration: 3000,
              });
              return;
            }

            if (
              userSecret.length !== 64 ||
              userName.length > 12 ||
              userName.length < 2 ||
              meetingID.length > 32 ||
              meetingID.length < 8 ||
              !link_.includes('mediasfu.com') ||
              meetingID.toLowerCase().startsWith('d')
            ) {
              showAlert?.({
                message: 'Invalid scanned data.',
                type: 'danger',
                duration: 3000,
              });
              return;
            }

            // Set the name and link from scanned data
            setName(userName);
            setLink(link_);

            // Hide the scanner
            setScannerVisible(false);
            setScannedData(null);
            setScanned(false);

            // Make the request with scanned data
            await checkLimitsAndMakeRequest({
              apiUserName: meetingID,
              apiToken: userSecret,
              link: link_,
              userName,
            });
          } else {
            // Handle unexpected data format
            showAlert?.({
              message: 'Invalid scanned data format.',
              type: 'danger',
              duration: 3000,
            });
          }
        } catch (error) {
          console.error('Error processing scanned data:', error);
          showAlert?.({
            message: 'An error occurred while processing scanned data.',
            type: 'danger',
            duration: 3000,
          });
        }
      }
    };

    processScannedData();
  }, [scannedData]);

  /**
   * Locks the orientation to portrait when the component mounts and unlocks on unmount.
   */
  useEffect(() => {
    Orientation.lockToPortrait();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  /**
   * Toggles the visibility of the QR Code Scanner.
   */
  const handleScannerToggle = () => {
    if (!isScannerVisible && hasPermission === null) {
      getCameraPermissions();
    }
    setScannerVisible(!isScannerVisible);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.container, Platform.OS === 'web' && { maxWidth: 600, alignSelf: 'center' }]}>
          {/* Brand Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri:
                  parameters.imgSrc ||
                  'https://mediasfu.com/images/logo192.png',
              }}
              style={styles.logoImage}
            />
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Event Display Name"
              value={name}
              onChangeText={handleNameChange}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Event Display Name"
              placeholderTextColor="gray"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Event Token (Secret)"
              value={secret}
              onChangeText={handleSecretChange}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              accessibilityLabel="Event Token (Secret)"
              placeholderTextColor="gray"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Event ID"
              value={eventID}
              onChangeText={handleEventIDChange}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Event ID"
              placeholderTextColor="gray"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Event Link"
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Event Link"
              placeholderTextColor="gray"
            />
          </View>

          {/* Confirm Button */}
          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </Pressable>

          {/* Horizontal Line with "OR" */}
          <View style={styles.horizontalLineContainer}>
            <View style={styles.horizontalLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.horizontalLine} />
          </View>

          {/* QR Code Scanner Section */}
          <View style={styles.scannerContainer}>
            {isScannerVisible && hasPermission ? (
              <View style={styles.scanner}>
                <CameraView
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'pdf417'],
                  }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Pressable
                  style={styles.closeScannerButton}
                  onPress={handleScannerToggle}
                  accessibilityRole="button"
                  accessibilityLabel="Close QR Scanner"
                >
                  <FontAwesome5 name="times-circle" size={24} color="red" />
                </Pressable>
                {scanned && (
                  <Button
                    title="Tap to Scan Again"
                    onPress={() => setScanned(false)}
                  />
                )}
              </View>
            ) : (
              <Pressable
                style={styles.scanButton}
                onPress={handleScannerToggle}
                accessibilityRole="button"
                accessibilityLabel="Scan QR Code"
              >
                <FontAwesome5
                  name="qrcode"
                  size={20}
                  color="white"
                  style={styles.scanIcon}
                />
                <Text style={styles.scanButtonText}>Scan QR Code</Text>
              </Pressable>
            )}
          </View>

          {/* Additional Options */}
          <View style={styles.additionalOptionsContainer}>
            <Text style={styles.additionalOptionsText}>
              Provide the event details either by typing manually or scanning the
              QR-code to autofill.
            </Text>
            <Text style={styles.additionalOptionsText}>Do not have a secret?</Text>
            <Pressable
              onPress={() => {
                Linking.openURL('https://meeting.mediasfu.com/meeting/start/');
              }}
              accessibilityRole="link"
              accessibilityLabel="Get one from mediasfu.com"
            >
              <Text style={styles.getOneLinkText}>Get one from mediasfu.com</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default WelcomePage;

/**
 * Stylesheet for the WelcomePage component.
 */
const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#53C6E0',
  },
  container: {
    flex: 1,
    paddingHorizontal: '10%',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputField: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  horizontalLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  horizontalLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'black',
  },
  orText: {
    color: 'black',
    marginHorizontal: 10,
    fontWeight: 'bold',
    fontSize: 14,
  },
  scannerContainer: {
    width: 240,
    height: 240,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center', 
    maxWidth: 350,
    maxHeight: 350,
  },
  scanner: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  closeScannerButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanIcon: {
    marginRight: 10,
  },
  additionalOptionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  additionalOptionsText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 14,
  },
  getOneLinkText: {
    color: 'white',
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
