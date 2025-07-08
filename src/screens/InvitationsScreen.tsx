
import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useInvitations } from '../hooks/useInvitations';
import { Invitation } from '../types';

const InvitationsScreen = () => {
  const { invitations, loading, handleAcceptInvitation, handleDeclineInvitation } = useInvitations();

  const renderItem = ({ item }: { item: Invitation }) => (
    <View style={styles.invitationContainer}>
      <Text>You have been invited to join {item.groupName}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Accept" onPress={() => handleAcceptInvitation(item)} />
        <Button title="Decline" onPress={() => handleDeclineInvitation(item)} color="red" />
      </View>
    </View>
  );

  if (loading) {
    return <Text>Loading invitations...</Text>;
  }

  return (
    <View style={styles.container}>
      {invitations.length === 0 ? (
        <Text>No pending invitations.</Text>
      ) : (
        <FlatList
          data={invitations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  invitationContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default InvitationsScreen;
