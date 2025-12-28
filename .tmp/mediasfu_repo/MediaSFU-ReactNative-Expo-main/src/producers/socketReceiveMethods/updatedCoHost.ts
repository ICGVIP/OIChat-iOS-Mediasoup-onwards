import { CoHostResponsibility, EventType, ShowAlert } from '../../@types/types';

export interface UpdatedCoHostOptions {
  coHost: string;
  coHostResponsibility: CoHostResponsibility[];
  showAlert?: ShowAlert;
  eventType: EventType;
  islevel: string;
  member: string;
  youAreCoHost: boolean;
  updateCoHost: (coHost: string) => void;
  updateCoHostResponsibility: (responsibility: CoHostResponsibility[]) => void;
  updateYouAreCoHost: (youAreCoHost: boolean) => void;
}

// Export the type definition for the function
export type UpdatedCoHostType = (options: UpdatedCoHostOptions) => Promise<void>;

/**
 * Updates co-host information and responsibilities based on provided options.
 *
 * @param {UpdatedCoHostOptions} options - Options for updating co-host status and responsibilities.
 * @param {string} options.coHost - The identifier of the new co-host.
 * @param {CoHostResponsibility[]} options.coHostResponsibility - Array of co-host responsibilities.
 * @param {ShowAlert} [options.showAlert] - Optional function to display alert messages.
 * @param {EventType} options.eventType - The event type (e.g., "broadcast", "chat").
 * @param {string} options.islevel - The event level.
 * @param {string} options.member - Identifier for the member.
 * @param {boolean} options.youAreCoHost - Boolean indicating if the current user is a co-host.
 * @param {Function} options.updateCoHost - Function to update the co-host identifier.
 * @param {Function} options.updateCoHostResponsibility - Function to update co-host responsibilities.
 * @param {Function} options.updateYouAreCoHost - Function to update the current user's co-host status.
 *
 * @returns {Promise<void>} Resolves when co-host information is updated.
 *
 * @example
 * const options = {
 *   coHost: "user123",
 *   coHostResponsibility: [{ task: "moderate", canEdit: true }],
 *   showAlert: (alert) => console.log(alert.message),
 *   eventType: "conference",
 *   islevel: "1",
 *   member: "user123",
 *   youAreCoHost: false,
 *   updateCoHost: (host) => console.log("Updated co-host:", host),
 *   updateCoHostResponsibility: (resps) => console.log("Responsibilities:", resps),
 *   updateYouAreCoHost: (status) => console.log("You are now co-host:", status),
 * };
 *
 * await updatedCoHost(options);
 * // Logs:
 * // "Updated co-host: user123"
 * // "Responsibilities: [{ task: 'moderate', canEdit: true }]"
 * // "You are now co-host: true"
 * // "You are now a co-host." (alert)
 */

export const updatedCoHost = async ({
  coHost,
  coHostResponsibility,
  showAlert,
  eventType,
  islevel,
  member,
  youAreCoHost,
  updateCoHost,
  updateCoHostResponsibility,
  updateYouAreCoHost,
}: UpdatedCoHostOptions): Promise<void> => {
  if (eventType !== 'broadcast' && eventType !== 'chat') {
    // Only update the co-host if the event type is not broadcast or chat
    updateCoHost(coHost);
    updateCoHostResponsibility(coHostResponsibility);

    if (member === coHost) {
      if (!youAreCoHost) {
        updateYouAreCoHost(true);

        showAlert?.({
          message: 'You are now a co-host.',
          type: 'success',
          duration: 3000,
        });
      }
    } else {
      updateYouAreCoHost(false);
    }
  } else if (islevel !== '2') {
    updateYouAreCoHost(true);
  }
};
