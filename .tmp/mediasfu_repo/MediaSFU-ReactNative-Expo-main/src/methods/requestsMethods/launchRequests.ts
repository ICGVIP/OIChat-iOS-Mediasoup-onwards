export interface LaunchRequestsOptions {
  updateIsRequestsModalVisible: (isVisible: boolean) => void;
  isRequestsModalVisible: boolean;
}

// Export the type definition for the function
export type LaunchRequestsType = (options: LaunchRequestsOptions) => void;

/**
 * Toggles the visibility state of the requests modal.
 *
 * @param {LaunchRequestsOptions} options - The options for launching requests.
 * @param {Function} options.updateIsRequestsModalVisible - Function to update the visibility state of the requests modal.
 * @param {boolean} options.isRequestsModalVisible - Current visibility state of the requests modal.
 * @returns {void}
 * 
 * @example
 * ```typescript
 * launchRequests({
 *   updateIsRequestsModalVisible: setRequestsModalVisible,
 *   isRequestsModalVisible: true
 * });
 * ```
 */

export const launchRequests = ({ updateIsRequestsModalVisible, isRequestsModalVisible }: LaunchRequestsOptions): void => {
  // Toggle the visibility state of the requests modal
  updateIsRequestsModalVisible(!isRequestsModalVisible);
};
