import React, { useState, useEffect, useMemo } from "react";
import AddEventModal from "../components/AddEventModal";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fetchUserGroups, fetchGroupEvents } from "../services/firebaseService";
import { useAuth } from "../context/AuthContext";
import EventSkeleton from "../components/EventSkeleton";
import { Group, Event, RootStackParamList } from "../types";
import { format, isAfter, isBefore } from "date-fns";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EventsScreen() {
  const { currentUser } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [addEventVisible, setAddEventVisible] = useState(false);
  const [search, setSearch] = useState("");
  // Only show groups where user is admin for event creation
  const adminGroups = useMemo(() => {
    if (!currentUser || !groups.length) return [];
    return groups.filter(
      (g) =>
        (g.adminIds && g.adminIds.includes(currentUser.uid)) ||
        (g.adminId && g.adminId === currentUser.uid)
    );
  }, [currentUser, groups]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "live" | "completed"
  >("all");

  useEffect(() => {
    loadData();
  }, []);

  // Memoized admin check for current user
  const isAdmin = useMemo(() => {
    if (!currentUser || !groups.length) return false;
    // User is admin in at least one group
    return groups.some(
      (g) =>
        (g.adminIds && g.adminIds.includes(currentUser.uid)) ||
        (g.adminId && g.adminId === currentUser.uid)
    );
  }, [currentUser, groups]);

  const loadData = async () => {
    try {
      const userGroups = await fetchUserGroups();
      setGroups(userGroups);

      // Fetch events from all groups
      const allEvents: Event[] = [];
      for (const group of userGroups) {
        try {
          const groupEvents = await fetchGroupEvents(group.id);
          allEvents.push(...groupEvents);
        } catch (error) {
          console.error(`Error fetching events for group ${group.id}:`, error);
        }
      }

      // Sort events by date
      allEvents.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setEvents(allEvents);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setLoading(true);
    await loadData();
  };

  const getEventStatus = (event: Event): "upcoming" | "live" | "completed" => {
    const eventDate = new Date(event.date);
    const now = new Date();

    if (event.status === "live") return "live";
    if (event.status === "completed") return "completed";

    // Check if event is within 6 hours of start time
    const eventStartTime = eventDate.getTime();
    const nowTime = now.getTime();
    const sixHoursInMs = 6 * 60 * 60 * 1000;

    if (Math.abs(eventStartTime - nowTime) <= sixHoursInMs) {
      return "live";
    }

    return isAfter(eventDate, now) ? "upcoming" : "completed";
  };

  const getFilteredEvents = () => {
    let filtered = events;
    if (filter !== "all") {
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
  };

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

  const renderEventItem = ({ item }: { item: Event }) => {
    const status = getEventStatus(item);
    const group = groups.find((g) => g.id === item.groupId);

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() =>
          navigation.navigate("EventDetails", {
            eventId: item.id,
            groupId: item.groupId,
          })
        }
      >
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.groupName}>
              {group?.name || "Unknown Group"}
            </Text>
          </View>
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
              {format(new Date(item.date), "MMM dd, yyyy")}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {format(new Date(item.date), "h:mm a")}
            </Text>
          </View>

          {item.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.eventFooter}>
          <Text style={styles.matchCount}>
            {item.matches?.length || 0} fights
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {["all", "upcoming", "live", "completed"].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.filterTab, filter === tab && styles.activeFilterTab]}
          onPress={() => setFilter(tab as any)}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === tab && styles.activeFilterTabText,
            ]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Events</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search events or groups..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );

  const filteredEvents = getFilteredEvents();

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilterTabs()}

      {/* Add Event button for admins */}
      {isAdmin && (
        <View
          style={{
            alignItems: "flex-end",
            paddingHorizontal: 20,
            marginTop: 8,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#2563eb",
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 20,
              marginBottom: 8,
            }}
            onPress={() => setAddEventVisible(true)}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              + Add Event
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Event Modal */}
      <AddEventModal
        visible={addEventVisible}
        onClose={() => setAddEventVisible(false)}
        groupOptions={adminGroups.map((g) => ({ id: g.id, name: g.name }))}
        onAdd={async ({ title, date, groupId }) => {
          try {
            // Use the new createEvent service
            // Minimal eventData: title, date, status, matches (empty), location (optional)
            const eventData = {
              title,
              date,
              status: "upcoming" as "upcoming",
              matches: [],
            };
            // Optionally add location, imageUrl, etc. if your modal supports it
            await import("../services/firebaseService").then(
              ({ createEvent }) => createEvent(groupId, eventData)
            );
            await loadData();
          } catch (e) {
            Alert.alert("Error", "Failed to add event");
          }
        }}
      />

      {loading ? (
        <View>
          {Array.from({ length: 4 }).map((_, i) => (
            <EventSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>
                {filter === "all" ? "No events found" : `No ${filter} events`}
              </Text>
              <Text style={styles.emptySubtitle}>
                Events will appear here when they're added to your groups
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  activeFilterTab: {
    backgroundColor: "#2563eb",
  },
  filterTabText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeFilterTabText: {
    color: "white",
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  eventCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  groupName: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  matchCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#9ca3af",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});
