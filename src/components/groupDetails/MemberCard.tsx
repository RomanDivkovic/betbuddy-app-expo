import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupMember } from '../../types';
import { styles } from '../../screens/GroupDetailsScreen.styles';

interface MemberCardProps {
  member: [string, GroupMember];
  isAdmin: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isAdmin }) => {
  const [userId, memberInfo] = member;
  return (
    <View style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {memberInfo.userName?.charAt(0).toUpperCase() || 'U'}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{memberInfo.userName || 'Unknown'}</Text>
        <Text style={styles.memberRole}>
          {memberInfo.member === 'isAdmin' ? 'Admin' : 'Member'}
        </Text>
      </View>
      {isAdmin && <Ionicons name="star" size={16} color="#f59e0b" />}
    </View>
  );
};

export default MemberCard;
