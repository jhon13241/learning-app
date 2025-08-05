import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRESLOV_TEXTS, BreslovText } from '../../constants/breslovTexts';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/designSystem';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/Card';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  const handleTextPress = (text: BreslovText) => {
    router.push(`/text/${encodeURIComponent(text.apiReference)}`);
  };

  const renderTextItem = ({ item }: { item: BreslovText }) => (
    <Card 
      onPress={() => handleTextPress(item)}
      animated={true}
      style={styles.textItem}
    >
      <View style={styles.textItemContent}>
        <View style={styles.textItemHeader}>
          <Text style={[styles.textTitle, { color: colors.label }]}>
            {item.title}
          </Text>
          <Feather name="chevron-right" size={20} color={colors.gray2} />
        </View>
        <Text style={[styles.textLanguages, { color: colors.secondaryLabel }]}>
          {item.languages.map(lang => 
            lang === 'en' ? 'English' : lang === 'he' ? 'Hebrew' : lang
          ).join(' • ')}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
      {/* Status Bar Safe Area */}
      <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: colors.systemBackground }]} />

      {/* Navigation Header */}
      <View style={[styles.navigationHeader, { backgroundColor: colors.systemBackground, borderBottomColor: colors.separator }]}>
        <Text style={[styles.navigationTitle, { color: colors.label }]}>Library</Text>
      </View>

      {/* Content */}
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
    paddingBottom: Spacing.md,
    borderBottomWidth: 0.5,
  },
  
  navigationTitle: {
    ...Typography.largeTitle,
    fontWeight: '700',
  },
  
  list: {
    flex: 1,
  },
  
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
  },
  
  textItem: {
    marginBottom: Spacing.md,
  },
  
  textItemContent: {
    // Padding handled by Card component
  },
  
  textItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  
  textTitle: {
    ...Typography.headline,
    flex: 1,
    fontWeight: '600',
  },
  
  textLanguages: {
    ...Typography.footnote,
  },
});