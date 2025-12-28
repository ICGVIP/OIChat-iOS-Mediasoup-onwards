import { WaitingRoomParticipant } from '../../@types/types';

// Export the type definition for the function
export type GenerateRandomWaitingRoomListType = (
) => WaitingRoomParticipant[];

/**
 * Generates a random list of participants for a waiting room.
 *
 * @returns An array of `WaitingRoomParticipant` objects, each with a random name and unique ID.
 *
 * @example
 * ```typescript
 * const waitingRoomList = generateRandomWaitingRoomList();
 * console.log(waitingRoomList);
 * // Output:
 * // [
 * //   { name: "Dimen", id: "0" },
 * //   { name: "Nore", id: "1" },
 * //   { name: "Ker", id: "2" },
 * //   { name: "Lor", id: "3" },
 * //   { name: "Mik", id: "4" }
 * // ]
 * ```
 */

const generateRandomWaitingRoomList = (): WaitingRoomParticipant[] => {
  // Array of random names to assign to participants in the waiting room
  const names = ['Dimen', 'Nore', 'Ker', 'Lor', 'Mik'];

  // Loop through the names array and add participants to the waiting room list
  const waitingRoomList: WaitingRoomParticipant[] = [];
  for (let i = 0; i < names.length; i++) {
    const randomName = names[i];
    waitingRoomList.push({
      name: randomName,
      id: i.toString(),
    });
  }

  return waitingRoomList;
};

export { generateRandomWaitingRoomList };
