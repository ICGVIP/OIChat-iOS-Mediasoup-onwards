import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Participant } from '../../@types/types';

export interface ParticipantListOthersItemOptions {
  participant: Participant;
  member: string;
  coHost: string;
}

export type ParticipantListOthersItemType = (
  options: ParticipantListOthersItemOptions
) => JSX.Element;

/**
 * ParticipantListOthersItem is a component that displays information about a single participant
 * in the participants list, indicating their host, co-host, or muted status.
 *
 * @component
 * @param {ParticipantListOthersItemOptions} props - The properties for the component.
 * @param {Participant} props.participant - An object containing the participant's details.
 * @param {string} props.participant.name - The name of the participant.
 * @param {string} props.participant.islevel - The level of the participant, indicating roles like host.
 * @param {boolean} props.participant.muted - Indicates if the participant is currently muted.
 * @param {string} props.member - The current user's name, used to label the participant if it matches.
 * @param {string} props.coHost - The name of the co-host, to distinguish participants with this role.
 * @returns {JSX.Element} The rendered ParticipantListOthersItem component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { ParticipantListOthersItem } from 'mediasfu-reactnative-expo';
 * 
 * function App() {
 *   const participant = { name: 'Alice', islevel: '1', muted: false };
 *   const member = 'Alice';
 *   const coHost = 'Bob';
 *   
 *   return (
 *     <ParticipantListOthersItem
 *       participant={participant}
 *       member={member}
 *       coHost={coHost}
 *     />
 *   );
 * }
 * 
 * export default App;
 * ```
 */

const ParticipantListOthersItem: React.FC<ParticipantListOthersItemOptions> = ({
  participant,
  member,
  coHost,
}) => (
  <View style={styles.container}>
    <View style={styles.nameContainer}>
      <Text style={styles.nameText}>
        {participant.islevel === '2'
          ? participant.name === member
            ? `${participant.name} (you)`
            : `${participant.name} (host)`
          : participant.name === member
            ? `${participant.name} (you)`
            : coHost === participant.name
              ? `${participant.name} (co-host)`
              : participant.name}
      </Text>
    </View>
    <View style={styles.iconContainer}>
      <FontAwesome
        name={participant.muted ? 'dot-circle-o' : 'dot-circle-o'}
        style={{ color: participant.muted ? 'red' : 'green' }}
      />
    </View>
    <View style={{ flex: 1, alignItems: 'flex-end' }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameContainer: {
    flex: 8,
  },
  nameText: {
    fontSize: 16,
  },
  iconContainer: {
    flex: 4,
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
});

export default ParticipantListOthersItem;
