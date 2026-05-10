import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Animated, StyleSheet, View } from "react-native";
import { theme } from "../theme";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  size = 26,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.timing(checkAnim, {
      toValue: checked ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [checked]);

  const bgColor = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", theme.colors.accent],
  });

  const borderColor = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.borderLight, theme.colors.accent],
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.3,
            backgroundColor: bgColor,
            borderColor: borderColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {checked && (
          <View style={styles.checkmark}>
            <View
              style={[styles.checkShort, { backgroundColor: theme.colors.bg }]}
            />
            <View
              style={[styles.checkLong, { backgroundColor: theme.colors.bg }]}
            />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  checkShort: {
    position: "absolute",
    width: 5,
    height: 2.5,
    borderRadius: 1,
    transform: [{ rotate: "45deg" }, { translateX: -2.5 }, { translateY: 2.5 }],
  },
  checkLong: {
    position: "absolute",
    width: 9,
    height: 2.5,
    borderRadius: 1,
    transform: [{ rotate: "-45deg" }, { translateX: 1 }, { translateY: -1 }],
  },
});
