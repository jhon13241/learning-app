import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/designSystem';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  shadow?: keyof typeof Shadows;
  backgroundColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'cardPadding',
  shadow = 'card',
  backgroundColor = Colors.secondarySystemGroupedBackground,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          padding: Spacing[padding],
          ...Shadows[shadow],
          // More whitespace, softer border
          borderRadius: BorderRadius.card,
          borderWidth: 1,
          borderColor: Colors.separator,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    marginVertical: 12,
    // Minimal shadow
    ...Shadows.card,
  },
});