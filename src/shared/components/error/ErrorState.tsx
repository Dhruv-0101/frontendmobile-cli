import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

interface ErrorStateProps {
  error?: any;
  message?: string;
  onRetry: () => void;
}

export const ErrorState = ({ error, message, onRetry }: ErrorStateProps) => {
  let displayMessage = message || 'An unexpected error occurred';
  let emoji = '⚠️';

  if (error) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      displayMessage = 'You are not authorized to view this content';
      emoji = '🔒';
    } else if (status === 404) {
      displayMessage = 'The requested resource was not found';
      emoji = '🔍';
    } else if (status >= 500) {
      displayMessage = 'Server error. Please try again later';
      emoji = '📡';
    } else if (error.message?.includes('Network') || error.message?.includes('Network Error')) {
      displayMessage = 'No internet connection. Please check your network settings';
      emoji = '🌐';
    } else if (error.message?.includes('timeout')) {
      displayMessage = 'Connection timed out. Please try again';
      emoji = '⏱️';
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{displayMessage}</Text>
      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={onRetry}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    marginVertical: SPACING.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: 14,
    color: COLORS.textLightSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
});

export default ErrorState;
