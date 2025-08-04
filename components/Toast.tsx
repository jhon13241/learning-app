import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/designSystem';

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<any>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((msg: string, duration: number = 2500) => {
    setMessage(msg);
    setVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start(() => {
        setVisible(false);
        setMessage('');
      });
    }, duration);
  }, [opacity]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View style={[styles.toast, { opacity }]}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.select({ ios: 60, android: 80, default: 40 }),
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.black,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    ...Shadows.medium,
    alignSelf: 'center',
  },
  toastText: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
}); 