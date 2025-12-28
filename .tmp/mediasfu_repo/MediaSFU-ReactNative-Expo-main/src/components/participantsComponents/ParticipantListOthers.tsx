import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ParticipantListOthersItem from './ParticipantListOthersItem';
import { Participant } from '../../@types/types';

export interface ParticipantListOthersOptions {
  participants: Participant[];
  coHost: string;
  member: string;
}

export type ParticipantListOthersType = (
  options: ParticipantListOthersOptions
) => JSX.Element;

/**
 * ParticipantListOthers is a React Native component that renders a list of participants, with options
 * for displaying co-host and member status. Each participant is rendered using the `ParticipantListOthersItem` component.
 * A separator line appears between each participant except the last one.
 *
 * @component
 * @param {ParticipantListOthersOptions} props - The properties for the ParticipantListOthers component.
 * @param {Array<Participant>} props.participants - An array of participant objects to display.
 * @param {string} props.coHost - Indicates the co-host status for displaying participants.
 * @param {string} props.member - Indicates the member status for displaying participants.
 * @returns {JSX.Element} The rendered ParticipantListOthers component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { ParticipantListOthers } from 'mediasfu-reactnative-expo';
 * 
 * function App() {
 *   const participants = [
 *     { id: '1', name: 'Alice' },
 *     { id: '2', name: 'Bob' },
 *   ];
 *   
 *   return (
 *     <ParticipantListOthers
 *       participants={participants}
 *       coHost="JohnDoe"
 *       member="JaneDoe"
 *     />
 *   );
 * }
 * 
 * export default App;
 * ```
 */

const ParticipantListOthers: React.FC<ParticipantListOthersOptions> = ({
  participants,
  coHost,
  member,
}) => (
  <ScrollView>
    {participants.map((participant, index) => (
      <React.Fragment key={participant.name}>
        <ParticipantListOthersItem
          participant={participant}
          coHost={coHost}
          member={member}
        />
        {index < participants.length - 1 && <View style={styles.separator} />}
      </React.Fragment>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 1,
  },
});

export default ParticipantListOthers;
