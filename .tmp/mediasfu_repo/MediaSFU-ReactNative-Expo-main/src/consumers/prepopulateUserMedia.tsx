import React from 'react';
import MiniCard from '../components/displayComponents/MiniCard';
import VideoCard from '../components/displayComponents/VideoCard';
import AudioCard from '../components/displayComponents/AudioCard';
// import { RTCView } from "../methods/utils/webrtc/webrtc";
import {
  Participant, Stream, AudioCardParameters, EventType,
  CustomVideoCardType, CustomAudioCardType, CustomMiniCardType,
} from '../@types/types';
import type { MediaStream } from '../@types/types';

export interface PrepopulateUserMediaParameters extends AudioCardParameters {

  participants: Participant[];
  allVideoStreams: (Stream | Participant)[];
  islevel: string;
  member: string;
  shared: boolean;
  shareScreenStarted: boolean;
  eventType: EventType;
  screenId?: string;
  forceFullDisplay: boolean;
  updateMainWindow: boolean;
  mainScreenFilled: boolean;
  adminOnMainScreen: boolean;
  mainScreenPerson: string;
  videoAlreadyOn: boolean;
  audioAlreadyOn: boolean;
  oldAllStreams: (Stream | Participant)[];
  checkOrientation: () => string;
  screenForceFullDisplay: boolean;
  localStreamScreen: MediaStream | null;
  remoteScreenStream: Stream[];
  localStreamVideo: MediaStream | null;
  mainHeightWidth: number;
  isWideScreen: boolean;
  localUIMode: boolean;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  virtualStream: MediaStream | null;
  keepBackground: boolean;
  annotateScreenStream: boolean;
  updateMainScreenPerson: (person: string) => void;
  updateMainScreenFilled: (filled: boolean) => void;
  updateAdminOnMainScreen: (admin: boolean) => void;
  updateMainHeightWidth: (heightWidth: number) => void;
  updateScreenForceFullDisplay: (force: boolean) => void;
  updateUpdateMainWindow: (update: boolean) => void;
  updateMainGridStream: (components: JSX.Element[]) => void;

  // custom components
  customVideoCard?: CustomVideoCardType;
  customAudioCard?: CustomAudioCardType;
  customMiniCard?: CustomMiniCardType;

  // Override-provided component references
  videoCardComponent?: React.ComponentType<React.ComponentProps<typeof VideoCard>>;
  audioCardComponent?: React.ComponentType<React.ComponentProps<typeof AudioCard>>;
  miniCardComponent?: React.ComponentType<React.ComponentProps<typeof MiniCard>>;

  // mediasfu functions
  getUpdatedAllParams: () => PrepopulateUserMediaParameters;
  [key: string]: any;
}

export interface PrepopulateUserMediaOptions {
  name: string;
  parameters: PrepopulateUserMediaParameters;
}

// Export the type definition for the function
export type PrepopulateUserMediaType = (options: PrepopulateUserMediaOptions) => Promise<JSX.Element[] | void>;

/**
 * Populates the main screen grid with participant video/audio cards based on current streams and settings.
 * 
 * This function is responsible for rendering the main user media grid, supporting both custom render functions
 * and component overrides for comprehensive UI customization. It implements a two-tier override system:
 * 1. Custom render functions (customVideoCard, customAudioCard, customMiniCard) - Full rendering control
 * 2. Component overrides (videoCardComponent, audioCardComponent, miniCardComponent) - Component replacement
 *
 * The function intelligently determines which type of card to display (video, audio, or mini) based on
 * participant media state and event configuration, then uses helper functions to properly invoke custom
 * render functions or render component overrides.
 *
 * @function
 * @async
 * @param {PrepopulateUserMediaOptions} options - The options for populating user media.
 * @param {string} options.name - The name identifier for the operation.
 * @param {PrepopulateUserMediaParameters} options.parameters - Configuration and state parameters.
 * @param {Array<Participant>} options.parameters.participants - List of all participants in the session.
 * @param {Array<Stream|Participant>} options.parameters.allVideoStreams - All available video streams.
 * @param {string} options.parameters.islevel - The user's participation level ('0', '1', '2').
 * @param {string} options.parameters.member - The current user's name/identifier.
 * @param {boolean} options.parameters.shared - Whether screen sharing is active.
 * @param {boolean} options.parameters.shareScreenStarted - Whether screen share has been initiated.
 * @param {EventType} options.parameters.eventType - Type of event ('chat', 'broadcast', 'conference', 'webinar').
 * @param {string} [options.parameters.screenId] - ID of the screen sharing participant.
 * @param {boolean} options.parameters.forceFullDisplay - Force full screen display mode.
 * @param {boolean} options.parameters.updateMainWindow - Whether to update the main window.
 * @param {boolean} options.parameters.mainScreenFilled - Whether main screen is occupied.
 * @param {boolean} options.parameters.adminOnMainScreen - Whether admin is on main screen.
 * @param {string} options.parameters.mainScreenPerson - Name of person on main screen.
 * @param {boolean} options.parameters.videoAlreadyOn - Whether user's video is active.
 * @param {boolean} options.parameters.audioAlreadyOn - Whether user's audio is active.
 * @param {Array<Stream|Participant>} options.parameters.oldAllStreams - Previous stream state for comparison.
 * @param {Function} options.parameters.checkOrientation - Function to check device orientation.
 * @param {boolean} options.parameters.screenForceFullDisplay - Force full display for screen share.
 * @param {MediaStream|null} options.parameters.localStreamScreen - Local screen share stream.
 * @param {Array<Stream>} options.parameters.remoteScreenStream - Remote screen share streams.
 * @param {MediaStream|null} options.parameters.localStreamVideo - Local video stream.
 * @param {number} options.parameters.mainHeightWidth - Main screen height/width value.
 * @param {boolean} options.parameters.isWideScreen - Whether display is wide screen.
 * @param {boolean} options.parameters.localUIMode - Whether in local UI development mode.
 * @param {boolean} options.parameters.whiteboardStarted - Whether whiteboard is active.
 * @param {boolean} options.parameters.whiteboardEnded - Whether whiteboard has ended.
 * @param {MediaStream|null} options.parameters.virtualStream - Virtual background stream.
 * @param {boolean} options.parameters.keepBackground - Whether to keep virtual background.
 * @param {boolean} options.parameters.annotateScreenStream - Whether screen annotation is active.
 * 
 * **Custom UI & Component Overrides:**
 * @param {CustomVideoCardType} [options.parameters.customVideoCard] - Custom render function for video cards.
 *   This function receives all video card props and should return a React element. Use React.createElement
 *   internally to invoke this function with proper props.
 *   @example
 *   const customVideoCard = ({ participant, videoStream, showControls }) => (
 *     <View><Text>{participant.name}</Text></View>
 *   );
 * 
 * @param {CustomAudioCardType} [options.parameters.customAudioCard] - Custom render function for audio cards.
 *   Receives audio card props and returns a React element for audio-only participants.
 *   @example
 *   const customAudioCard = ({ participant, showWaveform }) => (
 *     <View><Text>🎤 {participant.name}</Text></View>
 *   );
 * 
 * @param {CustomMiniCardType} [options.parameters.customMiniCard] - Custom render function for mini cards.
 *   Receives mini card props and returns a React element for minimized participant views.
 *   @example
 *   const customMiniCard = ({ participant }) => (
 *     <View style={{ width: 50, height: 50 }}><Text>{participant.name[0]}</Text></View>
 *   );
 * 
 * @param {React.ComponentType} [options.parameters.videoCardComponent] - Component override for VideoCard.
 *   Replaces the default VideoCard component entirely. The component receives the same props as VideoCard.
 *   @example
 *   import { MyCustomVideoCard } from './components/MyCustomVideoCard';
 *   // Pass: videoCardComponent: MyCustomVideoCard
 * 
 * @param {React.ComponentType} [options.parameters.audioCardComponent] - Component override for AudioCard.
 *   Replaces the default AudioCard component entirely.
 * 
 * @param {React.ComponentType} [options.parameters.miniCardComponent] - Component override for MiniCard.
 *   Replaces the default MiniCard component entirely.
 *
 * @param {Function} options.parameters.updateMainScreenPerson - Callback to update main screen person.
 * @param {Function} options.parameters.updateMainScreenFilled - Callback to update main screen filled state.
 * @param {Function} options.parameters.updateAdminOnMainScreen - Callback to update admin on main screen state.
 * @param {Function} options.parameters.updateMainHeightWidth - Callback to update main screen dimensions.
 * @param {Function} options.parameters.updateScreenForceFullDisplay - Callback to update screen force full display.
 * @param {Function} options.parameters.updateUpdateMainWindow - Callback to update main window state.
 * @param {Function} options.parameters.updateMainGridStream - Callback to update main grid with new components.
 * @param {Function} options.parameters.getUpdatedAllParams - Function to retrieve updated parameters.
 *
 * @returns {Promise<JSX.Element[]|void>} Array of React elements representing participant cards, or void.
 *
 * @throws {Error} Throws error if there's an issue processing streams or rendering components.
 *
 * @example
 * // Basic usage without customization
 * import { prepopulateUserMedia } from 'mediasfu-reactnative-expo';
 *
 * const components = await prepopulateUserMedia({
 *   name: 'mainGrid',
 *   parameters: {
 *     participants: allParticipants,
 *     allVideoStreams: videoStreams,
 *     eventType: 'conference',
 *     islevel: '2',
 *     member: 'John Doe',
 *     // ... other required parameters
 *   },
 * });
 *
 * @example
 * // Using custom render functions for full control
 * import { prepopulateUserMedia } from 'mediasfu-reactnative-expo';
 * 
 * const CustomVideo = ({ participant, videoStream }) => (
 *   <View style={{ borderWidth: 3, borderColor: 'gold' }}>
 *     <Text style={{ fontSize: 20 }}>{participant.name}</Text>
 *     {/* Custom video rendering *\/}
 *   </View>
 * );
 *
 * const components = await prepopulateUserMedia({
 *   name: 'mainGrid',
 *   parameters: {
 *     participants: allParticipants,
 *     customVideoCard: CustomVideo,
 *     customAudioCard: CustomAudio,
 *     customMiniCard: CustomMini,
 *     eventType: 'conference',
 *     // ... other parameters
 *   },
 * });
 *
 * @example
 * // Using component overrides to replace defaults
 * import { prepopulateUserMedia } from 'mediasfu-reactnative-expo';
 * import { MyVideoCard, MyAudioCard, MyMiniCard } from './custom-components';
 *
 * const components = await prepopulateUserMedia({
 *   name: 'mainGrid',
 *   parameters: {
 *     participants: allParticipants,
 *     videoCardComponent: MyVideoCard,
 *     audioCardComponent: MyAudioCard,
 *     miniCardComponent: MyMiniCard,
 *     eventType: 'webinar',
 *     // ... other parameters
 *   },
 * });
 *
 * @example
 *     remoteScreenStream: [],
 *     oldAllStreams: [],
 *     newLimitedStreams: [],
 *     sleep: sleepFunction,
 *     getUpdatedAllParams: () => parameters,
 *   },
 * });
 * ```
 */

export async function prepopulateUserMedia({
  name,
  parameters,
}: PrepopulateUserMediaOptions): Promise<JSX.Element[] | void> {
  try {
    // Destructure parameters

    const { getUpdatedAllParams } = parameters;
    parameters = getUpdatedAllParams();

    let {
      participants,
      allVideoStreams,
      islevel,
      member,
      shared,
      shareScreenStarted,
      eventType,
      screenId,
      forceFullDisplay,
      updateMainWindow,
      mainScreenFilled,
      adminOnMainScreen,
      mainScreenPerson,
      videoAlreadyOn,
      audioAlreadyOn,
      oldAllStreams,
      checkOrientation,
      screenForceFullDisplay,

      localStreamScreen,
      remoteScreenStream,
      localStreamVideo,
      mainHeightWidth,
      isWideScreen,
      localUIMode,
      whiteboardStarted,
      whiteboardEnded,

      virtualStream,
      keepBackground,
      annotateScreenStream,

      updateMainScreenPerson,
      updateMainScreenFilled,
      updateAdminOnMainScreen,
      updateMainHeightWidth,
      updateScreenForceFullDisplay,
      updateUpdateMainWindow,
      updateMainGridStream,

      customVideoCard,
      customAudioCard,
      customMiniCard,
      videoCardComponent,
      audioCardComponent,
      miniCardComponent,
    } = parameters;

    const VideoCardComponentOverride =
      (videoCardComponent ?? VideoCard) as React.ComponentType<React.ComponentProps<typeof VideoCard>>;
    const AudioCardComponentOverride =
      (audioCardComponent ?? AudioCard) as React.ComponentType<React.ComponentProps<typeof AudioCard>>;
    const MiniCardComponentOverride =
      (miniCardComponent ?? MiniCard) as React.ComponentType<React.ComponentProps<typeof MiniCard>>;

    const buildVideoCard = ({
      key,
      videoStream,
      remoteProducerId = "",
      eventType: cardEventType,
      forceFullDisplay: cardForceFullDisplay = false,
      customStyle,
      participant: cardParticipant,
      backgroundColor,
      showControls = false,
      showInfo = true,
      name = "",
      doMirror = false,
    }: {
      key: string;
      videoStream: MediaStream | null;
      remoteProducerId?: string;
      eventType: EventType;
      forceFullDisplay?: boolean;
      customStyle?: React.CSSProperties;
      participant: Participant;
      backgroundColor?: string;
      showControls?: boolean;
      showInfo?: boolean;
      name?: string;
      doMirror?: boolean;
    }) => {
      if (customVideoCard) {
        return React.createElement(customVideoCard as any, {
          key,
          videoStream: videoStream || new MediaStream(),
          remoteProducerId,
          eventType: cardEventType,
          forceFullDisplay: cardForceFullDisplay,
          customStyle,
          participant: cardParticipant,
          backgroundColor,
          showControls,
          showInfo,
          name,
          doMirror,
          parameters,
        });
      }

      return (
        <VideoCardComponentOverride
          key={key}
          videoStream={videoStream}
          remoteProducerId={remoteProducerId}
          eventType={cardEventType}
          forceFullDisplay={cardForceFullDisplay}
          customStyle={customStyle as any}
          participant={cardParticipant}
          backgroundColor={backgroundColor}
          showControls={showControls}
          showInfo={showInfo}
          name={name}
          doMirror={doMirror}
          parameters={parameters}
        />
      );
    };

    const buildAudioCard = ({
      key,
      name,
      barColor = "red",
      textColor = "white",
      customStyle,
      roundedImage = true,
      backgroundColor = "transparent",
      participant: cardParticipant,
    }: {
      key: string;
      name: string;
      barColor?: string;
      textColor?: string;
      customStyle?: React.CSSProperties;
      roundedImage?: boolean;
      backgroundColor?: string;
      participant: Participant;
    }) => {
      if (customAudioCard) {
        return React.createElement(customAudioCard as any, {
          key,
          name,
          barColor,
          textColor,
          imageSource: "",
          roundedImage,
          imageStyle: {},
          parameters,
        });
      }

      return (
        <AudioCardComponentOverride
          key={key}
          name={name}
          barColor={barColor}
          textColor={textColor}
          customStyle={customStyle as any}
          controlsPosition="topLeft"
          infoPosition="topRight"
          roundedImage={roundedImage}
          parameters={parameters}
          showControls={false}
          backgroundColor={backgroundColor}
          participant={cardParticipant}
        />
      );
    };

    const buildMiniCard = ({
      key,
      initials,
      fontSize = 20,
      borderColor,
    }: {
      key: string;
      initials: string;
      fontSize?: number;
      borderColor?: string;
    }) => {
      if (customMiniCard) {
        return React.createElement(customMiniCard as any, {
          key,
          initials,
          fontSize: `${fontSize}px`,
          name: initials,
          showVideoIcon: false,
          showAudioIcon: false,
          imageSource: "",
          roundedImage: true,
          imageStyle: {},
          parameters,
        });
      }

      return (
        <MiniCardComponentOverride
          key={key}
          initials={initials}
          fontSize={fontSize}
          customStyle={{
            backgroundColor: "transparent",
            borderColor: borderColor,
          } as any}
        />
      );
    };

    // If the event type is 'chat', return early
    if (eventType == 'chat') {
      return;
    }

    // Initialize variables
    let host: Participant | null = null;
    let hostStream: any;
    const newComponent: JSX.Element[] = [];

    // Check if screen sharing is started or shared
    if (shareScreenStarted || shared) {
      // Handle main grid visibility based on the event type
      if (eventType == 'conference') {
        if (shared || shareScreenStarted) {
          if (mainHeightWidth == 0) {
            // Add the main grid if not present
            updateMainHeightWidth(84);
          }
        } else {
          // Remove the main grid if not shared or started
          updateMainHeightWidth(0);
        }
      }

      // Switch display to optimize for screen share
      screenForceFullDisplay = forceFullDisplay;

      updateScreenForceFullDisplay(screenForceFullDisplay);

      // Get the orientation and adjust forceFullDisplay
      const orientation = checkOrientation();
      if (orientation == 'portrait' || !isWideScreen) {
        if (shareScreenStarted || shared) {
          screenForceFullDisplay = false;
          updateScreenForceFullDisplay(screenForceFullDisplay);
        }
      }

      // Check if the user is sharing the screen
      if (shared) {
        // User is sharing
        host = { name: member, audioID: '', videoID: '' };
        hostStream = localStreamScreen;

        // Update admin on the main screen
        adminOnMainScreen = islevel == '2';
        updateAdminOnMainScreen(adminOnMainScreen);

        // Update main screen person
        mainScreenPerson = host!.name || '';
        updateMainScreenPerson(mainScreenPerson);
      } else {
        // someone else is sharing
        host = participants.find(
          (participant: Participant) => participant.ScreenID == screenId && participant.ScreenOn == true,
        ) ?? null;

        if (whiteboardStarted && !whiteboardEnded) {
          host = {
            name: 'WhiteboardActive', islevel: '2', audioID: '', videoID: '',
          };
          hostStream = { producerId: 'WhiteboardActive' };
        }

        if (host == null) {
          // remoteScreenStream
          host = participants.find(
            (participant: Participant) => participant.ScreenOn == true,
          ) ?? null;
        }

        // check remoteScreenStream
        if (host != null && !host?.name!.includes('WhiteboardActive')) {
          if (remoteScreenStream.length == 0) {
            hostStream = allVideoStreams.find(
              (stream: (Stream | Participant)) => stream.producerId == host?.ScreenID,
            ) ?? null;
          } else {
            hostStream = remoteScreenStream[0];
          }
        }

        // Update admin on the main screen
        adminOnMainScreen = (host && host.islevel == '2') ?? false;
        updateAdminOnMainScreen(adminOnMainScreen);

        // Update main screen person
        mainScreenPerson = host?.name ?? '';
        updateMainScreenPerson(mainScreenPerson);
      }
    } else {
      // Screen share not started
      if (eventType == 'conference') {
        // No main grid for conferences
        return;
      }

      // Find the host with level '2'
      host = participants.find((participant: Participant) => participant.islevel == '2') ?? null;

      // Update main screen person
      mainScreenPerson = host?.name ?? '';
      updateMainScreenPerson(mainScreenPerson);
    }

    // If host is not null, check if host videoIsOn
    if (host) {
      // Populate the main screen with the host video
      if (shareScreenStarted || shared) {
        forceFullDisplay = screenForceFullDisplay;
        if (whiteboardStarted && !whiteboardEnded) {
          // Whiteboard is active
        } else {
          newComponent.push(
            buildVideoCard({
              key: host.ScreenID!,
              videoStream: shared ? hostStream : hostStream!.stream ?? null,
              remoteProducerId: host.ScreenID!,
              eventType: eventType,
              forceFullDisplay: annotateScreenStream && shared ? false : forceFullDisplay,
              customStyle: {
                borderWidth: eventType !== 'broadcast' ? 2 : 0,
                borderColor: 'black',
              },
              participant: host,
              backgroundColor: "rgba(217, 227, 234, 0.99)",
              showControls: false,
              showInfo: true,
              name: host.name || '',
              doMirror: false,
            }),
          );
        }

        updateMainGridStream(newComponent);

        mainScreenFilled = true;
        updateMainScreenFilled(mainScreenFilled);
        adminOnMainScreen = host.islevel == '2';
        updateAdminOnMainScreen(adminOnMainScreen);
        mainScreenPerson = host.name ?? '';
        updateMainScreenPerson(mainScreenPerson);

        return newComponent;
      }

      // Check if video is already on or not
      if (
        (islevel != '2' && !host.videoOn)
        || (islevel == '2' && (!host.videoOn || !videoAlreadyOn))
        || localUIMode == true
      ) {
        // Video is off
        if (islevel == '2' && videoAlreadyOn) {
          // Admin's video is on
          newComponent.push(
            buildVideoCard({
              key: host.videoID!,
              videoStream: keepBackground && virtualStream
                ? virtualStream
                : localStreamVideo!,
              remoteProducerId: host.videoID || '',
              eventType: eventType,
              forceFullDisplay: forceFullDisplay,
              customStyle: {
                borderWidth: eventType !== 'broadcast' ? 2 : 0,
                borderColor: 'black',
              },
              participant: host,
              backgroundColor: "rgba(217, 227, 234, 0.99)",
              showControls: false,
              showInfo: true,
              name: host.name || '',
              doMirror: true,
            }),
          );

          updateMainGridStream(newComponent);

          mainScreenFilled = true;
          updateMainScreenFilled(mainScreenFilled);
          adminOnMainScreen = true;
          updateAdminOnMainScreen(adminOnMainScreen);
          mainScreenPerson = host.name ?? '';
          updateMainScreenPerson(mainScreenPerson);
        } else {
          // Video is off and not admin
          let audOn;

          if (islevel == '2' && audioAlreadyOn) {
            audOn = true;
          } else if (host != null && islevel != '2') {
            audOn = host.muted == false;
          }

          if (audOn) {
            // Audio is on
            try {
              newComponent.push(
                buildAudioCard({
                  key: host.name!,
                  name: host.name || '',
                  barColor: "red",
                  textColor: "white",
                  customStyle: {
                    backgroundColor: 'transparent',
                    borderWidth: eventType !== 'broadcast' ? 2 : 0,
                    borderColor: 'black',
                  },
                  roundedImage: true,
                  backgroundColor: "transparent",
                  participant: host,
                }),
              );

              updateMainGridStream(newComponent);
            } catch {
              // Handle audio card creation error
            }

            mainScreenFilled = true;
            updateMainScreenFilled(mainScreenFilled);
            adminOnMainScreen = islevel == '2';
            updateAdminOnMainScreen(adminOnMainScreen);
            mainScreenPerson = host.name ?? '';
            updateMainScreenPerson(mainScreenPerson);
          } else {
            // Audio is off
            try {
              newComponent.push(
                buildMiniCard({
                  key: name,
                  initials: name,
                  fontSize: 20,
                  borderColor: eventType !== 'broadcast' ? 'black' : undefined,
                }),
              );

              updateMainGridStream(newComponent);
            } catch {
              // Handle mini card creation error
            }

            mainScreenFilled = false;
            updateMainScreenFilled(mainScreenFilled);
            adminOnMainScreen = islevel == '2';
            updateAdminOnMainScreen(adminOnMainScreen);
            mainScreenPerson = host.name ?? '';
            updateMainScreenPerson(mainScreenPerson);
          }
        }
      } else {
        // Video is on
        if (shareScreenStarted || shared) {
          // Screen share is on
          if (whiteboardStarted && !whiteboardEnded) {
            // Whiteboard is active
          } else {
            try {
              newComponent.push(
                buildVideoCard({
                  key: host.ScreenID!,
                  videoStream: shared ? hostStream : hostStream!.stream ?? null,
                  remoteProducerId: host.ScreenID!,
                  eventType: eventType,
                  forceFullDisplay: forceFullDisplay,
                  customStyle: {
                    borderWidth: eventType !== 'broadcast' ? 2 : 0,
                    borderColor: 'black',
                  },
                  participant: host,
                  backgroundColor: "rgba(217, 227, 234, 0.99)",
                  showControls: false,
                  showInfo: true,
                  name: host.name || '',
                  doMirror: false,
                }),
              );

              updateMainGridStream(newComponent);

              mainScreenFilled = true;
              updateMainScreenFilled(mainScreenFilled);
              adminOnMainScreen = host.islevel == '2';
              updateAdminOnMainScreen(adminOnMainScreen);
              mainScreenPerson = host.name ?? '';
              updateMainScreenPerson(mainScreenPerson);
            } catch {
              // Handle video card creation error
            }
          }
        } else {
          // Screen share is off
          let streame;
          if (islevel == '2') {
            host.stream = keepBackground && virtualStream
              ? virtualStream
              : localStreamVideo;
          } else {
            streame = oldAllStreams.find(
              (streame: (Stream|Participant)) => streame.producerId == host.videoID,
            );
            host.stream = streame && streame.stream;
          }

          try {
            if (host.stream) {
              newComponent.push(
                buildVideoCard({
                  key: host.videoID!,
                  videoStream: host.stream || null,
                  remoteProducerId: host.videoID || '',
                  eventType: eventType,
                  forceFullDisplay: forceFullDisplay,
                  customStyle: {
                    borderWidth: eventType !== 'broadcast' ? 2 : 0,
                    borderColor: 'black',
                  },
                  participant: host,
                  backgroundColor: "rgba(217, 227, 234, 0.99)",
                  showControls: false,
                  showInfo: true,
                  name: host.name || '',
                  doMirror: member == host.name,
                }),
              );

              updateMainGridStream(newComponent);
              mainScreenFilled = true;
              adminOnMainScreen = host.islevel == '2';
              mainScreenPerson = host.name ?? '';
            } else {
              newComponent.push(
                buildMiniCard({
                  key: name,
                  initials: name,
                  fontSize: 20,
                  borderColor: eventType !== 'broadcast' ? 'black' : undefined,
                }),
              );

              updateMainGridStream(newComponent);
              mainScreenFilled = false;
              adminOnMainScreen = islevel == '2';
              mainScreenPerson = host.name ?? '';
            }

            updateMainScreenFilled(mainScreenFilled);

            updateAdminOnMainScreen(adminOnMainScreen);

            updateMainScreenPerson(mainScreenPerson);
          } catch {
            // Handle video card creation error
          }
        }
      }
    } else {
      // Host is null, add a mini card
      try {
        newComponent.push(
          buildMiniCard({
            key: name,
            initials: name,
            fontSize: 20,
            borderColor: eventType !== 'broadcast' ? 'black' : undefined,
          }),
        );

        updateMainGridStream(newComponent);

        mainScreenFilled = false;
        adminOnMainScreen = false;
        mainScreenPerson = '';
        updateMainScreenFilled(mainScreenFilled);
        updateAdminOnMainScreen(adminOnMainScreen);
        updateMainScreenPerson(mainScreenPerson);
      } catch {
        // Handle mini card creation error
      }
    }

    updateMainWindow = false;
    updateUpdateMainWindow(updateMainWindow);

    return newComponent;
  } catch {
    // Handle errors during the process of preparing and populating the main screen
    // throw error;
  }
}
