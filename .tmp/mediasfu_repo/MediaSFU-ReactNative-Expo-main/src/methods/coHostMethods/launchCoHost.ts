export interface LaunchCoHostOptions {
  updateIsCoHostModalVisible: (isVisible: boolean) => void;
  isCoHostModalVisible: boolean;
}

// Export the type definition for the function
export type LaunchCoHostType = (options: LaunchCoHostOptions) => void;

/**
 * Toggles the visibility of the co-host modal.
 *
 * @param {Function} updateIsCoHostModalVisible - Function to update the visibility state of the co-host modal.
 * @param {boolean} isCoHostModalVisible - Current visibility state of the co-host modal.
 *
 * @example
 * ```typescript
 * const options: LaunchCoHostOptions = {
 *   updateIsCoHostModalVisible: setModalVisible,
 *   isCoHostModalVisible: false,
 * };
 *
 * launchCoHost(options);
 * // Toggles the co-host modal to visible.
 * ```
 */

export const launchCoHost = ({
  updateIsCoHostModalVisible,
  isCoHostModalVisible,
}: LaunchCoHostOptions): void => {
  // Open or close the co-host modal based on its current visibility state
  updateIsCoHostModalVisible(!isCoHostModalVisible);
};
