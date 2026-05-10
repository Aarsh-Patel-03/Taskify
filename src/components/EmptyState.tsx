import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

interface EmptyStateProps {
  onAdd: () => void;
  isFiltered: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAdd, isFiltered }) => (
  <View style={styles.container}>
    <Text style={styles.emoji}>{isFiltered ? '🔍' : '✅'}</Text>
    <Text style={styles.title}>
      {isFiltered ? 'No tasks found' : 'All clear!'}
    </Text>
    <Text style={styles.subtitle}>
      {isFiltered
        ? 'Try a different filter or add a new task.'
        : 'You have no tasks yet. Add one to get started.'}
    </Text>
    {!isFiltered && (
      <TouchableOpacity style={styles.btn} onPress={onAdd}>
        <Text style={styles.btnText}>+ Add your first task</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: 60,
  },
  emoji: {
    fontSize: 56,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  btn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
  },
  btnText: {
    color: theme.colors.bg,
    fontWeight: '800',
    fontSize: theme.fontSize.md,
  },
});
