import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, Animation } from '../constants/designSystem';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  minDuration?: number; // ms
  variant?: 'default' | 'pulse' | 'dots';
  fullScreen?: boolean;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'large',
  color,
  minDuration = 400,
  variant = 'default',
  fullScreen = false,
  overlay = false,
}) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(true);
  const startTimeRef = useRef<number>(Date.now());
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  const primaryColor = color || colors.primary;

  useEffect(() => {
    setVisible(true);
    startTimeRef.current = Date.now();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animation.normal,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...Animation.spring.gentle,
        useNativeDriver: true,
      }),
    ]).start();

    // Start continuous animations based on variant
    if (variant === 'pulse') {
      startPulseAnimation();
    } else if (variant === 'dots') {
      startDotsAnimation();
    }

    let timeout: number | null = null;
    return () => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < minDuration) {
        timeout = window.setTimeout(() => setVisible(false), minDuration - elapsed);
      } else {
        setVisible(false);
      }
      if (timeout) clearTimeout(timeout);
    };
  }, [minDuration, variant]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startDotsAnimation = () => {
    const animateDot = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      animateDot(dot1Anim, 0),
      animateDot(dot2Anim, 150),
      animateDot(dot3Anim, 300),
    ]).start();
  };

  if (!visible) return null;

  const renderSpinner = () => {
    const spinnerSize = size === 'large' ? 40 : 20;

    switch (variant) {
      case 'pulse':
        return (
          <Animated.View
            style={[
              styles.pulseSpinner,
              {
                width: spinnerSize,
                height: spinnerSize,
                backgroundColor: primaryColor,
                transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
              },
            ]}
          />
        );

      case 'dots':
        const dotSize = size === 'large' ? 12 : 8;
        const dotSpacing = size === 'large' ? 16 : 12;
        
        return (
          <View style={[styles.dotsContainer, { gap: dotSpacing }]}>
            {[dot1Anim, dot2Anim, dot3Anim].map((animValue, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotSize,
                    height: dotSize,
                    backgroundColor: primaryColor,
                    opacity: animValue,
                    transform: [
                      {
                        scale: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        );

      default:
        return (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <ActivityIndicator size={size} color={primaryColor} />
          </Animated.View>
        );
    }
  };

  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    overlay && styles.overlay,
  ];

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {overlay && <View style={styles.overlayBackground} />}
      
      <View style={[styles.content, { backgroundColor: colors.secondarySystemGroupedBackground }]}>
        {renderSpinner()}
        
        {message && (
          <Animated.Text
            style={[
              styles.message,
              { color: colors.secondaryLabel },
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {message}
          </Animated.Text>
        )}
      </View>
    </Animated.View>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight,
    zIndex: 1000,
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderRadius: 16,
    minWidth: 120,
  },
  
  message: {
    ...Typography.subheadline,
    fontWeight: '500',
    marginTop: Spacing.md,
    textAlign: 'center',
    maxWidth: 200,
  },
  
  // Pulse spinner
  pulseSpinner: {
    borderRadius: 20,
  },
  
  // Dots spinner
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  dot: {
    borderRadius: 6,
  },
});