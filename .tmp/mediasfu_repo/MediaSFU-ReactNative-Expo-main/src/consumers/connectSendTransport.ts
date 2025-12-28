import { ProducerOptions } from 'mediasoup-client/lib/types';
import {
  ConnectSendTransportAudioType, ConnectSendTransportVideoType, ConnectSendTransportScreenType, ConnectSendTransportAudioParameters, ConnectSendTransportVideoParameters, 
  ConnectSendTransportScreenParameters, MediaStream
} from '../@types/types';

export interface ConnectSendTransportParameters extends ConnectSendTransportAudioParameters, ConnectSendTransportVideoParameters, ConnectSendTransportScreenParameters {
  audioParams: ProducerOptions 
  videoParams: ProducerOptions;
  localStreamScreen: MediaStream | null;
  canvasStream: MediaStream | null;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  shared: boolean;
  islevel: string;

  //mediasfu functions
  connectSendTransportAudio: ConnectSendTransportAudioType;
  connectSendTransportVideo: ConnectSendTransportVideoType;
  connectSendTransportScreen: ConnectSendTransportScreenType;

  getUpdatedAllParams: () => ConnectSendTransportParameters;
  [key: string]: any;
}

export interface ConnectSendTransportOptions {
  option: 'audio' | 'video' | 'screen' | 'all';
  targetOption?: 'local' | 'remote' | 'all';
  parameters: ConnectSendTransportParameters;
}

// Export the type definition for the function
export type ConnectSendTransportType = (options: ConnectSendTransportOptions) => Promise<void>;

/**
 * Connects the send transport based on the specified option.
 *
 * @param {ConnectSendTransportOptions} options - The options for connecting the send transport.
 * @param {string} options.option - The type of transport to connect ('audio', 'video', 'screen', or 'all').
 * @param {boolean} options.targetOption - The target option to connect ('local', 'remote', or 'all').
 * @param {ConnectSendTransportParameters} options.parameters - The parameters required for connecting the transport.
 * @param {ProducerOptions} options.parameters.audioParams - The audio parameters.
 * @param {ProducerOptions} options.parameters.videoParams - The video parameters.
 * @param {MediaStream} options.parameters.localStreamScreen - The local screen stream.
 * @param {MediaStream} options.parameters.canvasStream - The canvas stream.
 * @param {boolean} options.parameters.whiteboardStarted - Indicates if the whiteboard has started.
 * @param {boolean} options.parameters.whiteboardEnded - Indicates if the whiteboard has ended.
 * @param {boolean} options.parameters.shared - Indicates if the screen is shared.
 * @param {string} options.parameters.islevel - The level of the screen sharing.
 * @param {Function} options.parameters.connectSendTransportAudio - Function to connect the audio send transport.
 * @param {Function} options.parameters.connectSendTransportVideo - Function to connect the video send transport.
 * @param {Function} options.parameters.connectSendTransportScreen - Function to connect the screen send transport.
 *
 * @returns {Promise<void>} A promise that resolves when the transport is connected.
 *
 * @throws Will throw an error if the connection fails.
 *
 * @example
 * const options = {
 *   option: 'audio',
 *   targetOption: 'local',
 *   parameters: {
 *     audioParams: audioProducerOptions,
 *     videoParams: videoProducerOptions,
 *     localStreamScreen: localStream,
 *     canvasStream: canvasStream,
 *     whiteboardStarted: false,
 *     whiteboardEnded: false,
 *     shared: false,
 *     islevel: '1',
 *     connectSendTransportAudio: connectAudioFunction,
 *     connectSendTransportVideo: connectVideoFunction,
 *     connectSendTransportScreen: connectScreenFunction,
 *   },
 * };
 * 
 * connectSendTransport(options)
 *   .then(() => {
 *     console.log('Transport connected successfully');
 *   })
 *   .catch((error) => {
 *     console.error('Error connecting transport:', error);
 *   });
 */

export const connectSendTransport = async ({ option, targetOption = 'all', parameters }: ConnectSendTransportOptions): Promise<void> => {
  try {
    let {
      audioParams,
      videoParams,
      localStreamScreen,
      canvasStream,
      whiteboardStarted,
      whiteboardEnded,
      shared,
      islevel,

      //media functions
      connectSendTransportAudio,
      connectSendTransportVideo,
      connectSendTransportScreen,
    } = parameters;

    // Connect send transport based on the specified option
    if (option === 'audio') {
      await connectSendTransportAudio({
        targetOption,
        audioParams,
        parameters,
      });
    } else if (option === 'video') {
      await connectSendTransportVideo({
        targetOption,
        videoParams,
        parameters,
      });
    } else if (option === 'screen') {
      if (
        whiteboardStarted &&
        !whiteboardEnded &&
        canvasStream &&
        islevel === '2' &&
        !shared
      ) {
        await connectSendTransportScreen({
          targetOption,
          stream: canvasStream,
          parameters,
        });
      } else {
        await connectSendTransportScreen({
          targetOption,
          stream: localStreamScreen!,
          parameters,
        });
      }
    } else {
      // Connect both audio and video send transports
      await connectSendTransportAudio({
        targetOption,
        audioParams,
        parameters,
      });
      await connectSendTransportVideo({
        targetOption,
        videoParams,
        parameters,
      });
    }
  } catch (error) {
    console.log('connectSendTransport error', error);
    // throw error;
  }
};
