import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/designSystem';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  minDuration?: number; // ms
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'large',
  color = Colors.primary,
  minDuration = 400,
}) => {
  const [visible, setVisible] = useState(true);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    setVisible(true);
    startTimeRef.current = Date.now();
    let timeout: number | null = null;
    return () => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < minDuration) {
        timeout = setTimeout(() => setVisible(false), minDuration - elapsed) as unknown as number;
      } else {
        setVisible(false);
      }
      if (timeout) clearTimeout(timeout);
    };
  }, [minDuration]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  message: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});