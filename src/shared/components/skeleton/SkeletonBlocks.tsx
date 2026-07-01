import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import BaseSkeleton from './BaseSkeleton';
import SPACING from '../../constants/spacing';

interface SkeletonRowProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const SkeletonRow = ({ children, style }: SkeletonRowProps) => (
  <View style={[styles.row, style]}>{children}</View>
);

interface SkeletonCircleProps {
  size: number;
  style?: ViewStyle | ViewStyle[];
}

export const SkeletonCircle = ({ size, style }: SkeletonCircleProps) => (
  <BaseSkeleton
    style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
      },
      style,
    ]}
  />
);

interface SkeletonBoxProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const SkeletonBox = ({
  width = '100%',
  height = 100,
  borderRadius = 8,
  style,
}: SkeletonBoxProps) => (
  <BaseSkeleton
    style={[
      {
        width,
        height,
        borderRadius,
      },
      style,
    ]}
  />
);

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  style?: ViewStyle | ViewStyle[];
  lastLineWidth?: string | number;
}

export const SkeletonText = ({
  lines = 3,
  lineHeight = 14,
  gap = SPACING.xs,
  style,
  lastLineWidth = '60%',
}: SkeletonTextProps) => {
  const lineArray = Array.from({ length: lines });
  return (
    <View style={style}>
      {lineArray.map((_, index) => {
        const isLast = index === lines - 1;
        return (
          <BaseSkeleton
            key={index}
            style={[
              styles.textLine,
              {
                height: lineHeight,
                marginBottom: isLast ? 0 : gap,
                width: isLast ? lastLineWidth : '100%',
              },
            ]}
          />
        );
      })}
    </View>
  );
};

interface SkeletonAvatarProps {
  size?: number;
  style?: ViewStyle | ViewStyle[];
}

export const SkeletonAvatar = ({ size = 40, style }: SkeletonAvatarProps) => (
  <SkeletonCircle size={size} style={style} />
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textLine: {
    borderRadius: 4,
  },
});
