import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchEventFromApi, createEvent } from "../services/firebaseService";
import { format } from "date-fns";

interface Props {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  onEventAdded?: () => void;
}

export default function EventSearchByDateModal({
  visible,
  onClose,
  groupId,
  onEventAdded,
}: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fights, setFights] = useState<any[]>([]);
  const [apiEvent, setApiEvent] = useState<any>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const searchFights = async () => {
    setLoading(true);
    setFights([]);
    setApiEvent(null);
    try {
      const apiDate = format(date, "yyyy-MM-dd");
      const event = await fetchEventFromApi("", apiDate);
      if (event && event.matches && event.matches.length > 0) {
        setFights(event.matches);
        setApiEvent(event);
      } else {
        Alert.alert("No fights found", `No fights found for ${apiDate}`);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to fetch fights");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!apiEvent) return;
    setLoading(true);
    try {
      await createEvent(groupId, {
        ...apiEvent,
        groupId,
        status: "upcoming",
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Event added", "Event and fights added to group!");
      if (onEventAdded) onEventAdded();
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            width: "90%",
            maxHeight: "80%",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
            Search Fights by Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={{ marginBottom: 12 }}
          >
            <Text style={{ fontSize: 16, color: "#2563eb" }}>
              Pick Date: {format(date, "yyyy-MM-dd")}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <TouchableOpacity
            onPress={searchFights}
            style={{
              backgroundColor: "#2563eb",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Search
            </Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="large" color="#2563eb" />}
          {fights.length > 0 && (
            <>
              <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
                {fights.length} fights found:
              </Text>
              <FlatList
                data={fights}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 200, marginBottom: 12 }}
                renderItem={({ item }) => (
                  <View style={{ paddingVertical: 6 }}>
                    <Text style={{ fontWeight: "600" }}>
                      {item.fighters.first.name} vs {item.fighters.second.name}
                    </Text>
                    <Text style={{ color: "#6b7280" }}>
                      {item.category} • {item.status.long}
                    </Text>
                  </View>
                )}
              />
              <TouchableOpacity
                onPress={handleAddEvent}
                style={{
                  backgroundColor: "#16a34a",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Add Event to Group
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={onClose} style={{ marginTop: 8 }}>
            <Text style={{ color: "#dc2626", textAlign: "center" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
