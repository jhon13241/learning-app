/**
 * Modern iOS Design System for Breslov Study App
 * Apple-inspired design tokens and styling constants
 */

// Modern professional blue
export const Colors = {
  primary: '#60A5FA', // blue-400 (balanced, modern, light)
  primaryDark: '#3B82F6', // blue-500 (for pressed/active states)
  primaryLight: '#DBEAFE', // blue-100 (for backgrounds/highlights)
  primaryExtraLight: '#F0F9FF', // very light blue for subtle backgrounds

  // Semantic Colors
  success: '#4CAF50',      // Muted green
  warning: '#FFB300',      // Muted amber
  error: '#D32F2F',        // Muted red
  info: '#1976D2',         // Muted blue

  // Neutral Colors
  black: '#181A1B',
  white: '#FFFFFF',

  // Gray Scale (Minimalist, soft)
  gray1: '#6E767D',        // Secondary text
  gray2: '#A0A4A8',        // Tertiary text
  gray3: '#C7C9CB',        // Quaternary text
  gray4: '#E0E2E4',        // Separator
  gray5: '#F4F5F7',        // System fill
  gray6: '#FAFAFA',        // Secondary system background

  // Background Colors
  systemBackground: '#FAFAFA',
  secondarySystemBackground: '#F4F5F7',
  tertiarySystemBackground: '#FFFFFF',

  // Text Colors
  label: '#222222',
  secondaryLabel: '#6E767D',
  tertiaryLabel: '#A0A4A8',
  quaternaryLabel: '#C7C9CB',

  // Grouped Background Colors
  systemGroupedBackground: '#F4F5F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  tertiarySystemGroupedBackground: '#F4F5F7',

  // Fill Colors
  systemFill: '#E0E2E4',
  secondarySystemFill: '#F4F5F7',
  tertiarySystemFill: '#FAFAFA',
  quaternarySystemFill: '#FFFFFF',

  // Separator Colors
  separator: '#E0E2E4',
  opaqueSeparator: '#C7C9CB',

  // Link Color
  link: '#60A5FA',

  // Dark Mode Colors - Minimalist, soft
  dark: {
    systemBackground: '#181A1B',
    secondarySystemBackground: '#232627',
    tertiarySystemBackground: '#232627',

    label: '#F4F5F7',
    secondaryLabel: '#A0A4A8',
    tertiaryLabel: '#6E767D',
    quaternaryLabel: '#3A3A3A',

    systemGroupedBackground: '#232627',
    secondarySystemGroupedBackground: '#181A1B',
    tertiarySystemGroupedBackground: '#232627',

    separator: '#232627',
    opaqueSeparator: '#3A3A3A',

    cardBackground: '#232627',
    border: '#232627',
    accent: '#A0A4A8',
    primaryButton: '#3B82F6',
    primaryButtonText: '#F4F5F7',
  },

  // Light mode specific colors
  primaryButton: '#60A5FA',
  primaryButtonText: '#FFFFFF',
};

// Typography: standard iOS/Android app defaults
export const Typography = {
  largeTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  title1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
    letterSpacing: 0.15,
  },
  title2: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 25,
    letterSpacing: 0.1,
  },
  title3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0.05,
  },
  headline: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.02,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0.01,
  },
  callout: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.01,
  },
  subheadline: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0.01,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 14,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
};

// Spacing: standard iOS/Android app defaults
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  cardPadding: 16,
  screenPadding: 16,
  sectionSpacing: 20,
  itemSpacing: 10,
  safeAreaTop: 44,
  safeAreaBottom: 34,
  tabBarHeight: 49,
};

// Border radius: standard iOS/Android app defaults
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  button: 8,
  card: 12,
  modal: 16,
  sheet: 20,
};

// Shadows: more subtle
export const Shadows = {
  small: {
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  large: {
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
};

export const Animation = {
  // iOS Animation Durations
  fast: 200,
  normal: 300,
  slow: 500,
  
  // Easing Functions (for Reanimated)
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  // Spring Configurations
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
};

export const Layout = {
  // Screen Dimensions
  minTouchTarget: 44,
  maxContentWidth: 414,
  
  // Component Heights
  navigationBar: 44,
  tabBar: 49,
  searchBar: 36,
  tableRowHeight: 44,
  
  // Breakpoints
  breakpoints: {
    small: 320,
    medium: 375,
    large: 414,
    xlarge: 768,
  },
};

// Theme Configuration
export interface Theme {
  colors: typeof Colors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  animation: typeof Animation;
  layout: typeof Layout;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animation: Animation,
  layout: Layout,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: {
    ...Colors,
    ...Colors.dark,
    primary: '#FFFFFF',      // White primary in dark mode
    primaryDark: '#CCCCCC',  // Light gray for pressed states
    primaryButton: '#FFFFFF',
    primaryButtonText: '#000000',
  },
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: {
    ...Shadows,
    // Minimal shadows for dark mode
    small: { ...Shadows.small, shadowOpacity: 0.1, shadowColor: '#FFFFFF' },
    medium: { ...Shadows.medium, shadowOpacity: 0.15, shadowColor: '#FFFFFF' },
    large: { ...Shadows.large, shadowOpacity: 0.2, shadowColor: '#FFFFFF' },
    card: { ...Shadows.card, shadowOpacity: 0.1, shadowColor: '#FFFFFF' },
  },
  animation: Animation,
  layout: Layout,
  isDark: true,
};

// Helper Functions
export const getTheme = (isDark: boolean = false): Theme => {
  return isDark ? darkTheme : lightTheme;
};

export const createTextStyle = (
  textStyle: keyof typeof Typography,
  color?: string,
  additionalStyles?: object
) => ({
  ...Typography[textStyle],
  color: color || Colors.label,
  ...additionalStyles,
});

export const createShadowStyle = (shadowType: keyof typeof Shadows) => ({
  ...Shadows[shadowType],
});