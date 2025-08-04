import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { BRESLOV_TEXTS } from '../constants/breslovTexts';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/designSystem';
import { ErrorMessage } from '../components/ErrorMessage';

interface TextSummary {
  title: string;
  apiReference: string;
  structure: {
    totalChapters?: number;
    totalSections?: number;
    sectionNames?: string[];
    categories?: string[];
    textDepth?: number;
  };
  versions: {
    english?: string;
    hebrew?: string;
    totalVersions: number;
  };
  sampleContent: {
    english?: string;
    hebrew?: string;
  };
  isLoading: boolean;
  error?: string;
}

/**
 * Fetches comprehensive information about a Breslov text
 * Based on documented Sefaria API endpoints
 */
const fetchTextSummary = async (text: any): Promise<TextSummary> => {
  const summary: TextSummary = {
    title: text.title,
    apiReference: text.apiReference,
    structure: {},
    versions: { totalVersions: 0 },
    sampleContent: {},
    isLoading: true
  };

  try {
    // Fetch index information
    const indexResponse = await fetch(`https://www.sefaria.org/api/v2/index/${text.apiReference}`);
    if (indexResponse.ok) {
      const indexData = await indexResponse.json();
      
      summary.structure = {
        sectionNames: indexData.sectionNames,
        categories: indexData.categories,
        textDepth: indexData.textDepth
      };
    }

    // Fetch shape information for chapter/section counts
    const shapeResponse = await fetch(`https://www.sefaria.org/api/shape/${text.apiReference}`);
    if (shapeResponse.ok) {
      const shapeData = await shapeResponse.json();
      if (Array.isArray(shapeData) && shapeData.length > 0) {
        const bookData = shapeData[0];
        if (bookData.chapters && Array.isArray(bookData.chapters)) {
          summary.structure.totalChapters = bookData.chapters.length;
          summary.structure.totalSections = bookData.chapters.reduce((total: number, chapter: any) => {
            return total + (Array.isArray(chapter) ? chapter.length : 0);
          }, 0);
        }
      }
    }

    // Fetch sample text content
    const textResponse = await fetch(`https://www.sefaria.org/api/texts/${text.sampleReference}`);
    if (textResponse.ok) {
      const textData = await textResponse.json();
      
      // Extract version information
      if (textData.versions && Array.isArray(textData.versions)) {
        summary.versions.totalVersions = textData.versions.length;
        const englishVersion = textData.versions.find((v: any) => v.language === 'en');
        const hebrewVersion = textData.versions.find((v: any) => v.language === 'he');
        
        summary.versions.english = englishVersion?.versionTitle;
        summary.versions.hebrew = hebrewVersion?.versionTitle;
      }

      // Extract sample content
      if (textData.text && textData.text.length > 0) {
        summary.sampleContent.english = textData.text[0].substring(0, 200) + '...';
      }
      if (textData.he && textData.he.length > 0) {
        summary.sampleContent.hebrew = textData.he[0].substring(0, 200) + '...';
      }
    }

    summary.isLoading = false;
    return summary;

  } catch (error) {
    summary.error = error instanceof Error ? error.message : 'Unknown error';
    summary.isLoading = false;
    return summary;
  }
};

/**
 * Individual text summary card component
 */
const TextSummaryCard: React.FC<{ text: any }> = ({ text }) => {
  const [summary, setSummary] = useState<TextSummary>({
    title: text.title,
    apiReference: text.apiReference,
    structure: {},
    versions: { totalVersions: 0 },
    sampleContent: {},
    isLoading: true
  });

  const fetchAndSetSummary = useCallback(() => {
    fetchTextSummary(text).then(setSummary);
  }, [text]);

  useEffect(() => {
    fetchAndSetSummary();
  }, [fetchAndSetSummary]);

  const handlePress = () => {
    const encodedRef = encodeURIComponent(text.sampleReference);
    router.push(`/text/${encodedRef}`);
  };

  const handleTOCPress = () => {
    router.push({
      pathname: '/toc',
      params: { title: text.apiReference }
    });
  };

  if (summary.isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: Colors.secondarySystemGroupedBackground, ...Shadows.card, borderRadius: BorderRadius.card }]}> 
        <Text style={[styles.cardTitle, { color: Colors.label }]}>{text.title}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading summary...</Text>
        </View>
      </View>
    );
  }

  if (summary.error) {
    return (
      <View style={[styles.card, styles.errorCard, { backgroundColor: Colors.secondarySystemGroupedBackground, ...Shadows.card, borderRadius: BorderRadius.card }]}> 
        <Text style={[styles.cardTitle, { color: Colors.label }]}>{text.title}</Text>
        <ErrorMessage
          title="Error loading summary"
          message={summary.error}
          onRetry={fetchAndSetSummary}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: Colors.secondarySystemGroupedBackground, ...Shadows.card, borderRadius: BorderRadius.card }]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`Open summary for ${summary.title}`}
      accessibilityRole="button"
      accessibilityHint="Shows summary and details for this text"
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: Colors.label }]}>{summary.title}</Text>
        <Text style={[styles.cardSubtitle, { color: Colors.secondaryLabel }]}>{text.isComplex ? 'Complex Structure' : 'Simple Structure'}</Text>
      </View>

      {/* Structure Information */}
      <View style={styles.infoSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Feather name="layers" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.infoTitle}>Structure</Text>
        </View>
        {summary.structure.totalChapters && (
          <Text style={styles.infoText}>
            <Feather name="book-open" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
            {summary.structure.totalChapters} {summary.structure.sectionNames?.[0] || 'chapters'}
          </Text>
        )}
        {summary.structure.totalSections && (
          <Text style={styles.infoText}>
            <Feather name="list" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
            {summary.structure.totalSections} total {summary.structure.sectionNames?.[1] || 'sections'}
          </Text>
        )}
        {summary.structure.categories && (
          <Text style={styles.infoText}>
            <Feather name="tag" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
            {summary.structure.categories.join('  ')}
          </Text>
        )}
        {summary.structure.textDepth && (
          <Text style={styles.infoText}>
            <Feather name="layers" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
            {summary.structure.textDepth} levels deep
          </Text>
        )}
      </View>

      {/* Version Information */}
      <View style={styles.infoSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Feather name="globe" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.infoTitle}>Versions ({summary.versions.totalVersions})</Text>
        </View>
        {summary.versions.english && (
          <Text style={styles.infoText}>
            <Feather name="flag" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
            {summary.versions.english}
          </Text>
        )}
        {summary.versions.hebrew && (
          <Text style={styles.infoText}>
            <Feather name="flag" size={14} color={Colors.primary} style={{ marginRight: 4, transform: [{ scaleX: -1 }] }} />
            {summary.versions.hebrew}
          </Text>
        )}
      </View>

      {/* Sample Content */}
      {summary.sampleContent.english && (
        <View style={styles.infoSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Feather name="file-text" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.infoTitle}>Sample Content</Text>
          </View>
          <Text style={styles.sampleText} numberOfLines={3}>
            {summary.sampleContent.english}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
          onPress={handlePress}
          accessibilityLabel={`Read text: ${summary.title}`}
          accessibilityRole="button"
          accessibilityHint="Opens the full text for reading"
        >
          <Text style={styles.primaryButtonText}>Read Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: Colors.systemFill }]}
          onPress={handleTOCPress}
          accessibilityLabel={`View table of contents for ${summary.title}`}
          accessibilityRole="button"
          accessibilityHint="Shows the table of contents for this text"
        >
          <Text style={styles.secondaryButtonText}>Table of Contents</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Main summary page component
 */
export default function SummaryPage() {
  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.systemGroupedBackground }]} contentContainerStyle={[styles.content, { padding: Spacing.screenPadding }]}> 
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: Colors.systemFill, borderRadius: BorderRadius.button }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.backButtonText, { color: Colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors.label }]}>Breslov Texts Summary</Text>
        <Text style={[styles.subtitle, { color: Colors.secondaryLabel }]}>Comprehensive overview of all 9 core Breslov texts with detailed structure information</Text>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: Colors.secondarySystemGroupedBackground, borderRadius: BorderRadius.card, ...Shadows.card }]}> 
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{BRESLOV_TEXTS.length}</Text>
          <Text style={[styles.statLabel, { color: Colors.secondaryLabel }]}>Texts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{BRESLOV_TEXTS.filter(t => t.isComplex).length}</Text>
          <Text style={[styles.statLabel, { color: Colors.secondaryLabel }]}>Complex</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{BRESLOV_TEXTS.filter(t => !t.isComplex).length}</Text>
          <Text style={[styles.statLabel, { color: Colors.secondaryLabel }]}>Simple</Text>
        </View>
      </View>

      {BRESLOV_TEXTS.map((text, index) => (
        <TextSummaryCard key={text.id} text={text} />
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>All data sourced from Sefaria.org API</Text>
        <Text style={styles.footerText}>Enhanced with comprehensive structure analysis</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.systemGroupedBackground,
  },
  content: {
    padding: Spacing.screenPadding,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    ...Typography.title1,
    fontWeight: 'bold',
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.secondarySystemGroupedBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.secondaryLabel,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
    borderRadius: BorderRadius.card,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.title2,
    fontWeight: 'bold',
    color: Colors.label,
    marginBottom: 2,
  },
  cardSubtitle: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  infoSection: {
    marginBottom: Spacing.md,
  },
  infoTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: 2,
  },
  infoText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    marginBottom: 2,
    lineHeight: 18,
  },
  sampleText: {
    ...Typography.body,
    color: Colors.label,
    lineHeight: 18,
    fontStyle: 'italic',
    backgroundColor: Colors.systemGroupedBackground,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.primaryButtonText,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.systemFill,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.label,
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  loadingText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    color: Colors.secondaryLabel,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.systemFill,
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: Colors.tertiaryLabel,
    textAlign: 'center',
    marginBottom: 2,
  },
});