/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - This is a demo/cookbook file showcasing various customization patterns
/**
 * AppUnique
 *
 * A toggle-driven cookbook that mirrors the guidance in `App.tsx`, while showcasing
 * the newer UI override hooks, custom cards, and fully custom render paths in one place.
 *
 * Adjust the booleans and selectors below to switch between common deployment scenarios
 * (Cloud, Community Edition, Hybrid), UI strategies (prebuilt UI, no-UI, or fully custom),
 * and customization layers (card builders, component overrides, container styling).
 *
 * Every configuration block is wrapped in a clearly named toggle so you can enable/disable
 * a feature by flipping a single value or commenting it out. The component is intentionally
 * verbose to double as living documentation that developers can copy, trim, or expand.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MediasfuGeneric, { MediasfuGenericOptions } from './src/components/mediasfuComponents/MediasfuGeneric';
import MediasfuBroadcast from './src/components/mediasfuComponents/MediasfuBroadcast';
import MediasfuChat from './src/components/mediasfuComponents/MediasfuChat';
import MediasfuWebinar from './src/components/mediasfuComponents/MediasfuWebinar';
import MediasfuConference from './src/components/mediasfuComponents/MediasfuConference';
import PreJoinPage from './src/components/miscComponents/PreJoinPage';
import MainContainerComponent from './src/components/displayComponents/MainContainerComponent';
import Pagination from './src/components/displayComponents/Pagination';
import AlertComponent from './src/components/displayComponents/AlertComponent';
import MenuModal from './src/components/menuComponents/MenuModal';
import ParticipantsModal from './src/components/participantsComponents/ParticipantsModal';
import ConfirmExitModal from './src/components/exitComponents/ConfirmExitModal';
import VideoCard from './src/components/displayComponents/VideoCard';
import AudioCard from './src/components/displayComponents/AudioCard';
import MiniCard from './src/components/displayComponents/MiniCard';
import MiniAudio from './src/components/displayComponents/MiniAudio';
import MiniAudioPlayer from './src/methods/utils/MiniAudioPlayer/MiniAudioPlayer';
import { createRoomOnMediaSFU } from './src/methods/utils/createRoomOnMediaSFU';
import { joinRoomOnMediaSFU } from './src/methods/utils/joinRoomOnMediaSFU';
import {
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
  CustomVideoCardType,
  CustomAudioCardType,
  CustomMiniCardType,
  CustomComponentType,
  MediasfuUICustomOverrides,
  Participant,
} from './src/@types/types';

// -----------------------------------------------------------------------------
// Toggle Section
// -----------------------------------------------------------------------------
type ConnectionScenario = 'cloud' | 'hybrid' | 'ce';
type ExperienceKey = 'generic' | 'broadcast' | 'webinar' | 'conference' | 'chat';

// Switch deployment target: 'cloud' | 'hybrid' | 'ce'
const connectionScenario: ConnectionScenario = 'cloud';

// Select which prebuilt experience to render by default
// Options: 'generic', 'broadcast', 'webinar', 'conference', 'chat'
const selectedExperience: ExperienceKey = 'generic';

// UI strategy toggles
const showPrebuiltUI = true;           // Set false to bypass the default UI entirely
const enableFullCustomUI = false;      // Set true to mount the CustomWorkspace instead of MediaSFU UI
const enableNoUIPreJoin = !showPrebuiltUI || enableFullCustomUI; // auto-calculated helper

// Layered customization toggles
const enableCardBuilders = true;       // Enables custom video/audio/mini card components
const enableUICoreOverrides = false;    // Enables layout-centric overrides via uiOverrides
const enableModalOverrides = true;     // Enables modal overrides via uiOverrides
const enableAudioComponentOverrides = true; // Enables MiniAudio and MiniAudioPlayer overrides
const enableContainerStyling = true;   // Applies a custom containerStyle
const enableBackendProxyHooks = true;  // Hooks create/join calls through helper functions
const enableDebugPanel = true;         // Renders a JSON panel of live parameters on the right

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

const experienceComponentMap: Record<ExperienceKey, React.ComponentType<MediasfuGenericOptions>> = {
  generic: MediasfuGeneric,
  broadcast: MediasfuBroadcast,
  webinar: MediasfuWebinar,
  conference: MediasfuConference,
  chat: MediasfuChat,
};

// -----------------------------------------------------------------------------
// Demo Custom Components (Cards + Full UI)
// -----------------------------------------------------------------------------
const ShowcaseVideoCard: CustomVideoCardType = ({
  customStyle,
  containerProps,
  infoOverlayProps,
  controlsOverlayProps,
  backgroundColor,
  name,
  participant,
  videoStream,
  ...rest
}) => {

  return (
    <VideoCard
      {...rest}
      name={name}
      participant={participant}
      videoStream={videoStream}
      backgroundColor={backgroundColor}
      customStyle={{
        borderRadius: 20,
        border: `3px solid #4c1d95`,
        overflow: 'hidden',
        boxShadow: '0 28px 65px rgba(76, 29, 149, 0.35)',
        backgroundColor: backgroundColor ?? '#0f172a',
        ...customStyle,
      }}
      containerProps={{
        ...(containerProps ?? {}),
        style: {
          background: 'linear-gradient(140deg, rgba(15, 23, 42, 0.78), rgba(30, 64, 175, 0.45))',
          borderRadius: 26,
          ...(containerProps?.style ?? {}),
        },
      }}
      infoOverlayProps={{
        ...(infoOverlayProps ?? {}),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 16px',
          borderRadius: 999,
          background: 'rgba(79, 70, 229, 0.9)',
          color: '#f8fafc',
          fontWeight: 600,
          letterSpacing: 0.35,
          ...(infoOverlayProps?.style ?? {}),
        },
      }}
      controlsOverlayProps={{
        ...(controlsOverlayProps ?? {}),
        style: {
          background: 'rgba(15, 23, 42, 0.55)',
          borderRadius: 16,
          backdropFilter: 'blur(8px)',
          ...(controlsOverlayProps?.style ?? {}),
        },
      }}
    />
  );
};

const ShowcaseAudioCard: CustomAudioCardType = ({
  customStyle,
  cardProps,
  nameContainerProps,
  nameTextProps,
  barColor,
  ...rest
}) => {
  const accent = barColor ?? '#22c55e';

  return (
    <AudioCard
      {...rest}
      barColor={accent}
      customStyle={{
        borderRadius: 22,
        border: `2px solid ${accent}`,
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(21, 128, 61, 0.45))',
        boxShadow: '0 18px 40px rgba(21, 128, 61, 0.25)',
        ...customStyle,
      }}
      cardProps={{
        ...(cardProps ?? {}),
        style: {
          padding: 18,
          gap: 14,
          ...(cardProps?.style ?? {}),
        },
      }}
      nameContainerProps={{
        ...(nameContainerProps ?? {}),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          ...(nameContainerProps?.style ?? {}),
        },
      }}
      nameTextProps={{
        ...(nameTextProps ?? {}),
        style: {
          fontSize: 16,
          fontWeight: 600,
          color: '#14532d',
          ...(nameTextProps?.style ?? {}),
        },
      }}
    />
  );
};

const ShowcaseMiniCard: CustomMiniCardType = ({ customStyle, initials, fontSize, renderContainer, ...rest }) => {
  const decorateContainer = ({ defaultContainer }: { defaultContainer: React.ReactNode; isImage: boolean }) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      {defaultContainer}
    </View>
  );

  const combinedRenderContainer = (options: { defaultContainer: React.ReactNode; isImage: boolean }) => {
    const decorated = decorateContainer(options);
    return renderContainer ? renderContainer({ defaultContainer: decorated, isImage: options.isImage }) : decorated;
  };

  return (
    <MiniCard
      {...rest}
      initials={initials}
      fontSize={fontSize ?? 16}
      customStyle={{
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#f59e0b',
        backgroundColor: '#fff7ed',
        color: '#b45309',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        ...customStyle,
      }}
      renderContainer={combinedRenderContainer}
    />
  );
};

const ShowcaseMiniAudio = (props: React.ComponentProps<typeof MiniAudio>) => {
  return (
    <MiniAudio
      {...props}
      customStyle={[
        props.customStyle,
        {
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderRadius: 8,
          padding: 4,
        },
      ]}
    />
  );
};

const ShowcaseMiniAudioPlayer = (props: React.ComponentProps<typeof MiniAudioPlayer>) => {
  return (
    <MiniAudioPlayer
      {...props}
      MiniAudioComponent={ShowcaseMiniAudio}
    />
  );
};

const CustomWorkspace: CustomComponentType = ({ parameters }) => {
  const {
    roomName,
    participants,
    islevel,
    meetingID,
    showAlert,
    toggleMenuModal,
  } = parameters;

  return (
    <View
      style={{
        flex: 1,
        height: '100%',
        backgroundColor: '#0f172a',
      }}
    >
      <View style={{ width: '100%', padding: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(148, 163, 184, 0.3)' }}>
        <Text style={{ fontSize: 28, marginBottom: 8, color: '#f1f5f9', fontWeight: 'bold' }}>Custom Workspace</Text>
        <Text style={{ margin: 0, fontSize: 14, opacity: 0.8, color: '#f1f5f9' }}>
          Room <Text style={{ fontWeight: 'bold' }}>{roomName || 'Unnamed room'}</Text> · Meeting ID <Text style={{ fontWeight: 'bold' }}>{meetingID || 'pending'}</Text> · Your role level: <Text style={{ fontWeight: 'bold' }}>{islevel || 'viewer'}</Text>
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flex: 1 }}>
        <View style={{ padding: 24, borderRightWidth: 1, borderRightColor: 'rgba(148, 163, 184, 0.2)', width: 320 }}>
          <Text style={{ fontSize: 16, marginBottom: 12, color: '#f1f5f9', fontWeight: 'bold' }}>Participants ({participants?.length ?? 0})</Text>
          <ScrollView>
            {(participants ?? []).map((person: Participant) => (
              <View
                key={person.id ?? person.name}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 12,
                  backgroundColor: 'rgba(79, 70, 229, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(79, 70, 229, 0.4)',
                }}
              >
                <Text style={{ fontWeight: '600', color: '#f1f5f9' }}>{person.name}</Text>
                <Text style={{ fontSize: 12, opacity: 0.8, color: '#f1f5f9' }}>Level {person.islevel ?? 'n/a'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={{ flex: 1, padding: 32 }}>
          <View
            style={{
              padding: 24,
              borderRadius: 18,
              backgroundColor: 'rgba(79, 70, 229, 0.25)',
              borderWidth: 1,
              borderColor: 'rgba(79, 70, 229, 0.55)',
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 18 },
              shadowOpacity: 0.45,
              shadowRadius: 45,
              elevation: 18,
            }}
          >
            <Text style={{ marginBottom: 12, fontSize: 18, color: '#f1f5f9', fontWeight: 'bold' }}>Custom Controls</Text>
            <Text style={{ marginBottom: 18, fontSize: 14, maxWidth: 420, color: '#f1f5f9' }}>
              Trigger native alerts, switch MediaSFU menus, or call any exposed helper via <Text style={{ fontFamily: 'monospace' }}>parameters</Text>.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 999,
                  backgroundColor: '#22c55e',
                }}
                onPress={() =>
                  showAlert?.({ message: 'Custom workspace calling back into MediaSFU!', type: 'success' })
                }
              >
                <Text style={{ color: '#022c22', fontWeight: '600' }}>Trigger success toast</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: 'rgba(148, 163, 184, 0.6)',
                  backgroundColor: 'transparent',
                }}
                onPress={() => toggleMenuModal?.({ showMenuModal: true })}
              >
                <Text style={{ color: '#e2e8f0', fontWeight: '600' }}>Open menu modal</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={{ fontSize: 12, opacity: 0.6, marginTop: 16, color: '#f1f5f9' }}>
            Built using <Text style={{ fontFamily: 'monospace' }}>customComponent</Text>. Disable <Text style={{ fontFamily: 'monospace' }}>enableFullCustomUI</Text> to fall back to the standard UI.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const EnhancedMainContainer: React.FC<React.ComponentProps<typeof MainContainerComponent>> = (props) => (
  <View style={{ borderWidth: 4, borderStyle: 'dashed', borderColor: 'rgba(139, 92, 246, 0.8)', borderRadius: 28, padding: 16, backgroundColor: 'rgba(244, 244, 255, 0.55)' }}>
    <Text style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: '#6b21a8', marginBottom: 8 }}>
      Custom main container wrapper (uiOverrides.mainContainer)
    </Text>
    <MainContainerComponent {...props} />
  </View>
);

const EnhancedPagination: React.FC<React.ComponentProps<typeof Pagination>> = (props) => (
  <View style={{ backgroundColor: '#0ea5e9', padding: 10, borderRadius: 16 }}>
    <Text style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#f8fafc', marginBottom: 8 }}>Custom pagination shell</Text>
    <Pagination {...props} />
  </View>
);

const EnhancedAlert: React.FC<React.ComponentProps<typeof AlertComponent>> = (props) => (
  <AlertComponent
    {...props}
    containerProps={{
      ...props.containerProps,
      style: {
        ...(props.containerProps?.style ?? {}),
        borderRadius: 20,
        border: '2px solid rgba(249, 115, 22, 0.6)',
        boxShadow: '0 18px 38px rgba(249, 115, 22, 0.25)',
        overflow: 'hidden',
      },
    }}
  />
);

const FrostedMenuModal: React.FC<React.ComponentProps<typeof MenuModal>> = (props) => (
  <MenuModal
    {...props}
    overlayProps={{
      ...(props.overlayProps ?? {}),
      style: {
        backdropFilter: 'blur(16px)',
        background: 'rgba(15, 23, 42, 0.45)',
        ...(props.overlayProps?.style ?? {}),
      },
    }}
    contentProps={{
      ...(props.contentProps ?? {}),
      style: {
        borderRadius: 28,
        border: '1px solid rgba(148, 163, 184, 0.35)',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)',
        background: 'linear-gradient(160deg, rgba(244, 244, 255, 0.92), rgba(224, 231, 255, 0.9))',
        color: '#0f172a',
        ...(props.contentProps?.style ?? {}),
      },
    }}
  />
);

const NeonParticipantsModal: React.FC<React.ComponentProps<typeof ParticipantsModal>> = (props) => (
  <ParticipantsModal
    {...props}
    contentProps={{
      ...(props.contentProps ?? {}),
      style: {
        borderRadius: 26,
        background: '#0f172a',
        color: '#e2e8f0',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        ...(props.contentProps?.style ?? {}),
      },
    }}
    headerProps={{
      ...(props.headerProps ?? {}),
      style: {
        ...(props.headerProps?.style ?? {}),
        borderBottom: '1px solid rgba(148, 163, 184, 0.35)',
        padding: '18px 22px',
      },
    }}
    bodyProps={{
      ...(props.bodyProps ?? {}),
      style: {
        ...(props.bodyProps?.style ?? {}),
        background: 'radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 70%)',
      },
    }}
  />
);

const SoftConfirmExitModal: React.FC<React.ComponentProps<typeof ConfirmExitModal>> = (props) => (
  <ConfirmExitModal
    {...props}
    contentProps={{
      ...(props.contentProps ?? {}),
      style: {
        borderRadius: 24,
        background: '#fdf2f8',
        border: '1px solid rgba(236, 72, 153, 0.35)',
        ...(props.contentProps?.style ?? {}),
      },
    }}
    confirmButtonProps={{
      ...(props.confirmButtonProps ?? {}),
      style: {
        ...(props.confirmButtonProps?.style ?? {}),
        background: '#f97316',
        color: '#0f172a',
        borderRadius: 999,
        padding: '10px 22px',
        fontWeight: 600,
      },
    }}
    cancelButtonProps={{
      ...(props.cancelButtonProps ?? {}),
      style: {
        ...(props.cancelButtonProps?.style ?? {}),
        borderRadius: 999,
        padding: '10px 22px',
      },
    }}
  />
);

// Note: ScreenboardModal component not available in this SDK version
// const SlateScreenboardModal: React.FC<React.ComponentProps<typeof ScreenboardModal>> = (props) => (
//   <ScreenboardModal
//     {...props}
//     backgroundColor={props.backgroundColor ?? 'rgba(15, 23, 42, 0.9)'}
//     position={props.position ?? 'center'}
//   />
// );





// -----------------------------------------------------------------------------
// AppUnique Component
// -----------------------------------------------------------------------------
const AppUnique: React.FC = () => {
  const [sourceParameters, setSourceParameters] = useState<{ [key: string]: any }>({});
  const updateSourceParameters = (data: { [key: string]: any }) => {
    setSourceParameters(data);
  };

  // ---------------------------------------------------------------------------
  // Connection Scenarios
  // ---------------------------------------------------------------------------
  const preset = connectionPresets[connectionScenario];
  const { credentials, localLink, connectMediaSFU } = preset;

  // When the UI is bypassed, simulate pre-join input here
  const noUIPreJoinOptions: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions | undefined = enableNoUIPreJoin
    ? {
        action: 'create',
        capacity: 12,
        duration: 30,
        eventType: 'conference',
        userName: 'Demo Host',
      }
    : undefined;

  const cardOverrides = useMemo<
    Partial<Pick<MediasfuGenericOptions, 'customVideoCard' | 'customAudioCard' | 'customMiniCard'>>
  >(() => {
    if (!enableCardBuilders) {
      return {};
    }

    return {
      customVideoCard: ShowcaseVideoCard,
      customAudioCard: ShowcaseAudioCard,
      customMiniCard: ShowcaseMiniCard,
    };
  }, []);

  const uiOverrides = useMemo<MediasfuUICustomOverrides | undefined>(() => {
    if (!enableUICoreOverrides && !enableModalOverrides && !enableAudioComponentOverrides) {
      return undefined;
    }

    const overrides: MediasfuUICustomOverrides = {};

    if (enableUICoreOverrides) {
      overrides.mainContainer = { component: EnhancedMainContainer };
      overrides.pagination = { component: EnhancedPagination };
      overrides.alert = { component: EnhancedAlert };
    }

    if (enableModalOverrides) {
      overrides.menuModal = { component: FrostedMenuModal };
      overrides.participantsModal = { component: NeonParticipantsModal };
      overrides.confirmExitModal = { component: SoftConfirmExitModal };
      // overrides.screenboardModal = { component: SlateScreenboardModal }; // Not available
    }

    if (enableAudioComponentOverrides) {
      overrides.miniAudio = { component: ShowcaseMiniAudio };
      overrides.miniAudioPlayer = { component: ShowcaseMiniAudioPlayer };
    }

    return Object.keys(overrides).length > 0 ? overrides : undefined;
  }, []);

  const containerStyle = enableContainerStyling
    ? {
        background: 'linear-gradient(135deg, #f9fafb 0%, #e0f2fe 45%, #ede9fe 100%)',
        borderRadius: 32,
        padding: '12px 12px 24px',
        boxShadow: '0 18px 48px rgba(15, 23, 42, 0.18)',
      }
    : undefined;

  const ExperienceComponent = experienceComponentMap[selectedExperience];

  const preJoinRenderer = showPrebuiltUI
    ? (options: React.ComponentProps<typeof PreJoinPage>) => <PreJoinPage {...options} />
    : undefined;

  const customComponent = enableFullCustomUI ? CustomWorkspace : undefined;

  return (
      <ExperienceComponent
        PrejoinPage={preJoinRenderer}
        localLink={localLink}
        connectMediaSFU={connectMediaSFU}
        credentials={credentials}
        // returnUI={!enableFullCustomUI && showPrebuiltUI}
        // noUIPreJoinOptions={noUIPreJoinOptions}
        // sourceParameters={sourceParameters}
        // updateSourceParameters={updateSourceParameters}
        // customComponent={customComponent}
        // containerStyle={containerStyle}
        uiOverrides={uiOverrides}
        // createMediaSFURoom={enableBackendProxyHooks ? createRoomOnMediaSFU : undefined}
        // joinMediaSFURoom={enableBackendProxyHooks ? joinRoomOnMediaSFU : undefined}
        {...cardOverrides}
      />

  );
};

export default AppUnique;
