// EventSettingsModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import RNPickerSelect from 'react-native-picker-select'; // Install using: npm install react-native-picker-select
import { Socket } from 'socket.io-client';
import { ShowAlert } from '../../@types/types';
import { modifySettings, ModifySettingsOptions } from '../../methods/settingsMethods/modifySettings';
import { getModalPosition } from '../../methods/utils/getModalPosition';

/**
 * Parameters for event settings state management.
 * 
 * @interface EventSettingsModalParameters
 * 
 * **Display Settings:**
 * @property {string} meetingDisplayType - Current display type for meeting layout
 * @property {boolean} autoWave - Whether auto-wave feature is enabled
 * @property {boolean} forceFullDisplay - Whether to force full display mode
 * @property {boolean} meetingVideoOptimized - Whether video optimization is enabled
 * 
 * **Session Context:**
 * @property {string} roomName - Name of the meeting room
 * @property {Socket} socket - Socket.io connection for real-time updates
 * @property {ShowAlert} [showAlert] - Optional alert display function
 */
export interface EventSettingsModalParameters {
  meetingDisplayType: string;
  autoWave: boolean;
  forceFullDisplay: boolean;
  meetingVideoOptimized: boolean;
  roomName: string;
  socket: Socket;
  showAlert?: ShowAlert;
}

/**
 * Configuration options for the EventSettingsModal component.
 * 
 * @interface EventSettingsModalOptions
 * 
 * **Modal Control:**
 * @property {boolean} isEventSettingsModalVisible - Whether the modal is currently visible
 * @property {function} onEventSettingsClose - Callback to close the modal
 * @property {function} updateIsSettingsModalVisible - Callback to update modal visibility state
 * 
 * **Permission Settings (Current State):**
 * @property {string} audioSetting - Current audio permission ("allow" | "approval" | "disallow")
 * @property {string} videoSetting - Current video permission ("allow" | "approval" | "disallow")
 * @property {string} screenshareSetting - Current screenshare permission ("allow" | "approval" | "disallow")
 * @property {string} chatSetting - Current chat permission ("allow" | "disallow")
 * 
 * **State Update Callbacks:**
 * @property {function} updateAudioSetting - Callback to update audio permission setting
 * @property {function} updateVideoSetting - Callback to update video permission setting
 * @property {function} updateScreenshareSetting - Callback to update screenshare permission setting
 * @property {function} updateChatSetting - Callback to update chat permission setting
 * 
 * **Session Context:**
 * @property {string} roomName - Meeting room name for settings updates
 * @property {Socket} socket - Socket connection for broadcasting changes
 * @property {ShowAlert} [showAlert] - Optional alert function for user feedback
 * 
 * **Customization:**
 * @property {function} [onModifyEventSettings=modifySettings] - Custom handler for settings modifications
 * @property {'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'} [position='topRight'] - Modal screen position
 * @property {string} [backgroundColor='#83c0e9'] - Modal background color
 * 
 * **Advanced Render Overrides:**
 * @property {object} [style] - Additional custom styles
 * @property {function} [renderContent] - Custom content renderer (receives defaultContent and dimensions)
 * @property {function} [renderContainer] - Custom container renderer (receives defaultContainer and dimensions)
 */
export interface EventSettingsModalOptions {
  isEventSettingsModalVisible: boolean;
  onEventSettingsClose: () => void;
  onModifyEventSettings?: (options: ModifySettingsOptions) => Promise<void>;
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  backgroundColor?: string;
  audioSetting: string;
  videoSetting: string;
  screenshareSetting: string;
  chatSetting: string;
  updateAudioSetting: (setting: string) => void;
  updateVideoSetting: (setting: string) => void;
  updateScreenshareSetting: (setting: string) => void;
  updateChatSetting: (setting: string) => void;
  updateIsSettingsModalVisible: (isVisible: boolean) => void;
  roomName: string;
  socket: Socket;
  showAlert?: ShowAlert;
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

export type EventSettingsModalType = (options: EventSettingsModalOptions) => JSX.Element;

/**
 * EventSettingsModal - Host controls for participant permissions
 * 
 * EventSettingsModal is a React Native component that provides host-level controls
 * for managing participant permissions across audio, video, screenshare, and chat.
 * Settings can be configured to allow, require approval, or disallow participant actions.
 * 
 * **Key Features:**
 * - Granular permission controls (audio, video, screenshare, chat)
 * - Three permission levels: allow, approval-required, disallow
 * - Real-time permission broadcasting to all participants
 * - Position-configurable modal (4 corners)
 * - Immediate settings application
 * - Socket.io-based synchronization
 * 
 * **Permission Options:**
 * - **Allow**: Participants can use feature freely
 * - **Approval**: Participants must request permission
 * - **Disallow**: Feature is disabled for participants
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.eventSettingsModal` to
 * provide a completely custom event settings interface.
 * 
 * @component
 * @param {EventSettingsModalOptions} props - Configuration options for event settings
 * 
 * @returns {JSX.Element} Rendered event settings modal
 * 
 * @example
 * // Basic usage - Host permission controls
 * import React, { useState } from 'react';
 * import { EventSettingsModal } from 'mediasfu-reactnative-expo';
 * import { io } from 'socket.io-client';
 * 
 * function HostControls() {
 *   const [isModalVisible, setModalVisible] = useState(false);
 *   const [audioSetting, setAudioSetting] = useState('allow');
 *   const [videoSetting, setVideoSetting] = useState('allow');
 *   const [screenshareSetting, setScreenshareSetting] = useState('approval');
 *   const [chatSetting, setChatSetting] = useState('allow');
 *   
 *   const socket = io('https://mediasfu.com');
 * 
 *   return (
 *     <>
 *       <Button title="Event Settings" onPress={() => setModalVisible(true)} />
 *       <EventSettingsModal
 *         isEventSettingsModalVisible={isModalVisible}
 *         onEventSettingsClose={() => setModalVisible(false)}
 *         audioSetting={audioSetting}
 *         videoSetting={videoSetting}
 *         screenshareSetting={screenshareSetting}
 *         chatSetting={chatSetting}
 *         updateAudioSetting={setAudioSetting}
 *         updateVideoSetting={setVideoSetting}
 *         updateScreenshareSetting={setScreenshareSetting}
 *         updateChatSetting={setChatSetting}
 *         updateIsSettingsModalVisible={setModalVisible}
 *         roomName="meeting-room-123"
 *         socket={socket}
 *         showAlert={(alert) => console.log(alert.message)}
 *       />
 *     </>
 *   );
 * }
 * 
 * @example
 * // Positioned at bottom-left with custom colors
 * <EventSettingsModal
 *   isEventSettingsModalVisible={true}
 *   onEventSettingsClose={closeModal}
 *   position="bottomLeft"
 *   backgroundColor="#2c2c2c"
 *   audioSetting="allow"
 *   videoSetting="approval"
 *   screenshareSetting="disallow"
 *   chatSetting="allow"
 *   updateAudioSetting={setAudioSetting}
 *   updateVideoSetting={setVideoSetting}
 *   updateScreenshareSetting={setScreenshareSetting}
 *   updateChatSetting={setChatSetting}
 *   updateIsSettingsModalVisible={setModalVisible}
 *   roomName={roomName}
 *   socket={socket}
 * />
 * 
 * @example
 * // Using uiOverrides for complete settings modal replacement
 * import { MyCustomEventSettings } from './MyCustomEventSettings';
 * 
 * const sessionConfig = {
 *   credentials: { apiKey: 'your-api-key' },
 *   uiOverrides: {
 *     eventSettingsModal: {
 *       component: MyCustomEventSettings,
 *       injectedProps: {
 *         showAdvancedOptions: true,
 *       },
 *     },
 *   },
 * };
 * 
 * // MyCustomEventSettings.tsx
 * export const MyCustomEventSettings = (props: EventSettingsModalOptions & { showAdvancedOptions: boolean }) => {
 *   const handleSave = async () => {
 *     await props.onModifyEventSettings?.({
 *       parameters: {
 *         audioSet: props.audioSetting,
 *         videoSet: props.videoSetting,
 *         screenshareSet: props.screenshareSetting,
 *         chatSet: props.chatSetting,
 *         ...props,
 *       },
 *     });
 *     props.onEventSettingsClose();
 *   };
 * 
 *   return (
 *     <Modal visible={props.isEventSettingsModalVisible}>
 *       <View style={{ padding: 20 }}>
 *         <Text>Audio Permission:</Text>
 *         <Picker
 *           selectedValue={props.audioSetting}
 *           onValueChange={props.updateAudioSetting}
 *         >
 *           <Picker.Item label="Allow" value="allow" />
 *           <Picker.Item label="Approval Required" value="approval" />
 *           <Picker.Item label="Disallow" value="disallow" />
 *         </Picker>
 *         {props.showAdvancedOptions && <AdvancedPermissionOptions />}
 *         <Button title="Save Settings" onPress={handleSave} />
 *       </View>
 *     </Modal>
 *   );
 * };
 */

const EventSettingsModal: React.FC<EventSettingsModalOptions> = ({
  isEventSettingsModalVisible,
  onEventSettingsClose,
  onModifyEventSettings = modifySettings,
  audioSetting,
  videoSetting,
  screenshareSetting,
  chatSetting,
  position = 'topRight',
  backgroundColor = '#83c0e9',
  updateAudioSetting,
  updateVideoSetting,
  updateScreenshareSetting,
  updateChatSetting,
  updateIsSettingsModalVisible,
  roomName,
  socket,
  showAlert,
  style,
  renderContent,
  renderContainer,
}) => {
  const [audioState, setAudioState] = useState<string>(audioSetting);
  const [videoState, setVideoState] = useState<string>(videoSetting);
  const [screenshareState, setScreenshareState] = useState<string>(screenshareSetting);
  const [chatState, setChatState] = useState<string>(chatSetting);

  const screenWidth = Dimensions.get('window').width;
  let modalWidth = 0.8 * screenWidth;
  if (modalWidth > 400) {
    modalWidth = 400;
  }

  useEffect(() => {
    if (isEventSettingsModalVisible) {
      setAudioState(audioSetting);
      setVideoState(videoSetting);
      setScreenshareState(screenshareSetting);
      setChatState(chatSetting);
    }
  }, [isEventSettingsModalVisible, audioSetting, videoSetting, screenshareSetting, chatSetting]);

  /**
   * Handles saving the modified event settings.
   */
  const handleSaveSettings = async () => {
    try {
      await onModifyEventSettings({
        audioSet: audioState,
        videoSet: videoState,
        screenshareSet: screenshareState,
        chatSet: chatState,
        updateAudioSetting,
        updateVideoSetting,
        updateScreenshareSetting,
        updateChatSetting,
        updateIsSettingsModalVisible,
        roomName,
        socket,
        showAlert,
      });
      onEventSettingsClose(); // Close modal after saving
    } catch {
      showAlert?.({ message: 'Failed to save settings.', type: 'danger' });
    }
  };

  const dimensions = { width: modalWidth, height: 0 };

  const defaultContent = (
    <>
      {/* Header */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Event Settings</Text>
        <Pressable
          onPress={onEventSettingsClose}
          style={styles.btnCloseSettings}
          accessibilityRole="button"
          accessibilityLabel="Close Event Settings Modal"
        >
          <FontAwesome name="times" style={styles.icon} />
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.hr} />

      {/* Body */}
      <View style={styles.modalBody}>
        {/* User Audio Setting */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>User Audio:</Text>
          <RNPickerSelect
            onValueChange={(value: string) => {
              setAudioState(value);
              updateAudioSetting(value);
            }}
            items={[
              { label: 'Disallow', value: 'disallow' },
              { label: 'Allow', value: 'allow' },
              { label: 'Upon approval', value: 'approval' },
            ]}
            value={audioState}
            style={pickerSelectStyles}
            placeholder={{}}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        {/* Separator */}
        <View style={styles.sep} />

        {/* User Video Setting */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>User Video:</Text>
          <RNPickerSelect
            onValueChange={(value: string) => {
              setVideoState(value);
              updateVideoSetting(value);
            }}
            items={[
              { label: 'Disallow', value: 'disallow' },
              { label: 'Allow', value: 'allow' },
              { label: 'Upon approval', value: 'approval' },
            ]}
            value={videoState}
            style={pickerSelectStyles}
            placeholder={{}}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        {/* Separator */}
        <View style={styles.sep} />

        {/* User Screenshare Setting */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>User Screenshare:</Text>
          <RNPickerSelect
            onValueChange={(value: string) => {
              setScreenshareState(value);
              updateScreenshareSetting(value);
            }}
            items={[
              { label: 'Disallow', value: 'disallow' },
              { label: 'Allow', value: 'allow' },
              { label: 'Upon approval', value: 'approval' },
            ]}
            value={screenshareState}
            style={pickerSelectStyles}
            placeholder={{}}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        {/* Separator */}
        <View style={styles.sep} />

        {/* User Chat Setting */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>User Chat:</Text>
          <RNPickerSelect
            onValueChange={(value: string) => {
              setChatState(value);
              updateChatSetting(value);
            }}
            items={[
              { label: 'Disallow', value: 'disallow' },
              { label: 'Allow', value: 'allow' },
            ]}
            value={chatState}
            style={pickerSelectStyles}
            placeholder={{}}
            useNativeAndroidPickerStyle={false}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.modalFooter}>
        <Pressable
          onPress={handleSaveSettings}
          style={styles.btnApplySettings}
          accessibilityRole="button"
          accessibilityLabel="Save Event Settings"
        >
          <Text style={styles.btnText}>Save</Text>
        </Pressable>
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
      visible={isEventSettingsModalVisible}
      onRequestClose={onEventSettingsClose}
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

export default EventSettingsModal;

/**
 * Stylesheet for the EventSettingsModal component.
 */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 9,
    elevation: 9,
    borderWidth: 2,
    borderColor: 'black',
    borderStyle: 'solid',
  },

  modalContent: {
    height: '70%',
    backgroundColor: '#83c0e9',
    borderRadius: 0,
    padding: 20,
    maxHeight: '75%',
    maxWidth: '70%',
    zIndex: 9,
    elevation: 9,
    borderWidth: 2,
    borderColor: 'black',
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

  btnCloseSettings: {
    padding: 5,
  },

  icon: {
    fontSize: 24,
    color: 'black',
  },

  hr: {
    height: 1,
    backgroundColor: 'black',
    marginVertical: 5,
  },

  modalBody: {
    flex: 1,
  },

  formGroup: {
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    color: 'black',
    marginBottom: 5,
    fontWeight: 'bold',
  },

  sep: {
    height: 1,
    backgroundColor: '#ffffff',
    marginVertical: 1,
  },

  modalFooter: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  btnApplySettings: {
    flex: 1,
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',


  },

  btnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

/**
 * Stylesheet for the RNPickerSelect component.
 */
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // To ensure the text is never behind the icon
    backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // To ensure the text is never behind the icon
    backgroundColor: 'white',
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
