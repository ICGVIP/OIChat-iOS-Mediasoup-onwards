/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MediasfuGeneric from './src/components/mediasfuComponents/MediasfuGeneric';
import {
  CustomVideoCardType,
  CustomAudioCardType,
  CustomMiniCardType,
} from './src/@types/types';

// Custom VideoCard Example for React Native
const MyCustomVideoCard: CustomVideoCardType = ({
  participant,
  stream,
  width,
  height,
  showControls,
  showInfo,
  name,
  backgroundColor,
  parameters,
}) => {
  return (
    <View
      style={[
        styles.videoCardContainer,
        {
          width: width,
          height: height,
          backgroundColor: backgroundColor || 'rgba(0, 0, 0, 0.8)',
        },
      ]}
    >
      {/* Custom video display would go here */}
      {/* Note: Video rendering in React Native requires platform-specific implementation */}
      
      {/* Custom participant info overlay */}
      {showInfo && (
        <View style={styles.videoInfoOverlay}>
          <Text style={styles.videoInfoText}>
            🎥 {name || participant.name}
          </Text>
        </View>
      )}
      
      {/* Custom controls overlay */}
      {showControls && (
        <View style={styles.videoControlsOverlay}>
          <View style={styles.controlButton}>
            <Text style={styles.controlButtonText}>🔇</Text>
          </View>
          <View style={styles.controlButton}>
            <Text style={styles.controlButtonText}>📹</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// Custom AudioCard Example for React Native
const MyCustomAudioCard: CustomAudioCardType = ({
  name,
  barColor,
  textColor,
  parameters,
}) => {
  const isActive = barColor; // barColor indicates if participant is speaking

  return (
    <View
      style={[
        styles.audioCardContainer,
        {
          backgroundColor: isActive ? '#ef4444' : '#6b7280',
        },
      ]}
    >
      {/* Audio wave animation background */}
      {isActive && (
        <View style={styles.audioWaveOverlay} />
      )}
      
      {/* Avatar */}
      <View style={styles.audioAvatar}>
        <Text style={styles.audioAvatarText}>
          {name ? name.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      
      {/* Name */}
      <Text style={[styles.audioNameText, { color: textColor || 'white' }]}>
        {name}
      </Text>
      
      {/* Speaking indicator */}
      {isActive && (
        <Text style={styles.speakingIndicator}>
          🎤 Speaking...
        </Text>
      )}
    </View>
  );
};

// Custom MiniCard Example for React Native
const MyCustomMiniCard: CustomMiniCardType = ({
  initials,
  name,
  showVideoIcon,
  showAudioIcon,
  parameters,
}) => {
  return (
    <View style={styles.miniCardContainer}>
      {/* Avatar/Initials */}
      <View style={styles.miniAvatar}>
        <Text style={styles.miniAvatarText}>
          {initials || name?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
      
      {/* Name */}
      <Text style={styles.miniNameText} numberOfLines={1} ellipsizeMode="tail">
        {name}
      </Text>
      
      {/* Media status icons */}
      <View style={styles.miniMediaIcons}>
        {showVideoIcon && (
          <Text style={styles.miniMediaIcon}>📹</Text>
        )}
        {showAudioIcon && (
          <Text style={styles.miniMediaIcon}>🎤</Text>
        )}
      </View>
    </View>
  );
};

// Styles for React Native
const styles = StyleSheet.create({
  // Video Card Styles
  videoCardContainer: {
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  videoInfoOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  videoInfoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  videoControlsOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
  },

  // Audio Card Styles
  audioCardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  audioWaveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  audioAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  audioAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  audioNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
  speakingIndicator: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },

  // Mini Card Styles
  miniCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    minHeight: 80,
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  miniAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  miniNameText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 6,
    color: 'white',
    maxWidth: '100%',
  },
  miniMediaIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  miniMediaIcon: {
    fontSize: 12,
    opacity: 0.7,
  },
});

// Usage Example
const ExampleApp = () => {
  return (
    <MediasfuGeneric
      // Standard MediaSFU options
      credentials={{
        apiUserName: "your-api-username",
        apiKey: "your-api-key"
      }}
      localLink=""
      connectMediaSFU={true}
      
      // Custom component implementations
      customVideoCard={MyCustomVideoCard}
      customAudioCard={MyCustomAudioCard}
      customMiniCard={MyCustomMiniCard}
    />
  );
};

export default ExampleApp;
export { MyCustomVideoCard, MyCustomAudioCard, MyCustomMiniCard };