import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Shadows, BorderRadius, Spacing } from '../../constants/designSystem';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  const renderTabBarBackground = () => {
    if (isDark) {
      return (
        <LinearGradient
          colors={['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.98)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '100%',
          }}
        />
      );
    }
    return (
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.98)']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '100%',
        }}
      />
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray2,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: Spacing.md,
          right: Spacing.md,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.select({
            ios: 60 + insets.bottom,
            android: 70,
            web: 65,
          }),
          paddingBottom: Platform.select({
            ios: insets.bottom > 0 ? insets.bottom + 8 : 12,
            android: 12,
            web: 12,
          }),
          paddingTop: 12,
          paddingHorizontal: Spacing.sm,
          borderRadius: BorderRadius.xl,
          marginBottom: Platform.select({
            ios: insets.bottom > 0 ? 8 : 16,
            android: 16,
            web: 16,
          }),
          ...Shadows.large,
          overflow: 'hidden',
        },
        tabBarBackground: renderTabBarBackground,
        tabBarLabelStyle: {
          ...Typography.caption1Medium,
          marginBottom: Platform.select({
            ios: 0,
            android: 0,
            web: 0,
          }),
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: Platform.select({
            ios: 0,
            android: 0,
            web: 0,
          }),
        },
        tabBarItemStyle: {
          borderRadius: BorderRadius.md,
          paddingVertical: 4,
          marginHorizontal: 2,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.primary}15` : 'transparent',
              borderRadius: BorderRadius.sm,
              paddingHorizontal: 12,
              paddingVertical: 6,
              minWidth: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Feather 
                name="book-open"
                size={Platform.select({ ios: 22, android: 24, web: 24 })} 
                color={focused ? colors.primary : color}
                style={{
                  opacity: focused ? 1 : 0.7,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.primary}15` : 'transparent',
              borderRadius: BorderRadius.sm,
              paddingHorizontal: 12,
              paddingVertical: 6,
              minWidth: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Feather 
                name="bookmark"
                size={Platform.select({ ios: 22, android: 24, web: 24 })} 
                color={focused ? colors.primary : color}
                style={{
                  opacity: focused ? 1 : 0.7,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Hitbodedut',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? `${colors.primary}15` : 'transparent',
              borderRadius: BorderRadius.sm,
              paddingHorizontal: 12,
              paddingVertical: 6,
              minWidth: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Feather 
                name="clock"
                size={Platform.select({ ios: 22, android: 24, web: 24 })} 
                color={focused ? colors.primary : color}
                style={{
                  opacity: focused ? 1 : 0.7,
                }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}