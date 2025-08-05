import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animation } from '../constants/designSystem';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info' | 'default';

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
  const { colors } = useTheme();
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'default' });
  const timeoutRef = useRef<any>(null);
  
  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  const showToast = useCallback((message: string, type: ToastType = 'default', duration: number = 2500) => {
    // Minimal haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setToast({ visible: true, message, type });
    
    // Reset animation values
    opacity.setValue(0);
    translateY.setValue(-50);
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: Animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: Animation.normal,
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
        }),
        Animated.timing(translateY, {
          toValue: -30,
          duration: Animation.fast,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast({ visible: false, message: '', type: 'default' });
      });
    }, duration);
  }, [opacity, translateY]);

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: colors.success,
          backgroundColor: colors.success,
        };
      case 'error':
        return {
          icon: 'x-circle',
          iconColor: colors.error,
          backgroundColor: colors.error,
        };
      case 'info':
        return {
          icon: 'info',
          iconColor: colors.primary,
          backgroundColor: colors.primary,
        };
      default:
        return {
          icon: 'message-circle',
          iconColor: colors.label,
          backgroundColor: colors.label,
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
            backgroundColor: config.backgroundColor,
            opacity,
            transform: [{ translateY }],
          },
        ]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <Feather 
          name={config.icon as any}
          size={16} 
          color={colors.white}
          style={styles.icon}
        />
        
        <Text style={[styles.toastText, { color: colors.white }]}>
          {toast.message}
        </Text>
      </Animated.View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    top: Platform.select({ 
      ios: 50, 
      android: 50, 
      default: 50 
    }),
    zIndex: 10000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    ...Shadows.medium,
    maxWidth: screenWidth - (Spacing.lg * 2),
  },
  
  icon: {
    marginRight: Spacing.sm,
  },
  
  toastText: {
    ...Typography.subheadline,
    fontWeight: '500',
    flex: 1,
  },
}); 