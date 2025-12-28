import React from 'react';
import MiniCard from '../components/displayComponents/MiniCard';
import VideoCard from '../components/displayComponents/VideoCard';
import AudioCard from '../components/displayComponents/AudioCard';
// import { RTCView } from "../methods/utils/webrtc/webrtc";

import {
  Participant, Stream, UpdateMiniCardsGridType, UpdateMiniCardsGridParameters, AudioCardParameters, EventType,
  MediaStream as MediaStreamType, CustomVideoCardType, CustomMiniCardType,
} from '../@types/types';

export interface AddVideosGridParameters extends UpdateMiniCardsGridParameters, AudioCardParameters {
  eventType: EventType;
  updateAddAltGrid: (addAltGrid: boolean) => void;
  ref_participants: Participant[];
  islevel: string;
  videoAlreadyOn: boolean;
  localStreamVideo: MediaStreamType | null;
  keepBackground: boolean;
  virtualStream: MediaStreamType | null;
  forceFullDisplay: boolean;
  otherGridStreams: JSX.Element[][];
  updateOtherGridStreams: (otherGridStreams: JSX.Element[][]) => void;

  // custom components
  customVideoCard?: CustomVideoCardType;
  customMiniCard?: CustomMiniCardType;
  videoCardComponent?: React.ComponentType<React.ComponentProps<typeof VideoCard>>;
  audioCardComponent?: React.ComponentType<React.ComponentProps<typeof AudioCard>>;
  miniCardComponent?: React.ComponentType<React.ComponentProps<typeof MiniCard>>;

  // mediasfu functions
  updateMiniCardsGrid: UpdateMiniCardsGridType;
  getUpdatedAllParams: () => AddVideosGridParameters;
  [key: string]: any;
}

export interface AddVideosGridOptions {
  mainGridStreams: (Stream | Participant)[];
  altGridStreams: (Stream | Participant)[];
  numtoadd: number;
  numRows: number;
  numCols: number;
  actualRows: number;
  lastrowcols: number;
  removeAltGrid: boolean;
  parameters: AddVideosGridParameters;
}

// Export the type definition for the function
export type AddVideosGridType = (options: AddVideosGridOptions) => Promise<void>;

/**
 * Adds participants to the main and alternate video grids based on the provided parameters.
 * 
 * This function populates video grids with participant cards, supporting both custom render functions
 * and component overrides for full UI customization. It uses a two-tier override system:
 * 1. Custom render functions (customVideoCard, customAudioCard, customMiniCard) - Full control via functions
 * 2. Component overrides (videoCardComponent, audioCardComponent, miniCardComponent) - Replace default components
 *
 * @function
 * @async
 * @param {AddVideosGridOptions} options - The options for adding videos to the grid.
 * @param {Array} options.mainGridStreams - The main grid streams containing participant or stream data.
 * @param {Array} options.altGridStreams - The alternate grid streams containing participant or stream data.
 * @param {number} options.numtoadd - The number of participants to add to the grid.
 * @param {number} options.numRows - The number of rows in the grid layout.
 * @param {number} options.numCols - The number of columns in the grid layout.
 * @param {number} options.actualRows - The actual number of rows currently filled in the grid.
 * @param {number} options.lastrowcols - The number of columns in the last row of the grid.
 * @param {boolean} options.removeAltGrid - Flag indicating whether to remove the alternate grid.
 * @param {AddVideosGridParameters} options.parameters - Additional parameters required for the function.
 * @param {string} options.parameters.eventType - The type of event (e.g., meeting, conference).
 * @param {Function} options.parameters.updateAddAltGrid - Callback to update the status of the alternate grid.
 * @param {Array} options.parameters.ref_participants - A reference list of participants.
 * @param {string} options.parameters.islevel - The participation level of the user.
 * @param {boolean} options.parameters.videoAlreadyOn - Indicates if video streaming is already active.
 * @param {MediaStream} options.parameters.localStreamVideo - The user's local video stream.
 * @param {boolean} options.parameters.keepBackground - Flag to determine if the background should be retained.
 * @param {MediaStream} options.parameters.virtualStream - The virtual stream to use.
 * @param {boolean} options.parameters.forceFullDisplay - Flag to enforce full display mode.
 * @param {Array} options.parameters.otherGridStreams - Additional streams for the grid.
 * @param {Function} options.parameters.updateOtherGridStreams - Callback to update other grid streams.
 * @param {Function} options.parameters.updateMiniCardsGrid - Callback to update the mini card display.
 * @param {Function} options.parameters.getUpdatedAllParams - Function to retrieve updated parameters.
 * 
 * **Custom UI & Component Overrides:**
 * @param {CustomVideoCardType} [options.parameters.customVideoCard] - Custom render function for video cards. 
 *   Receives props and returns JSX. Use for complete control over video card rendering.
 * @param {CustomAudioCardType} [options.parameters.customAudioCard] - Custom render function for audio cards.
 *   Receives props and returns JSX. Use for complete control over audio card rendering.
 * @param {CustomMiniCardType} [options.parameters.customMiniCard] - Custom render function for mini cards.
 *   Receives props and returns JSX. Use for complete control over mini card rendering.
 * @param {React.ComponentType} [options.parameters.videoCardComponent] - Component override for VideoCard.
 *   Replaces the default VideoCard component. Use when you want to replace the component but not control rendering.
 * @param {React.ComponentType} [options.parameters.audioCardComponent] - Component override for AudioCard.
 *   Replaces the default AudioCard component.
 * @param {React.ComponentType} [options.parameters.miniCardComponent] - Component override for MiniCard.
 *   Replaces the default MiniCard component.
 * 
 * @returns {Promise<void>} A promise that resolves when the grid has been updated successfully.
 *
 * @example
 * // Basic usage without customization
 * import { addVideosGrid } from 'mediasfu-reactnative-expo';
 *
 * await addVideosGrid({
 *   mainGridStreams: mainGridStreams,
 *   altGridStreams: altGridStreams,
 *   numtoadd: 4,
 *   numRows: 2,
 *   numCols: 2,
 *   actualRows: 2,
 *   lastrowcols: 2,
 *   removeAltGrid: false,
 *   parameters: {
 *     eventType: 'conference',
 *     videoAlreadyOn: true,
 *     // ... other required parameters
 *   },
 * });
 *
 * @example
 * // Using custom render function for complete control
 * import { addVideosGrid } from 'mediasfu-reactnative-expo';
 * 
 * const CustomVideoCard = ({ participant, videoStream, showControls }) => (
 *   <View style={{ border: '2px solid blue' }}>
 *     <Text>{participant.name}</Text>
 *     {/* Your custom video rendering logic *\/}
 *   </View>
 * );
 *
 * await addVideosGrid({
 *   mainGridStreams: streams,
 *   altGridStreams: [],
 *   numtoadd: 4,
 *   numRows: 2,
 *   numCols: 2,
 *   actualRows: 2,
 *   lastrowcols: 2,
 *   removeAltGrid: false,
 *   parameters: {
 *     customVideoCard: CustomVideoCard, // Custom render function
 *     eventType: 'conference',
 *     // ... other parameters
 *   },
 * });
 *
 * @example
 * // Using component override to replace default component
 * import { addVideosGrid } from 'mediasfu-reactnative-expo';
 * import { MyCustomVideoCard } from './MyCustomVideoCard';
 *
 * await addVideosGrid({
 *   mainGridStreams: streams,
 *   altGridStreams: [],
 *   numtoadd: 4,
 *   numRows: 2,
 *   numCols: 2,
 *   actualRows: 2,
 *   lastrowcols: 2,
 *   removeAltGrid: false,
 *   parameters: {
 *     videoCardComponent: MyCustomVideoCard, // Component override
 *     audioCardComponent: MyCustomAudioCard,
 *     miniCardComponent: MyCustomMiniCard,
 *     eventType: 'conference',
 *     // ... other parameters
 *   },
 * });
 */


export async function addVideosGrid({
  mainGridStreams,
  altGridStreams,
  numtoadd,
  numRows,
  numCols,
  actualRows,
  lastrowcols,
  removeAltGrid,
  parameters,
}: AddVideosGridOptions): Promise<void> {
  const { getUpdatedAllParams } = parameters;
  parameters = getUpdatedAllParams();

  const {
    eventType,
    updateAddAltGrid,
    ref_participants,
    islevel,
    videoAlreadyOn,
    localStreamVideo,
    keepBackground,
    virtualStream,
    forceFullDisplay,
    otherGridStreams,
    updateOtherGridStreams,
    updateMiniCardsGrid,
    customVideoCard,
    customMiniCard,
    videoCardComponent,
    audioCardComponent,
    miniCardComponent,
  } = parameters;

  // Create component overrides with fallbacks
  const VideoCardComponentToUse = videoCardComponent ?? VideoCard;
  const AudioCardComponentToUse = audioCardComponent ?? AudioCard;
  const MiniCardComponentToUse = miniCardComponent ?? MiniCard;

  // Helper functions to build cards with proper override handling
  const buildVideoCard = ({
    key,
    videoStream,
    remoteProducerId = '',
    eventType: cardEventType,
    forceFullDisplay: cardForceFullDisplay = false,
    customStyle,
    participant: cardParticipant,
    backgroundColor,
    showControls = false,
    showInfo = true,
    name = '',
    doMirror = false,
  }: {
    key: string;
    videoStream: MediaStreamType | null;
    remoteProducerId?: string;
    eventType: EventType;
    forceFullDisplay?: boolean;
    customStyle?: any;
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
      <VideoCardComponentToUse
        key={key}
        videoStream={videoStream}
        remoteProducerId={remoteProducerId}
        eventType={cardEventType}
        forceFullDisplay={cardForceFullDisplay}
        customStyle={customStyle}
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
    barColor = 'red',
    textColor = 'white',
    customStyle,
    roundedImage = true,
    backgroundColor = 'transparent',
    showControls = false,
    participant: cardParticipant,
  }: {
    key: string;
    name: string;
    barColor?: string;
    textColor?: string;
    customStyle?: any;
    roundedImage?: boolean;
    backgroundColor?: string;
    showControls?: boolean;
    participant: Participant;
  }) => {
    return (
      <AudioCardComponentToUse
        key={key}
        name={name}
        barColor={barColor}
        textColor={textColor}
        customStyle={customStyle}
        controlsPosition="topLeft"
        infoPosition="topRight"
        roundedImage={roundedImage}
        parameters={parameters}
        backgroundColor={backgroundColor}
        showControls={showControls}
        participant={cardParticipant}
      />
    );
  };

  const buildMiniCard = ({
    key,
    initials,
    fontSize = 20,
    customStyle,
  }: {
    key: string;
    initials: string;
    fontSize?: number;
    customStyle?: any;
  }) => {
    if (customMiniCard) {
      return React.createElement(customMiniCard as any, {
        key,
        initials,
        fontSize: `${fontSize}px`,
        name: initials,
        showVideoIcon: false,
        showAudioIcon: false,
        imageSource: '',
        roundedImage: true,
        imageStyle: {},
        parameters,
      });
    }

    return (
      <MiniCardComponentToUse
        key={key}
        initials={initials}
        fontSize={fontSize}
        customStyle={customStyle}
      />
    );
  };

  const newComponents: JSX.Element[][] = [[], []];
  let participant: any;
  let remoteProducerId: string = '';

  numtoadd = mainGridStreams.length;

  if (removeAltGrid) {
    updateAddAltGrid(false);
  }

  // Add participants to the main grid
  for (let i = 0; i < numtoadd; i++) {
    participant = mainGridStreams[i];
    remoteProducerId = participant.producerId;

    const pseudoName = !remoteProducerId || remoteProducerId === '';

    if (pseudoName) {
      remoteProducerId = participant.name;

      if (participant.audioID) {
        newComponents[0].push(
          buildAudioCard({
            key: `audio-${participant.id}`,
            name: participant.name || '',
            barColor: 'red',
            textColor: 'white',
            customStyle: {
              backgroundColor: 'transparent',
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            },
            roundedImage: true,
            backgroundColor: 'transparent',
            showControls: eventType !== 'chat',
            participant: participant,
          }),
        );
      } else {
        newComponents[0].push(
          buildMiniCard({
            key: `mini-${participant.id}`,
            initials: participant.name,
            fontSize: 20,
            customStyle: {
              backgroundColor: 'transparent',
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            },
          }),
        );
      }
    } else if (remoteProducerId === 'youyou' || remoteProducerId === 'youyouyou') {
      let name = 'You';
      if (islevel === '2' && eventType !== 'chat') {
        name = 'You (Host)';
      }

      if (!videoAlreadyOn) {
        newComponents[0].push(
          buildMiniCard({
            key: 'mini-you',
            initials: name,
            fontSize: 20,
            customStyle: {
              backgroundColor: 'transparent',
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            },
          }),
        );
      } else {
        participant = {
          id: 'youyouyou',
          stream:
              keepBackground && virtualStream
                ? virtualStream
                : localStreamVideo,
          name: 'youyouyou',
        };

        newComponents[0].push(
          buildVideoCard({
            key: 'video-you',
            videoStream: participant.stream,
            remoteProducerId: participant.stream?.id || '',
            eventType: eventType,
            forceFullDisplay: eventType === 'webinar' ? false : forceFullDisplay,
            customStyle: {
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            },
            participant: participant,
            backgroundColor: 'transparent',
            showControls: false,
            showInfo: false,
            name: participant.name,
            doMirror: true,
          }),
        );
      }
    } else {
      const participant_ = ref_participants.find(
        (obj: Participant) => obj.videoID === remoteProducerId,
      );
      if (participant_) {
        newComponents[0].push(
          buildVideoCard({
            key: `video-${participant_.id}`,
            videoStream: participant.stream,
            remoteProducerId: remoteProducerId || '',
            eventType: eventType,
            forceFullDisplay: forceFullDisplay,
            customStyle: {
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            },
            participant: participant_,
            backgroundColor: 'transparent',
            showControls: eventType !== 'chat',
            showInfo: true,
            name: participant_.name || '',
            doMirror: false,
          }),
        );
      }
    }

    if (i === numtoadd - 1) {
      otherGridStreams[0] = newComponents[0];

      await updateMiniCardsGrid({
        rows: numRows,
        cols: numCols,
        defal: true,
        actualRows,
        parameters,
      });

      updateOtherGridStreams(otherGridStreams);

      await updateMiniCardsGrid({
        rows: numRows,
        cols: numCols,
        defal: true,
        actualRows,
        parameters,
      });
    }
  }

  // Handle the alternate grid streams
  if (!removeAltGrid) {
    for (let i = 0; i < altGridStreams.length; i++) {
      participant = altGridStreams[i];
      remoteProducerId = participant.producerId;

      const pseudoName = !remoteProducerId || remoteProducerId === '';

      if (pseudoName) {
        if (participant.audioID) {
          newComponents[1].push(
            buildAudioCard({
              key: `audio-alt-${participant.id}`,
              name: participant.name,
              barColor: 'red',
              textColor: 'white',
              customStyle: {
                backgroundColor: 'transparent',
                borderWidth: eventType !== 'broadcast' ? 2 : 0,
                borderColor: 'black',
              },
              roundedImage: true,
              backgroundColor: 'transparent',
              showControls: eventType !== 'chat',
              participant: participant,
            }),
          );
        } else {
          newComponents[1].push(
            buildMiniCard({
              key: `mini-alt-${participant.id}`,
              initials: participant.name,
              fontSize: 20,
              customStyle: {
                backgroundColor: 'transparent',
                borderWidth: eventType !== 'broadcast' ? 2 : 0,
                borderColor: 'black',
              },
            }),
          );
        }
      } else {
        const participant_ = ref_participants.find(
          (obj: Participant) => obj.videoID === remoteProducerId,
        );
        if (participant_) {
          newComponents[1].push(
            buildVideoCard({
              key: `video-alt-${participant_.id}`,
              videoStream: participant.stream,
              remoteProducerId: remoteProducerId || '',
              eventType: eventType,
              forceFullDisplay: forceFullDisplay,
              customStyle: {
                borderWidth: eventType !== 'broadcast' ? 2 : 0,
                borderColor: 'black',
              },
              participant: participant_,
              backgroundColor: 'transparent',
              showControls: eventType !== 'chat',
              showInfo: true,
              name: participant.name,
              doMirror: false,
            }),
          );
        }
      }

      if (i === altGridStreams.length - 1) {
        otherGridStreams[1] = newComponents[1];

        await updateMiniCardsGrid({
          rows: 1,
          cols: lastrowcols,
          defal: false,
          actualRows,
          parameters,
        });

        updateOtherGridStreams(otherGridStreams);

        await updateMiniCardsGrid({
          rows: numRows,
          cols: numCols,
          defal: true,
          actualRows,
          parameters,
        });
      }
    }
  } else {
    updateAddAltGrid(false);
    otherGridStreams[1] = [];

    await updateMiniCardsGrid({
      rows: 0,
      cols: 0,
      defal: false,
      actualRows,
      parameters,
    });

    updateOtherGridStreams(otherGridStreams);

    await updateMiniCardsGrid({
      rows: numRows,
      cols: numCols,
      defal: true,
      actualRows,
      parameters,
    });
  }
}
