import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookmarks } from '../../hooks/useBookmarks';
import { Bookmark } from '../../types';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/designSystem';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../../components/Toast';

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { bookmarks, isLoading, deleteBookmark, refreshBookmarks } = useBookmarks();
  const { showToast } = useToast();

  useFocusEffect(
    React.useCallback(() => {
      refreshBookmarks();
    }, [refreshBookmarks])
  );

  const handleBookmarkPress = (bookmark: Bookmark) => {
    router.push(`/text/${encodeURIComponent(bookmark.textReference)}?verse=${bookmark.verseNumber}`);
  };

  const handleDeleteBookmark = (bookmark: Bookmark) => {
    Alert.alert(
      'Delete Bookmark',
      'Are you sure you want to delete this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBookmark(bookmark.id);
            showToast('Bookmark deleted', 'success');
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.gray5 }]}>
        <Feather name="bookmark" size={32} color={colors.gray3} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.label }]}>
        No Bookmarks Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondaryLabel }]}>
        Start reading to save meaningful passages
      </Text>
      <Button
        title="Browse Library"
        onPress={() => router.push('/')}
        variant="primary"
        style={styles.emptyButton}
      />
    </View>
  );

  const renderBookmarkItem = ({ item }: { item: Bookmark }) => (
    <Card 
      onPress={() => handleBookmarkPress(item)}
      animated={true}
      style={styles.bookmarkItem}
    >
      <View style={styles.bookmarkContent}>
        <View style={styles.bookmarkHeader}>
          <View style={styles.bookmarkInfo}>
            <Text style={[styles.bookmarkTitle, { color: colors.label }]}>
              {item.textTitle}
            </Text>
            <Text style={[styles.bookmarkVerse, { color: colors.secondaryLabel }]}>
              Verse {item.verseNumber}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => handleDeleteBookmark(item)}
            style={[styles.deleteButton, { backgroundColor: colors.gray5 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
        
        {item.note && (
          <Text style={[styles.bookmarkNote, { color: colors.secondaryLabel }]}>
            "{item.note}"
          </Text>
        )}
        
        <Text style={[styles.bookmarkDate, { color: colors.tertiaryLabel }]}>
          Saved {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
        <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: colors.systemBackground }]} />
        <LoadingSpinner message="Loading bookmarks..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
      {/* Status Bar Safe Area */}
      <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: colors.systemBackground }]} />

      {/* Navigation Header */}
      <View style={[styles.navigationHeader, { backgroundColor: colors.systemBackground, borderBottomColor: colors.separator }]}>
        <Text style={[styles.navigationTitle, { color: colors.label }]}>
          Bookmarks
        </Text>
        {bookmarks && bookmarks.length > 0 && (
          <Text style={[styles.bookmarkCount, { color: colors.secondaryLabel }]}>
            {bookmarks.length} saved
          </Text>
        )}
      </View>

      {/* Content */}
      {!bookmarks || bookmarks.length === 0 ? (
        renderEmptyState()
      ) : (
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
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  
  navigationTitle: {
    ...Typography.largeTitle,
    fontWeight: '700',
  },
  
  bookmarkCount: {
    ...Typography.subheadline,
    marginBottom: 2,
  },
  
  list: {
    flex: 1,
  },
  
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
  },
  
  bookmarkItem: {
    marginBottom: Spacing.md,
  },
  
  bookmarkContent: {
    // Padding handled by Card component
  },
  
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  
  bookmarkInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  
  bookmarkTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  
  bookmarkVerse: {
    ...Typography.footnote,
  },
  
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  bookmarkNote: {
    ...Typography.callout,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  
  bookmarkDate: {
    ...Typography.caption1,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  
  emptyTitle: {
    ...Typography.title2,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 280,
  },
  
  emptyButton: {
    minWidth: 160,
  },
});