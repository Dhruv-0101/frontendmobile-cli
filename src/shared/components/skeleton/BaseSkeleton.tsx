import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import COLORS from '../../constants/colors';

interface BaseSkeletonProps {
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  duration?: number;
}

export const BaseSkeleton = ({ style, children, duration = 1000 }: BaseSkeletonProps) => {
  const shimmerAnimated = useRef(new Animated.Value(0.3)).current;
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimated, {
          toValue: 0.8,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimated, {
          toValue: 0.3,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerAnimated, duration]);

  const skeletonColor = isDarkMode ? COLORS.cardDark : '#e2e8f0';

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { backgroundColor: skeletonColor, opacity: shimmerAnimated },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 4,
  },
});

export default BaseSkeleton;
