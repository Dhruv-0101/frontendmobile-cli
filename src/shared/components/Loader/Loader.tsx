import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

interface LoaderProps {
  message?: string;
  fullscreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ message, fullscreen = true }) => {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 999,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textLightSecondary,
    textAlign: 'center',
  },
});

export default Loader;
