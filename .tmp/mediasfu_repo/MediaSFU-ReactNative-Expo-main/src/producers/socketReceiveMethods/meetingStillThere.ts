export interface MeetingStillThereOptions {
  updateIsConfirmHereModalVisible: (isVisible: boolean) => void;
}

// Export the type definition for the function
export type MeetingStillThereType = (options: MeetingStillThereOptions) => Promise<void>;

/**
 * Handles the "still there?" meeting check by updating the visibility of the confirmation modal.
 *
 * @param {MeetingStillThereOptions} options - The options for the meeting still-there check.
 * @param {Function} options.updateIsConfirmHereModalVisible - Function to update the visibility of the "still there?" modal.
 * @returns {Promise<void>} A promise that resolves when the modal visibility is updated.
 *
 * @example
 * ```typescript
 * const options = {
 *   updateIsConfirmHereModalVisible: (isVisible) => console.log(`Modal visibility: ${isVisible}`),
 * };
 *
 * await meetingStillThere(options);
 * // Output:
 * // "Modal visibility: true"
 * ```
 */

export const meetingStillThere = async ({
  updateIsConfirmHereModalVisible,
}: MeetingStillThereOptions): Promise<void> => {
  // Update the visibility of the "still there?" modal
  updateIsConfirmHereModalVisible(true);
};
