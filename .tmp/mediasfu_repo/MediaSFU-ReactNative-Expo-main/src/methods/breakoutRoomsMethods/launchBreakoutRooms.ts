export interface LaunchBreakoutRoomsOptions {
  updateIsBreakoutRoomsModalVisible: (isVisible: boolean) => void;
  isBreakoutRoomsModalVisible: boolean;
}

// Export the type definition for the function
export type LaunchBreakoutRoomsType = (options: LaunchBreakoutRoomsOptions) => void;

/**
 * Launches the breakout rooms by toggling the visibility of the breakout rooms modal.
 *
 * @param {Function} updateIsBreakoutRoomsModalVisible - Function to update the visibility state of the breakout rooms modal.
 * @param {boolean} isBreakoutRoomsModalVisible - Current visibility state of the breakout rooms modal.
 *
 * @example
 * ```typescript
 * const options: LaunchBreakoutRoomsOptions = {
 *   updateIsBreakoutRoomsModalVisible: setModalVisible,
 *   isBreakoutRoomsModalVisible: false,
 * };
 *
 * launchBreakoutRooms(options);
 * // Toggles the breakout rooms modal to visible.
 * ```
 */

export const launchBreakoutRooms = ({
  updateIsBreakoutRoomsModalVisible,
  isBreakoutRoomsModalVisible,
}: LaunchBreakoutRoomsOptions): void => {
  /**
   * Toggle the visibility of the breakoutrooms modal.
   */
  updateIsBreakoutRoomsModalVisible(!isBreakoutRoomsModalVisible);
};
