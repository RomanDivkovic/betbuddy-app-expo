import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";
import Leaderboard from "../components/Leaderboard";
import PredictionMethodModal from "../components/PredictionMethodModal";
import { useEventDetails } from "./useEventDetails";
import { styles } from "./EventDetailsScreen.styles";
import { Fight } from "../types";

const FightCard = ({
  item,
  userPrediction,
  isFightCompleted,
  onSelectWinner,
}) => (
  <View style={styles.card}>
    <View style={styles.fightHeader}>
      <Text style={styles.fightCategory}>{item.category}</Text>
    </View>
    <View style={styles.fightersRow}>
      <View style={styles.fighter}>
        <Text style={styles.fighterName}>{item.fighters.first.name}</Text>
      </View>
      <Text style={styles.vs}>VS</Text>
      <View style={styles.fighter}>
        <Text style={styles.fighterName}>{item.fighters.second.name}</Text>
      </View>
    </View>
    <View style={styles.predictionContainer}>
      <View style={styles.fightersRow}>
        <TouchableOpacity
          style={[
            styles.predictionButton,
            userPrediction?.predictedWinnerId ===
              item.fighters.first.id.toString() && styles.selectedPrediction,
            isFightCompleted && styles.disabledPrediction,
          ]}
          onPress={() =>
            onSelectWinner(
              item.id.toString(),
              item.fighters.first.id.toString()
            )
          }
          disabled={isFightCompleted}
        >
          <Text
            style={[
              styles.predictionButtonText,
              userPrediction?.predictedWinnerId ===
                item.fighters.first.id.toString() &&
                styles.selectedPredictionText,
            ]}
          >
            Select {item.fighters.first.name.split(" ").pop()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.predictionButton,
            userPrediction?.predictedWinnerId ===
              item.fighters.second.id.toString() && styles.selectedPrediction,
            isFightCompleted && styles.disabledPrediction,
          ]}
          onPress={() =>
            onSelectWinner(
              item.id.toString(),
              item.fighters.second.id.toString()
            )
          }
          disabled={isFightCompleted}
        >
          <Text
            style={[
              styles.predictionButtonText,
              userPrediction?.predictedWinnerId ===
                item.fighters.second.id.toString() &&
                styles.selectedPredictionText,
            ]}
          >
            Select {item.fighters.second.name.split(" ").pop()}
          </Text>
        </TouchableOpacity>
      </View>
      {userPrediction && (
        <Text style={styles.userPredictionText}>
          You predicted:{" "}
          {userPrediction.predictedWinnerId ===
          item.fighters.first.id.toString()
            ? item.fighters.first.name
            : item.fighters.second.name}
          {userPrediction.method && ` by ${userPrediction.method}`}
        </Text>
      )}
      {isFightCompleted && !userPrediction && (
        <Text style={styles.userPredictionText}>
          Predictions are closed for this fight.
        </Text>
      )}
    </View>
  </View>
);

export default function EventDetailsScreen() {
  const {
    loading,
    event,
    fights,
    leaderboard,
    predictions,
    isMethodModalVisible,
    handleSelectWinner,
    handleSelectMethod,
    closeModal,
  } = useEventDetails();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Event not found.</Text>
      </View>
    );
  }

  const renderFightCard = ({ item }: { item: Fight }) => {
    const userPrediction = predictions[item.id.toString()];
    const isFightCompleted =
      item.status.short === "FT" || item.status.short === "CANC";

    return (
      <FightCard
        item={item}
        userPrediction={userPrediction}
        isFightCompleted={isFightCompleted}
        onSelectWinner={handleSelectWinner}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>
          {format(new Date(event.date), "EEEE, MMMM dd, yyyy")}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Leaderboard</Text>
      <Leaderboard data={leaderboard} />

      <Text style={styles.sectionTitle}>Fights</Text>
      {fights.length > 0 ? (
        <FlatList
          data={fights}
          renderItem={renderFightCard}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No fights found for this event.</Text>
        </View>
      )}
      <PredictionMethodModal
        visible={isMethodModalVisible}
        onClose={closeModal}
        onSelectMethod={handleSelectMethod}
      />
    </ScrollView>
  );
}
