import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const COLORS = [
  "#FFD700",
  "#FF69B4",
  "#00CFFF",
  "#7CFC00",
  "#FF6347",
  "#FFB347",
];
const { width, height } = Dimensions.get("window");
const CONFETTI_COUNT = 40;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const ConfettiPiece = ({ color }: { color: string }) => {
  const translateY = useRef(
    new Animated.Value(randomBetween(-height, 0))
  ).current;
  const translateX = useRef(
    new Animated.Value(randomBetween(0, width))
  ).current;
  const rotate = useRef(new Animated.Value(randomBetween(0, 360))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height + 50,
        duration: randomBetween(1200, 2200),
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 360 + randomBetween(0, 360),
        duration: randomBetween(1200, 2200),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
          transform: [
            { translateY },
            { translateX },
            {
              rotate: rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        },
      ]}
    />
  );
};

export default function Confetti({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiPiece key={i} color={COLORS[i % COLORS.length]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  confetti: {
    position: "absolute",
    width: 12,
    height: 18,
    borderRadius: 4,
    opacity: 0.85,
  },
});
