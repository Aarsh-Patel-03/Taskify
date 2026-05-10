import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTaskContext } from "../store/TaskContext";
import { StorageService } from "../utils/storage";
import { Task } from "../types";
import { theme } from "../theme";
import { TaskCard } from "../components/TaskCard";
import { TaskFormModal } from "../components/TaskFormModal";
import { FilterBar } from "../components/FilterBar";
import { StatsBar } from "../components/StatsBar";
import { EmptyState } from "../components/EmptyState";
import { getGreeting, getGreetingEmoji } from "../utils/user";
import { isSameDay } from "../utils/helpers";

interface HomeScreenProps {
  userName: string;
  onLogout: () => Promise<void>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ userName, onLogout }) => {
  const { tasks, filter, isLoading } = useTaskContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const calendarSwipeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < 40) {
          return;
        }

        if (gestureState.dx < 0) {
          setVisibleMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
          );
        } else {
          setVisibleMonth(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
          );
        }
      },
    }),
  ).current;

  const getMonthDays = useCallback((month: Date) => {
    const days: Date[] = [];
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const leadingDays = startOfMonth.getDay();
    const totalCells = 42; // 6 weeks
    const firstCell = new Date(startOfMonth);
    firstCell.setDate(1 - leadingDays);

    for (let i = 0; i < totalCells; i++) {
      const cell = new Date(firstCell);
      cell.setDate(firstCell.getDate() + i);
      days.push(cell);
    }
    return days;
  }, []);

  const taskCountByDay = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = new Date(task.dueDate).toDateString();
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [tasks]);

  const monthDays = useMemo(
    () => getMonthDays(visibleMonth),
    [visibleMonth, getMonthDays],
  );

  const selectedTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.dueDate && isSameDay(new Date(task.dueDate), selectedDate),
      ),
    [tasks, selectedDate],
  );

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return selectedTasks;
    const q = searchQuery.toLowerCase();
    return selectedTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q),
    );
  }, [selectedTasks, searchQuery]);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingTask(undefined);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingTask(undefined);
    setModalVisible(true);
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await StorageService.clearTasks();
    await onLogout();
  }, [onLogout]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const isFiltered = filter !== "all" || searchQuery.trim().length > 0;
  const greeting = getGreeting();
  const emoji = getGreetingEmoji();

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingEmoji}>{emoji}</Text>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{userName} 👋</Text>
          </View>
        </View>
        {/* <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Text style={styles.logoutText}>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Text>
          </TouchableOpacity>
        </View> */}
        <TouchableOpacity
          // style={styles.calendarBtn}
          onPress={() => {
            setCalendarOpen((prev) => {
              const willOpen = !prev;
              if (willOpen) {
                // Reset to current date and month when opening calendar
                const now = new Date();
                setSelectedDate(now);
                setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
              }
              return willOpen;
            });
          }}
        >
          <View style={styles.dateCalendar}>
            <View style={styles.dateCalendarTop} />
            <Text style={styles.dateCalendarText}>{new Date().getDate()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {calendarOpen && (
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.calendarNav}
              onPress={() =>
                setVisibleMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                )
              }
            >
              <Text style={styles.calendarNavText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {visibleMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity
              style={styles.calendarNav}
              onPress={() =>
                setVisibleMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                )
              }
            >
              <Text style={styles.calendarNavText}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.weekdayLabel}>
                {day}
              </Text>
            ))}
          </View>

          <View
            style={styles.calendarGrid}
            {...calendarSwipeResponder.panHandlers}
          >
            {monthDays.map((date) => {
              const isCurrentMonth =
                date.getMonth() === visibleMonth.getMonth();
              const isSelected = isSameDay(date, selectedDate);
              const dayCount = taskCountByDay.get(date.toDateString()) ?? 0;

              return (
                <TouchableOpacity
                  key={date.toDateString()}
                  style={[
                    styles.dayCell,
                    !isCurrentMonth && styles.dayCellFaded,
                    isSelected && styles.dayCellSelected,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      !isCurrentMonth && styles.dayCellTextFaded,
                      isSelected && styles.dayCellTextSelected,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {dayCount > 0 ? (
                    <View style={styles.taskDot}>
                      <Text style={styles.taskDotText}>{dayCount}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.selectedDateRow}>
            <Text style={styles.selectedDateLabel}>Tasks for</Text>
            <Text style={styles.selectedDateValue}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tasks..."
          placeholderTextColor={theme.colors.textMuted}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredBySearch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <StatsBar allTasks={tasks} />
            <FilterBar />
          </>
        }
        ListEmptyComponent={
          <EmptyState onAdd={handleAddNew} isFiltered={isFiltered} />
        }
        renderItem={({ item }) => <TaskCard task={item} onEdit={handleEdit} />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <TaskFormModal
        key={editingTask?.id ?? "new"}
        visible={modalVisible}
        onClose={handleCloseModal}
        editTask={editingTask}
        defaultDueDate={editingTask ? undefined : selectedDate.toISOString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerActions: {
    marginLeft: theme.spacing.sm,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoutText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
  },
  greetingBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  greetingEmoji: {
    fontSize: 32,
  },
  greeting: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    fontSize: 26,
    fontWeight: "300",
    color: theme.colors.bg,
    lineHeight: 30,
  },
  calendarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarBtnText: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.bg,
    lineHeight: 28,
  },
  calendarCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  calendarTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
  },
  calendarNav: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarNavText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  weekdayLabel: {
    width: 32,
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: theme.spacing.xs,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
    position: "relative",
  },
  dayCellFaded: {
    opacity: 0.35,
  },
  dayCellSelected: {
    backgroundColor: theme.colors.accent,
  },
  dayCellText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
  },
  dayCellTextFaded: {
    color: theme.colors.textMuted,
  },
  dayCellTextSelected: {
    color: theme.colors.bg,
  },
  taskDot: {
    position: "absolute",
    bottom: -8,
    right: 9,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
  },
  taskDotText: {
    color: "#000",
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDateRow: {
    marginTop: theme.spacing.sm,
  },
  selectedDateLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  selectedDateValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  fabText: {
    fontSize: 32,
    fontWeight: "300",
    color: theme.colors.bg,
    lineHeight: 36,
  },
  dateCalendar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  dateCalendarTop: {
    width: "100%",
    height: 10,
    backgroundColor: theme.colors.accent,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },

  dateCalendarText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
    textAlignVertical: "center",
  },
});

export default HomeScreen;
