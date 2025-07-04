import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import {
  fetchUserGroups,
  fetchGroupEvents,
  createEvent,
  fetchEventFromApi,
} from '../services/firebaseService';
import { Group, Event, RootStackParamList } from '../types';
import { isAfter } from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useEventsScreen = () => {
  const { currentUser } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all');
  const [searchEventVisible, setSearchEventVisible] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const adminGroups = useMemo(() => {
    if (!currentUser || !groups.length) return [];
    return groups.filter(
      (g) =>
        (g.adminIds && g.adminIds.includes(currentUser.uid)) ||
        (g.adminId && g.adminId === currentUser.uid)
    );
  }, [currentUser, groups]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userGroups = await fetchUserGroups();
      setGroups(userGroups);

      let allEvents: Event[] = [];
      for (const group of userGroups) {
        try {
          const groupEvents = await fetchGroupEvents(group.id);
          const normalized = (groupEvents || []).map((ev) => ({ ...ev, groupId: ev.groupId || group.id }));
          allEvents.push(...normalized);
        } catch (error) {
          console.error(`Error fetching events for group ${group.id}:`, error);
        }
      }

      allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    await loadData();
  };

  const handleAddEventPress = () => {
    if (adminGroups.length === 1) {
      setSelectedGroupId(adminGroups[0].id);
      setSearchEventVisible(true);
    } else if (adminGroups.length > 1) {
      Alert.alert(
        'Select a Group',
        'Which group do you want to add an event to?',
        adminGroups.map((g) => ({
          text: g.name,
          onPress: () => {
            setSelectedGroupId(g.id);
            setSearchEventVisible(true);
          },
        }))
      );
    } else {
      Alert.alert('No Admin Rights', 'You are not an admin of any group, so you cannot add events.');
    }
  };

  const handleCreateEvent = async (eventData: { slug: string; date: string }) => {
    if (!selectedGroupId) return;
    try {
      const apiEvent = await fetchEventFromApi(eventData.slug, eventData.date);
      if (!apiEvent) {
        throw new Error('Event not found in API.');
      }
      const { id, groupId, createdAt, ...restOfApiEvent } = apiEvent;
      await createEvent(selectedGroupId, restOfApiEvent);
      Alert.alert('Success', 'Event added successfully!');
      setSearchEventVisible(false);
      loadData();
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event.');
    }
  };

  const getEventStatus = (event: Event): 'upcoming' | 'live' | 'completed' => {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (event.status === 'live') return 'live';
    if (event.status === 'completed') return 'completed';
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    if (Math.abs(eventDate.getTime() - now.getTime()) <= sixHoursInMs) {
      return 'live';
    }
    return isAfter(eventDate, now) ? 'upcoming' : 'completed';
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (filter !== 'all') {
      filtered = filtered.filter((event) => getEventStatus(event) === filter);
    }
    if (search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filtered = filtered.filter((event) => {
        const group = groups.find((g) => g.id === event.groupId);
        return (
          event.title.toLowerCase().includes(searchLower) ||
          (group && group.name.toLowerCase().includes(searchLower))
        );
      });
    }
    return filtered;
  }, [events, filter, search, groups]);

  const navigateToEventDetails = (eventId: string, groupId: string) => {
    navigation.navigate('EventDetails', { eventId, groupId });
  };

  return {
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    filteredEvents,
    groups,
    adminGroups,
    searchEventVisible,
    setSearchEventVisible,
    selectedGroupId,
    onRefresh,
    handleAddEventPress,
    handleCreateEvent,
    getEventStatus,
    navigateToEventDetails,
  };
};
