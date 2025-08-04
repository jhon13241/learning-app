import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useBookmarks } from '../../hooks/useBookmarks';
import { Bookmark } from '../../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animation } from '../../constants/designSystem';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../../components/Toast';

const { width: screenWidth } = Dimensions.get('window');

interface BookmarkItemProps {
  item: Bookmark;
  index: number;
  onPress: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ item, index, onPress, onDelete }) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        ...Animation.spring.snappy,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: Animation.interaction.cardTap,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...Animation.spring.bouncy,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: Animation.interaction.cardTap,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(item);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onDelete(item);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const gradientColors = index % 3 === 0 
    ? isDark ? colors.gradients.primary : colors.gradients.primarySubtle
    : index % 3 === 1
    ? isDark ? colors.gradients.accent : colors.gradients.neutral
    : isDark ? colors.gradients.success : colors.gradients.warning;

  return (
    <Animated.View
      style={[
        styles.bookmarkItemContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityLabel={`Open bookmark: ${item.textTitle}`}
        accessibilityRole="button"
        accessibilityHint="Opens the bookmarked text for reading"
      >
        <Card
          variant="elevated"
          borderRadius="lg"
          padding="cardPadding"
          shadow="cardHover"
          style={styles.bookmarkItem}
        >
          {/* Gradient accent */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientAccent}
          />
          
          <View style={styles.bookmarkContent}>
            <View style={styles.bookmarkHeader}>
              <View style={styles.titleContainer}>
                <Text style={[styles.bookmarkTitle, { color: colors.label }]}>
                  {item.textTitle}
                </Text>
                <Text style={[styles.bookmarkReference, { color: colors.primary }]}>
                  {item.reference}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: colors.error + '15' }]}
                onPress={handleDelete}
                accessibilityLabel={`Remove bookmark: ${item.textTitle}`}
                accessibilityRole="button"
                accessibilityHint="Removes this bookmark from your list"
              >
                <Feather 
                  name="trash-2" 
                  size={18} 
                  color={colors.error}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.bookmarkPassage, { color: colors.secondaryLabel }]} numberOfLines={3}>
              {item.passage}
            </Text>
            
            <View style={styles.bookmarkFooter}>
              <Text style={[styles.bookmarkDate, { color: colors.tertiaryLabel }]}>
                {formatDate(item.dateCreated)}
              </Text>
              
              <View style={[styles.readingBadge, { backgroundColor: colors.primary + '15' }]}>
                <Feather 
                  name="book-open" 
                  size={12} 
                  color={colors.primary}
                />
                <Text style={[styles.readingText, { color: colors.primary }]}>
                  Continue Reading
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { bookmarks, isLoading, deleteBookmark, refreshBookmarks } = useBookmarks();
  const { showToast } = useToast();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Refresh bookmarks when screen comes into focus (without loading indicator)
  useFocusEffect(
    React.useCallback(() => {
      refreshBookmarks(false);
    }, [refreshBookmarks])
  );

  const handleBookmarkPress = (bookmark: Bookmark) => {
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
              showToast('Bookmark deleted successfully', 'success');
            } catch (error) {
                              showToast('Failed to delete bookmark. Please try again.', 'error');
            }
          }
        }
      ]
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <LinearGradient
        colors={isDark ? colors.gradients.dark : colors.gradients.neutral}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyStateGradient}
      />
      
      <View style={styles.emptyStateContent}>
        <View style={[styles.emptyStateIcon, { backgroundColor: colors.primary + '15' }]}>
          <Feather name="bookmark" size={32} color={colors.primary} />
        </View>
        
        <Text style={[styles.emptyStateTitle, { color: colors.label }]}>
          No Bookmarks Yet
        </Text>
        
        <Text style={[styles.emptyStateDescription, { color: colors.secondaryLabel }]}>
          Start exploring sacred texts and bookmark meaningful passages for easy access later.
        </Text>
        
        <Button
          title="Explore Library"
          variant="gradient"
          icon="book-open"
          onPress={() => router.push('/(tabs)/')}
          style={styles.emptyStateButton}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner 
            message="Loading your bookmarks..."
            variant="gradient"
            size="large"
          />
        </View>
      );
    }

    if (!bookmarks || bookmarks.length === 0) {
      return renderEmptyState();
    }

    return (
      <Animated.FlatList
        data={bookmarks}
        renderItem={({ item, index }) => (
          <BookmarkItem
            item={item}
            index={index}
            onPress={handleBookmarkPress}
            onDelete={handleDeleteBookmark}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: Platform.select({
              ios: 60 + insets.bottom + Spacing.xxxl,
              android: 90 + Spacing.xxxl,
              web: 80 + Spacing.xxxl,
            })
          }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
      {/* Status Bar Safe Area */}
      <View style={[styles.statusBarArea, { height: insets.top }]}>
        <LinearGradient
          colors={isDark ? ['#0F172A', '#1E293B'] : ['#FFFFFF', '#F8FAFC']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.animatedHeader,
          { 
            opacity: headerOpacity,
            backgroundColor: colors.systemBackground,
            borderBottomColor: colors.separator,
          }
        ]}
      >
        <Text style={[styles.animatedHeaderTitle, { color: colors.label }]}>
          Bookmarks
        </Text>
      </Animated.View>

      {/* Hero Section */}
      <Animated.View 
        style={[
          styles.heroSection,
          {
            transform: [{ translateY: heroTranslateY }],
            opacity: heroOpacity,
          }
        ]}
      >
        <LinearGradient
          colors={isDark ? colors.gradients.accent : colors.gradients.primarySubtle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        />
        
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: colors.label }]}>
            My Bookmarks
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.secondaryLabel }]}>
            Your saved passages and meaningful insights
          </Text>
          
          {bookmarks && bookmarks.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={[styles.statItem, { backgroundColor: colors.accent + '15' }]}>
                <Text style={[styles.statNumber, { color: colors.accent }]}>
                  {bookmarks.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}>
                  Saved
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  statusBarArea: {
    zIndex: 100,
  },
  
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 44, // Status bar height
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
    borderBottomWidth: 0.5,
    zIndex: 99,
  },
  
  animatedHeaderTitle: {
    ...Typography.title2,
    fontWeight: '700',
  },
  
  heroSection: {
    marginTop: Spacing.md,
    marginHorizontal: Spacing.screenPadding,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  
  heroContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  
  heroTitle: {
    ...Typography.largeTitle,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  
  heroSubtitle: {
    ...Typography.body,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  statItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minWidth: 80,
  },
  
  statNumber: {
    ...Typography.title3,
    fontWeight: '700',
    marginBottom: 2,
  },
  
  statLabel: {
    ...Typography.caption1Medium,
    textAlign: 'center',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
  },
  
  emptyStateContainer: {
    flex: 1,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.screenPadding,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  
  emptyStateGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  
  emptyStateContent: {
    flex: 1,
    padding: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  
  emptyStateTitle: {
    ...Typography.title1,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  emptyStateDescription: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xxl,
    maxWidth: 280,
  },
  
  emptyStateButton: {
    minWidth: 160,
  },
  
  list: {
    flex: 1,
    marginTop: Spacing.lg,
  },
  
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.lg,
  },
  
  bookmarkItemContainer: {
    // Animation container
  },
  
  bookmarkItem: {
    position: 'relative',
    overflow: 'hidden',
  },
  
  gradientAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  
  bookmarkContent: {
    paddingTop: Spacing.md,
  },
  
  bookmarkHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  
  bookmarkTitle: {
    ...Typography.title4,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  
  bookmarkReference: {
    ...Typography.caption1Medium,
    marginBottom: Spacing.sm,
  },
  
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  bookmarkPassage: {
    ...Typography.callout,
    lineHeight: 22,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  
  bookmarkFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  bookmarkDate: {
    ...Typography.caption1,
  },
  
  readingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.tag,
    gap: 4,
  },
  
  readingText: {
    ...Typography.caption1Medium,
    fontSize: 10,
  },
});