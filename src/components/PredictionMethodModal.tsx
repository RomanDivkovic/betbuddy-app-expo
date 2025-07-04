import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const PREDICTION_METHODS = ["Decision", "KO/TKO", "Submission"];

interface PredictionMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMethod: (method: string) => void;
}

export default function PredictionMethodModal({
  visible,
  onClose,
  onSelectMethod,
}: PredictionMethodModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select Method</Text>
          {PREDICTION_METHODS.map((method) => (
            <TouchableOpacity
              key={method}
              style={styles.methodButton}
              onPress={() => onSelectMethod(method)}
            >
              <Text style={styles.methodButtonText}>{method}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1f2937",
  },
  methodButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  methodButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#dc2626",
    fontSize: 16,
  },
});
