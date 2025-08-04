/**
 * Modern iOS Design System for Breslov Study App
 * Sophisticated, minimalist design tokens with gradients and enhanced visual hierarchy
 */

// Enhanced modern color palette with gradients and depth
export const Colors = {
  // Primary Colors - Modern gradient-friendly blues
  primary: '#6366F1', // Indigo-500 - sophisticated, modern
  primaryDark: '#4F46E5', // Indigo-600 - for pressed/active states
  primaryLight: '#E0E7FF', // Indigo-100 - for backgrounds/highlights
  primaryExtraLight: '#F0F4FF', // very light indigo for subtle backgrounds
  primaryUltraLight: '#FAFAFF', // ultra light for gentle backgrounds

  // Accent Colors - Sophisticated gradients
  accent: '#8B5CF6', // Violet-500 - for highlights and special elements
  accentDark: '#7C3AED', // Violet-600
  accentLight: '#EDE9FE', // Violet-100

  // Modern semantic colors with better contrast
  success: '#10B981', // Emerald-500 - modern green
  successLight: '#D1FAE5', // Emerald-100
  warning: '#F59E0B', // Amber-500 - warm amber
  warningLight: '#FEF3C7', // Amber-100
  error: '#EF4444', // Red-500 - balanced red
  errorLight: '#FEE2E2', // Red-100
  info: '#3B82F6', // Blue-500 - classic info blue
  infoLight: '#DBEAFE', // Blue-100

  // Neutral Colors - Enhanced depth
  black: '#0F172A', // Slate-900 - richer black
  white: '#FFFFFF',
  pure: '#FEFEFE', // Slightly off-white for softer contrast

  // Enhanced Gray Scale - More sophisticated gradations
  gray1: '#64748B', // Slate-500 - Secondary text
  gray2: '#94A3B8', // Slate-400 - Tertiary text
  gray3: '#CBD5E1', // Slate-300 - Quaternary text
  gray4: '#E2E8F0', // Slate-200 - Separator
  gray5: '#F1F5F9', // Slate-100 - System fill
  gray6: '#F8FAFC', // Slate-50 - Secondary system background

  // Modern background hierarchy
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F8FAFC', // Slate-50
  tertiarySystemBackground: '#F1F5F9', // Slate-100

  // Enhanced text hierarchy
  label: '#0F172A', // Slate-900 - Primary text
  secondaryLabel: '#475569', // Slate-600 - Secondary text
  tertiaryLabel: '#64748B', // Slate-500 - Tertiary text
  quaternaryLabel: '#94A3B8', // Slate-400 - Quaternary text

  // Grouped backgrounds with better depth
  systemGroupedBackground: '#F8FAFC', // Slate-50
  secondarySystemGroupedBackground: '#FFFFFF',
  tertiarySystemGroupedBackground: '#F1F5F9', // Slate-100

  // Fill colors with enhanced hierarchy
  systemFill: '#E2E8F0', // Slate-200
  secondarySystemFill: '#F1F5F9', // Slate-100
  tertiarySystemFill: '#F8FAFC', // Slate-50
  quaternarySystemFill: '#FFFFFF',

  // Separator colors - more refined
  separator: '#E2E8F0', // Slate-200
  opaqueSeparator: '#CBD5E1', // Slate-300

  // Link Color
  link: '#6366F1', // Indigo-500

  // Dark Mode Colors - Sophisticated dark palette
  dark: {
    systemBackground: '#0F172A', // Slate-900
    secondarySystemBackground: '#1E293B', // Slate-800
    tertiarySystemBackground: '#334155', // Slate-700

    label: '#F1F5F9', // Slate-100
    secondaryLabel: '#CBD5E1', // Slate-300
    tertiaryLabel: '#94A3B8', // Slate-400
    quaternaryLabel: '#64748B', // Slate-500

    systemGroupedBackground: '#1E293B', // Slate-800
    secondarySystemGroupedBackground: '#0F172A', // Slate-900
    tertiarySystemGroupedBackground: '#334155', // Slate-700

    separator: '#334155', // Slate-700
    opaqueSeparator: '#475569', // Slate-600

    cardBackground: '#1E293B', // Slate-800
    border: '#334155', // Slate-700
    accent: '#CBD5E1', // Slate-300
    primaryButton: '#6366F1', // Indigo-500
    primaryButtonText: '#F1F5F9', // Slate-100
  },

  // Light mode specific colors
  primaryButton: '#6366F1', // Indigo-500
  primaryButtonText: '#FFFFFF',

  // Gradient definitions for modern effects
  gradients: {
    primary: ['#6366F1', '#8B5CF6'], // Indigo to Violet
    primarySubtle: ['#F0F4FF', '#EDE9FE'], // Light indigo to light violet
    accent: ['#8B5CF6', '#EC4899'], // Violet to Pink
    success: ['#10B981', '#059669'], // Emerald gradient
    warning: ['#F59E0B', '#D97706'], // Amber gradient
    error: ['#EF4444', '#DC2626'], // Red gradient
    neutral: ['#F8FAFC', '#F1F5F9'], // Slate gradient
    dark: ['#0F172A', '#1E293B'], // Dark slate gradient
  },
};

// Typography: Modern, readable font system with enhanced hierarchy
export const Typography = {
  // Display styles - for hero content
  display: {
    fontSize: 48,
    fontWeight: '800' as const,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.2,
  },
  
  // Title hierarchy with better spacing
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.1,
  },
  title2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
    letterSpacing: 0,
  },
  title4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 23,
    letterSpacing: 0,
  },
  
  // Body text with enhanced readability
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 25,
    letterSpacing: -0.1,
  },
  bodyMedium: {
    fontSize: 17,
    fontWeight: '500' as const,
    lineHeight: 25,
    letterSpacing: -0.1,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  calloutMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  
  // Supporting text
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  subheadlineMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.05,
  },
  footnoteMedium: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    letterSpacing: -0.05,
  },
  
  // Caption text
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption1Medium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.06,
  },
  caption2Medium: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 13,
    letterSpacing: 0.06,
  },
};

// Spacing: Enhanced spacing system with better hierarchy
export const Spacing = {
  // Basic spacing scale
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 12,   // 0.75rem
  lg: 16,   // 1rem
  xl: 20,   // 1.25rem
  xxl: 24,  // 1.5rem
  xxxl: 32, // 2rem
  
  // Component-specific spacing
  cardPadding: 20,       // Enhanced card padding
  cardPaddingSmall: 16,  // Smaller cards
  screenPadding: 20,     // Enhanced screen edges
  screenPaddingLarge: 24, // For larger screens
  sectionSpacing: 32,    // Between major sections
  sectionSpacingSmall: 24, // Smaller section gaps
  itemSpacing: 12,       // Between list items
  itemSpacingLarge: 16,  // For larger items
  
  // Layout constants
  safeAreaTop: 44,
  safeAreaBottom: 34,
  tabBarHeight: 49,
  navigationBarHeight: 44,
  
  // Interactive elements
  touchTargetMinimum: 44, // Minimum touch target
  buttonPadding: 16,      // Standard button padding
  buttonPaddingSmall: 12, // Small button padding
  
  // Content spacing
  paragraphSpacing: 16,   // Between paragraphs
  lineSpacing: 8,         // Between related lines
};

// Border radius: Modern, sophisticated curves
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  
  // Component-specific radii
  button: 12,        // Modern button radius
  buttonSmall: 8,    // Small buttons
  buttonLarge: 16,   // Large buttons
  card: 16,          // Modern card radius
  cardSmall: 12,     // Smaller cards
  modal: 20,         // Modals and sheets
  sheet: 24,         // Bottom sheets
  input: 8,          // Form inputs
  tag: 6,            // Tags and badges
  
  // Special cases
  circle: 999,       // For circular elements
  pill: 999,         // For pill-shaped elements
};

// Shadows: Modern, layered shadow system
export const Shadows = {
  // Subtle shadows for depth
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  
  // Component-specific shadows
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  button: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 32,
    elevation: 16,
  },
};

// Animation: Sophisticated motion design system
export const Animation = {
  // Duration scale
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 750,
  
  // Timing functions for smooth, natural motion
  easing: {
    // Standard easing curves
    linear: 'cubic-bezier(0, 0, 1, 1)',
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    
    // Apple-style easing
    appleBounce: 'cubic-bezier(0.28, 0.84, 0.42, 1)',
    appleSmooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    
    // Modern easing for sophisticated feel
    anticipate: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    backOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    circOut: 'cubic-bezier(0.55, 0, 1, 0.45)',
  },
  
  // Spring configurations for different use cases
  spring: {
    // Gentle springs for UI elements
    gentle: {
      damping: 20,
      stiffness: 120,
      mass: 1,
    },
    // Bouncy springs for interactions
    bouncy: {
      damping: 12,
      stiffness: 200,
      mass: 0.8,
    },
    // Snappy springs for quick interactions
    snappy: {
      damping: 25,
      stiffness: 300,
      mass: 0.6,
    },
    // Smooth springs for large elements
    smooth: {
      damping: 30,
      stiffness: 100,
      mass: 1.2,
    },
  },
  
  // Interaction-specific timings
  interaction: {
    buttonPress: 100,
    cardTap: 150,
    pageTransition: 300,
    modalPresent: 400,
    slideIn: 250,
    fadeIn: 200,
    scaleIn: 150,
  },
};

// Layout: Modern responsive design system
export const Layout = {
  // Touch targets and accessibility
  minTouchTarget: 44,
  recommendedTouchTarget: 48,
  
  // Content constraints
  maxContentWidth: 600,      // For readable text
  maxCardWidth: 400,         // For cards
  minCardWidth: 280,         // Minimum card size
  
  // Component heights
  navigationBar: 44,
  navigationBarLarge: 96,    // Large title navigation
  tabBar: 49,
  tabBarSafe: 83,           // With safe area
  searchBar: 36,
  searchBarLarge: 44,
  tableRowHeight: 44,
  tableRowHeightLarge: 56,
  listItemHeight: 64,       // Modern list items
  
  // Common component sizes
  buttonHeight: 48,
  buttonHeightSmall: 36,
  buttonHeightLarge: 56,
  inputHeight: 48,
  cardMinHeight: 120,
  
  // Grid system
  columns: 12,
  gutterWidth: 16,
  containerPadding: 20,
  
  // Breakpoints for responsive design
  breakpoints: {
    xs: 0,      // Small phones
    sm: 375,    // Standard phones
    md: 414,    // Large phones
    lg: 768,    // Tablets
    xl: 1024,   // Large tablets
    xxl: 1440,  // Desktop
  },
  
  // Screen size helpers
  screenSizes: {
    small: { width: 320, height: 568 },    // iPhone SE
    medium: { width: 375, height: 667 },   // iPhone 8
    large: { width: 414, height: 896 },    // iPhone 11
    tablet: { width: 768, height: 1024 },  // iPad
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
    primary: '#8B5CF6',      // Violet-500 in dark mode
    primaryDark: '#7C3AED',  // Violet-600 for pressed states
    primaryLight: '#2D1B69', // Dark violet for backgrounds
    accent: '#EC4899',       // Pink-500 for dark mode accent
    primaryButton: '#8B5CF6',
    primaryButtonText: '#F1F5F9',
    link: '#A78BFA',         // Violet-400 for better contrast
    
    // Enhanced semantic colors for dark mode
    success: '#34D399',      // Emerald-400
    warning: '#FBBF24',      // Amber-400
    error: '#F87171',        // Red-400
    info: '#60A5FA',         // Blue-400
  },
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: {
    ...Shadows,
    // Enhanced shadows for dark mode with better depth
    xs: { ...Shadows.xs, shadowOpacity: 0.3, shadowColor: '#000000' },
    small: { ...Shadows.small, shadowOpacity: 0.4, shadowColor: '#000000' },
    medium: { ...Shadows.medium, shadowOpacity: 0.5, shadowColor: '#000000' },
    large: { ...Shadows.large, shadowOpacity: 0.6, shadowColor: '#000000' },
    xl: { ...Shadows.xl, shadowOpacity: 0.7, shadowColor: '#000000' },
    card: { ...Shadows.card, shadowOpacity: 0.4, shadowColor: '#000000' },
    cardHover: { ...Shadows.cardHover, shadowOpacity: 0.6, shadowColor: '#000000' },
    button: { ...Shadows.button, shadowOpacity: 0.4, shadowColor: '#000000' },
    modal: { ...Shadows.modal, shadowOpacity: 0.8, shadowColor: '#000000' },
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