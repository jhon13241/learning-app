import React, { useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows, Spacing, Animation } from '../constants/designSystem';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  shadow?: keyof typeof Shadows;
  backgroundColor?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient' | 'glass';
  borderRadius?: keyof typeof BorderRadius;
  onPress?: () => void;
  animated?: boolean;
  pressable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'cardPadding',
  shadow = 'card',
  backgroundColor,
  variant = 'default',
  borderRadius = 'card',
  onPress,
  animated = true,
  pressable = false,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!animated || (!onPress && !pressable)) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        ...Animation.spring.gentle,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: Animation.interaction.cardTap,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!animated || (!onPress && !pressable)) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...Animation.spring.bouncy,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: Animation.interaction.cardTap,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius[borderRadius],
      padding: Spacing[padding],
      overflow: 'hidden' as const,
    };

    const variantStyles = {
      default: {
        backgroundColor: backgroundColor || colors.secondarySystemGroupedBackground,
        ...Shadows[shadow],
        borderWidth: 0,
      },
      elevated: {
        backgroundColor: backgroundColor || colors.secondarySystemGroupedBackground,
        ...Shadows.cardHover,
        borderWidth: 0,
      },
      outlined: {
        backgroundColor: backgroundColor || 'transparent',
        borderWidth: 1,
        borderColor: colors.separator,
        ...Shadows.none,
      },
      gradient: {
        borderWidth: 0,
        ...Shadows[shadow],
      },
      glass: {
        backgroundColor: isDark 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1,
        borderColor: isDark 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(255, 255, 255, 0.2)',
        ...Shadows.small,
        backdropFilter: 'blur(10px)',
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const cardStyle = getCardStyle();

  const renderCard = () => {
    if (variant === 'gradient') {
      return (
        <View style={[cardStyle, style]}>
          <LinearGradient
            colors={isDark ? colors.gradients.dark : colors.gradients.neutral}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: BorderRadius[borderRadius] }
            ]}
          />
          <View style={styles.gradientContent}>
            {children}
          </View>
        </View>
      );
    }

    return (
      <View style={[cardStyle, style]}>
        {children}
      </View>
    );
  };

  if (onPress || pressable) {
    return (
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={styles.pressableCard}
        >
          {renderCard()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (animated) {
    return (
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {renderCard()}
      </Animated.View>
    );
  }

  return renderCard();
};

const styles = StyleSheet.create({
  pressableCard: {
    // Ensures the TouchableOpacity doesn't interfere with the card styling
  },
  
  gradientContent: {
    // Ensures content sits above the gradient
    zIndex: 1,
  },
});