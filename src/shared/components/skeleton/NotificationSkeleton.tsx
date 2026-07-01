import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonRow, SkeletonBox, SkeletonText } from './SkeletonBlocks';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

export const NotificationSkeleton = () => {
  return (
    <View style={styles.notifCard}>
      <SkeletonRow style={styles.notifHeader}>
        <SkeletonBox width={20} height={20} style={styles.emoji} />
        <SkeletonBox width={80} height={10} style={styles.date} />
      </SkeletonRow>
      <SkeletonText lines={2} lineHeight={14} style={styles.message} />
      <SkeletonBox width={100} height={10} style={styles.link} />
    </View>
  );
};

const styles = StyleSheet.create({
  notifCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  notifHeader: {
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  emoji: {
    borderRadius: 4,
  },
  date: {
    borderRadius: 4,
  },
  message: {
    marginBottom: SPACING.sm,
  },
  link: {
    borderRadius: 4,
  },
});

export default NotificationSkeleton;
