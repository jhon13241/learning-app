import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, AccessibilityRole, Animated, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animation } from '../constants/designSystem';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'plain';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Feather.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
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
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityHint,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: Animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: Animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
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
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: colors.secondarySystemBackground,
        borderWidth: 1,
        borderColor: colors.separator,
      },
      tertiary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
      },
      plain: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...variantStyles[variant],
        opacity: 0.4,
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
      primary: { color: colors.white },
      secondary: { color: colors.label },
      tertiary: { color: colors.primary },
      plain: { color: colors.primary },
    };

    return {
      ...baseTextStyle,
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const getIconSize = () => {
    const sizes = {
      small: 16,
      medium: 18,
      large: 20,
    };
    return sizes[size];
  };

  const getIconColor = () => {
    if (disabled) return colors.gray3;
    
    const variantColors = {
      primary: colors.white,
      secondary: colors.label,
      tertiary: colors.primary,
      plain: colors.primary,
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

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
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
  },
  
  // Size variants
  smallButton: {
    height: 32,
    paddingHorizontal: Spacing.lg,
    minWidth: 80,
  },
  mediumButton: {
    height: 44,
    paddingHorizontal: Spacing.xl,
    minWidth: 100,
  },
  largeButton: {
    height: 50,
    paddingHorizontal: Spacing.xxl,
    minWidth: 120,
  },

  // Text styles
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  smallText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  mediumText: {
    ...Typography.subheadline,
    fontWeight: '600',
  },
  largeText: {
    ...Typography.body,
    fontWeight: '600',
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
});