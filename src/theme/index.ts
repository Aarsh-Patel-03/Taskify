export const theme = {
  colors: {
    bg: '#0F0F0F',
    bgCard: '#1A1A1A',
    bgElevated: '#242424',
    border: '#2E2E2E',
    borderLight: '#3A3A3A',

    accent: '#E8FF47',        // Electric lime
    accentDim: '#C8DF20',
    accentMuted: 'rgba(232,255,71,0.12)',

    text: '#F0F0F0',
    textSecondary: '#8A8A8A',
    textMuted: '#555555',

    success: '#4ADE80',
    danger: '#FF5757',
    warning: '#FFB347',

    priorityHigh: '#FF5757',
    priorityMedium: '#FFB347',
    priorityLow: '#4ADE80',

    categoryPersonal: '#A78BFA',
    categoryWork: '#60A5FA',
    categoryHealth: '#4ADE80',
    categoryShopping: '#FB923C',
    categoryOther: '#94A3B8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  font: {
    // Using system fonts - swap these with custom fonts if desired
    bold: 'System',
    medium: 'System',
    regular: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
};

export const CATEGORY_COLORS: Record<string, string> = {
  personal: theme.colors.categoryPersonal,
  work: theme.colors.categoryWork,
  health: theme.colors.categoryHealth,
  shopping: theme.colors.categoryShopping,
  other: theme.colors.categoryOther,
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: theme.colors.priorityHigh,
  medium: theme.colors.priorityMedium,
  low: theme.colors.priorityLow,
};

export const CATEGORY_ICONS: Record<string, string> = {
  personal: '👤',
  work: '💼',
  health: '💪',
  shopping: '🛒',
  other: '📌',
};
