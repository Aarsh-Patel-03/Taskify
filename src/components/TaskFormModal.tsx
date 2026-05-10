import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Task, Priority, Category } from "../types";
import {
  theme,
  CATEGORY_ICONS,
  PRIORITY_COLORS,
  CATEGORY_COLORS,
} from "../theme";
import { useTaskForm } from "../hooks/useTaskForm";
import { TimePicker } from "./TimePicker";

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  editTask?: Task;
  defaultDueDate?: string;
}

const PRIORITIES: Priority[] = ["low", "medium", "high"];
const CATEGORIES: Category[] = [
  "personal",
  "work",
  "health",
  "shopping",
  "other",
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onClose,
  editTask,
  defaultDueDate,
}) => {
  const { form, setField, errors, submit, reset } = useTaskForm(
    editTask,
    defaultDueDate,
  );

  const handleSubmit = async () => {
    const ok = await submit();
    if (ok) {
      reset();
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editTask ? "Edit Task" : "New Task"}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={form.title}
              onChangeText={(v) => setField("title", v)}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={100}
              autoFocus={!editTask}
            />
            {errors.title ? (
              <Text style={styles.errorText}>{errors.title}</Text>
            ) : null}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={form.description}
              onChangeText={(v) => setField("description", v)}
              placeholder="Add details..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={300}
            />
          </View>

          {/* Priority */}
          <View style={styles.field}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.optionRow}>
              {PRIORITIES.map((p) => {
                const color = PRIORITY_COLORS[p];
                const active = form.priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setField("priority", p)}
                    style={[
                      styles.optionChip,
                      active && {
                        backgroundColor: `${color}22`,
                        borderColor: color,
                      },
                    ]}
                  >
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={[styles.optionText, active && { color }]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat];
                const active = form.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setField("category", cat)}
                    style={[
                      styles.catChip,
                      active && {
                        backgroundColor: `${color}22`,
                        borderColor: color,
                      },
                    ]}
                  >
                    <Text style={styles.catIcon}>{CATEGORY_ICONS[cat]}</Text>
                    <Text style={[styles.catText, active && { color }]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Due Date <Text style={styles.optional}>(optional)</Text>
            </Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateControl}
                onPress={() => {
                  const date = form.dueDate
                    ? new Date(form.dueDate)
                    : new Date();
                  date.setDate(date.getDate() - 1);
                  setField("dueDate", date.toISOString());
                }}
              >
                <Text style={styles.dateControlText}>◀</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  const date = form.dueDate
                    ? new Date(form.dueDate)
                    : new Date();
                  setField("dueDate", date.toISOString());
                }}
              >
                <Text style={styles.dateButtonText}>
                  {form.dueDate
                    ? new Date(form.dueDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "No due date"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateControl}
                onPress={() => {
                  const date = form.dueDate
                    ? new Date(form.dueDate)
                    : new Date();
                  date.setDate(date.getDate() + 1);
                  setField("dueDate", date.toISOString());
                }}
              >
                <Text style={styles.dateControlText}>▶</Text>
              </TouchableOpacity>
              {form.dueDate ? (
                <TouchableOpacity
                  style={styles.dateClear}
                  onPress={() => setField("dueDate", undefined)}
                >
                  <Text style={styles.dateClearText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Reminder Time */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Reminder Time <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TimePicker
              value={form.reminderTime}
              onChange={(v) => setField("reminderTime", v)}
            />
            {form.reminderTime && (
              <Text style={styles.reminderHint}>
                🔔 You'll be notified: "Time to do: {form.title || "this task"}"
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>
                {editTask ? "Save Changes" : "Add Task"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  handleContainer: {
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  scroll: { padding: theme.spacing.lg, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  field: { marginBottom: theme.spacing.lg },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },
  required: { color: theme.colors.danger },
  optional: {
    color: theme.colors.textMuted,
    textTransform: "none",
    fontWeight: "400",
  },
  input: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  inputMulti: { minHeight: 90, paddingTop: theme.spacing.md },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flexWrap: "wrap",
  },
  dateButton: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  dateButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  dateControl: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dateControlText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  dateClear: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  dateClearText: {
    color: theme.colors.bg,
    fontWeight: "700",
  },
  inputError: { borderColor: theme.colors.danger },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSize.xs,
    marginTop: 4,
  },
  reminderHint: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontStyle: "italic",
  },
  optionRow: { flexDirection: "row", gap: theme.spacing.sm },
  optionChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  optionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  catIcon: { fontSize: 16 },
  catText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: theme.fontSize.md,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
  },
  submitText: {
    color: theme.colors.bg,
    fontWeight: "800",
    fontSize: theme.fontSize.md,
  },
});
