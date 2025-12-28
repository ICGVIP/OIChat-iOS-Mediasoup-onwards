// MeetingPasscodeComponent.tsx

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';

/**
 * Props for the MeetingPasscodeComponent.
 */
export interface MeetingPasscodeComponentOptions {
  /**
   * The meeting passcode to display. Defaults to an empty string.
   */
  meetingPasscode?: string;
}

/**
 * MeetingPasscodeComponent displays a meeting passcode in a read-only input field.
 *
 * @component
 * @param {Object} props - Properties for configuring the MeetingPasscodeComponent.
 * @param {string} props.meetingPasscode - The meeting passcode to display.
 * @returns {JSX.Element} The MeetingPasscodeComponent.
 * 
 * @example
 * ```tsx
 * import React from 'react';
 * import { MeetingPasscodeComponent } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *   return (
 *     <MeetingPasscodeComponent meetingPasscode="123456" />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const MeetingPasscodeComponent: React.FC<MeetingPasscodeComponentOptions> = ({
  meetingPasscode = '',
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>Event Passcode (Host):</Text>
    <TextInput
      style={styles.disabledInput}
      value={meetingPasscode}
      editable={false}
      selectTextOnFocus={false}
        // Optionally, you can add more accessibility props
      accessibilityLabel="Event Passcode"
    />
  </View>
);

export default MeetingPasscodeComponent;

/**
 * Stylesheet for the MeetingPasscodeComponent.
 */
const styles = StyleSheet.create({
  formGroup: {
    marginTop: 10,
    maxWidth: 300,
    width: '100%',
  },

  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },

  disabledInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginTop: 5,
    backgroundColor: '#f0f0f0',
    color: 'black',
    borderRadius: 5,
    fontSize: 16,
    width: '100%',
  },
});
