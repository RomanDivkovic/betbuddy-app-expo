import React, { useState, useEffect } from "react";
import Confetti from "../components/Confetti";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, RouteProp } from "@react-navigation/native";
import {
  fetchGroupById,
  fetchUserPredictions,
  savePrediction,
  getEventLeaderboard,
} from "../services/firebaseService";
import {
  Group,
  Event,
  Match,
  Prediction,
  LeaderboardEntry,
  RootStackParamList,
} from "../types";
import { format, isAfter } from "date-fns";

type EventDetailsRouteProp = RouteProp<RootStackParamList, "EventDetails">;

export default function EventDetailsScreen() {
  const route = useRoute<EventDetailsRouteProp>();
  const { eventId, groupId } = route.params;

  const [group, setGroup] = useState<Group | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "matches" | "predictions" | "leaderboard"
  >("matches");
  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFighter, setSelectedFighter] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEventData();
  }, [eventId, groupId]);

  const loadEventData = async () => {
    try {
      const [groupData, userPredictions, eventLeaderboard] = await Promise.all([
        fetchGroupById(groupId),
        fetchUserPredictions(groupId, eventId),
        getEventLeaderboard(groupId, eventId),
      ]);

      setGroup(groupData);
      setPredictions(userPredictions);
      setLeaderboard(eventLeaderboard);

      // Find the event in the group's events
      if (groupData.events && groupData.events[eventId]) {
        setEvent(groupData.events[eventId]);
      }
    } catch (error) {
      console.error("Error loading event data:", error);
      Alert.alert("Error", "Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setLoading(true);
    await loadEventData();
  };

  const canMakePredictions = (event: Event) => {
    return (
      event.status === "upcoming" && isAfter(new Date(event.date), new Date())
    );
  };

  const getUserPrediction = (matchId: string) => {
    return predictions.find((p) => p.matchId === matchId);
  };

  const handleMakePrediction = (match: Match) => {
    if (!canMakePredictions(event!)) {
      Alert.alert("Error", "Predictions are closed for this event");
      return;
    }

    setSelectedMatch(match);
    setSelectedFighter("");
    setSelectedMethod("");
    setModalVisible(true);
  };

  const handleSubmitPrediction = async () => {
    if (!selectedMatch || !selectedFighter || !selectedMethod) {
      Alert.alert("Error", "Please select a fighter and method");
      return;
    }

    setSubmitting(true);
    try {
      await savePrediction(
        groupId,
        eventId,
        selectedMatch.id,
        selectedFighter,
        selectedMethod
      );

      setModalVisible(false);
      await loadEventData();
      Alert.alert("Success", "Prediction saved successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save prediction");
    } finally {
      setSubmitting(false);
    }
  };

  const renderEventHeader = () => (
    <View style={styles.eventHeader}>
      <Text style={styles.eventTitle}>{event?.title}</Text>
      <Text style={styles.eventDate}>
        {event && format(new Date(event.date), "EEEE, MMMM dd, yyyy • h:mm a")}
      </Text>
      {event?.location && (
        <Text style={styles.eventLocation}>{event.location}</Text>
      )}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(event?.status || "upcoming") },
        ]}
      >
        <Text style={styles.statusText}>
          {event?.status?.toUpperCase() || "UPCOMING"}
        </Text>
      </View>
    </View>
  );

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

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {["matches", "predictions", "leaderboard"].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab as any)}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMatch = (match: Match) => {
    const userPrediction = getUserPrediction(match.id);
    const actualWinnerName = match.result
      ? match.result.winner === "fighter1"
        ? match.fighter1.name
        : match.fighter2.name
      : null;
    const actualMethod = match.result?.method || null;
    const predictedName = userPrediction
      ? userPrediction.predictedWinnerId === match.fighter1.id
        ? match.fighter1.name
        : match.fighter2.name
      : null;
    const predictedMethod = userPrediction?.method || null;
    const isCorrect = userPrediction?.isCorrect;
    const pointsEarned = userPrediction?.pointsEarned;

    // Show confetti if user got correct prediction for a finished fight
    useEffect(() => {
      if (actualWinnerName && userPrediction && isCorrect && !showConfetti) {
        setShowConfetti(true);
        // Hide confetti after 2.5s
        setTimeout(() => setShowConfetti(false), 2500);
      }
    }, [actualWinnerName, isCorrect, showConfetti]);

    return (
      <View key={match.id} style={styles.matchCard}>
        <Confetti visible={showConfetti} />
        <View style={styles.matchHeader}>
          <Text style={styles.matchOrder}>Fight {match.order}</Text>
          {match.type && <Text style={styles.matchType}>{match.type}</Text>}
        </View>

        <View style={styles.fightersContainer}>
          <View style={styles.fighter}>
            <Text style={styles.fighterName}>{match.fighter1.name}</Text>
            <Text style={styles.fighterRecord}>{match.fighter1.record}</Text>
            <Text style={styles.fighterCountry}>{match.fighter1.country}</Text>
          </View>

          <Text style={styles.vs}>VS</Text>

          <View style={styles.fighter}>
            <Text style={styles.fighterName}>{match.fighter2.name}</Text>
            <Text style={styles.fighterRecord}>{match.fighter2.record}</Text>
            <Text style={styles.fighterCountry}>{match.fighter2.country}</Text>
          </View>
        </View>

        {/* Prediction and Result Comparison */}
        <View style={styles.predictionResultRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.predictionLabel}>Your Prediction:</Text>
            {userPrediction ? (
              <Text style={styles.predictionText}>
                {predictedName} by {predictedMethod}
              </Text>
            ) : (
              <Text style={styles.predictionText}>No prediction</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultLabel}>Actual Result:</Text>
            {actualWinnerName ? (
              <Text style={styles.resultText}>
                {actualWinnerName}
                {actualMethod && ` by ${actualMethod}`}
              </Text>
            ) : (
              <Text style={styles.resultText}>TBD</Text>
            )}
          </View>
        </View>
        {/* Correct/Incorrect indicator */}
        {userPrediction && actualWinnerName && (
          <View style={styles.predictionOutcomeRow}>
            <Text
              style={[
                styles.predictionResult,
                { color: isCorrect ? "#16a34a" : "#dc2626" },
              ]}
            >
              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
              {typeof pointsEarned === "number" &&
                pointsEarned > 0 &&
                ` (+${pointsEarned} pts)`}
            </Text>
          </View>
        )}
        {/* Prediction button if allowed */}
        {!userPrediction && canMakePredictions(event!) && (
          <TouchableOpacity
            style={styles.predictButton}
            onPress={() => handleMakePrediction(match)}
          >
            <Text style={styles.predictButtonText}>Make Prediction</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => (
    <View key={entry.userId} style={styles.leaderboardCard}>
      <View style={styles.leaderboardRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.leaderboardInfo}>
        <Text style={styles.leaderboardName}>{entry.userName}</Text>
        <Text style={styles.leaderboardStats}>
          {entry.correctPredictions}/{entry.totalPredictions} correct
        </Text>
      </View>
      <Text style={styles.leaderboardPoints}>{entry.points} pts</Text>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "matches":
        return (
          <View style={styles.tabContent}>
            {event?.matches?.map(renderMatch) || (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No matches available</Text>
              </View>
            )}
          </View>
        );

      case "predictions":
        return (
          <View style={styles.tabContent}>
            {predictions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No predictions yet</Text>
                <Text style={styles.emptySubtext}>
                  Make your predictions on the Matches tab
                </Text>
              </View>
            ) : (
              predictions.map((prediction) => {
                const match = event?.matches?.find(
                  (m) => m.id === prediction.matchId
                );
                if (!match) return null;

                return (
                  <View key={prediction.id} style={styles.predictionCard}>
                    <Text style={styles.predictionMatchTitle}>
                      {match.fighter1.name} vs {match.fighter2.name}
                    </Text>
                    <Text style={styles.predictionDetails}>
                      Predicted:{" "}
                      {prediction.predictedWinnerId === match.fighter1.id
                        ? match.fighter1.name
                        : match.fighter2.name}{" "}
                      by {prediction.method}
                    </Text>
                    {prediction.isCorrect !== undefined && (
                      <Text
                        style={[
                          styles.predictionResult,
                          {
                            color: prediction.isCorrect ? "#16a34a" : "#dc2626",
                          },
                        ]}
                      >
                        {prediction.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        {prediction.pointsEarned &&
                          ` (+${prediction.pointsEarned} pts)`}
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </View>
        );

      case "leaderboard":
        return (
          <View style={styles.tabContent}>
            {leaderboard.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="podium-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No leaderboard data</Text>
                <Text style={styles.emptySubtext}>
                  Leaderboard will appear after predictions are made
                </Text>
              </View>
            ) : (
              leaderboard.map(renderLeaderboardEntry)
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {renderEventHeader()}
        {renderTabs()}
        {renderTabContent()}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make Prediction</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedMatch && (
              <>
                <Text style={styles.modalMatchTitle}>
                  {selectedMatch.fighter1.name} vs {selectedMatch.fighter2.name}
                </Text>

                <Text style={styles.sectionLabel}>Select Winner:</Text>
                <View style={styles.fighterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.fighterOption,
                      selectedFighter === selectedMatch.fighter1.id &&
                        styles.selectedOption,
                    ]}
                    onPress={() =>
                      setSelectedFighter(selectedMatch.fighter1.id)
                    }
                  >
                    <Text
                      style={[
                        styles.fighterOptionText,
                        selectedFighter === selectedMatch.fighter1.id &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {selectedMatch.fighter1.name}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.fighterOption,
                      selectedFighter === selectedMatch.fighter2.id &&
                        styles.selectedOption,
                    ]}
                    onPress={() =>
                      setSelectedFighter(selectedMatch.fighter2.id)
                    }
                  >
                    <Text
                      style={[
                        styles.fighterOptionText,
                        selectedFighter === selectedMatch.fighter2.id &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {selectedMatch.fighter2.name}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>Select Method:</Text>
                <View style={styles.methodOptions}>
                  {["KO/TKO", "Submission", "Decision"].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.methodOption,
                        selectedMethod === method && styles.selectedOption,
                      ]}
                      onPress={() => setSelectedMethod(method)}
                    >
                      <Text
                        style={[
                          styles.methodOptionText,
                          selectedMethod === method &&
                            styles.selectedOptionText,
                        ]}
                      >
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      submitting && styles.buttonDisabled,
                    ]}
                    onPress={handleSubmitPrediction}
                    disabled={submitting || !selectedFighter || !selectedMethod}
                  >
                    <Text style={styles.submitButtonText}>
                      {submitting ? "Submitting..." : "Submit"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  eventHeader: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#2563eb",
  },
  tabContent: {
    padding: 20,
  },
  matchCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  matchOrder: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  matchType: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
  fightersContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  fighter: {
    flex: 1,
    alignItems: "center",
  },
  fighterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 4,
  },
  fighterRecord: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  fighterCountry: {
    fontSize: 12,
    color: "#9ca3af",
  },
  vs: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9ca3af",
    marginHorizontal: 16,
  },
  predictionContainer: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0369a1",
    marginBottom: 4,
  },
  predictionText: {
    fontSize: 14,
    color: "#0c4a6e",
  },
  predictionResult: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  predictButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  predictButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803d",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: "#166534",
  },
  predictionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  predictionMatchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  predictionDetails: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  leaderboardCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  leaderboardStats: {
    fontSize: 14,
    color: "#6b7280",
  },
  leaderboardPoints: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9ca3af",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
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
    maxHeight: "80%",
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
  closeButton: {
    padding: 4,
  },
  modalMatchTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  fighterOptions: {
    marginBottom: 24,
  },
  fighterOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  fighterOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  selectedOptionText: {
    color: "#2563eb",
  },
  methodOptions: {
    marginBottom: 24,
  },
  methodOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  methodOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  predictionResultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  predictionOutcomeRow: {
    alignItems: "flex-start",
    marginBottom: 4,
  },
});
