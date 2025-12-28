/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * AppPlaybook.tsx - MediaSFU UI Override Playbook for React Native Expo
 * 
 * A comprehensive, toggle-driven demo showcasing MediaSFU's customization layers.
 * This playbook demonstrates:
 * - Connection scenario switching (Cloud, Hybrid, Community Edition)
 * - Experience selector (Generic, Broadcast, Conference, Webinar, Chat)
 * - UI strategy toggles (prebuilt UI, custom UI, headless mode)
 * - Custom participant cards (video/audio/mini)
 * - Component overrides via uiOverrides
 * - Container styling
 * - Function wrapping with analytics
 * 
 * Adjust the boolean flags at the top to explore different configurations.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';
import MediasfuGeneric from './src/components/mediasfuComponents/MediasfuGeneric';
import MediasfuBroadcast from './src/components/mediasfuComponents/MediasfuBroadcast';
import MediasfuConference from './src/components/mediasfuComponents/MediasfuConference';
import MediasfuWebinar from './src/components/mediasfuComponents/MediasfuWebinar';
import MediasfuChat from './src/components/mediasfuComponents/MediasfuChat';

import MainContainerComponent from './src/components/displayComponents/MainContainerComponent';
import AlertComponent from './src/components/displayComponents/AlertComponent';
import VideoCard from './src/components/displayComponents/VideoCard';
import AudioCard from './src/components/displayComponents/AudioCard';
import MiniCard from './src/components/displayComponents/MiniCard';

import type {
  MediasfuUICustomOverrides,
  CustomVideoCardType,
  CustomAudioCardType,
  CustomMiniCardType,
  CustomComponentType,
} from './src/@types/types';

// ============================================================================
// CONFIGURATION TOGGLES - Change these to experiment with different setups
// ============================================================================

type ConnectionScenario = 'cloud' | 'hybrid' | 'ce';
type ExperienceKey = 'generic' | 'broadcast' | 'webinar' | 'conference' | 'chat';

// Connection & Deployment
const connectionScenario: ConnectionScenario = 'cloud'; // 'cloud' | 'hybrid' | 'ce'
const selectedExperience: ExperienceKey = 'generic'; // 'generic' | 'broadcast' | 'webinar' | 'conference' | 'chat'

// UI Strategy
const showPrebuiltUI = true;            // Set false to bypass default UI
const enableFullCustomUI = false;       // Set true to use CustomWorkspace component
const enableNoUIPreJoin = false;        // Set true to skip pre-join page

// Customization Layers
const enableCardBuilders = true;        // Enable custom video/audio/mini cards
const enableUICoreOverrides = true;     // Enable layout overrides via uiOverrides
const enableModalOverrides = false;     // Enable modal overrides via uiOverrides
const enableContainerStyling = true;    // Apply custom container styles
const enableFunctionWrappers = true;    // Wrap helper functions with logging/analytics

// ============================================================================
// CONNECTION PRESETS
// ============================================================================

const connectionPresets: Record<ConnectionScenario, {
  credentials?: { apiUserName: string; apiKey: string };
  localLink: string;
  connectMediaSFU: boolean;
}> = {
  cloud: {
    credentials: {
      apiUserName: 'yourDevUser',
      apiKey: 'yourDevApiKey1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
    localLink: '',
    connectMediaSFU: true,
  },
  hybrid: {
    credentials: {
      apiUserName: 'dummyUsr',
      apiKey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
    localLink: 'http://localhost:3000',
    connectMediaSFU: true,
  },
  ce: {
    credentials: undefined,
    localLink: 'http://localhost:3000',
    connectMediaSFU: false,
  },
};

// ============================================================================
// CUSTOM COMPONENTS - Mobile-Friendly Examples
// ============================================================================

/**
 * Custom Video Card - Mobile-styled with rounded borders and gradients
 * 
 * NOTE: This is a simplified wrapper example. In production, you would pass
 * all required VideoCard props or create a complete custom implementation.
 */
const customVideoCard: CustomVideoCardType = (props) => {
  const {
    participant,
    width,
    height,
    showInfo,
    name,
    backgroundColor,
  } = props;

  return (
    <View
      style={[
        styles.videoCard,
        {
          width,
          height,
          backgroundColor: backgroundColor || 'rgba(0, 0, 0, 0.9)',
        },
      ]}
    >
      {/* In production: <VideoCard {...allRequiredProps} /> */}
      
      {/* Custom overlay with gradient */}
      {showInfo && (
        <View style={styles.videoOverlay}>
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>
              🎥 {name || participant.name}
            </Text>
          </View>
        </View>
      )}
      
      {/* Placeholder for demo */}
      <View style={styles.videoPlaceholder}>
        <Text style={styles.videoPlaceholderText}>{participant.name}</Text>
      </View>
    </View>
  );
};

/**
 * Custom Audio Card - Animated speaking indicator
 * 
 * NOTE: This is a simplified example. In production, ensure all required props are passed.
 */
const customAudioCard: CustomAudioCardType = (props) => {
  const { name, barColor } = props;
  const isActive = barColor === 'green' || barColor === 'lime';

  return (
    <View style={styles.audioCard}>
      {/* In production: <AudioCard {...allRequiredProps} /> */}
      
      {/* Placeholder audio card */}
      <View style={styles.audioPlaceholder}>
        <Text style={styles.audioPlaceholderText}>🎤 {name}</Text>
      </View>
      
      {/* Speaking indicator pulse */}
      {isActive && (
        <View style={styles.speakingIndicator}>
          <View style={[styles.pulse, styles.pulseOuter]} />
          <View style={[styles.pulse, styles.pulseInner]} />
          <Text style={styles.speakingText}>Speaking...</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Custom Mini Card - Compact design with badges
 */
const customMiniCard: CustomMiniCardType = (props) => {
  const { initials, name } = props;

  return (
    <View style={styles.miniCardWrapper}>
      <MiniCard {...props} />
      
      {/* Custom badge */}
      <View style={styles.miniCardBadge}>
        <Text style={styles.miniCardBadgeText}>
          {initials?.slice(0, 2).toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

/**
 * Custom Workspace - Fully bespoke UI that replaces the entire MediaSFU interface
 * Shows how to access MediaSFU helpers and build your own dashboard
 */
const CustomWorkspace: CustomComponentType = ({ parameters }) => {
  const {
    participants = [],
    roomName,
    islevel,
    showAlert,
    clickVideo,
    clickAudio,
    clickScreenShare,
  } = parameters;

  return (
    <ScrollView style={styles.customWorkspace} contentContainerStyle={styles.customWorkspaceContent}>
      <View style={styles.customWorkspaceHeader}>
        <Text style={styles.customWorkspaceTitle}>My Custom MediaSFU Dashboard</Text>
        <Text style={styles.customWorkspaceSubtitle}>Mobile Edition</Text>
      </View>

      <View style={styles.customWorkspaceInfo}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Room</Text>
          <Text style={styles.infoValue}>{roomName || 'Not connected'}</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Your Level</Text>
          <Text style={styles.infoValue}>{islevel || '0'}</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Participants</Text>
          <Text style={styles.infoValue}>{participants?.length || 0}</Text>
        </View>
      </View>

      <View style={styles.customWorkspaceActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => clickVideo?.({ ...parameters })}
        >
          <Text style={styles.actionButtonText}>📹 Toggle Video</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => clickAudio?.({ ...parameters })}
        >
          <Text style={styles.actionButtonText}>🎤 Toggle Audio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonAccent]}
          onPress={() => clickScreenShare?.({ ...parameters })}
        >
          <Text style={styles.actionButtonText}>📱 Share Screen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonInfo]}
          onPress={() => showAlert?.({ message: 'Hello from custom UI!', type: 'success' })}
        >
          <Text style={styles.actionButtonText}>✨ Show Alert</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customWorkspaceFooter}>
        <Text style={styles.footerText}>
          This is a completely custom UI. You have full control over layout and functionality.
        </Text>
        <Text style={styles.footerSubtext}>
          All MediaSFU helpers are available via the parameters prop.
        </Text>
      </View>
    </ScrollView>
  );
};

// ============================================================================
// MAIN PLAYBOOK COMPONENT
// ============================================================================

export const AppPlaybook = () => {
  const [sourceParams, setSourceParams] = useState<any>(null);

  // Select connection preset
  const currentPreset = connectionPresets[connectionScenario];

  // Build uiOverrides based on toggles
  const uiOverrides = useMemo<MediasfuUICustomOverrides | undefined>(() => {
    if (!enableUICoreOverrides && !enableModalOverrides && !enableFunctionWrappers) {
      return undefined;
    }

    const overrides: MediasfuUICustomOverrides = {};

    // Core component overrides
    if (enableUICoreOverrides) {
      overrides.mainContainer = {
        render: (props) => (
          <View style={styles.overriddenContainer}>
            <View style={styles.overrideIndicator}>
              <Text style={styles.overrideIndicatorText}>🎨 Custom Container</Text>
            </View>
            <MainContainerComponent {...props} />
          </View>
        ),
      };

      overrides.alert = {
        render: (props) => (
          <View style={styles.customAlertWrapper}>
            <AlertComponent {...props} />
          </View>
        ),
      };
    }

    // Function overrides with logging/analytics
    if (enableFunctionWrappers) {
      overrides.consumerResume = {
        wrap: (original) => async (params: any) => {
          const start = Date.now();
          console.log('📡 [Consumer Resume] Starting...', {
            consumerId: params?.consumer?.id,
            platform: Platform.OS,
          });
          
          const result = await original(params);
          
          const duration = Date.now() - start;
          console.log('✅ [Consumer Resume] Completed', {
            duration: `${duration}ms`,
            consumerId: params?.consumer?.id,
          });
          
          return result;
        },
      };

      overrides.addVideosGrid = {
        wrap: (original) => async (params: any) => {
          console.log('📊 [Add Videos Grid] Called', {
            participants: params?.allVideoStreams?.length || 0,
          });
          
          const result = await original(params);
          
          console.log('✅ [Add Videos Grid] Complete');
          return result;
        },
      };
    }

    return overrides;
  }, []);

  // Container styling
  const containerStyle = enableContainerStyling
    ? {
        backgroundColor: '#0f172a',
        borderRadius: Platform.OS === 'ios' ? 24 : 16,
        overflow: 'hidden' as const,
        ...Platform.select({
          ios: {
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
          },
          android: {
            elevation: 10,
          },
        }),
      }
    : undefined;

  // Select the experience component
  const ExperienceComponent = {
    generic: MediasfuGeneric,
    broadcast: MediasfuBroadcast,
    webinar: MediasfuWebinar,
    conference: MediasfuConference,
    chat: MediasfuChat,
  }[selectedExperience];

  // Build final props
  const experienceProps = {
    ...currentPreset,
    returnUI: showPrebuiltUI && !enableFullCustomUI,
    customVideoCard: enableCardBuilders ? customVideoCard : undefined,
    customAudioCard: enableCardBuilders ? customAudioCard : undefined,
    customMiniCard: enableCardBuilders ? customMiniCard : undefined,
    customComponent: enableFullCustomUI ? CustomWorkspace : undefined,
    containerStyle,
    uiOverrides,
    updateSourceParameters: (params: any) => {
      setSourceParams(params);
      console.log('📦 [Source Parameters Updated]', Object.keys(params).length, 'helpers available');
    },
  };

  return (
    <View style={styles.playbookContainer}>
      {/* Configuration badge */}
      <View style={styles.configBadge}>
        <Text style={styles.configBadgeText}>
          {connectionScenario.toUpperCase()} · {selectedExperience.toUpperCase()}
        </Text>
        <Text style={styles.configBadgeSubtext}>
          {enableFullCustomUI ? 'Custom Workspace' : showPrebuiltUI ? 'Prebuilt UI' : 'Headless'}
        </Text>
      </View>

      {/* Render selected experience */}
      <ExperienceComponent {...experienceProps} />

      {/* Debug panel (optional) */}
      {sourceParams && __DEV__ && (
        <View style={styles.debugPanel}>
          <Text style={styles.debugText}>
            🔧 {Object.keys(sourceParams).length} helpers available
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES - Mobile-Optimized
// ============================================================================

const styles = StyleSheet.create({
  playbookContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Configuration Badge
  configBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  configBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  configBadgeSubtext: {
    color: '#e9d5ff',
    fontSize: 8,
    marginTop: 2,
  },

  // Video Card Styles
  videoCard: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#6366f1',
    overflow: 'hidden',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  videoBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoPlaceholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Audio Card Styles
  audioCard: {
    position: 'relative',
  },
  speakingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: '#22c55e',
  },
  pulseOuter: {
    width: 40,
    height: 40,
    opacity: 0.3,
  },
  pulseInner: {
    width: 30,
    height: 30,
    opacity: 0.6,
  },
  speakingText: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 22,
  },
  audioPlaceholder: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
  },
  audioPlaceholderText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },

  // Mini Card Styles
  miniCardWrapper: {
    position: 'relative',
  },
  miniCardBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ec4899',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  miniCardBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // Custom Workspace Styles
  customWorkspace: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  customWorkspaceContent: {
    padding: 20,
  },
  customWorkspaceHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  customWorkspaceTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  customWorkspaceSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  customWorkspaceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  customWorkspaceActions: {
    marginBottom: 24,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#6366f1',
  },
  actionButtonSecondary: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonAccent: {
    backgroundColor: '#ec4899',
  },
  actionButtonInfo: {
    backgroundColor: '#14b8a6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  customWorkspaceFooter: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  footerText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 8,
    lineHeight: 20,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },

  // Override Styles
  overriddenContainer: {
    flex: 1,
    borderWidth: 4,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    borderRadius: 20,
  },
  overrideIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1000,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  overrideIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  customAlertWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Debug Panel
  debugPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  debugText: {
    color: '#22c55e',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default AppPlaybook;
