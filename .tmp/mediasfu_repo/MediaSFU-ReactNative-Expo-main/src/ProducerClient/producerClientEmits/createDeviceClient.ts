import * as mediasoupClient from 'mediasoup-client';
import { RtpCapabilities, Device } from 'mediasoup-client/lib/types';

export interface CreateDeviceClientOptions {
  rtpCapabilities: RtpCapabilities | null;
}

// Export the type definition for the function
export type CreateDeviceClientType = (options: CreateDeviceClientOptions) => Promise<Device | null>;

/**
 * Creates a mediasoup client device with the provided RTP capabilities.
 *
 * @param {CreateDeviceClientOptions} options - The options for creating the device client.
 * @param {RTPCapabilities} options.rtpCapabilities - The RTP capabilities required for the device.
 * @returns {Promise<Device | null>} A promise that resolves to the created Device or null if creation fails.
 * @throws {Error} Throws an error if the required parameters are not provided or if device creation is not supported.
 *
 * @example
 * const device = await createDeviceClient({ rtpCapabilities });
 * if (device) {
 *   console.log("Device created successfully");
 * } else {
 *   console.log("Failed to create device");
 * }
 */

export const createDeviceClient = async ({
  rtpCapabilities,
}: CreateDeviceClientOptions): Promise<Device | null> => {
  try {
    // Validate input parameters
    if (!rtpCapabilities) {
      throw new Error(
        'Both rtpCapabilities and mediasoupClient must be provided.',
      );
    }

    // Create a mediasoup client device
    const device: (Device | null) = new mediasoupClient.Device();

    // Remove orientation capabilities
    rtpCapabilities.headerExtensions = rtpCapabilities!.headerExtensions!.filter(
      (ext) => ext.uri !== 'urn:3gpp:video-orientation',
    );

    // Load the provided RTP capabilities into the device
    await device!.load({
      routerRtpCapabilities: rtpCapabilities,
    });

    return device;
  } catch (error) {
    // Handle specific errors, e.g., UnsupportedError
    if (error as Error && (error as Error).name === 'UnsupportedError') {
      // Handle unsupported device creation
      console.error('Device creation is not supported by this browser.');
    }

    throw error; // Propagate other errors
  }
};
