import { TriggerType, TriggerParameters } from '../@types/types';

export interface CompareActiveNamesParameters extends TriggerParameters {
  activeNames: string[];
  prevActiveNames: string[];
  updateActiveNames: (activeNames: string[]) => void;
  updatePrevActiveNames: (prevActiveNames: string[]) => void;

  // mediasfu functions
  trigger: TriggerType;
  getUpdatedAllParams: () => CompareActiveNamesParameters;
  [key: string]: any;
}

export interface CompareActiveNamesOptions {
  restart?: boolean;
  parameters: CompareActiveNamesParameters;
}

// Export the type definition for the function
export type CompareActiveNamesType = (options: CompareActiveNamesOptions) => Promise<void>;

/**
 * Compares the current active names with the previous active names and triggers an action if there are changes.
 *
 * @param {CompareActiveNamesOptions} options - The options for comparing active names.
 * @param {boolean} [options.restart=false] - Whether to restart the comparison.
 * @param {CompareActiveNamesParameters} options.parameters - The parameters for the comparison.
 * @param {Function} options.parameters.getUpdatedAllParams - Function to get updated parameters.
 * @param {string[]} options.parameters.activeNames - The current active names.
 * @param {string[]} options.parameters.prevActiveNames - The previous active names.
 * @param {Function} options.parameters.updatePrevActiveNames - Function to update the previous active names.
 * @param {Function} options.parameters.trigger - Function to trigger an action when names change.
 *
 * @returns {Promise<void>} A promise that resolves when the comparison is complete.
 *
 * @throws Will log an error message if an error occurs during the comparison.
 * 
 * @example
 * const options = {
 *   restart: false,
 *   parameters: {
 *     getUpdatedAllParams: getUpdatedAllParamsFunction,
 *     activeNames: ['name1', 'name2'],
 *     prevActiveNames: ['name1'],
 *     updatePrevActiveNames: updatePrevActiveNamesFunction,
 *     trigger: triggerFunction,
 *   },
 * };
 * 
 * compareActiveNames(options)
 *   .then(() => {
 *     console.log('Active names compared successfully');
 *   });
 */

export async function compareActiveNames({
  restart = false,
  parameters,
}: CompareActiveNamesOptions): Promise<void> {
  try {
    const { getUpdatedAllParams } = parameters;
    parameters = getUpdatedAllParams();

    const {
      activeNames,
      prevActiveNames,
      updatePrevActiveNames,

      // mediasfu functions
      trigger,
    } = parameters;

    // Restart the comparison if needed
    if (restart) {
      await trigger({ ref_ActiveNames: activeNames, parameters });
      return;
    }

    // Array to track changes in activeNames
    const nameChanged: boolean[] = [];

    // Compare each name in activeNames
    for (let i = 0; i < activeNames.length; i++) {
      const currentName = activeNames[i];

      // Check if the name is present in prevActiveNames
      const hasNameChanged = !prevActiveNames.includes(currentName);

      if (hasNameChanged) {
        nameChanged.push(true);
        await trigger({ ref_ActiveNames: activeNames, parameters });
        break;
      }
    }

    // Count the number of `true` in nameChanged
    const count = nameChanged.filter((value) => value === true).length;

    if (count < 1) {
      // Check for new names in prevActiveNames
      for (let i = 0; i < prevActiveNames.length; i++) {
        const currentName = prevActiveNames[i];

        // Check if the name is present in activeNames
        const hasNameChanged = !activeNames.includes(currentName);

        // Signal change if the name is new
        if (hasNameChanged) {
          await trigger({ ref_ActiveNames: activeNames, parameters });
          break;
        }
      }
    }

    // Update prevActiveNames with current activeNames
    updatePrevActiveNames([...activeNames]);
  } catch (error) {
    console.log('compareActiveNames error', error);
    // throw error; (Optional: Keep or remove depending on your error handling strategy)
  }
}
