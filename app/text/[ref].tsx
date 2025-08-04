import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import EnhancedTableOfContents from '../../components/EnhancedTableOfContents';
import { TextReaderTools } from '../../components/TextReaderTools';
import { EnhancedTextDisplay } from '../../components/EnhancedTextDisplay';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useTextReaderSettings } from '../../hooks/useTextReaderSettings';
import sefariaApi, { SefariaTextResponse } from '../../services/sefariaApi';
import { getNavigationInfo, NavigationInfo, formatReferenceForDisplay } from '../../services/textNavigation';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/designSystem';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/Toast';

// Enhanced API service function using the documented Sefaria API
const fetchSefariaText = async (ref: string): Promise<SefariaTextResponse> => {
  return await sefariaApi.getText(ref, {
    commentary: false,
    context: false,
  });
};

export default function TextReaderPage() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const [showTOC, setShowTOC] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const { addBookmark, deleteBookmark, isBookmarked, bookmarks } = useBookmarks();
  const [navigationInfo, setNavigationInfo] = useState<NavigationInfo | null>(null);
  const [data, setData] = useState<SefariaTextResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();

  // Text reader settings (now from context)
  const {
    settings,
    updateSettings,
    isLoading: settingsLoading,
    getFontSize,
    getHebrewFontSize,
    getLineHeight,
    getHebrewLineHeight,
    shouldShowHebrew,
    shouldShowEnglish,
    getThemeColors,
  } = useTextReaderSettings();

  // Manual fetch function with enhanced processing
  const fetchTextData = async (textRef: string) => {
    if (!textRef) return;

    setIsLoading(true);
    setError(null);

    try {
      const textData = await fetchSefariaText(textRef);
      // Process the text based on current settings
      const processedData = sefariaApi.processTextForDisplay(textData, {
        showVowels: settings.showVowels,
        cleanHtml: true,
      });
      setData(processedData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when ref changes
  useEffect(() => {
    if (ref) {
      fetchTextData(ref);
    }
  }, [ref]);

  // Re-process data when vowel settings change
  useEffect(() => {
    if (data && ref) {
      const processedData = sefariaApi.processTextForDisplay(data, {
        showVowels: settings.showVowels,
        cleanHtml: true,
      });
      setData(processedData);
    }
  }, [settings.showVowels]);

  // Check if current text is bookmarked using the optimized sync method
  const isCurrentlyBookmarked = ref ? isBookmarked(ref) : false;
  // Find the bookmark id for this reference if it exists
  const currentBookmark = ref ? bookmarks.find(b => b.reference === ref) : undefined;

  // Fetch navigation information
  useEffect(() => {
    if (ref) {
      getNavigationInfo(ref).then(setNavigationInfo).catch(error => {
        console.error('Error fetching navigation info:', error);
        setNavigationInfo(null);
      });
    }
  }, [ref]);

  // Get theme colors
  const themeColors = getThemeColors();

  if (isLoading || settingsLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.systemBackground }]}>
        <LoadingSpinner message="Loading text..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.systemBackground }]}>
        <ErrorMessage
          title="Error loading text"
          message={error instanceof Error ? error.message : 'Unknown error occurred'}
          onRetry={() => {
            if (ref) {
              fetchTextData(ref);
            }
          }}
        />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.systemBackground }]}>
        <ErrorMessage
          title="No text found"
          message="The requested text could not be found. Please try a different reference."
        />
      </View>
    );
  }

  // Extract book title from reference for table of contents
  // Handle different reference formats from Breslov texts
  const extractBookTitle = (reference: string, bookFromData?: string): string => {
    if (bookFromData) return bookFromData;

    if (!reference) return '';

    // Handle complex references like "Likutei_Moharan.1.1" or "Likkutei_Etzot,_Truth_and_Faith"
    const parts = reference.split('.');
    const firstPart = parts[0];

    // Remove everything after the first comma for complex titles
    const cleanTitle = firstPart.split(',')[0];

    return cleanTitle;
  };

  const bookTitle = extractBookTitle(ref || '', data?.book);

  // Handle table of contents navigation
  const handleTOCNavigation = (reference: string) => {
    setShowTOC(false);
    // Navigate to the selected section
    const encodedRef = encodeURIComponent(reference);
    router.push(`/text/${encodedRef}`);
  };

  // Handle bookmark creation
  const handleBookmark = async () => {
    if (!data || !ref) return;

    if (isCurrentlyBookmarked && currentBookmark) {
      // Unbookmark (delete)
      try {
        await deleteBookmark(currentBookmark.id);
      } catch (error) {
        // Optionally handle error silently
      }
      return;
    }

    try {
      // Create a passage preview from the first few segments of text
      const passagePreview = data?.text && Array.isArray(data.text) && data.text.length > 0
        ? sefariaApi.cleanHtmlText(data.text.slice(0, 2).filter(Boolean).join(' ')).substring(0, 150) + '...'
        : 'No preview available';

      await addBookmark({
        textTitle: data?.book || extractBookTitle(ref, data?.book),
        reference: ref,
        passage: passagePreview
      });
    } catch (error) {
      // Optionally handle error silently
    }
  };

  // Convert human-readable reference to API format
  const convertToApiFormat = (ref: string): string => {
    if (!ref) return '';

    let apiRef = ref;

    // Handle the main title and section separation
    const match = apiRef.match(/^(.+?)\s+(\d+(?::\d+)*)$/);

    if (match) {
      const title = match[1].replace(/\s+/g, '_');
      const sections = match[2].replace(/:/g, '.');
      apiRef = `${title}.${sections}`;
    } else {
      // Fallback: just replace spaces with underscores and colons with dots
      apiRef = apiRef
        .replace(/\s+/g, '_')
        .replace(/:/g, '.');
    }

    return apiRef;
  };

  // Handle navigation
  const handleNavigation = (direction: 'next' | 'previous') => {
    if (!navigationInfo) return;

    const targetRef = direction === 'next' ? navigationInfo.next : navigationInfo.previous;
    if (targetRef) {
      const apiFormatRef = convertToApiFormat(targetRef);
      const encodedRef = encodeURIComponent(apiFormatRef);
      router.push(`/text/${encodedRef}`);
    }
  };

  if (showTOC) {
    return (
      <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
        {/* Status Bar Safe Area */}
        <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: colors.systemBackground }]} />

        {/* Navigation Header */}
        <View style={[styles.navigationHeader, { backgroundColor: colors.systemBackground, borderBottomColor: colors.separator }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowTOC(false)}
            activeOpacity={0.6}
          >
            <Feather name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.navigationTitle, { color: colors.label }]}>Contents</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Current Book Card */}
        <View style={[styles.currentBookCard, { backgroundColor: colors.secondarySystemGroupedBackground, borderColor: colors.separator }]}>
          <Text style={[styles.currentBookTitle, { color: colors.label }]}>
            {bookTitle.replace(/_/g, ' ')}
          </Text>
        </View>

        <EnhancedTableOfContents
          bookTitle={bookTitle}
          onSectionPress={handleTOCNavigation}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.systemBackground }]}>
      {/* Text Reader Tools Modal */}
      <TextReaderTools
        visible={showTools}
        onClose={() => setShowTools(false)}
        settings={settings}
        onSettingsChange={updateSettings}
      />

      {/* Status Bar Safe Area */}
      <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: colors.systemBackground }]} />

      {/* Navigation Header */}
      <View style={[styles.navigationHeader, { backgroundColor: colors.systemBackground, borderBottomColor: colors.separator }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/')}
          activeOpacity={0.6}
        >
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tocButton, { backgroundColor: colors.secondarySystemBackground, borderColor: colors.separator }]}
          onPress={() => setShowTOC(true)}
          activeOpacity={0.6}
        >
          <Feather name="list" size={16} color={colors.label} />
          <Text style={[styles.tocButtonText, { color: colors.label }]}>Contents</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBookmark}
            activeOpacity={0.6}
            accessibilityLabel={isCurrentlyBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            accessibilityRole="button"
            accessibilityHint={isCurrentlyBookmarked ? 'Removes this text from your bookmarks' : 'Adds this text to your bookmarks'}
          >
            <FontAwesome
              name={isCurrentlyBookmarked ? 'star' : 'star-o'}
              size={20}
              color={colors.primary}
              style={{}}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowTools(true)}
            activeOpacity={0.6}
          >
            <Feather name="settings" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Reading Location Card */}
      <View style={[styles.currentLocationCard, { backgroundColor: colors.secondarySystemBackground, borderColor: colors.separator }]}>
        <Text style={[styles.currentLocationText, { color: colors.label }]}>
          {data?.ref || ref}
        </Text>
        {data?.heRef && (
          <Text style={[styles.currentLocationHebrew, { color: colors.secondaryLabel }]}>
            {data.heRef}
          </Text>
        )}
      </View>

      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: colors.systemBackground }]}
        contentContainerStyle={styles.content}
        key={data?.ref}
      >
        <EnhancedTextDisplay
          data={data}
          settings={settings}
          fontSize={getFontSize()}
          hebrewFontSize={getHebrewFontSize()}
          lineHeight={getLineHeight()}
          hebrewLineHeight={getHebrewLineHeight()}
          themeColors={getThemeColors()}
        />

        {/* Navigation */}
        {(data?.prev || data?.next) && (
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: colors.secondarySystemBackground, borderColor: colors.separator },
                !data?.prev && styles.navButtonDisabled
              ]}
              onPress={() => {
                if (data?.prev) {
                  const apiFormatRef = convertToApiFormat(data.prev);
                  const encodedRef = encodeURIComponent(apiFormatRef);
                  router.push(`/text/${encodedRef}`);
                }
              }}
              disabled={!data?.prev}
              activeOpacity={0.6}
            >
              <Feather
                name="arrow-left"
                size={16}
                color={data?.prev ? colors.primary : colors.secondaryLabel}
              />
              <Text style={[
                styles.navButtonText,
                { color: data?.prev ? colors.primary : colors.secondaryLabel }
              ]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: colors.secondarySystemBackground, borderColor: colors.separator },
                !data?.next && styles.navButtonDisabled
              ]}
              onPress={() => {
                if (data?.next) {
                  const apiFormatRef = convertToApiFormat(data.next);
                  const encodedRef = encodeURIComponent(apiFormatRef);
                  router.push(`/text/${encodedRef}`);
                }
              }}
              disabled={!data?.next}
              activeOpacity={0.6}
            >
              <Text style={[
                styles.navButtonText,
                { color: data?.next ? colors.primary : colors.secondaryLabel }
              ]}>
                Next
              </Text>
              <Feather
                name="arrow-right"
                size={16}
                color={data?.next ? colors.primary : colors.secondaryLabel}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarArea: {
    // Height set dynamically
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  navigationTitle: {
    ...Typography.headline,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  tocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.button,
    borderWidth: 0.5,
    gap: Spacing.xs,
  },
  tocButtonText: {
    ...Typography.subheadline,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  currentLocationCard: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.cardPadding,
    borderRadius: BorderRadius.card,
    borderWidth: 0.5,
    ...Shadows.small,
  },
  currentBookCard: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.cardPadding,
    borderRadius: BorderRadius.card,
    borderWidth: 0.5,
    ...Shadows.small,
  },
  currentLocationText: {
    ...Typography.headline,
    textAlign: 'center',
    fontWeight: '600',
  },
  currentBookTitle: {
    ...Typography.title3,
    textAlign: 'center',
    fontWeight: '600',
  },
  currentLocationHebrew: {
    ...Typography.subheadline,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontFamily: 'System',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: Spacing.screenPadding,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Typography.title3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  errorDetails: {
    ...Typography.subheadline,
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    borderWidth: 0.5,
    gap: Spacing.xs,
    ...Shadows.small,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    ...Typography.callout,
    fontWeight: '600',
  },
});