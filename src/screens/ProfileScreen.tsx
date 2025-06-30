import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { currentUser, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to logout');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.displayName}>
        {currentUser?.displayName || 'User'}
      </Text>
      <Text style={styles.email}>
        {currentUser?.email}
      </Text>
    </View>
  );

  const renderMenuItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={danger ? '#dc2626' : '#6b7280'} 
        />
        <View style={styles.menuItemText}>
          <Text style={[
            styles.menuItemTitle,
            danger && styles.dangerText
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.menuItemSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {onPress && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={danger ? '#dc2626' : '#9ca3af'} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderProfileHeader()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderMenuItem(
            'person-outline',
            'Edit Profile',
            'Update your display name and photo',
            () => Alert.alert('Coming Soon', 'Profile editing will be available soon')
          )}
          {renderMenuItem(
            'notifications-outline',
            'Notifications',
            'Manage notification preferences',
            () => Alert.alert('Coming Soon', 'Notification settings will be available soon')
          )}
          {renderMenuItem(
            'lock-closed-outline',
            'Privacy',
            'Control your privacy settings',
            () => Alert.alert('Coming Soon', 'Privacy settings will be available soon')
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Betting</Text>
          {renderMenuItem(
            'stats-chart-outline',
            'Betting Statistics',
            'View your betting performance',
            () => Alert.alert('Coming Soon', 'Betting statistics will be available soon')
          )}
          {renderMenuItem(
            'trophy-outline',
            'Achievements',
            'Check your badges and achievements',
            () => Alert.alert('Coming Soon', 'Achievements will be available soon')
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderMenuItem(
            'help-circle-outline',
            'Help & FAQ',
            'Get help and find answers',
            () => Alert.alert('Coming Soon', 'Help section will be available soon')
          )}
          {renderMenuItem(
            'mail-outline',
            'Contact Support',
            'Get in touch with our team',
            () => Alert.alert('Coming Soon', 'Contact support will be available soon')
          )}
          {renderMenuItem(
            'information-circle-outline',
            'About',
            'App version and information',
            () => Alert.alert('About', 'BetBuddy Mobile App\nVersion 1.0.0')
          )}
        </View>

        <View style={styles.section}>
          {renderMenuItem(
            'log-out-outline',
            loggingOut ? 'Logging out...' : 'Logout',
            undefined,
            loggingOut ? undefined : handleLogout,
            true
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  displayName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  dangerText: {
    color: '#dc2626',
  },
  bottomPadding: {
    height: 20,
  },
});
