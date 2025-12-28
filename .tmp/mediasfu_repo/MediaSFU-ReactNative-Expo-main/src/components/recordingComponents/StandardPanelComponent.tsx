// StandardPanelComponent.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

export interface StandardPanelOptions {
  /**
   * Parameters for configuring the standard recording options.
   */
  parameters: StandardPanelParameters;
}

export interface StandardPanelParameters {
  recordingMediaOptions: string;
  recordingAudioOptions: string;
  recordingVideoOptions: string;
  recordingAddHLS: boolean;
  updateRecordingMediaOptions: (value: string) => void;
  updateRecordingAudioOptions: (value: string) => void;
  updateRecordingVideoOptions: (value: string) => void;
  updateRecordingAddHLS: (value: boolean) => void;
  eventType: string; // Assuming EventType is a string type
  // [key: string]: any; // For additional parameters
}

/**
 * StandardPanelComponent provides a set of standard recording options for users, including media options, specific audio and video configurations, and HLS streaming settings. The component allows users to select recording parameters based on the event type.
 *
 * @component
 * @param {StandardPanelOptions} props - The properties object containing parameters for configuring standard recording options.
 * @returns {JSX.Element} The rendered StandardPanelComponent.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { StandardPanelComponent } from 'mediasfu-reactnative-expo';
 * 
 * const standardParameters = {
 *   recordingMediaOptions: 'video',
 *   recordingAudioOptions: 'all',
 *   recordingVideoOptions: 'all',
 *   recordingAddHLS: true,
 *   updateRecordingMediaOptions: (value) => console.log('Media option updated:', value),
 *   updateRecordingAudioOptions: (value) => console.log('Audio option updated:', value),
 *   updateRecordingVideoOptions: (value) => console.log('Video option updated:', value),
 *   updateRecordingAddHLS: (value) => console.log('HLS option updated:', value),
 *   eventType: 'conference',
 * };
 *
 * function App() {
 *   return (
 *     <StandardPanelComponent parameters={standardParameters} />
 *   );
 * }
 * 
 * export default App;
 * ```
 */

const StandardPanelComponent: React.FC<StandardPanelOptions> = ({ parameters }) => {
  const {
    recordingMediaOptions,
    recordingAudioOptions,
    recordingVideoOptions,
    recordingAddHLS,
    updateRecordingMediaOptions,
    updateRecordingAudioOptions,
    updateRecordingVideoOptions,
    updateRecordingAddHLS,
    eventType,
  } = parameters;

  return (
    <View>
      {/* Media Options */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Media Options:</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={recordingMediaOptions}
          onValueChange={(value: string) => updateRecordingMediaOptions(value)}
          items={[
            { label: 'Record Video', value: 'video' },
            { label: 'Record Audio Only', value: 'audio' },
          ]}
          placeholder={{}}
          useNativeAndroidPickerStyle={false}
        />
      </View>
      <View style={styles.separator} />

      {/* Specific Audios */}
      {eventType !== 'broadcast' && (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Specific Audios:</Text>
            <RNPickerSelect
              style={pickerSelectStyles}
              value={recordingAudioOptions}
              onValueChange={(value: string) => updateRecordingAudioOptions(value)}
              items={[
                { label: 'Add All', value: 'all' },
                { label: 'Add All On Screen', value: 'onScreen' },
                { label: 'Add Host Only', value: 'host' },
              ]}
              placeholder={{}}
              useNativeAndroidPickerStyle={false}
            />
          </View>
          <View style={styles.separator} />

          {/* Specific Videos */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Specific Videos:</Text>
            <RNPickerSelect
              style={pickerSelectStyles}
              value={recordingVideoOptions}
              onValueChange={(value: string) => updateRecordingVideoOptions(value)}
              items={[
                { label: 'Add All', value: 'all' },
                { label: 'Big Screen Only (includes screenshare)', value: 'mainScreen' },
              ]}
              placeholder={{}}
              useNativeAndroidPickerStyle={false}
            />
          </View>
          <View style={styles.separator} />
        </>
      )}

      {/* Add HLS */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Add HLS:</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={recordingAddHLS}
          onValueChange={(value: boolean) => updateRecordingAddHLS(value)}
          items={[
            { label: 'True', value: true },
            { label: 'False', value: false },
          ]}
          placeholder={{}}
          useNativeAndroidPickerStyle={false}
                  />
      </View>
      <View style={styles.separator} />

      {/* Separator */}
      <View style={styles.hr} />
    </View>
  );
};

export default StandardPanelComponent;

/**
 * Stylesheet for the StandardPanelComponent.
 */
const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 10,
  },
  label: {
    color: 'black',
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 3,
  },
  hr: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 5,
  },

});

/**
 * Styles for the RNPickerSelect component.
 */
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // To ensure the text is never behind the icon
    backgroundColor: '#f0f0f0',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // To ensure the text is never behind the icon
    backgroundColor: '#f0f0f0',
  },
  inputWeb: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // To ensure the text is never behind the icon
    backgroundColor: 'white',
    marginBottom: 10,
  },
});
