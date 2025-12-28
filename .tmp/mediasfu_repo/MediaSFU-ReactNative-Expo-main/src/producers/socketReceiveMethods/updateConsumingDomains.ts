import {
  ConnectIpsType, GetDomainsType, ConnectIpsParameters, GetDomainsParameters, AltDomains, Participant, ConsumeSocket,
} from '../../@types/types';

export interface UpdateConsumingDomainsParameters extends ConnectIpsParameters, GetDomainsParameters {
  participants: Participant[];
  consume_sockets: ConsumeSocket[];

  // mediasfu functions
  connectIps: ConnectIpsType;
  getDomains: GetDomainsType;

  getUpdatedAllParams: () => UpdateConsumingDomainsParameters;
  [key: string]: any;
}

export interface UpdateConsumingDomainsOptions {
  domains: string[];
  alt_domains: AltDomains,
  apiUserName: string;
  apiKey: string;
  apiToken: string;
  parameters: UpdateConsumingDomainsParameters;
}

// Export the type definition for the function
export type UpdateConsumingDomainsType = (options: UpdateConsumingDomainsOptions) => Promise<void>;

/**
 * Updates the consuming domains based on provided options.
 *
 * @param {UpdateConsumingDomainsOptions} options - Options for updating consuming domains.
 * @param {string[]} options.domains - The primary domains to be updated.
 * @param {AltDomains} options.alt_domains - The alternative consuming domains for participants.
 * @param {string} options.apiUserName - API username for domain updates.
 * @param {string} options.apiKey - API key for authorization.
 * @param {string} options.apiToken - API token for secure access.
 * @param {UpdateConsumingDomainsParameters} options.parameters - Additional parameters required for updating consuming domains.
 * 
 * @returns {Promise<void>} Resolves when consuming domains have been successfully updated.
 * 
 * @throws Logs an error if an issue occurs during the update process.
 * 
 * @example
 * ```typescript
 * const options = {
 *   domains: ["domain1.com", "domain2.com"],
 *   alt_domains: { domainAlias: ["altDomain1.com"] },
 *   apiUserName: "myApiUser",
 *   apiKey: "myApiKey",
 *   apiToken: "myApiToken",
 *   parameters: {
 *     participants: [{ id: "user1", name: "User 1" }],
 *     consume_sockets: [{ id: "socket1", isConnected: true }],
 *     connectIps: async (options) => { console.log("Connecting IPs", options); },
 *     getDomains: async (options) => { console.log("Getting Domains", options); },
 *     getUpdatedAllParams: () => ({ consume_sockets: [{ id: "socket1", isConnected: true }] }),
 *   },
 * };
 * 
 * await updateConsumingDomains(options);
 * ```
 */

export const updateConsumingDomains = async ({
  domains,
  alt_domains,
  parameters,
  apiUserName,
  apiKey,
  apiToken,
}: UpdateConsumingDomainsOptions): Promise<void> => {
  // Destructure necessary variables from parameters
  let {
    participants,
    getDomains,
    consume_sockets,

    // mediasfu functions
    connectIps,
  } = parameters;

  // Update consume_sockets with the latest value from getUpdatedAllParams
  consume_sockets = parameters.getUpdatedAllParams().consume_sockets;

  try {
    // Check if participants array is not empty
    if (participants.length > 0) {
      // Check if alt_domains has keys and remove duplicates
      if (Object.keys(alt_domains).length > 0) {
        await getDomains({
          domains, alt_domains, apiUserName, apiKey, apiToken, parameters,
        });
      } else {
        // If no alt_domains, directly connect IPs with the provided domains
        await connectIps({
          consume_sockets,
          remIP: domains,
          parameters,
          apiUserName,
          apiKey,
          apiToken,
        });
      }
    }
  } catch (error) {
    console.log('Error in updateConsumingDomains: ', error);
    // Optionally, throw the error if you want to handle it at a higher level
    // throw new Error("Failed to update consuming domains.");
  }
};
