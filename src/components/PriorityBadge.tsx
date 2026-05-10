import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Priority } from "../types";
import { theme, PRIORITY_COLORS } from "../theme";

interface PriorityBadgeProps {
  priority: Priority;
  size?: "sm" | "md";
}

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "↑ High",
  medium: "Medium",
  low: "↓ Low",
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = "sm",
}) => {
  const color = PRIORITY_COLORS[priority];
  return (
    <View
      style={[
        styles.badge,
        { borderColor: color, backgroundColor: `${color}18` },
      ]}
    >
      <Text style={[styles.text, { color }, size === "md" && styles.textMd]}>
        {PRIORITY_LABELS[priority]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  textMd: {
    fontSize: theme.fontSize.sm,
  },
});
