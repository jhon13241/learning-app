import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookmarks } from '../../hooks/useBookmarks';
import { Bookmark } from '../../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/designSystem';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../../components/Toast';

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { bookmarks, isLoading, deleteBookmark, refreshBookmarks } = useBookmarks();
  const { showToast } = useToast();

  // Refresh bookmarks when screen comes into focus (without loading indicator)
  useFocusEffect(
    React.useCallback(() => {
      refreshBookmarks(false);
    }, [refreshBookmarks])
  );

  const handleBookmarkPress = (bookmark: Bookmark) => {
    // Navigate to the bookmarked text
    router.push(`/text/${encodeURIComponent(bookmark.reference)}`);
  };

  const handleDeleteBookmark = (bookmark: Bookmark) => {
    Alert.alert(
      'Delete Bookmark',
      `Are you sure you want to delete the bookmark for "${bookmark.textTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBookmark(bookmark.id);
            } catch (error) {
              showToast('Failed to delete bookmark. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderBookmarkItem = ({ item }: { item: Bookmark }) => (
    <View style={[styles.bookmarkItem, { backgroundColor: colors.secondarySystemGroupedBackground }]}>
      <TouchableOpacity
        style={styles.bookmarkContent}
        onPress={() => handleBookmarkPress(item)}
        activeOpacity={0.6}
        accessibilityLabel={`Open bookmark: ${item.textTitle}`}
        accessibilityRole="button"
        accessibilityHint="Opens the bookmarked text for reading"
      >
        <View style={styles.bookmarkHeader}>
          <Text style={[styles.bookmarkTitle, { color: colors.label }]}>{item.textTitle}</Text>
          <View style={styles.chevronContainer}>
            <Feather name="chevron-right" size={22} color={colors.gray2} />
          </View>
        </View>
        <Text style={[styles.bookmarkReference, { color: colors.primary }]}>{item.reference}</Text>
        <Text style={[styles.bookmarkPassage, { color: colors.secondaryLabel }]} numberOfLines={3}>
          {item.passage}
        </Text>
        <Text style={[styles.bookmarkDate, { color: colors.tertiaryLabel }]}>
          {item.dateCreated.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: colors.error }]}
        onPress={() => handleDeleteBookmark(item)}
        activeOpacity={0.6}
        accessibilityLabel={`Remove bookmark: ${item.textTitle}`}
        accessibilityRole="button"
        accessibilityHint="Removes this bookmark from your list"
      >
        <Text style={[styles.deleteButtonText, { color: colors.white }]}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={[
          styles.centerContainer,
          {
            paddingBottom: Platform.select({
              ios: 50 + insets.bottom + 20,
              android: 85,
              web: 70,
            })
          }
        ]}>
          <LoadingSpinner message="Loading bookmarks..." />
        </View>
      );
    }

    if (bookmarks.length === 0) {
      return (
        <View style={[
          styles.centerContainer,
          {
            paddingBottom: Platform.select({
              ios: 49 + insets.bottom + Spacing.xl,
              android: 85,
              web: 70,
            })
          }
        ]}>
          <View style={styles.emptyStateContainer}>
            <Feather name="bookmark" size={64} color={colors.gray3} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start reading texts and bookmark passages you want to remember.
            </Text>
            <Button
              title="Browse Library"
              onPress={() => router.push('/')}
              icon="book"
              variant="primary"
            />
          </View>
        </View>
      );
    }

    return (
      <>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <FlatList
          data={bookmarks}
          renderItem={renderBookmarkItem}
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
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
      {/* Status Bar Safe Area */}
      <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: colors.systemBackground }]} />

      {/* Navigation Header */}
      <View style={[styles.navigationHeader, { backgroundColor: colors.systemBackground, borderBottomColor: colors.separator }]}>
        <Text style={[styles.navigationTitle, { color: colors.label }]}>Bookmarks</Text>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.systemGroupedBackground,
  },
  statusBarArea: {
    backgroundColor: Colors.systemBackground,
  },
  navigationHeader: {
    backgroundColor: Colors.systemBackground,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  navigationTitle: {
    ...Typography.largeTitle,
    color: Colors.label,
    fontWeight: '700',
    marginBottom: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  emptyStateContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.title2,
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  statsContainer: {
    backgroundColor: Colors.systemBackground,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  statsText: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
  },
  bookmarkItem: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.itemSpacing,
    ...Shadows.card,
    overflow: 'hidden',
  },
  bookmarkContent: {
    padding: Spacing.cardPadding,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  bookmarkTitle: {
    ...Typography.headline,
    color: Colors.label,
    flex: 1,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    display: 'none',
  },
  bookmarkReference: {
    ...Typography.footnote,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  bookmarkPassage: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  bookmarkDate: {
    ...Typography.caption1,
    color: Colors.tertiaryLabel,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.button,
  },
  deleteButtonText: {
    ...Typography.callout,
    color: Colors.white,
    fontWeight: '600',
  },
});