import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchUserGroups, createGroup } from '../services/firebaseService';
import { Group, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useGroupsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const userGroups = await fetchUserGroups();
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    await loadGroups();
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setCreating(true);
    try {
      await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        adminIds: [],
      });
      
      Alert.alert('Success', 'Group created successfully!');
      setModalVisible(false);
      setGroupName('');
      setGroupDescription('');
      await loadGroups();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const navigateToGroupDetails = (groupId: string) => {
    navigation.navigate('GroupDetails', { groupId });
  };

  return {
    groups,
    loading,
    modalVisible,
    groupName,
    groupDescription,
    creating,
    setModalVisible,
    setGroupName,
    setGroupDescription,
    loadGroups,
    onRefresh,
    handleCreateGroup,
    navigateToGroupDetails,
  };
};
