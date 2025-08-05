/**
 * Professional Apple-inspired Design System
 * Clean, sophisticated, minimalistic design tokens
 */

// Sophisticated, professional color palette - Apple-like
export const Colors = {
  // Primary Colors - Clean professional grays and blues
  primary: '#007AFF', // iOS Blue - clean and professional
  primaryDark: '#0056CC', // Darker blue for pressed states
  primaryLight: '#E5F1FF', // Very subtle blue highlight
  primaryExtraLight: '#F7FAFF', // Almost white with hint of blue

  // Sophisticated neutral palette
  black: '#1D1D1F', // Apple's sophisticated black
  white: '#FFFFFF',
  
  // Professional gray scale - Apple-inspired
  gray1: '#8E8E93', // iOS secondary text
  gray2: '#AEAEB2', // iOS tertiary text  
  gray3: '#C7C7CC', // iOS quaternary text
  gray4: '#D1D1D6', // iOS separator
  gray5: '#E5E5EA', // iOS system fill
  gray6: '#F2F2F7', // iOS secondary background

  // Clean semantic colors
  success: '#34C759', // iOS green
  warning: '#FF9500', // iOS orange
  error: '#FF3B30', // iOS red
  info: '#007AFF', // iOS blue

  // Professional backgrounds
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  tertiarySystemBackground: '#FFFFFF',

  // Clean text hierarchy
  label: '#000000',
  secondaryLabel: '#3C3C43', // 60% opacity
  tertiaryLabel: '#3C3C4399', // 30% opacity
  quaternaryLabel: '#3C3C432E', // 18% opacity

  // Professional grouped backgrounds
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  tertiarySystemGroupedBackground: '#F2F2F7',

  // Clean separators
  separator: '#3C3C4329', // 16% opacity
  opaqueSeparator: '#C6C6C8',

  // Professional dark mode
  dark: {
    systemBackground: '#000000',
    secondarySystemBackground: '#1C1C1E',
    tertiarySystemBackground: '#2C2C2E',

    label: '#FFFFFF',
    secondaryLabel: '#EBEBF5', // 60% opacity
    tertiaryLabel: '#EBEBF599', // 30% opacity
    quaternaryLabel: '#EBEBF52E', // 18% opacity

    systemGroupedBackground: '#000000',
    secondarySystemGroupedBackground: '#1C1C1E',
    tertiarySystemGroupedBackground: '#2C2C2E',

    separator: '#38383A',
    opaqueSeparator: '#38383A',
  },
};

// Clean, professional typography - SF Pro inspired
export const Typography = {
  // Large titles
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: 0.37,
  },
  
  // Title hierarchy
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
    letterSpacing: 0.38,
  },
  
  // Headlines and body
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  
  // Supporting text
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  
  // Captions
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
};

// Clean spacing system
export const Spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Component spacing
  cardPadding: 16,
  screenPadding: 16,
  sectionSpacing: 24,
  itemSpacing: 8,
  
  // Layout constants
  safeAreaTop: 44,
  safeAreaBottom: 34,
  tabBarHeight: 49,
  navigationBarHeight: 44,
  
  // Interactive elements
  touchTargetMinimum: 44,
  buttonPadding: 16,
};

// Minimal border radius
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  
  // Component specific
  button: 8,
  card: 12,
  modal: 12,
  sheet: 10,
};

// Subtle, professional shadows
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Clean animation system
export const Animation = {
  // Duration scale
  instant: 0,
  fast: 200,
  normal: 300,
  slow: 400,
  
  // Apple-standard easing
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
  
  // Minimal spring configurations
  spring: {
    gentle: {
      damping: 25,
      stiffness: 120,
      mass: 1,
    },
    responsive: {
      damping: 30,
      stiffness: 400,
      mass: 1,
    },
  },
};

// Clean layout system
export const Layout = {
  minTouchTarget: 44,
  maxContentWidth: 414,
  
  // Component heights
  navigationBar: 44,
  tabBar: 49,
  buttonHeight: 44,
  listItemHeight: 44,
  
  // Breakpoints
  breakpoints: {
    sm: 375,
    md: 414,
    lg: 768,
    xl: 1024,
  },
};

// Theme configuration
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
    primary: '#0A84FF', // iOS blue for dark mode
    primaryDark: '#0066CC',
    success: '#30D158', // iOS green for dark mode
    warning: '#FF9F0A', // iOS orange for dark mode
    error: '#FF453A', // iOS red for dark mode
  },
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: {
    ...Shadows,
    // Minimal shadows for dark mode
    subtle: { ...Shadows.subtle, shadowOpacity: 0.2, shadowColor: '#000000' },
    small: { ...Shadows.small, shadowOpacity: 0.3, shadowColor: '#000000' },
    medium: { ...Shadows.medium, shadowOpacity: 0.4, shadowColor: '#000000' },
    large: { ...Shadows.large, shadowOpacity: 0.5, shadowColor: '#000000' },
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