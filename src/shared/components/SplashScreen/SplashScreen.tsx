import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, ActivityIndicator } from 'react-native';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

export const SplashScreen = () => {
  // Animation values for premium entry transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Visual Premium Logo Emblem */}
        <View style={styles.logoEmblem}>
          <Text style={styles.logoEmblemText}>BM</Text>
        </View>

        {/* Brand Text */}
        <Text style={styles.brandTitle}>
          Blog<Text style={styles.brandTitleSec}>Mapp</Text>
        </Text>
        
        <Text style={styles.brandTagline}>Your Premium Story Space</Text>
      </Animated.View>

      {/* Loading indicator */}
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.white} style={{ marginBottom: SPACING.md }} />
        <Text style={styles.loadingText}>Initializing workspace...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmblem: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoEmblemText: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
  },
  brandTitleSec: {
    color: COLORS.success,
  },
  brandTagline: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.xs,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;
