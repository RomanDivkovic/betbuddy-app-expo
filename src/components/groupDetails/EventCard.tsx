import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Event } from '../../types';
import { styles } from '../../screens/GroupDetailsScreen.styles';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => (
  <TouchableOpacity style={styles.eventCard} onPress={onPress}>
    <View style={styles.eventHeader}>
      <Text style={styles.eventTitle}>{event.title || 'Untitled Event'}</Text>
      <View style={styles.eventStatus}>
        <Text
          style={[
            styles.statusText,
            {
              color:
                event.status === 'upcoming'
                  ? '#2563eb'
                  : event.status === 'live'
                  ? '#dc2626'
                  : event.status === 'completed'
                  ? '#16a34a'
                  : '#6b7280',
            },
          ]}
        >
          {(event.status || 'upcoming').toUpperCase()}
        </Text>
      </View>
    </View>
    <Text style={styles.eventDate}>
      {event.date ? format(new Date(event.date), 'MMM dd, yyyy • h:mm a') : 'No date'}
    </Text>
    {event.location && <Text style={styles.eventLocation}>{event.location}</Text>}
    <Text style={styles.matchCount}>
      {Array.isArray(event.matches) ? event.matches.length : 0} fights
    </Text>
  </TouchableOpacity>
);

export default EventCard;
