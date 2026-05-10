import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FilterType, SortType } from '../types';
import { theme, CATEGORY_ICONS } from '../theme';
import { useTaskContext } from '../store/TaskContext';

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Done', value: 'completed' },
  { label: '👤 Personal', value: 'personal' },
  { label: '💼 Work', value: 'work' },
  { label: '💪 Health', value: 'health' },
  { label: '🛒 Shopping', value: 'shopping' },
  { label: '📌 Other', value: 'other' },
];

const SORT_OPTIONS: { label: string; value: SortType }[] = [
  { label: 'New', value: 'createdAt' },
  { label: 'Priority', value: 'priority' },
  { label: 'A-Z', value: 'title' },
  { label: 'Due', value: 'dueDate' },
];

export const FilterBar: React.FC = () => {
  const { filter, setFilter, sortBy, setSortBy } = useTaskContext();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_OPTIONS.map(opt => {
          const active = filter === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setFilter(opt.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortRow}
      >
        <Text style={styles.sortLabel}>Sort:</Text>
        {SORT_OPTIONS.map(opt => {
          const active = sortBy === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSortBy(opt.value)}
              style={[styles.sortChip, active && styles.sortChipActive]}
            >
              <Text style={[styles.sortText, active && styles.sortTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.bg,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: theme.spacing.md,
  },
  sortLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: '500',
    marginRight: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortChipActive: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: theme.colors.accent,
  },
  sortText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  sortTextActive: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
});
