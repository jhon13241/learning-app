import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Platform, 
  Animated, 
  Easing,
  SafeAreaView,
  AppState,
  AppStateStatus,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animation } from '../../constants/designSystem';
import { useTheme } from '../../contexts/ThemeContext';
import * as Notifications from 'expo-notifications';
import * as KeepAwake from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

// Timer presets in minutes
const PRESET_MINUTES = [5, 10, 15];
// Available minutes for custom timer (0-60)
const MINUTES = Array.from({ length: 61 }, (_, i) => i);
// Available seconds for custom timer
const SECONDS = [0, 15, 30, 45];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TimerTab() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  // Timer state
  const [customMinutes, setCustomMinutes] = useState(10);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [paused, setPaused] = useState(false);
  
  // UI state
  const [showDNDModal, setShowDNDModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  
  // Refs and animations
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timerAnim] = useState(new Animated.Value(1));
  const [modalAnim] = useState(new Animated.Value(0));
  const [buttonAnim] = useState(new Animated.Value(1));

  // Add app state tracking
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const endTimeRef = useRef<number | null>(null);
  
  // Add a ref to track if the end modal was already dismissed
  const endModalDismissed = useRef(false);

  // Load timer state from storage when component mounts
  useEffect(() => {
    loadTimerState();
    
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      updateTimerFromStorage();
    }
    
    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };
  
  // Update saveTimerState to also save the timerStoppedManually flag
  const saveTimerState = async () => {
    try {
      if (timerActive && remaining !== null && timerDuration !== null) {
        // Calculate end time if not set
        if (!endTimeRef.current && remaining > 0) {
          endTimeRef.current = Date.now() + remaining * 1000;
        }
        
        const timerState = {
          active: timerActive,
          paused: paused,
          duration: timerDuration,
          endTime: endTimeRef.current,
          stoppedManually: timerStoppedManually.current, // Save the stopped manually flag
        };
        
        await AsyncStorage.setItem('@timer_state', JSON.stringify(timerState));
      } else {
        // Clear timer state if not active
        await AsyncStorage.removeItem('@timer_state');
        endTimeRef.current = null;
      }
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  };

  // Update loadTimerState with similar improvements for consistency
  const loadTimerState = async () => {
    try {
      // First check if the end modal was already dismissed
      const modalDismissed = await AsyncStorage.getItem('@end_modal_dismissed');
      if (modalDismissed === 'true') {
        endModalDismissed.current = true;
      } else {
        endModalDismissed.current = false;
      }
      
      const timerStateString = await AsyncStorage.getItem('@timer_state');
      
      // If there's no timer state or it's empty, ensure timer is fully reset
      if (!timerStateString) {
        setTimerActive(false);
        setRemaining(null);
        setPaused(false);
        setTimerDuration(null);
        endTimeRef.current = null;
        timerStoppedManually.current = false;
        return;
      }
      
      const timerState = JSON.parse(timerStateString);
      
      // Check if timer was manually stopped - if so, don't restore it
      if (timerState.stoppedManually) {
        console.log('Timer was manually stopped, not restoring state on app load');
        setTimerActive(false);
        setRemaining(null);
        setPaused(false);
        setTimerDuration(null);
        endTimeRef.current = null;
        
        // Clean up any lingering state
        await AsyncStorage.removeItem('@timer_state');
        return;
      }
      
      // If there's an active timer
      if (timerState.active && timerState.endTime) {
        const now = Date.now();
        const endTime = timerState.endTime;
        
        // If timer hasn't ended yet
        if (endTime > now) {
          console.log('Loading active timer with remaining seconds:', Math.ceil((endTime - now) / 1000));
          const remainingSeconds = Math.ceil((endTime - now) / 1000);
          setTimerDuration(timerState.duration);
          setRemaining(remainingSeconds);
          setTimerActive(true);
          setPaused(timerState.paused || false);
          endTimeRef.current = endTime;
          // Restore the stopped manually flag
          timerStoppedManually.current = timerState.stoppedManually || false;
        } else {
          // Timer has ended while app was closed
          console.log('Timer has ended while app was closed, clearing state');
          await AsyncStorage.removeItem('@timer_state');
          // Only show end modal if timer wasn't manually stopped AND modal wasn't already dismissed
          if (!timerState.stoppedManually && !endModalDismissed.current) {
            setShowEndModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
      // In case of error, reset timer to be safe
      setTimerActive(false);
      setRemaining(null);
      setPaused(false);
      setTimerDuration(null);
      endTimeRef.current = null;
    }
  };

  // Update updateTimerFromStorage to add additional verification for stopped timers
  const updateTimerFromStorage = async () => {
    try {
      // First check if the end modal was already dismissed
      const modalDismissed = await AsyncStorage.getItem('@end_modal_dismissed');
      if (modalDismissed === 'true') {
        endModalDismissed.current = true;
      } else {
        endModalDismissed.current = false;
      }
      
      const timerStateString = await AsyncStorage.getItem('@timer_state');
      
      // If there's no timer state or it's empty, ensure timer is fully reset
      if (!timerStateString) {
        setTimerActive(false);
        setRemaining(null);
        setPaused(false);
        setTimerDuration(null);
        endTimeRef.current = null;
        timerStoppedManually.current = false;
        return;
      }
      
      const timerState = JSON.parse(timerStateString);
      
      // Check if timer was manually stopped - if so, don't restore it
      if (timerState.stoppedManually) {
        console.log('Timer was manually stopped, not restoring state');
        setTimerActive(false);
        setRemaining(null);
        setPaused(false);
        setTimerDuration(null);
        endTimeRef.current = null;
        
        // Clean up any lingering state
        await AsyncStorage.removeItem('@timer_state');
        return;
      }
      
      if (timerState.active && timerState.endTime) {
        const now = Date.now();
        const endTime = timerState.endTime;
        
        // Restore the stopped manually flag
        timerStoppedManually.current = timerState.stoppedManually || false;
        
        if (endTime > now) {
          // Timer still running
          console.log('Restoring active timer with remaining seconds:', Math.ceil((endTime - now) / 1000));
          const remainingSeconds = Math.ceil((endTime - now) / 1000);
          setTimerDuration(timerState.duration);
          setRemaining(remainingSeconds);
          setTimerActive(true);
          setPaused(timerState.paused || false);
        } else {
          // Timer has ended
          console.log('Timer has ended, clearing state');
          setTimerActive(false);
          setRemaining(null);
          setPaused(false);
          setTimerDuration(null);
          // Only show end modal if timer wasn't manually stopped AND modal wasn't already dismissed
          if (!timerState.stoppedManually && !endModalDismissed.current) {
            setShowEndModal(true);
          }
          await AsyncStorage.removeItem('@timer_state');
        }
      }
    } catch (error) {
      console.error('Failed to update timer from storage:', error);
      // In case of error, reset timer to be safe
      setTimerActive(false);
      setRemaining(null);
      setPaused(false);
      setTimerDuration(null);
    }
  };
  
  // Update handlePreset to reset the end modal dismissed flag
  const handlePreset = (minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    // Reset the manual stop flag when starting a new timer
    timerStoppedManually.current = false;
    // Reset the end modal dismissed flag
    endModalDismissed.current = false;
    AsyncStorage.removeItem('@end_modal_dismissed').catch(error => {
      console.error('Failed to remove modal dismissed state:', error);
    });
    setShowDNDModal(true);
    animateButton();
  };

  // Update handleCustomStart to reset the end modal dismissed flag
  const handleCustomStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const totalSeconds = (customMinutes * 60) + customSeconds;
    if (totalSeconds > 0) {
      setTimerDuration(totalSeconds);
      // Reset the manual stop flag when starting a new timer
      timerStoppedManually.current = false;
      // Reset the end modal dismissed flag
      endModalDismissed.current = false;
      AsyncStorage.removeItem('@end_modal_dismissed').catch(error => {
        console.error('Failed to remove modal dismissed state:', error);
      });
      setShowDNDModal(true);
      animateButton();
    }
  };

  // Animate button press
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonAnim, { 
        toValue: 0.95, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(buttonAnim, { 
        toValue: 1, 
        duration: 100, 
        useNativeDriver: true 
      })
    ]).start();
  };

  // Update the handleDNDConfirm function to reset the timerStoppedManually flag
  const handleDNDConfirm = () => {
    setShowDNDModal(false);
    if (timerDuration) {
      // Reset the manual stop flag when starting a new timer
      timerStoppedManually.current = false;
      
      setRemaining(timerDuration);
      setTimerActive(true);
      setPaused(false);
      // Set end time reference
      endTimeRef.current = Date.now() + timerDuration * 1000;
      // Save timer state
      saveTimerState();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Modify the foreground notification useEffect to only trigger when timer naturally completes
  // Add a ref to track if the timer was manually stopped
  const timerStoppedManually = useRef(false);

  // Update the handleStop function to explicitly remove timer state from AsyncStorage
  const handleStop = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Set flag that timer was manually stopped
    timerStoppedManually.current = true;
    
    // Cancel all scheduled notifications when timer is stopped
    Notifications.cancelAllScheduledNotificationsAsync();
    
    // Explicitly ensure end modal doesn't show
    setShowEndModal(false);
    
    // Reset all timer state
    setTimerActive(false);
    setRemaining(null);
    setPaused(false);
    setTimerDuration(null);
    endTimeRef.current = null;
    
    // Explicitly remove timer state from AsyncStorage
    try {
      await AsyncStorage.removeItem('@timer_state');
      console.log('Timer state successfully cleared from AsyncStorage');
    } catch (error) {
      console.error('Failed to clear timer state from AsyncStorage:', error);
    }
    
    // No need to call saveTimerState since we're directly handling AsyncStorage
  };

  // Update the timer countdown effect to check the manual stop flag before showing the end modal
  useEffect(() => {
    if (timerActive && !paused && remaining !== null && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          return null;
        });
      }, 1000);
      
      // Save timer state when it changes
      saveTimerState();
      
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else if (remaining === 0 && timerActive && !timerStoppedManually.current) {
      // Timer naturally completed and wasn't manually stopped
      timerStoppedManually.current = false; // Reset flag
      setTimerActive(false);
      setShowEndModal(true);
      setRemaining(null);
      // Clear timer state
      saveTimerState();
      
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive, paused, remaining]);

  // Request notification permissions
  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      })
    });
  }, []);

  // Keep screen awake during timer
  useEffect(() => {
    if (timerActive) {
      KeepAwake.activateKeepAwake();
    } else {
      KeepAwake.deactivateKeepAwake();
    }
    return () => {
      KeepAwake.deactivateKeepAwake();
    };
  }, [timerActive]);

  // Schedule notification when timer starts
  useEffect(() => {
    let notificationId: string | undefined;
    
    if (timerActive && remaining && remaining > 0) {
      Notifications.cancelAllScheduledNotificationsAsync();
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hitbodedut Session Complete',
          body: 'Your meditation session has ended. You may turn off Do Not Disturb.',
          sound: true,
        },
        trigger: { 
          type: 'timeInterval', 
          seconds: remaining, 
          repeats: false 
        } as Notifications.TimeIntervalTriggerInput,
      }).then(id => { notificationId = id as string });
    }
    
    // Cancel notification if timer stops
    if (!timerActive) {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
    
    return () => {
      if (notificationId) Notifications.cancelScheduledNotificationAsync(notificationId);
    };
  }, [timerActive, remaining]);

  // Remove the foreground notification that causes duplicates
  useEffect(() => {
    if (showEndModal && !timerStoppedManually.current) {
      // Only trigger haptic feedback, not another notification
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [showEndModal]);

  // Animate timer display on tick
  useEffect(() => {
    if (timerActive && remaining !== null && remaining % 60 === 0) {
      Animated.sequence([
        Animated.timing(timerAnim, { 
          toValue: 1.05, 
          duration: 150, 
          useNativeDriver: true, 
          easing: Easing.out(Easing.ease) 
        }),
        Animated.timing(timerAnim, { 
          toValue: 1, 
          duration: 150, 
          useNativeDriver: true, 
          easing: Easing.in(Easing.ease) 
        })
      ]).start();
    }
  }, [remaining]);

  // Animate modal appearance
  useEffect(() => {
    if (showDNDModal || showEndModal) {
      Animated.timing(modalAnim, { 
        toValue: 1, 
        duration: 250, 
        useNativeDriver: true, 
        easing: Easing.out(Easing.ease) 
      }).start();
    } else {
      Animated.timing(modalAnim, { 
        toValue: 0, 
        duration: 200, 
        useNativeDriver: true, 
        easing: Easing.in(Easing.ease) 
      }).start();
    }
  }, [showDNDModal, showEndModal]);

  // Format time as mm:ss
  const formatTime = (sec: number | null) => {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Update the handlePauseResume function to also handle the timerStoppedManually flag
  const handlePauseResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaused((p) => {
      const newPausedState = !p;
      
      // Update end time when pausing/resuming
      if (remaining !== null) {
        if (newPausedState) {
          // Pausing - store current remaining time
          endTimeRef.current = null; // Clear end time when paused
          
          // Cancel scheduled notifications when paused
          Notifications.cancelAllScheduledNotificationsAsync();
        } else {
          // Resuming - calculate new end time
          endTimeRef.current = Date.now() + remaining * 1000;
          
          // Reset the manual stop flag when resuming
          timerStoppedManually.current = false;
          
          // Reschedule notification with remaining time
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Hitbodedut Session Complete',
              body: 'Your meditation session has ended. You may turn off Do Not Disturb.',
              sound: true,
            },
            trigger: { 
              type: 'timeInterval', 
              seconds: remaining, 
              repeats: false 
            } as Notifications.TimeIntervalTriggerInput,
          });
        }
        // Save updated state
        saveTimerState();
      }
      
      return newPausedState;
    });
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (timerDuration === null || remaining === null) return 0;
    return 100 * (1 - remaining / timerDuration);
  };

  // Update the function that handles closing the end modal
  const handleEndModalClose = () => {
    setShowEndModal(false);
    endModalDismissed.current = true;
    
    // Save the dismissed state to AsyncStorage
    AsyncStorage.setItem('@end_modal_dismissed', 'true').catch(error => {
      console.error('Failed to save modal dismissed state:', error);
    });
  };

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDark ? colors.systemBackground : colors.systemBackground }
    ]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {timerActive ? (
        // ACTIVE TIMER VIEW - MODERNIZED
        <View style={styles.activeTimerContainer}>
          {/* Gradient Background */}
          <LinearGradient
            colors={isDark ? colors.gradients.dark : colors.gradients.primarySubtle}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Modern Timer Card */}
          <Card
            variant="glass"
            borderRadius="xxl"
            padding="xxxl"
            style={styles.modernTimerCard}
            shadow="xl"
          >
            {/* Enhanced Circular Progress */}
            <View style={styles.progressContainer}>
              <AnimatedCircularProgress
                size={screenWidth * 0.7} 
                width={12}
                backgroundWidth={6}
                fill={getProgressPercentage()}
                tintColor={colors.primary}
                backgroundColor={isDark ? colors.gray4 + '30' : colors.primaryExtraLight}
                rotation={-90}
                lineCap="round"
                duration={800}
                style={styles.circularProgress}
              >
                {() => (
                  <View style={styles.modernTimerDisplay}>
                    <Animated.Text
                      style={[
                        styles.modernTimeText,
                        { 
                          color: colors.label, 
                          transform: [{ scale: timerAnim }] 
                        }
                      ]}
                      accessibilityRole="timer"
                    >
                      {formatTime(remaining)}
                    </Animated.Text>
                    
                    <View style={[styles.statusBadge, { backgroundColor: paused ? colors.warning + '20' : colors.success + '20' }]}>
                      <Feather 
                        name={paused ? "pause" : "clock"} 
                        size={16} 
                        color={paused ? colors.warning : colors.success}
                        style={styles.statusIcon}
                      />
                      <Text style={[
                        styles.modernStatusText, 
                        { color: paused ? colors.warning : colors.success }
                      ]}>
                        {paused ? 'Paused' : 'Active Session'}
                      </Text>
                    </View>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>

            {/* Session Info */}
            <View style={styles.sessionInfo}>
              <Text style={[styles.sessionTitle, { color: colors.label }]}>
                Hitbodedut Session
              </Text>
              <Text style={[styles.sessionDuration, { color: colors.secondaryLabel }]}>
                {Math.floor((timerDuration || 0) / 60)} minutes total
              </Text>
            </View>
          </Card>

          {/* Modern Controls */}
          <View style={styles.modernControlsContainer}>
            <Button
              title={paused ? 'Resume' : 'Pause'}
              icon={paused ? "play" : "pause"}
              variant={paused ? "gradient" : "glass"}
              size="large"
              onPress={handlePauseResume}
              style={styles.controlButton}
            />
            
            <Button
              title="End Session"
              icon="square"
              variant="outline"
              size="large"
              onPress={handleStop}
              style={[styles.controlButton, { borderColor: colors.error, color: colors.error }]}
              textStyle={{ color: colors.error }}
            />
          </View>
        </View>
      ) : (
        // SETUP VIEW - MODERNIZED
        <View style={styles.modernSetupContainer}>
          {/* Gradient Background */}
          <LinearGradient
            colors={isDark ? colors.gradients.dark : colors.gradients.neutral}
            style={styles.setupGradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Modern Header */}
          <View style={styles.modernHeader}>
            <Text style={[styles.modernHeaderTitle, { color: colors.label }]}>
              Hitbodedut Timer
            </Text>
            <Text style={[styles.modernHeaderSubtitle, { color: colors.secondaryLabel }]}>
              Find peace through guided meditation sessions
            </Text>
          </View>

          {/* Quick Start Section */}
          <Card
            variant="glass"
            borderRadius="xl"
            padding="cardPadding"
            style={styles.modernSetupCard}
            shadow="medium"
          >
            <View style={styles.sectionHeader}>
              <Feather name="zap" size={24} color={colors.primary} />
              <Text style={[styles.modernSectionTitle, { color: colors.label }]}>
                Quick Start
              </Text>
            </View>
            
            <View style={styles.modernPresetContainer}>
              {PRESET_MINUTES.map((min, index) => (
                <Button
                  key={min}
                  title={`${min} min`}
                  variant={index === 1 ? "gradient" : "glass"}
                  size="large"
                  onPress={() => handlePreset(min)}
                  style={styles.presetButton}
                  icon="clock"
                />
              ))}
            </View>
          </Card>

          {/* Custom Timer Section */}
          <View style={[
            styles.setupCard, 
            { 
              backgroundColor: isDark ? colors.secondarySystemBackground : colors.white,
              borderColor: isDark ? 'transparent' : colors.separator,
              borderWidth: isDark ? 0 : 1,
            }
          ]}>
            <Text style={[styles.sectionTitle, { color: colors.label }]}>
              Custom Timer
            </Text>
            
            <View style={styles.pickerContainer}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.pickerLabel, { color: colors.secondaryLabel }]}>
                  Minutes
                </Text>
                <View style={[
                  styles.pickerWrapper, 
                  { 
                    backgroundColor: isDark ? colors.secondarySystemBackground : colors.white,
                    borderColor: isDark ? 'transparent' : colors.separator,
                    borderWidth: 0, // Remove border
                  }
                ]}>
                  <Picker
                    selectedValue={customMinutes}
                    onValueChange={setCustomMinutes}
                    style={styles.picker}
                    itemStyle={[styles.pickerItem, { color: colors.label }]}
                    dropdownIconColor={colors.label}
                  >
                    {MINUTES.map((min) => (
                      <Picker.Item 
                        key={min} 
                        label={min.toString()} 
                        value={min} 
                        color={isDark ? colors.label : undefined} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.pickerLabel, { color: colors.secondaryLabel }]}>
                  Seconds
                </Text>
                <View style={[
                  styles.pickerWrapper, 
                  { 
                    backgroundColor: isDark ? colors.secondarySystemBackground : colors.white,
                    borderColor: isDark ? 'transparent' : colors.separator,
                    borderWidth: 0, // Remove border
                  }
                ]}>
                  <Picker
                    selectedValue={customSeconds}
                    onValueChange={setCustomSeconds}
                    style={styles.picker}
                    itemStyle={[styles.pickerItem, { color: colors.label }]}
                    dropdownIconColor={colors.label}
                  >
                    {SECONDS.map((sec) => (
                      <Picker.Item 
                        key={sec} 
                        label={sec.toString()} 
                        value={sec} 
                        color={isDark ? colors.label : undefined} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
          
          {/* Start Button */}
          <TouchableOpacity
            style={[
              styles.startButton, 
              { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary
              }
            ]}
            onPress={handleCustomStart}
            activeOpacity={0.6}
          >
            <Feather name="play" size={22} color={colors.white} style={styles.startButtonIcon} />
            <Text style={[styles.startButtonText, { color: colors.white }]}>
              Start Timer
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Do Not Disturb Modal */}
      <Modal visible={showDNDModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalCard, 
              { 
                backgroundColor: isDark ? colors.secondarySystemBackground : colors.white,
                opacity: modalAnim,
                transform: [{ 
                  scale: modalAnim.interpolate({ 
                    inputRange: [0, 1], 
                    outputRange: [0.9, 1] 
                  }) 
                }]
              }
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Feather 
                name="bell-off" 
                size={32} 
                color={colors.primary} 
              />
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.label }]}>
              Turn On Do Not Disturb
            </Text>
            
            <Text style={[styles.modalText, { color: colors.secondaryLabel }]}>
              For a distraction-free meditation session, please enable Do Not Disturb mode on your device.
            </Text>
            
            <TouchableOpacity
              style={[
                styles.modalButton, 
                { 
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary
                }
              ]}
              onPress={handleDNDConfirm}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: colors.white }]}>
                Begin Session
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Session Complete Modal */}
      <Modal visible={showEndModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalCard, 
              { 
                backgroundColor: isDark ? colors.secondarySystemBackground : colors.white,
                opacity: modalAnim,
                transform: [{ 
                  scale: modalAnim.interpolate({ 
                    inputRange: [0, 1], 
                    outputRange: [0.9, 1] 
                  }) 
                }]
              }
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Feather 
                name="check-circle" 
                size={32} 
                color={colors.success} 
              />
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.label }]}>
              Session Complete
            </Text>
            
            <Text style={[styles.modalText, { color: colors.secondaryLabel }]}>
              Your Hitbodedut session has ended. Remember to turn off Do Not Disturb mode.
            </Text>
            
            <TouchableOpacity
              style={[
                styles.modalButton, 
                { 
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary
                }
              ]}
              onPress={handleEndModalClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: colors.white }]}>
                Close
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Active Timer Styles
  activeTimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  timerCard: {
    width: '100%',
    maxWidth: 340,
    aspectRatio: 1,
    borderRadius: 24, // More iOS-like rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.small, // Subtle shadow for iOS feel
  },
  timerDigitsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    height: 140,
  },
  timerDisplay: {
    ...Typography.largeTitle,
    fontSize: 56, // Larger font for SF Pro Display style
    fontWeight: '500', // Medium weight for iOS feel
    letterSpacing: -0.5, // Negative tracking for iOS feel
    lineHeight: 64,
    height: 64,
    textAlign: 'center',
  },
  timerStatus: {
    ...Typography.subheadline,
    marginTop: Spacing.md,
    fontWeight: '400', // Regular weight for iOS feel
    opacity: 0.8,
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 340,
    gap: Spacing.lg,
    marginTop: Spacing.xl,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 16, // More iOS-like rounded corners
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 44, // Standard iOS touch target height
    ...Shadows.small,
  },
  controlButtonText: {
    ...Typography.subheadline,
    fontWeight: '500', // Medium weight for iOS feel
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },
  
  // Setup View Styles
  setupContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl, // More horizontal padding for iOS feel
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    ...Typography.title1,
    fontWeight: '600', // Semibold weight for iOS feel
    marginBottom: Spacing.sm,
    letterSpacing: -0.5, // Negative tracking for iOS feel
  },
  headerSubtitle: {
    ...Typography.subheadline,
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },
  setupCard: {
    borderRadius: 20, // More iOS-like rounded corners
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.small, // Subtle shadow for iOS feel
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.headline,
    fontWeight: '600', // Semibold weight for iOS feel
    marginBottom: Spacing.lg,
    textAlign: 'center',
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },
  presetButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Even spacing between buttons
    width: '100%',
    marginTop: Spacing.sm,
  },
  presetButton: {
    flex: 1,
    borderRadius: 14, // iOS-like rounded corners
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40, // Slightly shorter for better proportions
    ...Shadows.small, // Subtle shadow for iOS feel
  },
  presetButtonText: {
    ...Typography.subheadline,
    fontWeight: '500', // Medium weight for iOS feel
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  pickerWrapper: {
    width: 140,
    height: 120,
    borderRadius: 16, // More iOS-like rounded corners
    overflow: 'hidden',
    marginHorizontal: Spacing.md,
    ...Shadows.small, // Subtle shadow for iOS feel
  },
  pickerLabel: {
    ...Typography.subheadline,
    textAlign: 'center',
    paddingTop: Spacing.xs,
    marginBottom: Spacing.sm,
    fontWeight: '500', // Medium weight for iOS feel
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },
  picker: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
  },
  pickerItem: {
    fontSize: 20,
    lineHeight: 120,
    textAlign: 'center',
    fontWeight: '400', // Regular weight for iOS feel
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16, // iOS-like rounded corners
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    ...Shadows.small, // Subtle shadow for iOS feel
    width: '100%', // Full width
    alignSelf: 'center',
    height: 50, // Standard iOS button height
    elevation: 2, // Reduced elevation for subtlety
  },
  startButtonIcon: {
    marginRight: Spacing.sm,
  },
  startButtonText: {
    ...Typography.callout,
    fontWeight: '600', // Semibold weight for iOS feel
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 20, // More iOS-like rounded corners
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.medium,
  },
  modalIconContainer: {
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.title3,
    fontWeight: '600', // Semibold weight for iOS feel
    marginBottom: Spacing.md,
    textAlign: 'center',
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },
  modalText: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },
  modalButton: {
    borderRadius: 16, // iOS-like rounded corners
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small, // Subtle shadow for iOS feel
    height: 44, // Standard iOS touch target height
  },
  modalButtonText: {
    ...Typography.callout,
    fontWeight: '600', // Semibold weight for iOS feel
    letterSpacing: -0.2, // Slight negative tracking for iOS feel
  },

  // Modern Timer Styles
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  
  modernTimerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.85,
    maxWidth: 400,
    marginVertical: Spacing.xl,
  },
  
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  
  circularProgress: {
    transform: [{ rotate: '180deg' }],
  },
  
  modernTimerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  
  modernTimeText: {
    ...Typography.display,
    fontSize: screenWidth * 0.12,
    fontWeight: '300',
    letterSpacing: -2,
    marginBottom: Spacing.md,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    gap: Spacing.xs,
  },
  
  statusIcon: {
    // Icon styling handled by parent
  },
  
  modernStatusText: {
    ...Typography.caption1Medium,
    fontSize: 12,
  },
  
  sessionInfo: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  
  sessionTitle: {
    ...Typography.title2,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  
  sessionDuration: {
    ...Typography.subheadline,
    fontWeight: '400',
  },
  
  modernControlsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.screenPadding,
    width: '100%',
  },
  
  // Modern Setup Styles
  modernSetupContainer: {
    flex: 1,
    position: 'relative',
  },
  
  setupGradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  
  modernHeader: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  
  modernHeaderTitle: {
    ...Typography.largeTitle,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  
  modernHeaderSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  
  modernSetupCard: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  
  modernSectionTitle: {
    ...Typography.title3,
    fontWeight: '700',
  },
  
  modernPresetContainer: {
    gap: Spacing.md,
  },
  
  presetButton: {
    width: '100%',
  },
}); 