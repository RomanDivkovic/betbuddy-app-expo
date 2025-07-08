import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../screens/GroupDetailsScreen.styles';
import { Group } from '../../types';

interface GroupHeaderProps {
  group: Group | null;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ group }) => (
  <View style={styles.groupHeader}>
    <Text style={styles.groupName}>{group?.name}</Text>
    {group?.description && (
      <Text style={styles.groupDescription}>{group.description}</Text>
    )}
    <Text style={styles.memberCount}>
      {Object.keys(group?.members || {}).length} members
    </Text>
  </View>
);

export default GroupHeader;
