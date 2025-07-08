import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEventsScreen } from "./useEventsScreen";
import { styles } from "./EventsScreen.styles";
import EventSearchByDateModal from "../components/EventSearchByDateModal";
import { format } from "date-fns";

const EventsScreen = () => {
  const {
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    filteredEvents,
    groups,
    searchEventVisible,
    setSearchEventVisible,
    selectedGroupId,
    onRefresh,
    handleAddEventPress,
    handleCreateEvent,
    getEventStatus,
    navigateToEventDetails,
  } = useEventsScreen();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#2563eb";
      case "live":
        return "#dc2626";
      case "completed":
        return "#16a34a";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "live":
        return "Live";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const renderEventItem = ({ item }: { item: any }) => {
    const status = getEventStatus(item);
    const group = groups.find((g: any) => g.id === item.groupId);
    const eventTitle = item.title || item.name || "Unnamed Event";

    return (
      <TouchableOpacity
        style={styles.eventItem}
        onPress={() => navigateToEventDetails(item.id, item.groupId)}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{eventTitle}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
          </View>
        </View>
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {format(new Date(item.date), "EEE, MMM d, yyyy")}
            </Text>
          </View>
          {group && (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{group.name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (value: any, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.activeFilter]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[styles.filterText, filter === value && styles.activeFilterText]}
      >
        {label}
      </Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events or groups..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        {renderFilterButton("all", "All")}
        {renderFilterButton("upcoming", "Upcoming")}
        {renderFilterButton("live", "Live")}
        {renderFilterButton("completed", "Completed")}
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No events found.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddEventPress}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {selectedGroupId && (
        <EventSearchByDateModal
          visible={searchEventVisible}
          onClose={() => setSearchEventVisible(false)}
          onSelectEvent={handleCreateEvent}
        />
      )}
    </SafeAreaView>
  );
};

export default EventsScreen;
