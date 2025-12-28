import { RtpCapabilities } from 'mediasoup-client/lib/types';
import {
  ConnectIpsType, ConnectIpsParameters, AltDomains, ConsumeSocket,
} from '../../@types/types';

export interface GetDomainsParameters extends ConnectIpsParameters {

  roomRecvIPs: string[];
  rtpCapabilities: RtpCapabilities | null;
  consume_sockets: ConsumeSocket[];

  // mediasfu functions
  connectIps: ConnectIpsType;
  getUpdatedAllParams: () => GetDomainsParameters;

  [key: string]: any;

}

export interface GetDomainsOptions {
  domains: string[];
  alt_domains: AltDomains;
  apiUserName: string;
  apiKey: string;
  apiToken: string;
  parameters: GetDomainsParameters;
}

// Export the type definition for the function
export type GetDomainsType = (options: GetDomainsOptions) => Promise<void>;

/**
 * Asynchronously processes domain information and connects to specified IPs.
 *
 * @param {GetDomainsOptions} options - The options for processing domains and connecting to IPs.
 * @param {string[]} options.domains - Array of domain names to process.
 * @param {AltDomains} options.alt_domains - Alternative domain mapping with IP addresses.
 * @param {string} options.apiUserName - The API username for domain authentication.
 * @param {string} options.apiKey - The API key for domain authentication.
 * @param {string} options.apiToken - The API token for domain authentication.
 * @param {GetDomainsParameters} options.parameters - Additional parameters for domain processing.
 * @param {string[]} options.parameters.roomRecvIPs - Array of IPs that are already connected and receiving.
 * @param {ConsumeSocket[]} options.parameters.consume_sockets - List of consume sockets.
 * @param {ConnectIpsType} options.parameters.connectIps - Function to connect to specified IPs.
 * @param {Function} options.parameters.getUpdatedAllParams - Function to get updated parameters.
 *
 * @returns {Promise<void>} A promise that resolves when the domain processing and IP connection is complete.
 *
 * @throws {Error} Will throw an error if the operation fails.
 *
 * @example
 * ```typescript
 * await getDomains({
 *   domains: ["example1.com", "example2.com"],
 *   alt_domains: { "example1.com": "192.168.1.1" },
 *   apiUserName: "user123",
 *   apiKey: "apikey123",
 *   apiToken: "apitoken123",
 *   parameters: {
 *     roomRecvIPs: ["192.168.1.10"],
 *     consume_sockets: [{ id: "socket1" }],
 *     connectIps: async ({ consume_sockets, remIP, parameters, apiUserName, apiKey, apiToken }) => {
 *       // Connect IP logic here
 *     },
 *     getUpdatedAllParams: () => ({ ...parameters }),
 *   },
 * });
 * ```
 */

export const getDomains = async ({
  domains,
  alt_domains,
  apiUserName,
  apiKey,
  apiToken,
  parameters,
}: GetDomainsOptions): Promise<void> => {
  // Destructuring parameters
  let {
    roomRecvIPs,
    consume_sockets,
    connectIps,
  } = parameters;

  const ipsToConnect: string[] = [];

  try {
    // Get the latest consume_sockets
    const updatedParams = parameters.getUpdatedAllParams();
    consume_sockets = updatedParams.consume_sockets;

    // Process each domain
    for (const domain of domains) {
      const ipToCheck = alt_domains[domain] || domain;

      // If the IP is not in roomRecvIPs, add to ipsToConnect
      if (!roomRecvIPs.includes(ipToCheck)) {
        ipsToConnect.push(ipToCheck);
      }
    }

    // Connect to the IPs
    await connectIps({
      consume_sockets,
      remIP: ipsToConnect,
      parameters,
      apiUserName,
      apiKey,
      apiToken,
    });
  } catch (error) {
    console.error('Error in getDomains: ', error);
  }
};
