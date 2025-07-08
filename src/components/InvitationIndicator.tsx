
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useInvitations } from '../hooks/useInvitations';
import { FontAwesome } from '@expo/vector-icons';

const InvitationIndicator = () => {
  const { invitations } = useInvitations();

  if (invitations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FontAwesome name="bell" size={24} color="white" />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{invitations.length}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default InvitationIndicator;
