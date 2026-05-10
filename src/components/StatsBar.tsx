import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Task } from '../types';

interface StatsBarProps {
  allTasks: Task[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ allTasks }) => {
  const total = allTasks.length;
  const done = allTasks.filter(t => t.completed).length;
  const active = total - done;
  const progress = total > 0 ? done / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.numbers}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: theme.colors.accent }]}>{active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: theme.colors.success }]}>{done}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      {total > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  numbers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.full,
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
});
