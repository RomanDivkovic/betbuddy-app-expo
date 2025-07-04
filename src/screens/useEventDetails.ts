import { useState, useEffect, useCallback } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import {
  fetchGroupEventDetails,
  fetchFightsByDate,
  getEventLeaderboard,
  savePrediction,
  fetchUserPredictions,
} from "../services/firebaseService";
import {
  RootStackParamList,
  Event as EventType,
  Fight,
  LeaderboardEntry,
  Prediction,
} from "../types";

type EventDetailsRouteProp = RouteProp<RootStackParamList, "EventDetails">;

export const useEventDetails = () => {
  const route = useRoute<EventDetailsRouteProp>();
  const { groupId, eventId } = route.params;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventType | null>(null);
  const [fights, setFights] = useState<Fight[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>(
    {}
  );
  const [isMethodModalVisible, setIsMethodModalVisible] = useState(false);
  const [selectedFight, setSelectedFight] = useState<{
    fightId: string;
    winnerId: string;
  } | null>(null);

  const loadEventDetails = useCallback(async () => {
    if (!groupId || !eventId) return;
    setLoading(true);
    try {
      const eventData = await fetchGroupEventDetails(groupId, eventId);
      setEvent(eventData);

      if (eventData && eventData.date) {
        const fightsData = await fetchFightsByDate(eventData.date);
        setFights(fightsData);
      }
      const leaderboardData = await getEventLeaderboard(groupId, eventId);
      setLeaderboard(leaderboardData);

      const userPredictions = await fetchUserPredictions(groupId, eventId);
      const predictionsMap = userPredictions.reduce((acc, p) => {
        acc[p.matchId] = p;
        return acc;
      }, {} as Record<string, Prediction>);
      setPredictions(predictionsMap);
    } catch (error) {
      console.error("Failed to load event details:", error);
      setEvent(null);
      setFights([]);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, [groupId, eventId]);

  useEffect(() => {
    loadEventDetails();
  }, [loadEventDetails]);

  const handleSelectWinner = (fightId: string, winnerId: string) => {
    setSelectedFight({ fightId, winnerId });
    setIsMethodModalVisible(true);
  };

  const handleSelectMethod = async (method: string) => {
    if (!selectedFight || !groupId || !eventId) return;

    const { fightId, winnerId } = selectedFight;

    try {
      const prediction = await savePrediction(
        groupId,
        eventId,
        fightId,
        winnerId,
        method
      );
      setPredictions((prev) => ({ ...prev, [fightId]: prediction }));
    } catch (error) {
      console.error("Failed to save prediction:", error);
    } finally {
      setIsMethodModalVisible(false);
      setSelectedFight(null);
    }
  };

  const closeModal = () => {
    setIsMethodModalVisible(false);
    setSelectedFight(null);
  };

  return {
    loading,
    event,
    fights,
    leaderboard,
    predictions,
    isMethodModalVisible,
    handleSelectWinner,
    handleSelectMethod,
    closeModal,
  };
};
