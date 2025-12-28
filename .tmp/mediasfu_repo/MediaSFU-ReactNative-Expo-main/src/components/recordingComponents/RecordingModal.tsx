// RecordingModal.tsx

import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Text,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import StandardPanelComponent from './StandardPanelComponent';
import AdvancedPanelComponent from './AdvancedPanelComponent';
import { getModalPosition } from '../../methods/utils/getModalPosition';
import {
  EventType,
  ConfirmRecordingType,
  StartRecordingType,
  ConfirmRecordingParameters,
  StartRecordingParameters,
} from '../../@types/types';

/**
 * Interface defining the parameters for the RecordingModal component.
 * Extends ConfirmRecordingParameters and StartRecordingParameters for full recording functionality.
 * 
 * @interface RecordingModalParameters
 * 
 * **Recording State:**
 * @property {boolean} recordPaused - Whether recording is currently paused
 * @property {EventType} eventType - Type of event being recorded
 * 
 * **Video Settings:**
 * @property {string} recordingVideoType - Video capture type ('fullDisplay', 'mainScreen', etc.)
 * @property {'video' | 'media' | 'all'} recordingDisplayType - What to display in recording
 * @property {string} recordingOrientationVideo - Video orientation ('landscape', 'portrait')
 * @property {string} recordingVideoOptions - Video quality/codec options
 * 
 * **Visual Customization:**
 * @property {string} recordingBackgroundColor - Background color for recording canvas
 * @property {string} recordingNameTagsColor - Color for participant name tags
 * @property {boolean} recordingNameTags - Whether to show participant name tags
 * @property {boolean} recordingAddText - Whether to add custom text overlay
 * @property {string} recordingCustomText - Custom text to overlay on recording
 * @property {string} recordingCustomTextPosition - Position of custom text ('top', 'bottom', etc.)
 * @property {string} recordingCustomTextColor - Color of custom text
 * 
 * **Media Options:**
 * @property {string} recordingMediaOptions - General media recording options
 * @property {string} recordingAudioOptions - Audio encoding/quality options
 * @property {boolean} recordingAddHLS - Whether to enable HLS streaming
 * 
 * **State Update Functions:**
 * @property {(value: string) => void} updateRecordingVideoType - Update video type setting
 * @property {(value: 'video' | 'media' | 'all') => void} updateRecordingDisplayType - Update display type
 * @property {(value: string) => void} updateRecordingBackgroundColor - Update background color
 * @property {(value: string) => void} updateRecordingNameTagsColor - Update name tags color
 * @property {(value: string) => void} updateRecordingOrientationVideo - Update video orientation
 * @property {(value: boolean) => void} updateRecordingNameTags - Toggle name tags
 * @property {(value: boolean) => void} updateRecordingAddText - Toggle custom text
 * @property {(value: string) => void} updateRecordingCustomText - Update custom text content
 * @property {(value: string) => void} updateRecordingCustomTextPosition - Update text position
 * @property {(value: string) => void} updateRecordingCustomTextColor - Update text color
 * @property {(value: string) => void} updateRecordingMediaOptions - Update media options
 * @property {(value: string) => void} updateRecordingAudioOptions - Update audio options
 * @property {(value: string) => void} updateRecordingVideoOptions - Update video options
 * @property {(value: boolean) => void} updateRecordingAddHLS - Toggle HLS streaming
 * 
 * **Utility:**
 * @property {() => RecordingModalParameters} getUpdatedAllParams - Get latest parameter state
 */
export interface RecordingModalParameters
  extends ConfirmRecordingParameters,
    StartRecordingParameters {
  recordPaused: boolean;
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
  recordingMediaOptions: string;
  recordingAudioOptions: string;
  recordingVideoOptions: string;
  recordingAddHLS: boolean;
  eventType: EventType;
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
  updateRecordingMediaOptions: (value: string) => void;
  updateRecordingAudioOptions: (value: string) => void;
  updateRecordingVideoOptions: (value: string) => void;
  updateRecordingAddHLS: (value: boolean) => void;

  // mediasfu functions
  getUpdatedAllParams: () => RecordingModalParameters;
  [key: string]: any;
}

/**
 * Interface defining the options for the RecordingModal component.
 * 
 * @interface RecordingModalOptions
 * 
 * **Display Control:**
 * @property {boolean} isRecordingModalVisible - Whether the modal is currently visible
 * @property {() => void} onClose - Callback when modal is closed
 * @property {string} [backgroundColor="#83c0e9"] - Background color of the modal content
 * @property {"topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center"} [position="bottomRight"]
 *   Screen position where the modal should appear
 * 
 * **Recording Actions:**
 * @property {ConfirmRecordingType} confirmRecording - Function to confirm and apply recording settings
 * @property {StartRecordingType} startRecording - Function to start the recording with configured settings
 * 
 * **Configuration:**
 * @property {RecordingModalParameters} parameters - Recording configuration parameters and state
 * 
 * **Advanced Render Overrides:**
 * @property {object} [style] - Custom styles for modal container
 * @property {(options: { defaultContent: JSX.Element; dimensions: { width: number; height: number }}) => JSX.Element} [renderContent]
 *   Function to wrap or replace the default modal content
 * @property {(options: { defaultContainer: JSX.Element; dimensions: { width: number; height: number }}) => React.ReactNode} [renderContainer]
 *   Function to wrap or replace the entire modal container
 */
export interface RecordingModalOptions {
  /**
   * Flag to control the visibility of the modal.
   */
  isRecordingModalVisible: boolean;

  /**
   * Callback function to handle the closing of the modal.
   */
  onClose: () => void;

  /**
   * Background color of the modal content.
   * Defaults to '#83c0e9'.
   */
  backgroundColor?: string;

  /**
   * Position of the modal on the screen.
   * Possible values: 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'center'.
   * Defaults to 'bottomRight'.
   */
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';

  /**
   * Function to confirm recording settings.
   */
  confirmRecording: ConfirmRecordingType;

  /**
   * Function to start the recording.
   */
  startRecording: StartRecordingType;

  /**
   * Parameters for configuring the recording.
   */
  parameters: RecordingModalParameters;

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

export type RecordingModalType = (options: RecordingModalOptions) => JSX.Element;

/**
 * RecordingModal - Comprehensive recording settings with standard and advanced options
 * 
 * RecordingModal is a feature-rich React Native modal for configuring and managing
 * session recordings. It provides both standard (quick start) and advanced (detailed)
 * panels for customizing video layout, background, text overlays, media options, and more.
 * 
 * **Key Features:**
 * - Tabbed interface (Standard / Advanced settings)
 * - Video type selection (fullDisplay, mainScreen, custom layouts)
 * - Display type options (video, media, all)
 * - Background color customization
 * - Participant name tags with color options
 * - Custom text overlays with positioning
 * - Video orientation control
 * - Media/audio/video encoding options
 * - HLS streaming enablement
 * - Real-time preview of settings
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.recordingModalComponent` to
 * provide a completely custom recording modal implementation.
 * 
 * @component
 * @param {RecordingModalOptions} props - Configuration options for the RecordingModal component
 * 
 * @returns {JSX.Element} Rendered recording modal with configuration panels
 * 
 * @example
 * // Basic usage - Display recording modal with default settings
 * import React, { useState } from 'react';
 * import { RecordingModal, confirmRecording, startRecording } from 'mediasfu-reactnative-expo';
 * 
 * function RecordingControls() {
 *   const [showModal, setShowModal] = useState(false);
 *   const [recordingParams, setRecordingParams] = useState({
 *     recordPaused: false,
 *     recordingVideoType: 'fullDisplay',
 *     recordingDisplayType: 'video' as const,
 *     recordingBackgroundColor: '#ffffff',
 *     recordingNameTagsColor: '#000000',
 *     recordingOrientationVideo: 'landscape',
 *     recordingNameTags: true,
 *     recordingAddText: false,
 *     recordingCustomText: '',
 *     recordingCustomTextPosition: 'top',
 *     recordingCustomTextColor: '#000000',
 *     recordingMediaOptions: 'default',
 *     recordingAudioOptions: 'default',
 *     recordingVideoOptions: 'default',
 *     recordingAddHLS: false,
 *     eventType: 'conference' as const,
 *     updateRecordingVideoType: (value: string) => setRecordingParams({...recordingParams, recordingVideoType: value}),
 *     updateRecordingDisplayType: (value: 'video' | 'media' | 'all') => setRecordingParams({...recordingParams, recordingDisplayType: value}),
 *     // ... other update functions
 *     getUpdatedAllParams: () => recordingParams,
 *   });
 * 
 *   return (
 *     <>
 *       <Button title="Recording Settings" onPress={() => setShowModal(true)} />
 *       <RecordingModal
 *         isRecordingModalVisible={showModal}
 *         onClose={() => setShowModal(false)}
 *         confirmRecording={confirmRecording}
 *         startRecording={startRecording}
 *         parameters={recordingParams}
 *       />
 *     </>
 *   );
 * }
 * 
 * @example
 * // With custom styling and positioning
 * <RecordingModal
 *   isRecordingModalVisible={showRecordingModal}
 *   onClose={() => setShowRecordingModal(false)}
 *   backgroundColor="#1a1a2e"
 *   position="center"
 *   confirmRecording={async (options) => {
 *     console.log('Confirming recording settings');
 *     await confirmRecording(options);
 *   }}
 *   startRecording={async (options) => {
 *     console.log('Starting recording with settings:', options.parameters);
 *     await startRecording(options);
 *   }}
 *   parameters={{
 *     ...recordingParams,
 *     recordingBackgroundColor: '#0f3460',
 *     recordingNameTagsColor: '#e94560',
 *     recordingAddText: true,
 *     recordingCustomText: 'Company Webinar',
 *     recordingAddHLS: true,
 *   }}
 * />
 * 
 * @example
 * // Using uiOverrides for complete modal replacement
 * import { MyCustomRecordingModal } from './MyCustomRecordingModal';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     recordingModalComponent: {
 *       component: MyCustomRecordingModal,
 *       injectedProps: {
 *         theme: 'professional',
 *         presets: ['meeting', 'webinar', 'presentation'],
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomRecordingModal.tsx
 * export const MyCustomRecordingModal = (props: RecordingModalOptions & { theme: string; presets: string[] }) => {
 *   return (
 *     <Modal visible={props.isRecordingModalVisible} onRequestClose={props.onClose}>
 *       <View style={{ backgroundColor: props.theme === 'professional' ? '#2c3e50' : '#fff' }}>
 *         <Text>Recording Settings</Text>
 *         {props.presets.map(preset => (
 *           <Button key={preset} title={preset} onPress={() => applyPreset(preset)} />
 *         ))}
 *         <Button title="Start" onPress={() => props.startRecording({ parameters: props.parameters })} />
 *       </View>
 *     </Modal>
 *   );
 * };
 *   );
 * }
 * 
 * export default App;
 * ```
 */

const RecordingModal: React.FC<RecordingModalOptions> = ({
  isRecordingModalVisible,
  onClose,
  backgroundColor = '#83c0e9',
  position = 'bottomRight',
  confirmRecording,
  startRecording,
  parameters,
  style,
  renderContent,
  renderContainer,
}) => {
  const { recordPaused } = parameters;

  const screenWidth = Dimensions.get('window').width;
  let modalWidth = 0.75 * screenWidth;
  if (modalWidth > 400) {
    modalWidth = 400;
  }

  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <>
      {/* Header */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          <FontAwesome name="bars" size={24} color="black" />
          {' Recording Settings'}
        </Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <FontAwesome name="times" size={24} color="black" />
        </Pressable>
      </View>

      <View style={styles.separator} />

      {/* Modal Body */}
      <View style={styles.modalBody}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.listGroup}>
            <StandardPanelComponent parameters={parameters} />
            <AdvancedPanelComponent parameters={parameters} />
          </View>
        </ScrollView>
      </View>

      <View style={styles.separator} />

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.confirmButton]}
          onPress={() => confirmRecording({ parameters })}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </Pressable>
        {!recordPaused && (
          <Pressable
            style={[styles.button, styles.startButton]}
            onPress={() => startRecording({ parameters })}
          >
            <Text style={styles.buttonText}>
              Start <FontAwesome name="play" size={16} color="black" />
            </Text>
          </Pressable>
        )}
      </View>
    </>
  );

  const content = renderContent
    ? renderContent({ defaultContent, dimensions })
    : defaultContent;

  const defaultContainer = (
    <Modal
      transparent
      animationType="slide"
      visible={isRecordingModalVisible}
      onRequestClose={onClose}
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

export default RecordingModal;

/**
 * Stylesheet for the RecordingModal component.
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 9,
    elevation: 9,
  },
  modalContent: {
    height: '75%',
    backgroundColor: '#ffffff', // Default background color
    borderRadius: 10,
    padding: 15,
    maxHeight: '80%',
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 9,
    zIndex: 9,
  },
  scrollView: {
    flex: 1,
    maxHeight: '100%',
    maxWidth: '100%',

  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#000000',
    marginVertical: 10,
  },
  modalBody: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  startButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'black',
    fontSize: 14,
  },
  listGroup: {
    margin: 0,
    padding: 0,
  },
});
