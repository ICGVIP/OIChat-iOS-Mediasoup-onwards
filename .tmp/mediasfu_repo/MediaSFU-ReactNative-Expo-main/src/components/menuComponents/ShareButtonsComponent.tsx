import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Linking,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; 
import * as Clipboard from 'expo-clipboard'; 
import { EventType } from '../../@types/types';

/**
 * Interface defining the structure of each share button.
 */
export interface ShareButton {
  /**
   * The name of the FontAwesome5 icon to be displayed.
   */
  icon: string;

  /**
   * The function to be called when the share button is pressed.
   */
  action: () => void;

  /**
   * Determines if the share button should be displayed.
   */
  show: boolean;

  /**
   * The background color of the share button.
   * @default 'black'
   */
  color?: string;

  /**
   * The color of the icon within the share button.
   * @default '#ffffff'
   */
  iconColor?: string;
}

/**
 * Interface defining the props for the ShareButtonsComponent.
 */
export interface ShareButtonsComponentOptions {
  /**
   * The unique identifier for the meeting.
   */
  meetingID: string;

  /**
   * An optional array of custom share buttons to display. If not provided, default share buttons will be used.
   */
  shareButtons?: ShareButton[];

  /**
   * The type of event, which can be "chat", "broadcast", or "meeting". This determines the URL structure for sharing.
   */
  eventType: EventType;

  /**
   * The link to the Commnity Edition server.
   */
  localLink?: string;
}

export type ShareButtonsComponentType = (
  options: ShareButtonsComponentOptions
) => JSX.Element;

/**
 * ShareButtonsComponent is a React Native functional component that renders a set of share buttons.
 * These buttons allow users to share a meeting link via various platforms such as clipboard, email, Facebook, WhatsApp, and Telegram.
 *
 * @component
 * @param {ShareButtonsComponentOptions} props - The properties for the component.
 * @returns {JSX.Element} The rendered ShareButtonsComponent.
 * @example
 * ```tsx
 * import React from 'react';
 * import { ShareButtonsComponent } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *   return (
 *     <ShareButtonsComponent
 *       meetingID="123456"
 *       eventType="meeting"
 *       localLink="https://example.com"
 *       shareButtons={[
 *         {
 *           icon: 'copy',
 *           action: () => console.log('Copied to clipboard'),
 *           show: true,
 *         },
 *         {
 *           icon: 'envelope',
 *           action: () => console.log('Shared via email'),
 *           show: true,
 *         },
 *       ]}
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const ShareButtonsComponent: React.FC<ShareButtonsComponentOptions> = ({
  meetingID,
  shareButtons = [],
  eventType,
  localLink,
}) => {
  const shareName = eventType === 'chat'
    ? 'chat'
    : eventType === 'broadcast'
      ? 'broadcast'
      : 'meeting';

  const getShareUrl = () => {
    if (localLink && !localLink.includes("mediasfu.com")) {
      return `${localLink}/meeting/${meetingID}`;
    }
    return `https://${shareName}.mediasfu.com/${shareName}/${meetingID}`;
  };

  const defaultShareButtons: ShareButton[] = [
    {
      icon: 'copy',
      action: async () => {
        // Action for the copy button
        try {
          await Clipboard.setStringAsync(getShareUrl());
        } catch (error) {
          console.error("Failed to copy to clipboard", error);
        }
      },
      show: true,
    },
    {
      icon: 'envelope',
      action: () => {
        // Action for the email button
        const emailUrl = `mailto:?subject=Join my meeting&body=Here's the link to the meeting: ${getShareUrl()}`;
        Linking.openURL(emailUrl);
      },
      show: true,
    },
    {
      icon: 'facebook',
      action: () => {
        // Action for the Facebook button
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          getShareUrl()
        )}`;
        Linking.openURL(facebookUrl);
      },
      show: true,
    },
    {
      icon: 'whatsapp',
      action: () => {
        // Action for the WhatsApp button
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getShareUrl())}`;
        Linking.openURL(whatsappUrl);
      },
      show: true,
    },
    {
      icon: 'telegram',
      action: () => {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}`;
        Linking.openURL(telegramUrl);
      },
      show: true,
    },
  ];

  const finalShareButtons = shareButtons.length > 0
    ? shareButtons.filter((button) => button.show)
    : defaultShareButtons.filter((button) => button.show);

  return (
    <View style={styles.shareButtonsContainer}>
      {finalShareButtons.map((button, index) => (
        <Pressable
          key={index}
          onPress={button.action}
          style={[
            styles.shareButton,
            { backgroundColor: button.color || 'black' },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Share via ${button.icon}`}
        >
          <FontAwesome5
            name={button.icon}
            style={[styles.shareIcon, { color: button.iconColor || '#ffffff' }]}
          />
        </Pressable>
      ))}
    </View>
  );
};

export default ShareButtonsComponent;

/**
 * Stylesheet for the ShareButtonsComponent.
 */
const styles = StyleSheet.create({
  shareButtonsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shareButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    // Optional: Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
  },

  shareIcon: {
    fontSize: 24,
  },
});
