import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EnhancedTableOfContents from '../components/EnhancedTableOfContents';
import { useTheme } from '../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { Spacing, Typography, BorderRadius, Shadows } from '../constants/designSystem';

export default function TOCPage() {
  const { title } = useLocalSearchParams<{ title: string }>();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();

  const handleSectionPress = (reference: string) => {
    const encodedRef = encodeURIComponent(reference);
    router.push(`/text/${encodedRef}`);
  };

  if (!title) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.systemBackground }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>No text title provided</Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: theme.isDark ? colors.primaryButtonText : colors.white }]}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
      {/* Minimal Header with Safe Area */}
      <View style={[styles.minimalHeader, { paddingTop: insets.top, backgroundColor: colors.systemBackground }]}>
        {/* Empty header for minimal design */}
      </View>

      {/* Sub Header with Navigation Controls */}
      <View style={[styles.subHeader, { backgroundColor: colors.systemBackground, borderBottomColor: colors.separator }]}>
        <TouchableOpacity 
          style={[styles.backIconButton, { backgroundColor: colors.systemFill, borderRadius: 16 }]} 
          onPress={() => router.push('/')} 
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={18} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[styles.tocTitle, { color: colors.label }]}>Table of Contents</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      {/* Current Book Card */}
      <View style={[styles.currentBookCard, { backgroundColor: colors.secondarySystemGroupedBackground, borderColor: colors.separator, borderRadius: BorderRadius.card, ...theme.shadows.card }]}> 
        <Text style={[styles.currentBookText, { color: colors.label }]}>{title.replace(/_/g, ' ')}</Text>
      </View>
      
      <EnhancedTableOfContents 
        bookTitle={title}
        onSectionPress={handleSectionPress}
        themeColors={{
          background: colors.systemGroupedBackground,
          cardBackground: colors.secondarySystemGroupedBackground,
          text: colors.label,
          secondaryText: colors.secondaryLabel,
          border: colors.separator,
          accent: colors.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  minimalHeader: {
    minHeight: 12,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  tocTitle: {
    ...Typography.headline,
    fontWeight: '600',
  },
  spacer: {
    width: 32,
  },
  currentBookCard: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    ...Shadows.card,
  },
  currentBookText: {
    ...Typography.headline,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    ...Typography.title3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  backButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.button,
    ...Shadows.small,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});