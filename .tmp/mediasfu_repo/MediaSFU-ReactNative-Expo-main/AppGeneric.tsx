/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * MediaSFU Component Configuration and Usage Guide
 *
 * The following code and comments will guide you through:
 * 1. Configuring the MediaSFU component with different server and credential setups.
 * 2. Handling API credentials securely depending on whether you use MediaSFU Cloud or your own MediaSFU CE server.
 * 3. Rendering custom UIs by disabling the default MediaSFU UI.
 * 4. Using custom "create room" and "join room" functions for secure, flexible integration.
 *
 * Note: All guide instructions are provided as code comments. They will not render to the user directly.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// MediaSFU view components (if you choose to use them)
import MediasfuGeneric from './src/components/mediasfuComponents/MediasfuGeneric';
import MediasfuBroadcast from './src/components/mediasfuComponents/MediasfuBroadcast';
import MediasfuChat from './src/components/mediasfuComponents/MediasfuChat';
import MediasfuWebinar from './src/components/mediasfuComponents/MediasfuWebinar';
import MediasfuConference from './src/components/mediasfuComponents/MediasfuConference';

// Pre-Join Page component (if you choose to use it)
import PreJoinPage from './src/components/miscComponents/PreJoinPage';

// Custom component types
import {
  CustomVideoCardType,
  CustomAudioCardType,
  CustomMiniCardType,
} from './src/@types/types';

// Utilities for seed data (deprecated - do not use in new code)
import { generateRandomParticipants } from './src/methods/utils/generateRandomParticipants';
import { generateRandomMessages } from './src/methods/utils/generateRandomMessages';
import { generateRandomRequestList } from './src/methods/utils/generateRandomRequestList';
import { generateRandomWaitingRoomList } from './src/methods/utils/generateRandomWaitingRoomList';

// Import custom "create" and "join" room functions
import { createRoomOnMediaSFU } from './src/methods/utils/createRoomOnMediaSFU';
import { joinRoomOnMediaSFU } from './src/methods/utils/joinRoomOnMediaSFU';
import { CreateMediaSFURoomOptions, JoinMediaSFURoomOptions } from './src/@types/types';

// =========================================================
//                    CUSTOM COMPONENT EXAMPLES
// =========================================================
//
// These are example custom components that you can use to replace
// the default VideoCard, AudioCard, and MiniCard components.
// Feel free to modify these examples or create your own custom components.

// Example Custom VideoCard for React Native
const CustomVideoCard: CustomVideoCardType = ({
  participant,
  stream,
  width,
  height,
  showControls,
  showInfo,
  name,
  backgroundColor,
  parameters,
}) => {
  return (
    <View
      style={[
        {
          width: width,
          height: height,
          backgroundColor: backgroundColor || 'rgba(0, 0, 0, 0.8)',
          borderRadius: 16,
          position: 'relative',
          overflow: 'hidden',
          borderWidth: 3,
          borderColor: '#6366f1',
        },
      ]}
    >
      {/* Custom video display would go here */}
      {/* Note: Video rendering in React Native requires platform-specific implementation */}
      
      {/* Custom participant info overlay */}
      {showInfo && (
        <View style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          backgroundColor: '#6366f1',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 14,
            fontWeight: 'bold',
          }}>
            🎥 {name || participant.name}
          </Text>
        </View>
      )}
      
      {/* Custom controls overlay */}
      {showControls && (
        <View style={{
          position: 'absolute',
          top: 8,
          right: 8,
          flexDirection: 'row',
          gap: 8,
        }}>
          <View style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 16,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 16 }}>🔇</Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 16,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 16 }}>📹</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// Example Custom AudioCard for React Native
const CustomAudioCard: CustomAudioCardType = ({
  name,
  barColor,
  textColor,
  parameters,
}) => {
  const isActive = barColor; // barColor indicates if participant is speaking

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 16,
        minHeight: 120,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: isActive ? '#ef4444' : '#6b7280',
      }}
    >
      {/* Audio wave animation background */}
      {isActive && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          opacity: 0.5,
        }} />
      )}
      
      {/* Avatar */}
      <View style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        zIndex: 1,
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: 'white',
        }}>
          {name ? name.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      
      {/* Name */}
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: textColor || 'white',
        zIndex: 1,
      }}>
        {name}
      </Text>
      
      {/* Speaking indicator */}
      {isActive && (
        <Text style={{
          marginTop: 8,
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1,
        }}>
          🎤 Speaking...
        </Text>
      )}
    </View>
  );
};

// Example Custom MiniCard for React Native
const CustomMiniCard: CustomMiniCardType = ({
  initials,
  name,
  showVideoIcon,
  showAudioIcon,
  parameters,
}) => {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      backgroundColor: '#1f2937',
      borderRadius: 12,
      minHeight: 80,
      minWidth: 80,
      borderWidth: 2,
      borderColor: '#6366f1',
    }}>
      {/* Avatar/Initials */}
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: 'white',
        }}>
          {initials || name?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
      
      {/* Name */}
      <Text style={{
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 6,
        color: 'white',
        maxWidth: '100%',
      }} numberOfLines={1} ellipsizeMode="tail">
        {name}
      </Text>
      
      {/* Media status icons */}
      <View style={{
        flexDirection: 'row',
        gap: 4,
      }}>
        {showVideoIcon && (
          <Text style={{ fontSize: 12, opacity: 0.7 }}>📹</Text>
        )}
        {showAudioIcon && (
          <Text style={{ fontSize: 12, opacity: 0.7 }}>🎤</Text>
        )}
      </View>
    </View>
  );
};

/**
 * App Component
 *
 * This component demonstrates how to:
 * - Configure credentials for MediaSFU Cloud and/or Community Edition (CE).
 * - Use MediaSFU with or without a custom server.
 * - Integrate a pre-join page.
 * - Return no UI and manage state through sourceParameters, allowing a fully custom frontend.
 *
 * Basic instructions:
 * 1. Set `localLink` to your CE server if you have one, or leave it blank to use MediaSFU Cloud.
 * 2. Set `connectMediaSFU` to determine whether you're connecting to MediaSFU Cloud services.
 * 3. Provide credentials if using MediaSFU Cloud (dummy credentials are acceptable in certain scenarios).
 * 4. If you prefer a custom UI, set `returnUI` to false and handle all interactions via `sourceParameters` and `updateSourceParameters`.
 * 5. For secure production usage, consider using custom `createMediaSFURoom` and `joinMediaSFURoom` functions to forward requests through your backend.
 */

const App = () => {
  // =========================================================
  //                API CREDENTIALS CONFIGURATION
  // =========================================================
  //
  // Scenario A: Not using MediaSFU Cloud at all.
  // - No credentials needed. Just set localLink to your CE server.
  // Example:
  /*
  const credentials = {};
  const localLink = 'http://your-ce-server.com'; //http://localhost:3000
  const connectMediaSFU = localLink.trim() !== '';
  */

  // Scenario B: Using MediaSFU CE + MediaSFU Cloud for Egress only.
  // - Use dummy credentials (8 chars for userName, 64 chars for apiKey).
  // - Your CE backend will forward requests with your real credentials.
  /*
  const credentials = {
    apiUserName: 'dummyUsr',
    apiKey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  };
  const localLink = 'http://your-ce-server.com'; //http://localhost:3000
  const connectMediaSFU = localLink.trim() !== '';
  */

  // Scenario C: Using MediaSFU Cloud without your own server.
  // - For development, use your actual or dummy credentials.
  // - In production, securely handle credentials server-side and use custom room functions.
  const credentials = {
    apiUserName: 'yourDevUser', // 8 chars recommended for dummy
    apiKey: 'yourDevApiKey1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // 64 chars
  };
  const localLink = ''; // Leave empty if not using your own server
  const connectMediaSFU = true; // Set to true if using MediaSFU Cloud since localLink is empty

  // =========================================================
  //                    UI RENDERING OPTIONS
  // =========================================================
  //
  // If you want a fully custom UI (e.g., a custom layout inspired by WhatsApp):
  // 1. Set `returnUI = false` to prevent the default MediaSFU UI from rendering.
  // 2. Provide `noUIPreJoinOptions` to simulate what would have been entered on a pre-join page.
  // 3. Use `sourceParameters` and `updateSourceParameters` to access and update state/actions.
  // 4. No need for any of the above if you're using the default MediaSFU UI.
  //
  // Example noUIPreJoinOptions:
  const noUIPreJoinOptions: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions = {
    action: 'create',
    capacity: 10,
    duration: 15,
    eventType: 'broadcast',
    userName: 'Prince',
  };

  // Example for joining a room:
  // const noUIPreJoinOptions: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions = {
  //   action: 'join',
  //   userName: 'Prince',
  //   meetingID: 'yourMeetingID'
  // };

  const [sourceParameters, setSourceParameters] = useState<{ [key: string]: any }>({});
  const updateSourceParameters = (data: { [key: string]: any }) => {
    setSourceParameters(data);
  };

  // =========================================================
  //                CUSTOM ROOM FUNCTIONS (OPTIONAL)
  // =========================================================
  //
  // To securely forward requests to MediaSFU:
  // - Implement custom `createMediaSFURoom` and `joinMediaSFURoom` functions.
  // - These functions send requests to your server, which then communicates with MediaSFU Cloud.
  //
  // Already imported `createRoomOnMediaSFU` and `joinRoomOnMediaSFU` are examples.
  //
  // If using MediaSFU CE backend, ensure your server endpoints:
  // - Validate dummy credentials.
  // - Forward requests to mediasfu.com with real credentials.

  // =========================================================
  //              CHOOSE A USE CASE / COMPONENT
  // =========================================================
  //
  // Multiple components are available depending on your event type:
  // MediasfuBroadcast, MediasfuChat, MediasfuWebinar, MediasfuConference
  //
  // By default, we'll use MediasfuGeneric with custom settings.



  // =========================================================
  //                    RENDER COMPONENT
  // =========================================================
  //
  // The MediasfuGeneric component is used by default.
  // You can replace it with any other component based on your event type.
  // Example: <MediasfuBroadcast ... />
  // Example: <MediasfuChat ... />
  // Example: <MediasfuWebinar ... />
  // Example: <MediasfuConference ... />
  //
  // The PreJoinPage component is displayed if `returnUI` is true.
  // If `returnUI` is false, `noUIPreJoinOptions` is used as a substitute.
  // You can also use `sourceParameters` to interact with MediaSFU functionalities directly.
  // Avoid using `useLocalUIMode` or `useSeed` in new implementations.
  // Ensure that real credentials are not exposed in the frontend.
  // Use HTTPS and secure backend endpoints for production.

  // Example of MediaSFU CE with no MediaSFU Cloud
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     localLink={localLink}
  //     />
  // );

  // Example of MediaSFU CE + MediaSFU Cloud for Egress only
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     credentials={credentials}
  //     localLink={localLink}
  //     connectMediaSFU={connectMediaSFU}
  //     />
  // );

  // Example of MediaSFU Cloud only
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     credentials={credentials}
  //     connectMediaSFU={connectMediaSFU}
  //     />
  // );

  // Example of MediaSFU CE + MediaSFU Cloud for Egress only with custom UI
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     credentials={credentials}
  //     localLink={localLink}
  //     connectMediaSFU={connectMediaSFU}
  //     returnUI={false}
  //     noUIPreJoinOptions={noUIPreJoinOptions}
  //     sourceParameters={sourceParameters}
  //     updateSourceParameters={updateSourceParameters}
  //     createMediaSFURoom={createRoomOnMediaSFU}
  //     joinMediaSFURoom={joinRoomOnMediaSFU}
  //   />

  // Example of MediaSFU Cloud only with custom UI
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     credentials={credentials}
  //     connectMediaSFU={connectMediaSFU}
  //     returnUI={false}
  //     noUIPreJoinOptions={noUIPreJoinOptions}
  //     sourceParameters={sourceParameters}
  //     updateSourceParameters={updateSourceParameters}
  //     createMediaSFURoom={createRoomOnMediaSFU}
  //     joinMediaSFURoom={joinRoomOnMediaSFU}
  //   />

  // Example of using MediaSFU CE only with custom UI
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     localLink={localLink}
  //     connectMediaSFU={false}
  //     returnUI={false}
  //     noUIPreJoinOptions={noUIPreJoinOptions}
  //     sourceParameters={sourceParameters}
  //     updateSourceParameters={updateSourceParameters}
  //   />

  // Example with custom components (uncomment to use custom VideoCard, AudioCard, and MiniCard)
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     credentials={credentials}
  //     localLink={localLink}
  //     connectMediaSFU={connectMediaSFU}
  //     returnUI={returnUI}
  //     noUIPreJoinOptions={!returnUI ? noUIPreJoinOptions : undefined}
  //     sourceParameters={!returnUI ? sourceParameters : undefined}
  //     updateSourceParameters={!returnUI ? updateSourceParameters : undefined}
  //     createMediaSFURoom={createRoomOnMediaSFU}
  //     joinMediaSFURoom={joinRoomOnMediaSFU}
  //     customVideoCard={CustomVideoCard}
  //     customAudioCard={CustomAudioCard}
  //     customMiniCard={CustomMiniCard}
  //   />
  // );


  return (
    <MediasfuGeneric
      // This pre-join page can be displayed if `returnUI` is true.
      // If `returnUI` is false, `noUIPreJoinOptions` is used as a substitute.
      PrejoinPage={PreJoinPage}
      credentials={credentials}
      localLink={localLink}
      connectMediaSFU={connectMediaSFU}
      returnUI={false}
      noUIPreJoinOptions={noUIPreJoinOptions}
      sourceParameters={sourceParameters}
      updateSourceParameters={updateSourceParameters}
      createMediaSFURoom={createRoomOnMediaSFU}
      joinMediaSFURoom={joinRoomOnMediaSFU}
    />
  );
};

export default App;

/**
 * =========================================================
 *                     ADDITIONAL NOTES
 * =========================================================
 *
 * Handling Core Methods:
 * Once `sourceParameters` is populated, you can call core methods like `clickVideo` or `clickAudio` directly:
 * Example:
 * sourceParameters.clickVideo({ ...sourceParameters });
 * sourceParameters.clickAudio({ ...sourceParameters });
 *
 * This allows your custom UI to directly interact with MediaSFU functionalities.
 *
 * Deprecated Features (Seed Data):
 * The seed data generation feature is deprecated. Avoid using `useLocalUIMode` or `useSeed` in new implementations.
 *
 * Security Considerations:
 * - Do not expose real credentials in your frontend code in production.
 * - Use HTTPS and secure backend endpoints.
 * - Validate inputs and handle errors gracefully.
 *
 * Example CE Backend Setup:
 * If using MediaSFU CE + MediaSFU Cloud, your backend might look like this:
 *
 * app.post("/createRoom", async (req, res) => {
 *   // Validate incoming dummy credentials
 *   // Forward request to mediasfu.com with real credentials
 * });
 *
 * app.post("/joinRoom", async (req, res) => {
 *   // Validate incoming dummy credentials
 *   // Forward request to mediasfu.com with real credentials
 * });
 *
 * By doing so, you keep real credentials secure on your server.
 *
 * End of Guide.
 */



/**
 * =======================
 * ====== EXTRA NOTES ======
 * =======================
 *
 * ### Handling Core Methods
 * With `sourceParameters`, you can access core methods such as `clickVideo` and `clickAudio`:
 *
 * ```typescript
 * sourceParameters.clickVideo({ ...sourceParameters });
 * sourceParameters.clickAudio({ ...sourceParameters });
 * ```
 *
 * This allows your custom UI to interact with MediaSFU's functionalities seamlessly.
 *
 * ### Seed Data (Deprecated)
 * The seed data functionality is deprecated and maintained only for legacy purposes.
 * It is recommended to avoid using it in new implementations.
 *
 * ### Security Considerations
 * - **Protect API Credentials:** Ensure that API credentials are not exposed in the frontend. Use environment variables and secure backend services to handle sensitive information.
 * - **Use HTTPS:** Always use HTTPS to secure data transmission between the client and server.
 * - **Validate Inputs:** Implement proper validation and error handling on both client and server sides to prevent malicious inputs.
 *
 * ### Custom Backend Example for MediaSFU CE
 * Below is an example of how to set up custom backend endpoints for creating and joining rooms using MediaSFU CE:
 *
 * ```javascript
 * // Endpoint for `createRoom`
 * app.post("/createRoom", async (req, res) => {
 *   try {
 *     const payload = req.body;
 *     const [apiUserName, apiKey] = req.headers.authorization
 *       .replace("Bearer ", "")
 *       .split(":");
 *
 *     // Verify temporary credentials
 *     if (!apiUserName || !apiKey || !verifyCredentials(apiUserName, apiKey)) {
 *       return res.status(401).json({ error: "Invalid or expired credentials" });
 *     }
 *
 *     const response = await fetch("https://mediasfu.com/v1/rooms/", {
 *       method: "POST",
 *       headers: {
 *         "Content-Type": "application/json",
 *         Authorization: `Bearer ${actualApiUserName}:${actualApiKey}`,
 *       },
 *       body: JSON.stringify(payload),
 *     });
 *
 *     const result = await response.json();
 *     res.status(response.status).json(result);
 *   } catch (error) {
 *     console.error("Error creating room:", error);
 *     res.status(500).json({ error: "Internal server error" });
 *   }
 * });
 *
 * // Endpoint for `joinRoom`
 * app.post("/joinRoom", async (req, res) => {
 *   try {
 *     const payload = req.body;
 *     const [apiUserName, apiKey] = req.headers.authorization
 *       .replace("Bearer ", "")
 *       .split(":");
 *
 *     // Verify temporary credentials
 *     if (!apiUserName || !apiKey || !verifyCredentials(apiUserName, apiKey)) {
 *       return res.status(401).json({ error: "Invalid or expired credentials" });
 *     }
 *
 *     const response = await fetch("https://mediasfu.com/v1/rooms", {
 *       method: "POST",
 *       headers: {
 *         "Content-Type": "application/json",
 *         Authorization: `Bearer ${actualApiUserName}:${actualApiKey}`,
 *       },
 *       body: JSON.stringify(payload),
 *     });
 *
 *     const result = await response.json();
 *     res.status(response.status).json(result);
 *   } catch (error) {
 *     console.error("Error joining room:", error);
 *     res.status(500).json({ error: "Internal server error" });
 *   }
 * });
 * ```
 *
 * ### Custom Room Function Implementation
 * Below are examples of how to implement custom functions for creating and joining rooms securely:
 *
 * ```typescript
 * import { CreateJoinRoomError, CreateJoinRoomResponse, CreateJoinRoomType, CreateMediaSFURoomOptions, JoinMediaSFURoomOptions } from '../../@types/types';
 *
 *
 * Async function to create a room on MediaSFU.
 *
 * @param {object} options - The options for creating a room.
 * @param {CreateMediaSFURoomOptions} options.payload - The payload for the API request.
 * @param {string} options.apiUserName - The API username.
 * @param {string} options.apiKey - The API key.
 * @param {string} options.localLink - The local link.
 * @returns {Promise<{ data: CreateJoinRoomResponse | CreateJoinRoomError | null; success: boolean; }>} The response from the API.
 * export const createRoomOnMediaSFU: CreateJoinRoomType = async ({
 *     payload,
 *     apiUserName,
 *     apiKey,
 *     localLink = '',
 * }) => {
 *     try {
 *         let finalLink = 'https://mediasfu.com/v1/rooms/';
 *
 *         // Update finalLink if using a local server
 *         if (localLink) {
 *             finalLink = `${localLink}/createRoom`;
 *         }
 *
 *         const response = await fetch(finalLink, {
 *             method: 'POST',
 *             headers: {
 *                 'Content-Type': 'application/json',
 *                 Authorization: `Bearer ${apiUserName}:${apiKey}`,
 *             },
 *             body: JSON.stringify(payload),
 *         });
 *
 *         if (!response.ok) {
 *             throw new Error(`HTTP error! Status: ${response.status}`);
 *         }
 *
 *         const data: CreateJoinRoomResponse = await response.json();
 *         return { data, success: true };
 *     } catch (error) {
 *         const errorMessage = (error as Error).message || 'unknown error';
 *         return {
 *             data: { error: `Unable to create room, ${errorMessage}` },
 *             success: false,
 *         };
 *     }
 * };
 *
*
*  Async function to join a room on MediaSFU.
*
*  @param {object} options - The options for joining a room.
*  @param {JoinMediaSFURoomOptions} options.payload - The payload for the API request.
*  @param {string} options.apiUserName - The API username.
*  @param {string} options.apiKey - The API key.
*  @param {string} options.localLink - The local link.
*  @returns {Promise<{ data: CreateJoinRoomResponse | CreateJoinRoomError | null; success: boolean; }>} The response from the API.
*
* export const joinRoomOnMediaSFU: JoinRoomOnMediaSFUType = async ({
*     payload,
*     apiUserName,
*     apiKey,
*     localLink = '',
* }) => {
*     try {
*         let finalLink = 'https://mediasfu.com/v1/rooms/join';
*
*         // Update finalLink if using a local server
*         if (localLink) {
*             finalLink = `${localLink}/joinRoom`;
*         }
*
*         const response = await fetch(finalLink, {
*             method: 'POST',
*             headers: {
*                 'Content-Type': 'application/json',
*                 Authorization: `Bearer ${apiUserName}:${apiKey}`,
*             },
*             body: JSON.stringify(payload),
*         });
*
*         if (!response.ok) {
*             throw new Error(`HTTP error! Status: ${response.status}`);
*         }
*
*         const data: CreateJoinRoomResponse = await response.json();
*         return { data, success: true };
*     } catch (error) {
*         const errorMessage = (error as Error).message || 'unknown error';
*         return {
*             data: { error: `Unable to join room, ${errorMessage}` },
*             success: false,
*         };
*     }
* };
* ```
*
* ### Example Usage of Core Methods
* Core methods like `clickVideo` and `clickAudio` can now be accessed through `sourceParameters`:
*
* ```typescript
* // Example of toggling video
* sourceParameters.clickVideo({ ...sourceParameters });
*
* // Example of toggling audio
* sourceParameters.clickAudio({ ...sourceParameters });
* ```
*
* These methods allow your custom UI to interact with MediaSFU's functionalities seamlessly.
*
* ========================
* ====== END OF GUIDE ======
* ========================
*/






