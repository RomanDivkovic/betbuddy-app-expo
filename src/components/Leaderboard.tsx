import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  data: LeaderboardEntry[];
}

export default function Leaderboard({ data }: LeaderboardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.userId}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.name}>{item.userName}</Text>
            <Text style={styles.points}>{item.points} pts</Text>
            {typeof item.correctPredictions === "number" && (
              <Text style={styles.stats}>
                {item.correctPredictions}/{item.totalPredictions} correct
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No leaderboard data yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
    color: "#2563eb",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rank: {
    width: 28,
    fontWeight: "bold",
    color: "#888",
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  points: {
    fontWeight: "bold",
    color: "#2563eb",
    marginLeft: 8,
  },
  stats: {
    marginLeft: 8,
    color: "#888",
    fontSize: 12,
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 16,
  },
});
