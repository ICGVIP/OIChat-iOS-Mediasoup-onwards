// AdvancedPanelComponent.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
} from 'reanimated-color-picker';

export interface AdvancedPanelParameters {
  recordingVideoType: string;
  recordingDisplayType: 'video' | 'media' | 'all';
  recordingBackgroundColor: string;
  recordingNameTagsColor: string;
  recordingOrientationVideo: string;
  recordingNameTags: boolean;
  recordingAddText: boolean;
  recordingCustomText: string;
  recordingCustomTextPosition: string;
  recordingCustomTextColor: string;
  updateRecordingVideoType: (value: string) => void;
  updateRecordingDisplayType: (value: 'video' | 'media' | 'all') => void;
  updateRecordingBackgroundColor: (value: string) => void;
  updateRecordingNameTagsColor: (value: string) => void;
  updateRecordingOrientationVideo: (value: string) => void;
  updateRecordingNameTags: (value: boolean) => void;
  updateRecordingAddText: (value: boolean) => void;
  updateRecordingCustomText: (value: string) => void;
  updateRecordingCustomTextPosition: (value: string) => void;
  updateRecordingCustomTextColor: (value: string) => void;
  eventType: string;
  // [key: string]: any; // For additional properties
}

export interface AdvancedPanelOptions {
  /**
   * Parameters for configuring the advanced recording options.
   */
  parameters: AdvancedPanelParameters;
}

/**
 * AdvancedPanelComponent provides an interface for users to configure advanced recording options such as video type, display settings, background color, custom text, name tags, and video orientation.
 *
 * @component
 * @param {AdvancedPanelOptions} props - The properties object.
 * @returns {JSX.Element} The rendered AdvancedPanelComponent.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { AdvancedPanelComponent } from 'mediasfu-reactnative-expo';
 *
 * const advancedParameters = {
 *   recordingVideoType: 'fullDisplay',
 *   recordingDisplayType: 'video',
 *   recordingBackgroundColor: '#ffffff',
 *   recordingNameTagsColor: '#000000',
 *   recordingOrientationVideo: 'landscape',
 *   recordingNameTags: true,
 *   recordingAddText: false,
 *   recordingCustomText: '',
 *   recordingCustomTextPosition: 'top',
 *   recordingCustomTextColor: '#000000',
 *   updateRecordingVideoType: (value) => {  },
 *   updateRecordingDisplayType: (value) => {  },
 *   updateRecordingBackgroundColor: (value) => {  },
 *   updateRecordingNameTagsColor: (value) => {  },
 *   updateRecordingOrientationVideo: (value) => {  },
 *   updateRecordingNameTags: (value) => {  },
 *   updateRecordingAddText: (value) => {  },
 *   updateRecordingCustomText: (value) => {  },
 *   updateRecordingCustomTextPosition: (value) => {  },
 *   updateRecordingCustomTextColor: (value) => {  },
 *   eventType: 'conference',
 * };
 *
 * function App() {
 *   return <AdvancedPanelComponent parameters={advancedParameters} />;
 * }
 * 
 * export default App;
 * ```
 */

const AdvancedPanelComponent: React.FC<AdvancedPanelOptions> = ({
  parameters,
}) => {
  const {
    recordingVideoType,
    recordingDisplayType,
    recordingBackgroundColor,
    recordingNameTagsColor,
    recordingOrientationVideo,
    recordingNameTags,
    recordingAddText,
    recordingCustomText,
    recordingCustomTextPosition,
    recordingCustomTextColor,
    updateRecordingVideoType,
    updateRecordingDisplayType,
    updateRecordingBackgroundColor,
    updateRecordingNameTagsColor,
    updateRecordingOrientationVideo,
    updateRecordingNameTags,
    updateRecordingAddText,
    updateRecordingCustomText,
    updateRecordingCustomTextPosition,
    updateRecordingCustomTextColor,
    eventType,
  } = parameters;

  // State for selected orientation video
  const [selectedOrientationVideo, setSelectedOrientationVideo] =
    useState<string>(recordingOrientationVideo);

  // State for color picker modal visibility
  const [showBackgroundColorModal, setShowBackgroundColorModal] =
    useState<boolean>(false);
  const [showNameTagsColorModal, setShowNameTagsColorModal] =
    useState<boolean>(false);
  const [showCustomTextColorModal, setShowCustomTextColorModal] =
    useState<boolean>(false);

  // State for selected color type (background color or name tags color)
  const [selectedColorType, setSelectedColorType] = useState<string>('');

  // Recording text state
  const [recordingText, setRecordingText] = useState<boolean>(recordingAddText);
  const [customText, setCustomText] = useState<string>(recordingCustomText);

  /**
   * Validates the text input against the specified regex.
   *
   * @param input - The text input to validate.
   * @returns {boolean} Whether the input is valid.
   */
  const validateTextInput = (input: string): boolean => {
    const regex = /^[a-zA-Z0-9\s]{1,40}$/;
    return regex.test(input);
  };

  /**
   * Handles text input changes for custom text.
   *
   * @param text - The new text input.
   */
  const onChangeTextHandler = (text: string) => {
    if (text.length === 0 || validateTextInput(text)) {
      updateRecordingCustomText(text);
      setCustomText(text);
    }
  };

  useEffect(() => {
    setSelectedOrientationVideo(recordingOrientationVideo);
  }, [recordingOrientationVideo]);

  /**
   * Handles color selection from the color picker.
   *
   * @param {Object} param0 - The selected color object.
   * @param {string} param0.hex - The hexadecimal color code.
   */
  const onSelectColor = ({ hex }: { hex: string }) => {
    handleColorChange(hex);
  };

  /**
   * Updates the corresponding color based on the selected color type.
   *
   * @param color - The selected hexadecimal color code.
   */
  const handleColorChange = (color: string) => {
    switch (selectedColorType) {
      case 'backgroundColor':
        updateRecordingBackgroundColor(color);
        break;
      case 'customTextColor':
        updateRecordingCustomTextColor(color);
        break;
      case 'nameTagsColor':
        updateRecordingNameTagsColor(color);
        break;
      default:
        break;
    }
  };

  /**
   * Toggles the color picker modal based on the color type.
   *
   * @param colorType - The type of color being selected.
   */
  const toggleColorPicker = (colorType: string) => {
    setSelectedColorType(colorType);
    if (colorType === 'backgroundColor') {
      setShowBackgroundColorModal(true);
      setShowNameTagsColorModal(false);
      setShowCustomTextColorModal(false);
    } else if (colorType === 'customTextColor') {
      setShowCustomTextColorModal(true);
      setShowBackgroundColorModal(false);
      setShowNameTagsColorModal(false);
    } else if (colorType === 'nameTagsColor') {
      setShowNameTagsColorModal(true);
      setShowBackgroundColorModal(false);
      setShowCustomTextColorModal(false);
    }
  };

  /**
   * Handles changes to the "Add Text" option.
   *
   * @param value - The new value for the "Add Text" option.
   */
  const handleTextChange = (value: boolean) => {
    setRecordingText(value);
    updateRecordingAddText(value);
  };

  return (
    <View>
      {/* Video Type */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Video Type:</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={recordingVideoType}
          onValueChange={(value: string) => updateRecordingVideoType(value)}
          items={[
            { label: 'Full Display (no background)', value: 'fullDisplay' },
            { label: 'Full Video', value: 'bestDisplay' },
            { label: 'All', value: 'all' },
          ]}
          placeholder={{}}
          useNativeAndroidPickerStyle={false}
        />
      </View>
      <View style={styles.separator} />

      {/* Display Type */}
      {eventType !== 'broadcast' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Display Type:</Text>
          <RNPickerSelect
            style={pickerSelectStyles}
            value={recordingDisplayType}
            onValueChange={(value: 'video' | 'media' | 'all') =>
              updateRecordingDisplayType(value)
            }
            items={[
              { label: 'Only Video Participants', value: 'video' },
              {
                label: 'Only Video Participants (optimized)',
                value: 'videoOpt',
              },
              { label: 'Participants with media', value: 'media' },
              { label: 'All Participants', value: 'all' },
            ]}
            placeholder={{}}
            useNativeAndroidPickerStyle={false}
          />
        </View>
      )}
      <View style={styles.separator} />

      {/* Background Color */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Background Color:</Text>
        <Pressable
          onPress={() => toggleColorPicker('backgroundColor')}
          style={[
            styles.colorPreview,
            { backgroundColor: recordingBackgroundColor },
          ]}
        >
          <Text style={styles.colorText}>{recordingBackgroundColor}</Text>
        </Pressable>
        {/* Color Picker Modal for Background Color */}
        <Modal
          visible={showBackgroundColorModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowBackgroundColorModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Color Picker Component */}
              <ColorPicker
                style={{ width: '100%', height: '70%' }}
                value={recordingBackgroundColor}
                onComplete={onSelectColor}
              >
                <Preview />
                <Panel1 />
                <HueSlider />
                <OpacitySlider />
                <Swatches />
                <Pressable
                  onPress={() => setShowBackgroundColorModal(false)}
                  style={styles.closePickerButton}
                >
                  <Text style={styles.closePickerButtonText}>Done</Text>
                </Pressable>
              </ColorPicker>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.separator} />

      {/* Add Text */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Add Text:</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={recordingText}
          onValueChange={(value: boolean) => handleTextChange(value)}
          items={[
            { label: 'True', value: true },
            { label: 'False', value: false },
          ]}
          placeholder={{}}
          useNativeAndroidPickerStyle={false}
        />
      </View>
      <View style={styles.separator} />

      {/* Custom Text */}
      {recordingText && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Custom Text:</Text>
          <TextInput
            style={styles.input}
            value={customText}
            onChangeText={onChangeTextHandler}
            placeholder="Enter custom text"
            maxLength={40}
          />
        </View>
      )}
      {recordingText && <View style={styles.separator} />}

      {/* Custom Text Position */}
      {recordingText && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Custom Text Position:</Text>
          <RNPickerSelect
            style={pickerSelectStyles}
            value={recordingCustomTextPosition}
            onValueChange={(value: string) =>
              updateRecordingCustomTextPosition(value)
            }
            items={[
              { label: 'Top', value: 'top' },
              { label: 'Middle', value: 'middle' },
              { label: 'Bottom', value: 'bottom' },
            ]}
            placeholder={{}}
            useNativeAndroidPickerStyle={false}
          />
        </View>
      )}
      {recordingText && <View style={styles.separator} />}

      {/* Custom Text Color */}
      {recordingText && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Custom Text Color:</Text>
          <Pressable
            onPress={() => toggleColorPicker('customTextColor')}
            style={[
              styles.colorPreview,
              { backgroundColor: recordingCustomTextColor },
            ]}
          >
            <Text style={styles.colorText}>{recordingCustomTextColor}</Text>
          </Pressable>
          {/* Color Picker Modal for Custom Text Color */}
          <Modal
            visible={showCustomTextColorModal}
            animationType="slide"
            transparent
            onRequestClose={() => setShowCustomTextColorModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {/* Color Picker Component */}
                <ColorPicker
                  style={{ width: '100%', height: '70%' }}
                  value={recordingCustomTextColor}
                  onComplete={onSelectColor}
                >
                  <Preview />
                  <Panel1 />
                  <HueSlider />
                  <OpacitySlider />
                  <Swatches />
                </ColorPicker>
                <Pressable
                  onPress={() => setShowCustomTextColorModal(false)}
                  style={styles.closePickerButton}
                >
                  <Text style={styles.closePickerButtonText}>Done</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      )}
      {recordingText && <View style={styles.separator} />}

      {/* Add Name Tags */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Add Name Tags:</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={recordingNameTags}
          onValueChange={(value: boolean) => updateRecordingNameTags(value)}
          items={[
            { label: 'True', value: true },
            { label: 'False', value: false },
          ]}
          placeholder={{}}
          useNativeAndroidPickerStyle={false}
        />
      </View>
      <View style={styles.separator} />

      {/* Name Tags Color */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name Tags Color:</Text>
        <Pressable
          onPress={() => toggleColorPicker('nameTagsColor')}
          style={[
            styles.colorPreview,
            { backgroundColor: recordingNameTagsColor },
          ]}
        >
          <Text style={styles.colorText}>{recordingNameTagsColor}</Text>
        </Pressable>
        {/* Color Picker Modal for Name Tags Color */}
        <Modal
          visible={showNameTagsColorModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowNameTagsColorModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Color Picker Component */}
              <ColorPicker
                style={{ width: '100%', height: '70%' }}
                value={recordingNameTagsColor}
                onComplete={onSelectColor}
              >
                <Preview />
                <Panel1 />
                <HueSlider />
                <OpacitySlider />
                <Swatches />
              </ColorPicker>
              <Pressable
                onPress={() => setShowNameTagsColorModal(false)}
                style={styles.closePickerButton}
              >
                <Text style={styles.closePickerButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.separator} />

      {/* Orientation (Video) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Orientation (Video):</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={selectedOrientationVideo}
          onValueChange={(value: string) => {
            updateRecordingOrientationVideo(value);
            setSelectedOrientationVideo(value);
          }}
          items={[
            { label: 'Landscape', value: 'landscape' },
            { label: 'Portrait', value: 'portrait' },
            { label: 'All', value: 'all' },
          ]}
          placeholder={{}}
          useNativeAndroidPickerStyle={false}
        />
      </View>
    </View>
  );
};

export default AdvancedPanelComponent;

/**
 * Stylesheet for the AdvancedPanelComponent.
 */
const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 10,
  },
  label: {
    color: 'black',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    height: 30,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    fontSize: 16,
    marginBottom: 10,
    width: '100%',
  },
  colorPreview: {
    width: '100%',
    height: 30,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
    position: 'relative',
  },
  colorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  closePickerButton: {
    marginTop: 5,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  closePickerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderColor: 'gray',
    borderRadius: 5,
    color: 'black',
    paddingRight: 30, // To ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 5,
    color: 'black',
    paddingRight: 30, // To ensure the text is never behind the icon
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
