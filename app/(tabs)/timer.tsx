import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as KeepAwake from 'expo-keep-awake';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/designSystem';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/Toast';
import { Feather } from '@expo/vector-icons';

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();
  
  // Timer state
  const [duration, setDuration] = useState(20); // minutes
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [timerActive, setTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = duration * 60;

  useEffect(() => {
    if (timerActive && !isPaused && timeLeft > 0) {
      KeepAwake.activateKeepAwakeAsync();
      
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      KeepAwake.deactivateKeepAwake();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerActive, isPaused, timeLeft]);

  const handleTimerComplete = () => {
    setTimerActive(false);
    setIsPaused(false);
    setTimeLeft(0);
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    showToast('Timer completed!', 'success');
    
    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startTimer = () => {
    setTimeLeft(totalDuration);
    setTimerActive(true);
    setIsPaused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const pauseTimer = () => {
    setIsPaused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resumeTimer = () => {
    setIsPaused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stopTimer = () => {
    Alert.alert(
      'Stop Timer',
      'Are you sure you want to stop the timer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            setTimerActive(false);
            setIsPaused(false);
            setTimeLeft(0);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (totalDuration === 0) return 0;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const renderDurationSelector = () => (
    <Card style={styles.durationCard}>
      <Text style={[styles.sectionTitle, { color: colors.label }]}>
        Duration
      </Text>
      
      <View style={styles.durationButtons}>
        {[5, 10, 15, 20, 30, 45].map((mins) => (
          <Button
            key={mins}
            title={`${mins}m`}
            onPress={() => setDuration(mins)}
            variant={duration === mins ? 'primary' : 'secondary'}
            size="small"
            style={styles.durationButton}
          />
        ))}
      </View>
      
      <Text style={[styles.selectedDuration, { color: colors.secondaryLabel }]}>
        Selected: {duration} minutes
      </Text>
    </Card>
  );

  const renderActiveTimer = () => (
    <Animated.View 
      style={[
        styles.activeTimerContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <Card style={styles.timerCard} variant="elevated">
        <View style={styles.timerContent}>
          <Text style={[styles.timerTitle, { color: colors.label }]}>
            {isPaused ? 'Paused' : 'Meditation Timer'}
          </Text>
          
          <View style={styles.progressContainer}>
            <AnimatedCircularProgress
              size={200}
              width={8}
              fill={getProgress()}
              tintColor={colors.primary}
              backgroundColor={colors.gray5}
              lineCap="round"
              rotation={0}
            >
              {() => (
                <View style={styles.timerCenter}>
                  <Text style={[styles.timeDisplay, { color: colors.label }]}>
                    {formatTime(timeLeft)}
                  </Text>
                  <Text style={[styles.timeLabel, { color: colors.secondaryLabel }]}>
                    remaining
                  </Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>
          
          <View style={styles.timerControls}>
            {isPaused ? (
              <Button
                title="Resume"
                onPress={resumeTimer}
                variant="primary"
                icon="play"
                style={styles.controlButton}
              />
            ) : (
              <Button
                title="Pause"
                onPress={pauseTimer}
                variant="secondary"
                icon="pause"
                style={styles.controlButton}
              />
            )}
            
            <Button
              title="Stop"
              onPress={stopTimer}
              variant="tertiary"
              icon="square"
              style={styles.controlButton}
            />
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
      <StatusBar style="auto" />
      
      {/* Status Bar Safe Area */}
      <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: colors.systemBackground }]} />

      {/* Navigation Header */}
      <View style={[styles.navigationHeader, { backgroundColor: colors.systemBackground, borderBottomColor: colors.separator }]}>
        <Text style={[styles.navigationTitle, { color: colors.label }]}>Timer</Text>
      </View>

      <View style={styles.content}>
        {timerActive ? (
          renderActiveTimer()
        ) : (
          <View style={styles.setupContainer}>
            {renderDurationSelector()}
            
            <Card style={styles.descriptionCard}>
              <View style={[styles.iconContainer, { backgroundColor: colors.gray5 }]}>
                <Feather name="clock" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.descriptionTitle, { color: colors.label }]}>
                Meditation Timer
              </Text>
              <Text style={[styles.descriptionText, { color: colors.secondaryLabel }]}>
                Set a focused time for prayer, meditation, or study. 
                The timer will keep your screen awake and notify you when complete.
              </Text>
            </Card>
            
            <Button
              title="Start Timer"
              onPress={startTimer}
              variant="primary"
              icon="play"
              size="large"
              fullWidth
              style={styles.startButton}
            />
          </View>
        )}
      </View>
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
  },
  
  navigationTitle: {
    ...Typography.largeTitle,
    fontWeight: '700',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
  },
  
  // Setup view
  setupContainer: {
    flex: 1,
    gap: Spacing.xl,
  },
  
  durationCard: {
    // Card styling handled by component
  },
  
  sectionTitle: {
    ...Typography.headline,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  
  durationButton: {
    minWidth: 60,
  },
  
  selectedDuration: {
    ...Typography.subheadline,
    textAlign: 'center',
  },
  
  descriptionCard: {
    alignItems: 'center',
    textAlign: 'center',
  },
  
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  
  descriptionTitle: {
    ...Typography.title3,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  descriptionText: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  
  startButton: {
    marginTop: 'auto',
    marginBottom: Platform.select({
      ios: Spacing.xl,
      android: Spacing.xxl,
      web: Spacing.xl,
    }),
  },
  
  // Active timer view
  activeTimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  timerCard: {
    width: '100%',
    alignItems: 'center',
  },
  
  timerContent: {
    alignItems: 'center',
    width: '100%',
  },
  
  timerTitle: {
    ...Typography.title2,
    fontWeight: '600',
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  
  timerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  timeDisplay: {
    ...Typography.largeTitle,
    fontWeight: '300',
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  
  timeLabel: {
    ...Typography.subheadline,
  },
  
  timerControls: {
    flexDirection: 'row',
    gap: Spacing.lg,
    width: '100%',
    justifyContent: 'center',
  },
  
  controlButton: {
    minWidth: 100,
  },
}); 