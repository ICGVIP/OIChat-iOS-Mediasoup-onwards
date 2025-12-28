export interface LaunchBackgroundOptions {
  updateIsBackgroundModalVisible: (isVisible: boolean) => void;
  isBackgroundModalVisible: boolean;
}

// Export the type definition for the function
export type LaunchBackgroundType = (options: LaunchBackgroundOptions) => void;

/**
 * Toggles the visibility of the background modal.
 * @function
 * @param {Object} options - The options object containing necessary variables and functions.
 * @param {Function} options.updateIsBackgroundModalVisible - Function to update the visibility state of the background modal.
 * @param {boolean} options.isBackgroundModalVisible - Current visibility state of the background modal.
 *
 * @example
 * ```typescript
 * const backgroundOptions: LaunchBackgroundOptions = {
 *   updateIsBackgroundModalVisible: setBackgroundModalVisible,
 *   isBackgroundModalVisible: false,
 * };
 *
 * launchBackground(backgroundOptions);
 * ```
 */


export const launchBackground = ({
  updateIsBackgroundModalVisible,
  isBackgroundModalVisible,
}: LaunchBackgroundOptions): void => {
  /**
   * Toggle the visibility of the background modal.
   */
  updateIsBackgroundModalVisible(!isBackgroundModalVisible);
};
