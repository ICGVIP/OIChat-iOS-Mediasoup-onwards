// LoadingModal.tsx

import React from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

/**
 * Configuration options for the LoadingModal component.
 * 
 * @interface LoadingModalOptions
 * 
 * **Modal Control:**
 * @property {boolean} isVisible - Controls modal visibility
 * 
 * **Styling:**
 * @property {string} [backgroundColor='rgba(0, 0, 0, 0.5)'] - Background color of the modal overlay
 * @property {string} [displayColor='black'] - Color of the loading spinner and "Loading..." text
 * @property {object} [style] - Additional custom styles for the container
 * 
 * **Advanced Render Overrides:**
 * @property {(options: { defaultContent: React.ReactNode; dimensions: { width: number; height: number } }) => React.ReactNode} [renderContent] - Custom render function for modal content
 * @property {(options: { defaultContainer: React.ReactNode; dimensions: { width: number; height: number } }) => React.ReactNode} [renderContainer] - Custom render function for modal container
 */
export interface LoadingModalOptions {
  /**
   * Determines if the modal is visible.
   */
  isVisible: boolean;

  /**
   * The background color of the modal overlay.
   * @default 'rgba(0, 0, 0, 0.5)'
   */
  backgroundColor?: string;

  /**
   * The color of the loading spinner and text.
   * @default 'black'
   */
  displayColor?: string;

  /**
   * Optional custom style to apply to the container.
   */
  style?: object;

  /**
   * Optional function to render custom content, receiving the default content and dimensions.
   */
  renderContent?: (options: {
    defaultContent: React.ReactNode;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;

  /**
   * Optional function to render a custom container, receiving the default container and dimensions.
   */
  renderContainer?: (options: {
    defaultContainer: React.ReactNode;
    dimensions: { width: number; height: number };
  }) => React.ReactNode;
}

export type LoadingModalType = (options: LoadingModalOptions) => JSX.Element;

/**
 * LoadingModal - Fullscreen loading indicator overlay
 * 
 * LoadingModal is a React Native component that displays a centered loading spinner
 * with "Loading..." text in a fullscreen modal overlay. Used to indicate ongoing
 * operations like joining meetings, processing media, or waiting for server responses.
 * 
 * **Key Features:**
 * - Fullscreen modal overlay
 * - Centered loading spinner
 * - "Loading..." text label
 * - Customizable background and spinner colors
 * - Transparent overlay support
 * - Blocks interaction while visible
 * - Simple visibility toggle
 * 
 * **UI Customization:**
 * This component can be replaced via `uiOverrides.loadingModal` to
 * provide a completely custom loading indicator.
 * 
 * @component
 * @param {LoadingModalOptions} props - Configuration options
 * 
 * @returns {JSX.Element} Rendered loading modal
 * 
 * @example
 * ```tsx
 * // Basic usage with default styling
 * import React, { useState } from 'react';
 * import { LoadingModal } from 'mediasfu-reactnative-expo';
 * 
 * const [isLoading, setIsLoading] = useState(true);
 * 
 * return (
 *   <LoadingModal isVisible={isLoading} />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // With custom styling
 * const [loading, setLoading] = useState(false);
 * 
 * return (
 *   <LoadingModal
 *     isVisible={loading}
 *     backgroundColor="rgba(0, 0, 0, 0.8)"
 *     displayColor="white"
 *   />
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // During async operation
 * const handleJoinMeeting = async () => {
 *   setLoading(true);
 *   try {
 *     await joinRoom({ roomName, userName });
 *   } finally {
 *     setLoading(false);
 *   }
 * };
 * 
 * return (
 *   <>
 *     <LoadingModal isVisible={loading} displayColor="#007bff" />
 *     <Button title="Join" onPress={handleJoinMeeting} />
 *   </>
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // Using custom UI via uiOverrides
 * const config = {
 *   uiOverrides: {
 *     loadingModal: {
 *       component: MyCustomLoadingSpinner,
 *       injectedProps: {
 *         theme: 'dark',
 *         showProgressBar: true,
 *       },
 *     },
 *   },
 * };
 * 
 * return <MyMeetingComponent config={config} />;
 * ```
 */

const LoadingModal: React.FC<LoadingModalOptions> = ({
  isVisible,
  backgroundColor = 'rgba(0, 0, 0, 0.5)',
  displayColor = 'black',
  style,
  renderContent,
  renderContainer,
}) => {
  /**
   * Styles for the modal overlay container.
   */
  const modalContainerStyle: StyleProp<ViewStyle> = {
    flex: 1,
    justifyContent: 'center', // Vertically center content
    alignItems: 'center', // Horizontally center content
    backgroundColor,
  };

  /**
   * Styles for the modal content box.
   */
  const modalContentStyle: StyleProp<ViewStyle> = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 200,
  };

  /**
   * Styles for the loading text.
   */
  const loadingTextStyle: StyleProp<TextStyle> = {
    color: displayColor,
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  };

  const dimensions = { width: 200, height: 0 };

  const defaultContent = (
    <>
      <ActivityIndicator size="large" color={displayColor} />
      <Text style={loadingTextStyle}>Loading...</Text>
    </>
  );

  const content = renderContent 
    ? renderContent({ defaultContent, dimensions }) 
    : defaultContent;

  const defaultContainer = (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={() => { /* Optionally handle modal close */ }}
    >
      <View style={[modalContainerStyle, style]}>
        <View style={modalContentStyle}>
          {content}
        </View>
      </View>
    </Modal>
  );

  return renderContainer 
    ? (renderContainer({ defaultContainer, dimensions }) as JSX.Element)
    : defaultContainer;
};

export default LoadingModal;
