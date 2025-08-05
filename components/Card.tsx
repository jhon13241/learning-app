import React, { useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing, Animation } from '../constants/designSystem';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  shadow?: keyof typeof Shadows;
  backgroundColor?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  borderRadius?: keyof typeof BorderRadius;
  onPress?: () => void;
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'cardPadding',
  shadow = 'small',
  backgroundColor,
  variant = 'default',
  borderRadius = 'card',
  onPress,
  animated = false,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!animated || !onPress) return;

    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: Animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!animated || !onPress) return;

    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: Animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius[borderRadius],
      padding: Spacing[padding],
    };

    const variantStyles = {
      default: {
        backgroundColor: backgroundColor || colors.secondarySystemGroupedBackground,
        ...Shadows[shadow],
        borderWidth: 0,
      },
      elevated: {
        backgroundColor: backgroundColor || colors.secondarySystemGroupedBackground,
        ...Shadows.medium,
        borderWidth: 0,
      },
      outlined: {
        backgroundColor: backgroundColor || 'transparent',
        borderWidth: 1,
        borderColor: colors.separator,
        ...Shadows.none,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const cardStyle = getCardStyle();

  const renderCard = () => (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View
        style={animated ? { transform: [{ scale: scaleAnim }] } : undefined}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}
          style={styles.pressableCard}
        >
          {renderCard()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return renderCard();
};

const styles = StyleSheet.create({
  pressableCard: {
    // Ensures the TouchableOpacity doesn't interfere with the card styling
  },
});