import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

interface InviteMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onInvite: (email: string) => Promise<string>;
  groupName?: string;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  inviteButton: {
    backgroundColor: "#2563eb",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#374151",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
});

export default function InviteMemberModal({
  visible,
  onClose,
  onInvite,
  groupName,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert("Validation", "Please enter an email address.");
      return;
    }
    setIsInviting(true);
    try {
      await onInvite(email);
      setEmail("");
    } catch (error) {
      // Error is already handled in the parent component
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Member</Text>
          </View>
          <Text style={styles.description}>
            Enter the email of the person you want to invite to{" "}
            {groupName || "the group"}.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="friend@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isInviting}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.inviteButton]}
              onPress={handleInvite}
              disabled={isInviting}
            >
              {isInviting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Invite</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
