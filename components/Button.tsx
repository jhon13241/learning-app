import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, AccessibilityRole } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/designSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Feather.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
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
  style,
  textStyle,
  fullWidth = false,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityHint,
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
      ...(fullWidth && styles.fullWidth),
      // More whitespace, larger touch area
      minHeight: 48,
      paddingVertical: 0,
      borderRadius: 18,
    };
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? Colors.gray4 : Colors.primaryButton,
          borderWidth: 0,
          ...Shadows.small,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? Colors.gray5 : Colors.secondarySystemBackground,
          borderWidth: 1,
          borderColor: Colors.separator,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? Colors.gray4 : Colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
      // Larger, more readable
      fontSize: size === 'large' ? 20 : size === 'medium' ? 18 : 16,
      letterSpacing: 0.1,
    };
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: disabled ? Colors.gray2 : Colors.primaryButtonText,
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: disabled ? Colors.gray2 : Colors.label,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: disabled ? Colors.gray2 : Colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: disabled ? Colors.gray2 : Colors.primary,
        };
      default:
        return baseStyle;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return disabled ? Colors.gray2 : Colors.white;
      case 'secondary':
        return disabled ? Colors.gray2 : Colors.label;
      case 'outline':
      case 'ghost':
        return disabled ? Colors.gray2 : Colors.primary;
      default:
        return Colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
    >
      {icon && iconPosition === 'left' && (
        <Feather
          name={icon}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.leftIcon}
        />
      )}
      
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
      
      {icon && iconPosition === 'right' && (
        <Feather
          name={icon}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.rightIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: Spacing.xl,
    marginVertical: 8,
    // Minimal shadow
    ...Shadows.small,
  },
  fullWidth: {
    width: '100%',
  },
  smallButton: {
    paddingHorizontal: Spacing.md,
    minHeight: 40,
  },
  mediumButton: {
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  largeButton: {
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  smallText: {
    ...Typography.footnote,
    fontWeight: '600',
  },
  mediumText: {
    ...Typography.body,
    fontWeight: '600',
  },
  largeText: {
    ...Typography.title3,
    fontWeight: '700',
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
});