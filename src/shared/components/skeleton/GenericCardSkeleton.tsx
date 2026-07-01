import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox, SkeletonText } from './SkeletonBlocks';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

export const GenericCardSkeleton = () => {
  return (
    <View style={styles.card}>
      <SkeletonBox width="50%" height={16} style={styles.title} />
      <SkeletonBox width="80%" height={32} style={styles.value} />
      <SkeletonText lines={1} lastLineWidth="100%" style={styles.footer} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 12,
  },
  title: {
    borderRadius: 4,
  },
  value: {
    borderRadius: 6,
  },
  footer: {
    marginTop: 4,
  },
});

export default GenericCardSkeleton;
