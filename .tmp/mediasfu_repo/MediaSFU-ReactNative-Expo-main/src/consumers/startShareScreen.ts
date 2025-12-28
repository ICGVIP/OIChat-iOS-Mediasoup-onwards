import { StreamSuccessScreenType, StreamSuccessScreenParameters, ShowAlert, MediaDevices as RNMediaDevices} from '../@types/types';


export interface StartShareScreenParameters extends StreamSuccessScreenParameters {
  shared: boolean;
  showAlert?: ShowAlert;
  updateShared: (shared: boolean) => void;
  mediaDevices: MediaDevices | RNMediaDevices;
  onWeb: boolean;
  targetWidth?: number;
  targetHeight?: number;

  // mediasfu functions
  streamSuccessScreen: StreamSuccessScreenType;
  [key: string]: any;
}

export interface StartShareScreenOptions {
  parameters: StartShareScreenParameters;
}

// Export the type definition for the function
export type StartShareScreenType = (options: StartShareScreenOptions) => Promise<void>;

/**
 * Starts the screen sharing process.
 *
 * @param {StartShareScreenOptions} options - The options for starting screen sharing.
 * @param {Object} options.parameters - The parameters for screen sharing.
 * @param {boolean} options.parameters.shared - Indicates if the screen is currently being shared.
 * @param {Function} options.parameters.showAlert - Function to show alert messages.
 * @param {Function} options.parameters.updateShared - Function to update the shared state.
 * @param {MediaDevices} options.parameters.mediaDevices - The media devices available for screen sharing.
 * @param {boolean} options.parameters.onWeb - Indicates if the application is running on a web platform.
 * @param {number} [options.parameters.targetWidth] - The target width for screen sharing.
 * @param {number} [options.parameters.targetHeight] - The target height for screen sharing.
 * @param {Function} options.parameters.streamSuccessScreen - Function to handle successful screen sharing.
 * 
 * @returns {Promise<void>} A promise that resolves when the screen sharing process is complete.
 * 
 * @throws Will log an error message if there is an issue starting the screen share.
 *
 * @example
 * const options = {
 *   parameters: {
 *     shared: false,
 *     showAlert: showAlertFunction,
 *     updateShared: updateSharedFunction,
 *     mediaDevices: navigator.mediaDevices,
 *     onWeb: true,
 *     targetWidth: 1280,
 *     targetHeight: 720,
 *     streamSuccessScreen: streamSuccessFunction,
 *   },
 * };
 * 
 * startShareScreen(options)
 *   .then(() => {
 *     console.log('Screen sharing started successfully');
 *   })
 *   .catch(error => {
 *     console.error('Error starting screen share:', error);
 *   });
 */

export async function startShareScreen({ parameters }: StartShareScreenOptions): Promise<void> {
  let {
    shared,
    showAlert,
    updateShared,
    mediaDevices,
    onWeb,
    targetWidth = 1280,
    targetHeight = 720,

    streamSuccessScreen,
  } = parameters;

  try {
    if (!onWeb) {
      showAlert?.({
        message: 'You cannot share screen while on mobile',
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    if (mediaDevices && mediaDevices.getDisplayMedia) {
      shared = true;
      await mediaDevices
        .getDisplayMedia({
          video: {
            width: targetWidth,
            height: targetHeight,
            frameRate: 30,
          },
          audio: false,
        })
        .then(async (stream: any) => {
          await streamSuccessScreen({ stream, parameters });
        })
        .catch(async () => {
          shared = false;
          showAlert?.({
            message: 'Could not share screen, check and retry',
            type: 'danger',
            duration: 3000,
          });
        });
    } else {
      showAlert?.({
        message: 'Could not share screen, check and retry',
        type: 'danger',
        duration: 3000,
      });
    }

    // Update the shared variable
    updateShared(shared);
  } catch (error) {
    console.log('Error starting screen share', error);
  }
}
