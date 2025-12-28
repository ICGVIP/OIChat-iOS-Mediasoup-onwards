import { ResponseJoinLocalRoom, PreJoinPageParameters, JoinMediaSFURoomOptions } from '../../@types/types';
import { validateAlphanumeric } from '../../methods/utils/validateAlphanumeric';
import { Socket } from 'socket.io-client';
import { joinRoomOnMediaSFU, JoinRoomOnMediaSFUType } from '../../methods/utils/joinRoomOnMediaSFU';
import { checkLimitsAndMakeRequest } from '../../methods/utils/checkLimitsAndMakeRequest';

export interface JoinLocalRoomOptions {
  socket: Socket;
  roomName: string;
  islevel: string;
  member: string;
  sec: string;
  apiUserName: string;
  parameters: PreJoinPageParameters;
  checkConnect?: boolean;
  joinMediaSFURoom?: JoinRoomOnMediaSFUType,
  localLink?: string;
}

// Export the type definition for the function
export type JoinLocalRoomType = (
  options: JoinLocalRoomOptions
) => Promise<ResponseJoinLocalRoom>;


export interface CheckMediasfuURLOptions {
  data: ResponseJoinLocalRoom;
  member: string;
  roomName: string;
  islevel: string;
  socket: Socket;
  parameters: PreJoinPageParameters;
  joinMediaSFURoom?: JoinRoomOnMediaSFUType,
  localLink?: string;
}

// Export the type definition for the function
export type CheckMediasfuURLType = (options: CheckMediasfuURLOptions) => Promise<void>;

/**
 * Checks the MediaSFU URL and processes the necessary actions based on the URL's validity.
 *
 * @param {CheckMediasfuURLOptions} options - The options for checking and handling the MediaSFU URL.
 * @param {ResponseJoinLocalRoom} options.data - The data received from the room join response.
 * @param {string} options.member - The member identifier.
 * @param {string} options.roomName - The name of the room to join.
 * @param {string} options.islevel - The level of the user.
 * @param {Socket} options.socket - The socket instance to use for communication.
 * @param {PreJoinPageParameters} options.parameters - Additional parameters for pre-join page actions.
 * @param {JoinRoomOnMediaSFUType} [options.joinMediaSFURoom] - The function to join a room on MediaSFU.
 * @param {string} [options.localLink] - The local link for the Community Edition.
 * 
 * @returns {Promise<void>} A promise that resolves when the actions are complete.
 * 
 * @example
 * ```typescript
 * const options = {
 *   data: {
 *     mediasfuURL: 'https://example.com/meet/room123/secret',
 *     allowRecord: true,
 *     apiKey: '1234567890123456789012345678901234567890123456789012345678901234',
 *     apiUserName: 'user123',
 *   },
 *   member: 'user123',
 *   roomName: 's12345678',
 *   islevel: '1',
 *   socket: socketInstance,
 *   parameters: {
 *     someParameter: 'value',
 *   },
 * };
 *
 * try {
 *   await checkMediasfuURL(options);
 *   console.log('MediaSFU URL processed successfully.');
 * } catch (error) {
 *   console.error('Failed to process MediaSFU URL:', error);
 * }
 * ```
 */

export async function checkMediasfuURL({
  data,
  member,
  roomName,
  islevel,
  socket,
  parameters,
  joinMediaSFURoom = joinRoomOnMediaSFU,
  localLink = '',
}: CheckMediasfuURLOptions): Promise<void> {

  if (
    data.mediasfuURL &&
    data.mediasfuURL !== '' &&
    data.mediasfuURL.length > 10
  ) {
   
    let link;
    let secretCode;

    try {
      const splitTexts = ['/meet/', '/chat/', '/broadcast/'];
      let splitText = splitTexts.find((text) => data.mediasfuURL.includes(text)) || '/meet/';

      const urlParts = data.mediasfuURL.split(splitText);
      link = urlParts[0];
      secretCode = urlParts[1].split('/')[1];
    } catch {
      link = data.mediasfuURL;
      return;
    }

    await checkLimitsAndMakeRequest({
      apiUserName: roomName,
      apiToken: secretCode,
      link,
      apiKey: '',
      userName: member,
      parameters,
      validate: false,
    });

    return;
  }

  if (
    (!data.mediasfuURL || data.mediasfuURL.length < 10) &&
    islevel !== '2' &&
    data.allowRecord &&
    (data.allowRecord === true || data.allowRecord === 'true') &&
    data.apiKey &&
    data.apiKey.length === 64 &&
    data.apiUserName &&
    data.apiUserName.length > 5 &&
    (roomName.startsWith('s') || roomName.startsWith('p'))
  ) {
    const payload:JoinMediaSFURoomOptions = {
      action: 'join',
      meetingID: roomName,
      userName: member,
    };

    const response = await joinMediaSFURoom({
      payload,
      apiKey: data.apiKey,
      apiUserName: data.apiUserName,
      localLink,
    });

    if (response.success && response.data && 'roomName' in response.data) {

      try {
        socket.emit(
          'updateMediasfuURL',
          { eventID: roomName, mediasfuURL: response.data.publicURL },
          async () => {}
        );
      } catch {
        // Do nothing
      }
    
      await checkLimitsAndMakeRequest({
        apiUserName: response.data.roomName,
        apiToken: response.data.secret,
        link: response.data.link,
        userName: member,
        parameters: parameters,
        validate: false,
      });
      parameters.updateApiToken(response.data.secret);
    }
    return;
  }
}

/**
 * Joins a user to a specified room via a socket connection.
 *
 * @param {JoinLocalRoomOptions} options - The options for joining the room.
 * @param {Socket} options.socket - The socket instance to use for communication.
 * @param {string} options.roomName - The name of the room to join.
 * @param {string} options.islevel - The level of the user.
 * @param {string} options.member - The member identifier.
 * @param {string} options.sec - The security token.
 * @param {string} options.apiUserName - The API username of the user.
 * @param {PreJoinPageParameters} options.parameters - Additional parameters for pre-join page actions.
 * @param {boolean} options.checkConnect - A flag to check the MediaSFU URL and perform necessary actions.
 * @param {JoinRoomOnMediaSFUType} [options.joinMediaSFURoom] - The function to join a room on MediaSFU.
 * @param {string} [options.localLink] - The local link for the Community Edition.
 * 
 * @returns {Promise<object>} A promise that resolves with the data received from the 'joinRoom' event or rejects with a validation error.
 * 
 * @example
 * ```typescript
 * const options = {
 *   socket: socketInstance,
 *   roomName: 's12345678',
 *   islevel: '1',
 *   member: 'user123',
 *   sec: '32CharacterLongSecretHere',
 *   apiUserName: 'user123',
 *   parameters: { someParameter: 'value' },
 *   checkConnect: true,
 * };
 *
 * try {
 *   const response = await joinLocalRoom(options);
 *   console.log('Room joined:', response);
 * } catch (error) {
 *   console.error('Failed to join room:', error);
 * }
 * ```
 */

async function joinLocalRoom
  ({
    socket,
    roomName,
    islevel,
    member,
    sec,
    apiUserName,
    parameters,
    checkConnect = false,
    joinMediaSFURoom = joinRoomOnMediaSFU,
    localLink = '',
  }: JoinLocalRoomOptions): Promise<ResponseJoinLocalRoom> {

  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!(sec && roomName && islevel && apiUserName && member)) {
      const validationError = {
        success: false,
        rtpCapabilities: null as any,
        reason: 'Missing required parameters',
      };
      reject(validationError);
      return;
    }

    // Validate alphanumeric for roomName, apiUserName, and member
    try {
      validateAlphanumeric({ str: roomName });
      validateAlphanumeric({ str: apiUserName });
      validateAlphanumeric({ str: member });
    } catch {
      const validationError = {
        success: false,
        rtpCapabilities: null as any,
        reason: 'Invalid roomName or apiUserName or member',
      };
      reject(validationError);
      return;
    }

    // Validate roomName starts with 's' or 'p'
    if (!(roomName.startsWith('s') || roomName.startsWith('p') || roomName.startsWith('m'))) {
      const validationError = {
        success: false,
        rtpCapabilities: null as any,
        reason: 'Invalid roomName, must start with s or p',
      };
      reject(validationError);
      return;
    }

    // Validate other conditions for sec, roomName, islevel, apiUserName
    if (
      !(
        sec.length === 32 &&
        roomName.length >= 8 &&
        islevel.length === 1 &&
        apiUserName.length >= 6 &&
        (islevel === '0' || islevel === '1' || islevel === '2')
      )
    ) {
      const validationError = {
        success: false,
        rtpCapabilities: null as any,
        reason: 'Invalid roomName or islevel or apiUserName or secret',
      };
      reject(validationError);
      return;
    }

    socket.emit(
      'joinRoom',
      { roomName, islevel, member, sec, apiUserName },
      async (data: ResponseJoinLocalRoom) => {

        try {
          // Check if rtpCapabilities is null
          if (data.rtpCapabilities === null) {
            // Check if isBanned or hostNotJoined
            if (data.isBanned) {
              throw new Error('User is banned.');
            }
            if (data.hostNotJoined) {
              throw new Error('Host has not joined the room yet.');
            }

            // If not null, create device or perform other actions as needed
            // ...

            // Resolve with the data received from the 'joinRoom' event
            resolve(data);
          } else {
            if (checkConnect) {
              await checkMediasfuURL({
                data,
                member,
                roomName,
                islevel,
                socket,
                parameters,
                joinMediaSFURoom,
                localLink,
              });
            }else {
              // if mediasfuURL is present, split and get the secret code
              if (data.mediasfuURL && data.mediasfuURL !== '' && data.mediasfuURL.length > 10) {
                let secretCode;
                const splitTexts = ['/meet/', '/chat/', '/broadcast/'];
                let splitText = splitTexts.find((text) => data.mediasfuURL.includes(text)) || '/meet/';
                const urlParts = data.mediasfuURL.split(splitText);
                secretCode = urlParts[1].split('/')[1];
                parameters.updateApiToken(secretCode);
              }
            }
            // Resolve with the data received from the 'joinRoom' event
            resolve(data);
          }
        } catch (error) {
          // Handle errors during the joinRoom process
          console.log('Error joining room:', error);
          reject(error);
        }
      }
    );
  });
}

export { joinLocalRoom };
