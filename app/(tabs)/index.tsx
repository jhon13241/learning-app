import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRESLOV_TEXTS, BreslovText } from '../../constants/breslovTexts';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/designSystem';
import { useTheme } from '../../contexts/ThemeContext';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  const handleTextPress = (text: BreslovText) => {
    // Navigate to text reader with the API reference
    router.push(`/text/${encodeURIComponent(text.apiReference)}`);
  };

  const renderTextItem = ({ item }: { item: BreslovText }) => (
    <TouchableOpacity
      style={[styles.textItem, { backgroundColor: colors.secondarySystemGroupedBackground }]}
      onPress={() => handleTextPress(item)}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`Read ${item.title}`}
      accessibilityHint="Tap to open this text for reading"
    >
      <View style={styles.textItemContent}>
        <View style={styles.textItemHeader}>
          <Text style={[styles.textTitle, { color: colors.label }]}>{item.title}</Text>
          <View style={styles.chevronContainer}>
            <Feather name="chevron-right" size={22} color={colors.gray2} />
          </View>
        </View>
        <Text style={[styles.textSubtitle, { color: colors.secondaryLabel }]}> 
          {item.languages.map(lang => lang === 'en' ? 'English' : lang === 'he' ? 'Hebrew' : lang).join(' | ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
      {/* Status Bar Safe Area */}
      <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: colors.systemBackground }]} />

      {/* Navigation Header */}
      <View style={[styles.navigationHeader, { backgroundColor: colors.systemBackground, borderBottomColor: colors.separator }]}>
        <Text style={[styles.navigationTitle, { color: colors.label }]}>Library</Text>
      </View>

      {/* Hero Section */}
      <View style={[styles.heroSection, { backgroundColor: colors.systemBackground }]}>
        <Text style={[styles.heroTitle, { color: colors.label }]}>Breslov Study</Text>
        <Text style={[styles.heroSubtitle, { color: colors.secondaryLabel }]}>Explore the wisdom of Rabbi Nachman and his teachings</Text>
      </View>
      
      <FlatList
        data={BRESLOV_TEXTS}
        renderItem={renderTextItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { 
            paddingBottom: Platform.select({
              ios: 49 + insets.bottom + Spacing.xl,
              android: 85,
              web: 70,
            })
          }
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarArea: {
    // Background color set dynamically
  },
  navigationHeader: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 0.5,
  },
  navigationTitle: {
    ...Typography.largeTitle,
    fontWeight: '700',
    marginBottom: 0,
  },
  heroSection: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    ...Typography.title1,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.subheadline,
    lineHeight: 18,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
  },
  textItem: {
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.itemSpacing,
    ...Shadows.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E2E4', // Use a static color from the design system
  },
  textItemContent: {
    padding: Spacing.cardPadding,
    minHeight: 56,
    justifyContent: 'center',
  },
  textItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  textTitle: {
    ...Typography.title2,
    flex: 1,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSubtitle: {
    ...Typography.body,
    fontWeight: '400',
    marginTop: 2,
  },
});