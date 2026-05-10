import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { Task } from "../types";
import { theme, CATEGORY_COLORS, CATEGORY_ICONS } from "../theme";
import { useTaskContext } from "../store/TaskContext";
import { Checkbox } from "./Checkbox";
import { PriorityBadge } from "./PriorityBadge";
import { formatDate, formatDueDate } from "../utils/helpers";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { toggleComplete, deleteTask } = useTaskContext();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const categoryColor = CATEGORY_COLORS[task.category];
  const taskDateLabel = task.dueDate
    ? formatDueDate(task.dueDate)
    : formatDate(task.createdAt);

  const handleDelete = () => {
    Alert.alert("Delete Task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: -30,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => deleteTask(task.id));
        },
      },
    ]);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />

      <View style={styles.inner}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Checkbox
            checked={task.completed}
            onToggle={() => toggleComplete(task.id)}
          />

          <View style={styles.titleBlock}>
            <Text
              style={[styles.title, task.completed && styles.titleDone]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {task.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {task.description}
              </Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onEdit(task)}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.actionIcon}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.actionIcon, { color: theme.colors.danger }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.meta}>
            <Text style={[styles.categoryChip, { color: categoryColor }]}>
              {CATEGORY_ICONS[task.category]} {task.category}
            </Text>
            <PriorityBadge priority={task.priority} />
            <Text style={styles.date}>
              {task.dueDate ? `Due ${taskDateLabel}` : taskDateLabel}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
  },
  inner: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "600",
    lineHeight: 22,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flexWrap: "wrap",
  },
  categoryChip: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
