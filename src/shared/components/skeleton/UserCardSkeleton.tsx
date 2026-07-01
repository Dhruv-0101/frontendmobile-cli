import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonRow, SkeletonCircle, SkeletonBox } from './SkeletonBlocks';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

export const UserCardSkeleton = () => {
  return (
    <View style={styles.userCard}>
      <SkeletonRow>
        <SkeletonCircle size={44} style={styles.avatar} />
        <View style={styles.userInfo}>
          <SkeletonBox width={120} height={14} style={styles.name} />
          <SkeletonBox width={80} height={10} style={styles.handle} />
          <SkeletonBox width={140} height={10} style={styles.subtext} />
        </View>
      </SkeletonRow>
    </View>
  );
};

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  name: {
    borderRadius: 4,
  },
  handle: {
    borderRadius: 4,
  },
  subtext: {
    borderRadius: 4,
  },
});

export default UserCardSkeleton;
