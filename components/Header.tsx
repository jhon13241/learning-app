import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows } from '../constants/designSystem';

interface HeaderProps {
  title: string;
  leftButton?: {
    icon: keyof typeof Feather.glyphMap;
    onPress: () => void;
  };
  rightButton?: {
    icon: keyof typeof Feather.glyphMap;
    onPress: () => void;
  };
  subtitle?: string;
  backgroundColor?: string;
  showBorder?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  leftButton,
  rightButton,
  subtitle,
  backgroundColor = Colors.systemBackground,
  showBorder = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        paddingTop: insets.top,
        borderBottomColor: showBorder ? Colors.separator : 'transparent',
        // Minimal shadow
        ...Shadows.small,
      }
    ]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {leftButton && (
            <TouchableOpacity
              style={styles.button}
              onPress={leftButton.onPress}
              activeOpacity={0.6}
            >
              <Feather name={leftButton.icon} size={24} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.rightSection}>
          {rightButton && (
            <TouchableOpacity
              style={styles.button}
              onPress={rightButton.onPress}
              activeOpacity={0.6}
            >
              <Feather name={rightButton.icon} size={24} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    ...Shadows.small,
    // More whitespace
    minHeight: 64,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  leftSection: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  rightSection: {
    width: 48,
    alignItems: 'flex-end',
  },
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  title: {
    ...Typography.headline,
    color: Colors.label,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 0.1,
  },
  subtitle: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    marginTop: 2,
  },
});