import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../screens/GroupDetailsScreen.styles';

interface TabsProps {
  activeTab: string;
  onTabPress: (tab: 'posts' | 'events' | 'members') => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabPress }) => (
  <View style={styles.tabContainer}>
    <TouchableOpacity
      style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
      onPress={() => onTabPress('posts')}
    >
      <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
        Posts
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tab, activeTab === 'events' && styles.activeTab]}
      onPress={() => onTabPress('events')}
    >
      <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
        Events
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tab, activeTab === 'members' && styles.activeTab]}
      onPress={() => onTabPress('members')}
    >
      <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
        Members
      </Text>
    </TouchableOpacity>
  </View>
);

export default Tabs;
