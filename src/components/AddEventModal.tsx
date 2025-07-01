import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (event: {
    title: string;
    date: string;
    groupId: string;
  }) => Promise<void>;
  groupOptions: { id: string; name: string }[];
}

export default function AddEventModal({
  visible,
  onClose,
  onAdd,
  groupOptions,
}: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [groupId, setGroupId] = useState(groupOptions[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim() || !date.trim() || !groupId) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await onAdd({ title: title.trim(), date: date.trim(), groupId });
      setTitle("");
      setDate("");
      onClose();
    } catch (e) {
      Alert.alert("Error", "Failed to add event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.header}>Add Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD HH:mm)"
            value={date}
            onChangeText={setDate}
          />
          {/* Group selector */}
          <Text style={styles.label}>Group</Text>
          <View style={styles.groupList}>
            {groupOptions.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.groupOption,
                  groupId === g.id && styles.selectedGroup,
                ]}
                onPress={() => setGroupId(g.id)}
              >
                <Text
                  style={
                    groupId === g.id
                      ? styles.selectedGroupText
                      : styles.groupText
                  }
                >
                  {g.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAdd}
              disabled={loading}
            >
              <Text style={styles.addText}>
                {loading ? "Adding..." : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    elevation: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2563eb",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1f2937",
  },
  groupList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  groupOption: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedGroup: {
    backgroundColor: "#2563eb",
  },
  groupText: {
    color: "#1f2937",
  },
  selectedGroupText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  cancelBtn: {
    marginRight: 16,
  },
  cancelText: {
    color: "#888",
    fontWeight: "bold",
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  addText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
