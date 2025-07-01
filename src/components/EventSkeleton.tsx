import React from "react";
import { View, StyleSheet } from "react-native";
import Shimmer from "./Shimmer";

export default function EventSkeleton() {
  return (
    <View style={styles.card}>
      {/* Avatar shimmer */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Shimmer
          width={40}
          height={40}
          borderRadius={20}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Shimmer width={140} height={18} style={{ marginBottom: 6 }} />
          <Shimmer width={90} height={14} />
        </View>
      </View>
      {/* Date and location shimmer */}
      <Shimmer width={100} height={12} style={{ marginBottom: 8 }} />
      <Shimmer width={60} height={12} style={{ marginBottom: 8 }} />
      {/* Status badge shimmer */}
      <Shimmer
        width={60}
        height={18}
        borderRadius={9}
        style={{ alignSelf: "flex-start", marginBottom: 8 }}
      />
      {/* Fights count shimmer */}
      <Shimmer width={50} height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
