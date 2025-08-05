import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Shadows, BorderRadius, Spacing } from '../../constants/designSystem';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray2,
        tabBarStyle: {
          backgroundColor: colors.systemBackground,
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
          height: Platform.select({
            ios: 49 + insets.bottom,
            android: 65,
            web: 60,
          }),
          paddingBottom: Platform.select({
            ios: insets.bottom > 0 ? insets.bottom : 8,
            android: 8,
            web: 8,
          }),
          paddingTop: 8,
          paddingHorizontal: 0,
        },
        tabBarLabelStyle: {
          ...Typography.caption1,
          fontWeight: '500',
          marginBottom: Platform.select({
            ios: 0,
            android: 2,
            web: 2,
          }),
        },
        tabBarIconStyle: {
          marginTop: Platform.select({
            ios: 2,
            android: 0,
            web: 0,
          }),
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <Feather 
              name="book-open"
              size={Platform.select({ ios: 22, android: 24, web: 24 })} 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color }) => (
            <Feather 
              name="bookmark"
              size={Platform.select({ ios: 22, android: 24, web: 24 })} 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => (
            <Feather 
              name="clock"
              size={Platform.select({ ios: 22, android: 24, web: 24 })} 
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}