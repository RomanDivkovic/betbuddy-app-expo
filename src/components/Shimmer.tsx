import React, { useRef, useEffect } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";

interface ShimmerProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function Shimmer({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: ShimmerProps) {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.container,
        { width: width as any, height: height as any, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            borderRadius,
            transform: [{ translateX }],
            width: "60%",
            height: "100%",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
    position: "relative",
  },
  shimmer: {
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: "#f5f5f5",
    opacity: 0.7,
  },
});
