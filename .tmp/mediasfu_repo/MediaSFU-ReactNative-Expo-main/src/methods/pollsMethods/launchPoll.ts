export interface LaunchPollOptions {
  updateIsPollModalVisible: (isVisible: boolean) => void;
  isPollModalVisible: boolean;
}

// Export the type definition for the function
export type LaunchPollType = (options: LaunchPollOptions) => void;

/**
 * Toggles the visibility of the poll modal.
 *
 * @param {LaunchPollOptions} options - The options for toggling the poll modal visibility.
 * @param {Function} options.updateIsPollModalVisible - Function to update the visibility state of the poll modal.
 * @param {boolean} options.isPollModalVisible - Current visibility state of the poll modal.
 *
 * @example
 * ```typescript
 * launchPoll({
 *   updateIsPollModalVisible: (visible) => setIsPollModalVisible(visible),
 *   isPollModalVisible: false,
 * });
 * ```
 */

export const launchPoll = ({
  updateIsPollModalVisible,
  isPollModalVisible,
}: LaunchPollOptions): void => {
  /**
   * Toggle the visibility of the poll modal.
   */
  updateIsPollModalVisible(!isPollModalVisible);
};
