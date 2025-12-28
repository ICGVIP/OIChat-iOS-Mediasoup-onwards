

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PreJoinPageParameters } from "../../@types/types";
import { Socket } from "socket.io-client";


const MAX_ATTEMPTS = 10; // Maximum number of unsuccessful attempts before rate limiting
const RATE_LIMIT_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds


/**
 * Checks rate limits and makes a socket connection request.
 */
export const checkLimitsAndMakeRequest = async ({
    apiUserName,
    apiToken,
    link,
    apiKey = '',
    userName,
    parameters,
    validate = true,
}: {
    apiUserName: string;
    apiToken: string;
    link: string;
    apiKey?: string;
    userName: string;
    parameters: PreJoinPageParameters;
    validate?: boolean;
}) => {
    const TIMEOUT_DURATION = 10000; // 10 seconds

    try {
        // Retrieve unsuccessful attempts and last request timestamp from AsyncStorage
        let unsuccessfulAttempts = parseInt(
            (await AsyncStorage.getItem('unsuccessfulAttempts')) || '0',
            10);
        const lastRequestTimestamp = parseInt(
            (await AsyncStorage.getItem('lastRequestTimestamp')) || '0',
            10);

        // Check if user has exceeded maximum attempts
        if (
            unsuccessfulAttempts >= MAX_ATTEMPTS
            && Date.now() - lastRequestTimestamp < RATE_LIMIT_DURATION
        ) {
            parameters.showAlert?.({
                message: 'Too many unsuccessful attempts. Please try again later.',
                type: 'danger',
                duration: 3000,
            });
            await AsyncStorage.setItem(
                'lastRequestTimestamp',
                Date.now().toString(),
            );
            return;
        } if (unsuccessfulAttempts >= MAX_ATTEMPTS) {
            // Reset unsuccessful attempts after rate limit duration
            unsuccessfulAttempts = 0;
            await AsyncStorage.setItem(
                'unsuccessfulAttempts',
                unsuccessfulAttempts.toString(),
            );
            await AsyncStorage.setItem(
                'lastRequestTimestamp',
                Date.now().toString(),
            );
        }

        // Show loading modal
        parameters.updateIsLoadingModalVisible(true);

        // Attempt to connect to socket with a timeout
        const socketPromise = parameters.connectSocket({
            apiUserName,
            apiKey,
            apiToken,
            link,
        });
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(
            () => reject(new Error('Request timed out')),
            TIMEOUT_DURATION,
        ));

        const socket = await Promise.race([socketPromise, timeoutPromise]);

        if (socket && socket instanceof Socket && socket.id) {
            // Successful connection
            unsuccessfulAttempts = 0;
            await AsyncStorage.setItem(
                'unsuccessfulAttempts',
                unsuccessfulAttempts.toString(),
            );
            await AsyncStorage.setItem(
                'lastRequestTimestamp',
                Date.now().toString(),
            );

            // Update parent state with socket and user details
            if (validate) {
                // only one connection is established, no local socket
                parameters.updateSocket(socket);
            } else {
                // local socket is also established, mediaSFU connection is now the local socket
                parameters.updateLocalSocket?.(socket);
            }
            parameters.updateApiUserName(apiUserName);
            parameters.updateApiToken(apiToken);
            parameters.updateLink(link);
            parameters.updateRoomName(apiUserName);
            parameters.updateMember(userName);
            if (validate) parameters.updateValidated(true);
        } else {
            // Unsuccessful connection
            unsuccessfulAttempts += 1;
            await AsyncStorage.setItem(
                'unsuccessfulAttempts',
                unsuccessfulAttempts.toString(),
            );
            await AsyncStorage.setItem(
                'lastRequestTimestamp',
                Date.now().toString(),
            );
            parameters.updateIsLoadingModalVisible(false);

            if (unsuccessfulAttempts >= MAX_ATTEMPTS) {
                parameters.showAlert?.({
                    message: 'Too many unsuccessful attempts. Please try again later.',
                    type: 'danger',
                    duration: 3000,
                });
            } else {
                parameters.showAlert?.({
                    message: 'Invalid credentials.',
                    type: 'danger',
                    duration: 3000,
                });
            }
        }
    } catch (error) {
        // Handle errors during connection
        console.error('Error connecting to socket:', error);
        parameters.showAlert?.({
            message: 'Unable to connect. Check your credentials and try again.',
            type: 'danger',
            duration: 3000,
        });

        // Increment unsuccessful attempts
        let unsuccessfulAttempts = parseInt(
            (await AsyncStorage.getItem('unsuccessfulAttempts')) || '0',
            10);
        unsuccessfulAttempts += 1;
        await AsyncStorage.setItem(
            'unsuccessfulAttempts',
            unsuccessfulAttempts.toString(),
        );
        await AsyncStorage.setItem('lastRequestTimestamp', Date.now().toString());
        parameters.updateIsLoadingModalVisible(false);
    }

};