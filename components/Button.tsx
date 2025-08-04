import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, AccessibilityRole, Animated, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animation } from '../constants/designSystem';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glass';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Feather.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  hapticFeedback?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityHint,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        ...Animation.spring.snappy,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: Animation.interaction.buttonPress,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...Animation.spring.bouncy,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: Animation.interaction.buttonPress,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onPress();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
      ...(fullWidth && { width: '100%' }),
    };

    const variantStyles = {
      primary: {
        backgroundColor: colors.primary,
        ...Shadows.button,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: colors.secondarySystemGroupedBackground,
        borderWidth: 1,
        borderColor: colors.separator,
        ...Shadows.small,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      gradient: {
        borderWidth: 0,
        overflow: 'hidden',
      },
      glass: {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)',
        ...Shadows.small,
      },
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...variantStyles[variant],
        opacity: 0.5,
        backgroundColor: variant === 'primary' ? colors.gray4 : variantStyles[variant].backgroundColor,
      };
    }

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };

    const variantTextStyles = {
      primary: { color: colors.primaryButtonText },
      secondary: { color: colors.label },
      outline: { color: colors.primary },
      ghost: { color: colors.primary },
      gradient: { color: colors.white },
      glass: { color: colors.label },
    };

    if (disabled) {
      return {
        ...baseTextStyle,
        ...variantTextStyles[variant],
        opacity: 0.6,
      };
    }

    return {
      ...baseTextStyle,
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const getIconSize = () => {
    const sizes = {
      small: 16,
      medium: 20,
      large: 24,
    };
    return sizes[size];
  };

  const getIconColor = () => {
    if (disabled) return colors.gray3;
    
    const variantColors = {
      primary: colors.primaryButtonText,
      secondary: colors.label,
      outline: colors.primary,
      ghost: colors.primary,
      gradient: colors.white,
      glass: colors.label,
    };
    
    return variantColors[variant];
  };

  const renderContent = () => {
    const iconSize = getIconSize();
    const iconColor = getIconColor();
    const showLoading = loading && !disabled;

    return (
      <View style={styles.content}>
        {showLoading && (
          <ActivityIndicator
            size="small"
            color={iconColor}
            style={[styles.loadingIndicator, icon && iconPosition === 'left' && { marginRight: Spacing.sm }]}
          />
        )}
        
        {icon && iconPosition === 'left' && !showLoading && (
          <Feather
            name={icon}
            size={iconSize}
            color={iconColor}
            style={[styles.icon, { marginRight: Spacing.sm }]}
          />
        )}
        
        <Text style={getTextStyle()}>{title}</Text>
        
        {icon && iconPosition === 'right' && !showLoading && (
          <Feather
            name={icon}
            size={iconSize}
            color={iconColor}
            style={[styles.icon, { marginLeft: Spacing.sm }]}
          />
        )}
      </View>
    );
  };

  const buttonStyle = getButtonStyle();

  if (variant === 'gradient' && !disabled) {
    return (
      <Animated.View
        style={[
          buttonStyle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={isDark ? colors.gradients.accent : colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: buttonStyle.borderRadius }]}
        />
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          accessibilityLabel={accessibilityLabel || title}
          accessibilityRole={accessibilityRole}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: disabled || loading }}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  
  // Size variants
  smallButton: {
    height: 36,
    paddingHorizontal: Spacing.md,
    minWidth: 80,
  },
  mediumButton: {
    height: 48,
    paddingHorizontal: Spacing.lg,
    minWidth: 100,
  },
  largeButton: {
    height: 56,
    paddingHorizontal: Spacing.xl,
    minWidth: 120,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  smallText: {
    ...Typography.subheadlineMedium,
  },
  mediumText: {
    ...Typography.calloutMedium,
  },
  largeText: {
    ...Typography.bodyMedium,
  },

  // Content layout
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  icon: {
    // Icon spacing handled by parent
  },
  
  loadingIndicator: {
    // Loading indicator spacing handled by parent
  },
  
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: '100%',
  },
});