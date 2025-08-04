import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/designSystem';

export default function NotFoundScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: Colors.systemGroupedBackground }]}> 
            <View style={styles.content}> 
                <Feather name="alert-circle" size={64} color={Colors.error} style={styles.icon} />
                <Text style={[styles.title, { color: Colors.label }]}>Page Not Found</Text> 
                <Text style={[styles.message, { color: Colors.secondaryLabel }]}> 
                    The page you're looking for doesn't exist or there was a routing error. 
                </Text> 

                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: Colors.primary, borderRadius: BorderRadius.button }]} 
                    onPress={() => router.push('/')} 
                    accessibilityLabel="Go to Home"
                    accessibilityRole="button"
                    accessibilityHint="Navigates to the home screen"
                > 
                    <Text style={[styles.buttonText, { color: Colors.primaryButtonText }]}>Go to Home</Text> 
                </TouchableOpacity> 

                <TouchableOpacity 
                    style={[styles.button, styles.secondaryButton, { borderRadius: BorderRadius.button, borderColor: Colors.primary }]} 
                    onPress={() => router.back()} 
                    accessibilityLabel="Go Back"
                    accessibilityRole="button"
                    accessibilityHint="Returns to the previous screen"
                > 
                    <Feather name="arrow-left" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.buttonText, styles.secondaryButtonText, { color: Colors.primary }]}>Go Back</Text> 
                </TouchableOpacity> 
            </View> 
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.systemGroupedBackground,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
    },
    icon: {
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.title1,
        color: Colors.label,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    message: {
        ...Typography.body,
        color: Colors.secondaryLabel,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.button,
        marginBottom: Spacing.sm,
        minWidth: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        ...Typography.callout,
        color: Colors.primaryButtonText,
        fontWeight: '600',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    secondaryButtonText: {
        color: Colors.primary,
    },
});