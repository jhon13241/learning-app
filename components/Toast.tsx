import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animation } from '../constants/designSystem';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors, isDark } = useTheme();
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'default' });
  const timeoutRef = useRef<any>(null);
  
  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const showToast = useCallback((message: string, type: ToastType = 'default', duration: number = 3000) => {
    // Haptic feedback based on type
    switch (type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setToast({ visible: true, message, type });
    
    // Reset animation values
    opacity.setValue(0);
    translateY.setValue(50);
    scale.setValue(0.9);
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: Animation.normal,
        useNativeDriver: true,
        easing: Easing.out(Easing.bezier(0.4, 0.0, 0.2, 1)),
      }),
      Animated.spring(translateY, {
        toValue: 0,
        ...Animation.spring.bouncy,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        ...Animation.spring.gentle,
        useNativeDriver: true,
      }),
    ]).start();

    // Clear existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Set hide timeout
    timeoutRef.current = setTimeout(() => {
      // Exit animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: Animation.fast,
          useNativeDriver: true,
          easing: Easing.in(Easing.bezier(0.4, 0.0, 1, 1)),
        }),
        Animated.timing(translateY, {
          toValue: -30,
          duration: Animation.fast,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: Animation.fast,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast({ visible: false, message: '', type: 'default' });
      });
    }, duration);
  }, [opacity, translateY, scale]);

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: colors.success,
          gradientColors: isDark 
            ? ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']
            : ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)'],
          borderColor: colors.success + '40',
        };
      case 'error':
        return {
          icon: 'alert-circle',
          iconColor: colors.error,
          gradientColors: isDark 
            ? ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']
            : ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)'],
          borderColor: colors.error + '40',
        };
      case 'warning':
        return {
          icon: 'alert-triangle',
          iconColor: colors.warning,
          gradientColors: isDark 
            ? ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']
            : ['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)'],
          borderColor: colors.warning + '40',
        };
      case 'info':
        return {
          icon: 'info',
          iconColor: colors.info,
          gradientColors: isDark 
            ? ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']
            : ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)'],
          borderColor: colors.info + '40',
        };
      default:
        return {
          icon: 'message-circle',
          iconColor: colors.label,
          gradientColors: isDark 
            ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
            : ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.02)'],
          borderColor: colors.separator,
        };
    }
  };

  if (!toast.visible) return <ToastContext.Provider value={{ showToast }}>{children}</ToastContext.Provider>;

  const config = getToastConfig();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View 
        style={[
          styles.toastContainer,
          {
            opacity,
            transform: [
              { translateY },
              { scale },
            ],
          },
        ]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.toastGradient,
            { borderColor: config.borderColor }
          ]}
        >
          <View style={styles.toastContent}>
            <View style={[styles.iconContainer, { backgroundColor: config.iconColor + '15' }]}>
              <Feather 
                name={config.icon as any}
                size={20} 
                color={config.iconColor}
              />
            </View>
            
            <Text style={[styles.toastText, { color: colors.label }]}>
              {toast.message}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
    top: Platform.select({ 
      ios: 60, 
      android: 60, 
      default: 60 
    }),
    zIndex: 10000,
    maxWidth: screenWidth - (Spacing.screenPadding * 2),
  },
  
  toastGradient: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  
  toastText: {
    ...Typography.calloutMedium,
    flex: 1,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
}); 