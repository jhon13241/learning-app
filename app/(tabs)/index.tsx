import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BRESLOV_TEXTS, BreslovText } from '../../constants/breslovTexts';
import { Typography, Spacing, BorderRadius, Shadows, Animation } from '../../constants/designSystem';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/Card';

const { width: screenWidth } = Dimensions.get('window');

interface TextItemProps {
  item: BreslovText;
  index: number;
  onPress: (text: BreslovText) => void;
}

const TextItem: React.FC<TextItemProps> = ({ item, index, onPress }) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

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

  const gradientColors = index % 2 === 0 
    ? isDark ? colors.gradients.primary : colors.gradients.primarySubtle
    : isDark ? colors.gradients.accent : colors.gradients.neutral;

  return (
    <Animated.View
      style={[
        styles.textItemContainer,
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
        accessibilityRole="button"
        accessibilityLabel={`Read ${item.title}`}
        accessibilityHint="Tap to open this text for reading"
      >
        <Card
          variant="elevated"
          borderRadius="lg"
          padding="cardPadding"
          shadow="cardHover"
          style={styles.textItem}
        >
          {/* Gradient accent */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientAccent}
          />
          
          <View style={styles.textItemContent}>
            <View style={styles.textItemHeader}>
              <View style={styles.titleContainer}>
                <Text style={[styles.textTitle, { color: colors.label }]}>
                  {item.title}
                </Text>
                <View style={styles.languageBadges}>
                  {item.languages.map((lang, langIndex) => (
                    <View 
                      key={langIndex}
                      style={[
                        styles.languageBadge,
                        { 
                          backgroundColor: isDark ? colors.accent + '20' : colors.primary + '15',
                          borderColor: isDark ? colors.accent + '40' : colors.primary + '30',
                        }
                      ]}
                    >
                      <Text style={[
                        styles.languageText,
                        { color: isDark ? colors.accent : colors.primary }
                      ]}>
                        {lang === 'en' ? 'EN' : lang === 'he' ? 'HE' : lang.toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={[styles.chevronContainer, { backgroundColor: colors.primary + '15' }]}>
                <Feather 
                  name="arrow-right" 
                  size={18} 
                  color={colors.primary}
                />
              </View>
            </View>
            
            <Text style={[styles.textDescription, { color: colors.secondaryLabel }]}>
              Discover the wisdom and teachings of this sacred text
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const handleTextPress = (text: BreslovText) => {
    router.push(`/text/${encodeURIComponent(text.apiReference)}`);
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
          Library
        </Text>
      </Animated.View>

      {/* Hero Section with Gradient */}
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
          colors={isDark ? colors.gradients.dark : colors.gradients.neutral}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        />
        
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: colors.label }]}>
            Breslov Study
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.secondaryLabel }]}>
            Explore the profound wisdom of Rabbi Nachman and discover transformative teachings
          </Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statItem, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {BRESLOV_TEXTS.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}>
                Sacred Texts
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
      
      {/* Enhanced List */}
      <Animated.FlatList
        data={BRESLOV_TEXTS}
        renderItem={({ item, index }) => (
          <TextItem 
            item={item} 
            index={index} 
            onPress={handleTextPress}
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
    maxWidth: screenWidth - 80,
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
  
  list: {
    flex: 1,
    marginTop: Spacing.lg,
  },
  
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.lg,
  },
  
  textItemContainer: {
    // Animation container
  },
  
  textItem: {
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
  
  textItemContent: {
    paddingTop: Spacing.md,
  },
  
  textItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  
  textTitle: {
    ...Typography.title3,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    letterSpacing: -0.2,
  },
  
  languageBadges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  
  languageBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.tag,
    borderWidth: 1,
  },
  
  languageText: {
    ...Typography.caption1Medium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  textDescription: {
    ...Typography.callout,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});