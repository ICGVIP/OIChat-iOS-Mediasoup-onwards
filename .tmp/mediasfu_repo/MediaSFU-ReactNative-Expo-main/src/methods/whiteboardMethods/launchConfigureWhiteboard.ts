export interface LaunchConfigureWhiteboardOptions {
  updateIsConfigureWhiteboardModalVisible: (visible: boolean) => void;
  isConfigureWhiteboardModalVisible: boolean;
}

// Export the type definition for the function
export type LaunchConfigureWhiteboardType = (options: LaunchConfigureWhiteboardOptions) => void;

/**
 * Toggles the visibility of the configure whiteboard modal.
 *
 * @param {LaunchConfigureWhiteboardOptions} options - The options for toggling the whiteboard modal visibility.
 * @param {Function} options.updateIsConfigureWhiteboardModalVisible - Function to update the visibility state of the configure whiteboard modal.
 * @param {boolean} options.isConfigureWhiteboardModalVisible - Current visibility state of the configure whiteboard modal.
 *
 * @example
 * ```typescript
 * const options = {
 *   updateIsConfigureWhiteboardModalVisible: (visible: boolean) => console.log("Modal visibility updated:", visible),
 *   isConfigureWhiteboardModalVisible: false,
 * };
 * launchConfigureWhiteboard(options); // Toggles the modal visibility
 * ```
 */

export const launchConfigureWhiteboard = ({
  updateIsConfigureWhiteboardModalVisible,
  isConfigureWhiteboardModalVisible,
}: LaunchConfigureWhiteboardOptions): void => {
  /**
   * Toggle the visibility of the configure whiteboard modal.
   */
  updateIsConfigureWhiteboardModalVisible(!isConfigureWhiteboardModalVisible);
};
