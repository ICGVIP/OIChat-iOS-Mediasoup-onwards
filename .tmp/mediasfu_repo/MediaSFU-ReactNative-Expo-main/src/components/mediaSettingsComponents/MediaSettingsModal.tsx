// MediaSettingsModal.tsx

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; 
import RNPickerSelect from 'react-native-picker-select'; // Install using: npm install react-native-picker-select
import { switchAudio, SwitchAudioOptions, SwitchAudioParameters } from '../../methods/streamMethods/switchAudio';
import { switchVideo, SwitchVideoOptions, SwitchVideoParameters } from '../../methods/streamMethods/switchVideo';
import { switchVideoAlt, SwitchVideoAltOptions, SwitchVideoAltParameters } from '../../methods/streamMethods/switchVideoAlt';
import { getModalPosition } from '../../methods/utils/getModalPosition';

/**
 * Parameters for media settings state and device management.
 * 
 * @interface MediaSettingsModalParameters
 * @extends SwitchAudioParameters, SwitchVideoParameters, SwitchVideoAltParameters
 * 
 * **Default Devices:**
 * @property {string} userDefaultVideoInputDevice - Currently selected video input device ID
 * @property {string} userDefaultAudioInputDevice - Currently selected audio input device ID
 * 
 * **Available Devices:**
 * @property {MediaDeviceInfo[]} videoInputs - List of available video input devices (cameras)
 * @property {MediaDeviceInfo[]} audioInputs - List of available audio input devices (microphones)
 * 
 * **Background Modal:**
 * @property {boolean} isBackgroundModalVisible - Whether background effects modal is visible
 * @property {function} updateIsBackgroundModalVisible - Callback to update background modal visibility
 * 
 * **Utility:**
 * @property {function} getUpdatedAllParams - Function to retrieve current parameter state
 */
export interface MediaSettingsModalParameters extends SwitchAudioParameters, SwitchVideoParameters, SwitchVideoAltParameters {
  userDefaultVideoInputDevice: string;
  videoInputs: MediaDeviceInfo[];
  audioInputs: MediaDeviceInfo[];
  userDefaultAudioInputDevice: string;
  isBackgroundModalVisible: boolean;
  updateIsBackgroundModalVisible: (visible: boolean) => void;
  getUpdatedAllParams: () => MediaSettingsModalParameters;
}

/**
 * Configuration options for the MediaSettingsModal component.
 * 
 * @interface MediaSettingsModalOptions
 * 
 * **Modal Control:**
 * @property {boolean} isMediaSettingsModalVisible - Whether the modal is currently visible
 * @property {function} onMediaSettingsClose - Callback to close the modal
 * 
 * **Device Switch Handlers:**
 * @property {function} [switchCameraOnPress=switchVideoAlt] - Handler for camera switching (front/back on mobile)
 * @property {function} [switchVideoOnPress=switchVideo] - Handler for video input device switching
 * @property {function} [switchAudioOnPress=switchAudio] - Handler for audio input device switching
 * 
 * **State Parameters:**
 * @property {MediaSettingsModalParameters} parameters - Current device state and available devices
 * 
 * **Customization:**
 * @property {'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'} [position='topRight'] - Modal screen position
 * @property {string} [backgroundColor='#83c0e9'] - Modal background color
 * @property {object} [style] - Additional custom styles
 * 
 * **Advanced Render Overrides:**
 * @property {function} [renderContent] - Custom content renderer (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Custom container renderer (receives defaultContainer and dimensions)
 */
export interface MediaSettingsModalOptions {
  isMediaSettingsModalVisible: boolean;
  onMediaSettingsClose: () => void;
  switchCameraOnPress?: (options: SwitchVideoAltOptions) => Promise<void>;
  switchVideoOnPress?: (options: SwitchVideoOptions) => Promise<void>;
  switchAudioOnPress?: (options: SwitchAudioOptions) => Promise<void>;
  parameters: MediaSettingsModalParameters;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  backgroundColor?: string;
  style?: object;
  renderContent?: (options: {
    defaultContent: JSX.Element;
    dimensions: { width: number; height: number };
  }) => JSX.Element;
  renderContainer?: (options: {
    defaultContainer: JSX.Element;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;
}

export type MediaSettingsModalType = (
  options: MediaSettingsModalOptions
) => JSX.Element;

/**
 * MediaSettingsModal - Audio/Video device selection interface
 * 
 * MediaSettingsModal is a React Native component that provides an interface for
 * participants to select their preferred audio and video input devices. It supports
 * camera switching (front/back on mobile), microphone selection, and background
 * effects integration.
 * 
 * **Key Features:**
 * - Audio input device selection (microphone)
 * - Video input device selection (camera)
 * - Camera switch button (front/back on mobile)
 * - Background effects modal integration
 * - Real-time device switching
 * - Available device enumeration
 * - Position-configurable modal (4 corners)
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.mediaSettingsModal` to
 * provide a completely custom media settings interface.
 * 
 * @component
 * @param {MediaSettingsModalOptions} props - Configuration options for media settings
 * 
 * @returns {JSX.Element} Rendered media settings modal
 * 
 * @example
 * // Basic usage - Device selection
 * import React, { useState } from 'react';
 * import { MediaSettingsModal } from 'mediasfu-reactnative-expo';
 * 
 * function MediaControls() {
 *   const [isModalVisible, setModalVisible] = useState(false);
 *   const [selectedCamera, setSelectedCamera] = useState('camera1');
 *   const [selectedMic, setSelectedMic] = useState('mic1');
 * 
 *   const videoDevices = [
 *     { deviceId: 'camera1', label: 'Front Camera', kind: 'videoinput' },
 *     { deviceId: 'camera2', label: 'Back Camera', kind: 'videoinput' },
 *   ];
 * 
 *   const audioDevices = [
 *     { deviceId: 'mic1', label: 'Built-in Microphone', kind: 'audioinput' },
 *     { deviceId: 'mic2', label: 'Bluetooth Headset', kind: 'audioinput' },
 *   ];
 * 
 *   return (
 *     <>
 *       <Button title="Media Settings" onPress={() => setModalVisible(true)} />
 *       <MediaSettingsModal
 *         isMediaSettingsModalVisible={isModalVisible}
 *         onMediaSettingsClose={() => setModalVisible(false)}
 *         parameters={{
 *           userDefaultVideoInputDevice: selectedCamera,
 *           userDefaultAudioInputDevice: selectedMic,
 *           videoInputs: videoDevices,
 *           audioInputs: audioDevices,
 *           isBackgroundModalVisible: false,
 *           updateIsBackgroundModalVisible: (visible) => console.log('Background modal:', visible),
 *           getUpdatedAllParams: () => ({
 *             userDefaultVideoInputDevice: selectedCamera,
 *             userDefaultAudioInputDevice: selectedMic,
 *             videoInputs: videoDevices,
 *             audioInputs: audioDevices,
 *           }),
 *         }}
 *       />
 *     );
 *   };
 *   ```
 * 
 * @example
 * ```tsx
 * // With position and background effects modal
 * const handleSwitchCamera = async (options: SwitchVideoAltOptions) => {
 *   await switchVideoAlt(options);
 *   console.log('Camera switched');
 * };
 * 
 * return (
 *   <MediaSettingsModal
 *     isMediaSettingsModalVisible={showSettings}
 *     onMediaSettingsClose={() => setShowSettings(false)}
 *     switchCameraOnPress={handleSwitchCamera}
 *     parameters={mediaParameters}
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
 *     mediaSettingsModal: {
 *       component: MyCustomMediaSettings,
 *       injectedProps: {
 *         theme: 'dark',
 *         showAdvancedOptions: true,
 *       },
 *     },
 *   },
 * };
 * 
 * return <MyMediaComponent config={config} />;
 * ```
 */
const MediaSettingsModal: React.FC<MediaSettingsModalOptions> = ({
  isMediaSettingsModalVisible,
  onMediaSettingsClose,
  switchCameraOnPress = switchVideoAlt,
  switchVideoOnPress = switchVideo,
  switchAudioOnPress = switchAudio,
  parameters,
  position = 'topRight',
  backgroundColor = '#83c0e9',
  style,
  renderContent,
  renderContainer,
}) => {
  const {
    userDefaultVideoInputDevice,
    videoInputs,
    audioInputs,
    userDefaultAudioInputDevice,
    // isBackgroundModalVisible,
    // updateIsBackgroundModalVisible,
  } = parameters;


  const [selectedVideoInput, setSelectedVideoInput] = useState<string>(userDefaultVideoInputDevice);
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>(userDefaultAudioInputDevice);

  const [modalWidth, setModalWidth] = useState<number>(0.8 * Dimensions.get('window').width);

  useEffect(() => {
    const updateDimensions = () => {
      let width = 0.8 * Dimensions.get('window').width;
      if (width > 400) {
        width = 400;
      }
      setModalWidth(width);
    };

    const subscribe = Dimensions.addEventListener('change', updateDimensions);
    // Initial call
    updateDimensions();

    return () => {
      subscribe.remove();
    };
  }, []);

  /**
   * Handles switching the camera.
   */
  const handleSwitchCamera = async () => {
    try {
      await switchCameraOnPress({ parameters });
    } catch (error) {
      console.error('Failed to switch camera:', error);
      // Optionally, implement alert or toast
    }
  };

  /**
   * Handles switching the video input device.
   * @param {string} value - The device ID of the selected video input.
   */
  const handleVideoSwitch = async (value: string) => {
    if (value !== selectedVideoInput) {
      setSelectedVideoInput(value);
      try {
        await switchVideoOnPress({ videoPreference: value, parameters });
      } catch (error) {
        console.error('Failed to switch video input:', error);
        // Optionally, implement alert or toast
      }
    }
  };

  /**
   * Handles switching the audio input device.
   * @param {string} value - The device ID of the selected audio input.
   */
  const handleAudioSwitch = async (value: string) => {
    if (value !== selectedAudioInput) {
      setSelectedAudioInput(value);
      try {
        await switchAudioOnPress({ audioPreference: value, parameters });
      } catch (error) {
        console.error('Failed to switch audio input:', error);
        // Optionally, implement alert or toast
      }
    }
  };

  /**
   * Toggles the virtual background modal visibility.
   */
  // const toggleVirtualBackground = () => {
  //   updateIsBackgroundModalVisible(!isBackgroundModalVisible);
  // };

  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <>
      {/* Header */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Media Settings</Text>
        <Pressable
          onPress={onMediaSettingsClose}
          style={styles.btnCloseMediaSettings}
          accessibilityRole="button"
          accessibilityLabel="Close Media Settings Modal"
        >
          <FontAwesome5 name="times" style={styles.icon} />
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.hr} />

      {/* Body */}
      <View style={styles.modalBody}>
        {/* Select Camera */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            <FontAwesome5 name="camera" size={16} color="black" />
            Select Camera:
          </Text>
          <RNPickerSelect
            onValueChange={(value: string) => handleVideoSwitch(value)}
            items={videoInputs.map((input) => ({
              label: input.label || `Camera ${input.deviceId}`,
              value: input.deviceId,
            }))}
            value={selectedVideoInput || ''}
            style={pickerSelectStyles}
            placeholder={{ label: 'Select a camera...', value: '' }}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        {/* Separator */}
        <View style={styles.sep} />

        {/* Select Microphone */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            <FontAwesome5 name="microphone" size={16} color="black" />
            Select Microphone:
          </Text>
          <RNPickerSelect
            onValueChange={(value: string) => handleAudioSwitch(value)}
            items={audioInputs.map((input) => ({
              label: input.label || `Microphone ${input.deviceId}`,
              value: input.deviceId,
            }))}
            value={selectedAudioInput || ''}
            style={pickerSelectStyles}
            placeholder={{ label: 'Select a microphone...', value: '' }}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        {/* Separator */}
        <View style={styles.sep} />

        {/* Switch Camera Button */}
        <View style={styles.formGroup}>
          <Pressable
            onPress={handleSwitchCamera}
            style={styles.switchCameraButton}
            accessibilityRole="button"
            accessibilityLabel="Switch Camera"
          >
            <Text style={styles.switchCameraButtonText}>
              <FontAwesome5 name="sync-alt" size={16} color="black" />
              Switch Camera
            </Text>
          </Pressable>
        </View>

        {/* Separator */}
        {/* <View style={styles.sep} /> */}

        {/* Virtual Background Button  - Not implemented */}
        {/* <View style={styles.formGroup}>
          <Pressable
            onPress={toggleVirtualBackground}
            style={styles.virtualBackgroundButton}
            accessibilityRole="button"
            accessibilityLabel="Toggle Virtual Background"
          >
            <Text style={styles.virtualBackgroundButtonText}>
              <FontAwesome5 name="photo-video" size={16} color="black" />
              {' '}
              Virtual Background
            </Text>
          </Pressable>
        </View> */}
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
      visible={isMediaSettingsModalVisible}
      onRequestClose={onMediaSettingsClose}
    >
      <View style={[styles.modalContainer, getModalPosition({ position })]}>
        <View style={[styles.modalContent, { backgroundColor, width: modalWidth }, style]}>
          {content}
        </View>
      </View>
    </Modal>
  );

  return renderContainer
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default MediaSettingsModal;

/**
 * Stylesheet for the MediaSettingsModal component.
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    height: '65%',
    backgroundColor: '#83c0e9',
    borderRadius: 10,
    padding: 10,
    maxHeight: '65%',
    maxWidth: '80%',
    overflow: 'scroll',
    borderWidth: 2,
    borderColor: 'black',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 9,
    zIndex: 9,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },

  btnCloseMediaSettings: {
    padding: 5,
  },

  icon: {
    fontSize: 20,
    color: 'black',
  },

  hr: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginVertical: 15,
  },

  modalBody: {
    padding: 10,
  },

  formGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
    fontWeight: 'bold',
  },

  picker: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
  },

  switchCameraButton: {
    backgroundColor: '#8cd3ff',
    paddingHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },

  switchCameraButtonText: {
    color: 'black',
    fontSize: 20,
  },

  virtualBackgroundButton: {
    backgroundColor: '#8cd3ff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },

  virtualBackgroundButtonText: {
    color: 'black',
    fontSize: 16,
  },

  sep: {
    height: 1,
    backgroundColor: '#ffffff',
    marginVertical: 5,
  },
});

/**
 * Stylesheet for the RNPickerSelect component.
 */
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // To ensure the text is never behind the icon
    backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // To ensure the text is never behind the icon
    backgroundColor: 'white',
    marginVertical: 5,
  },
  inputWeb: {
    fontSize: 14,
    paddingHorizontal: 5,
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
