// MeetingIdComponent.tsx

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * Interface defining the props for the MeetingIdComponent.
 */
export interface MeetingIdComponentOptions {
  /**
   * The meeting ID to display. Defaults to an empty string.
   */
  meetingID?: string;
}

/**
 * MeetingIdComponent displays a meeting ID in a read-only input field with an option to copy the ID to the clipboard.
 *
 * @component
 * @param {MeetingIdComponentOptions} props - Configuration options for the MeetingIdComponent.
 * @param {string} [props.meetingID=''] - The meeting ID to display.
 * @returns {JSX.Element} The rendered MeetingIdComponent component.
 * 
 * @example
 * ```tsx
 * import React from 'react';
 * import { MeetingIdComponent } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *   return (
 *     <MeetingIdComponent meetingID="1234567890" />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const MeetingIdComponent: React.FC<MeetingIdComponentOptions> = ({ meetingID = '' }) => {
  /**
   * Copies the meeting ID to the clipboard and alerts the user.
   */
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(meetingID);
    } catch {
      // Handle error
    }
  };

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Event ID:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.disabledInput}
          value={meetingID}
          editable={false}
          selectTextOnFocus={false}
          accessibilityLabel="Event ID"
        />
        <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
          <FontAwesome5 name="copy" style={styles.copyIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MeetingIdComponent;

/**
 * Stylesheet for the MeetingIdComponent.
 */
const styles = StyleSheet.create({
  formGroup: {
    marginTop: 10,
    maxWidth: 300,
    width: '100%',
    marginBottom: 10,
  },

  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  disabledInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    backgroundColor: '#f0f0f0',
    color: 'black',
    borderRadius: 5,
    fontSize: 16,
  },

  copyButton: {
    padding: 10,
    marginLeft: 5,
  },

  copyIcon: {
    fontSize: 20,
    color: '#0F0F10FF', // Blue color for copy icon
  },
});
