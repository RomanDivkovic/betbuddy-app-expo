import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGroupsScreen } from './useGroupsScreen';
import { styles } from './GroupsScreen.styles';

const GroupsScreen = () => {
  const {
    groups,
    loading,
    modalVisible,
    groupName,
    groupDescription,
    creating,
    setModalVisible,
    setGroupName,
    setGroupDescription,
    onRefresh,
    handleCreateGroup,
    navigateToGroupDetails,
  } = useGroupsScreen();

  const renderGroup = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => navigateToGroupDetails(item.id)}
    >
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No groups found. Create one to get started!
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Create New Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={groupName}
              onChangeText={setGroupName}
            />
            <TextInput
              style={styles.input}
              placeholder="Group Description"
              value={groupDescription}
              onChangeText={setGroupDescription}
            />
            <Button
              title={creating ? 'Creating...' : 'Create Group'}
              onPress={handleCreateGroup}
              disabled={creating}
            />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GroupsScreen;
