import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonRow, SkeletonCircle, SkeletonBox } from './SkeletonBlocks';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

export const ProfileSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.profileHeader}>
        <SkeletonCircle size={100} style={styles.avatar} />
        <SkeletonBox width={140} height={20} style={styles.username} />
        <SkeletonBox width={180} height={14} style={styles.email} />
      </View>

      {/* Stats Counter Row */}
      <SkeletonRow style={styles.statsRow}>
        <View style={styles.statBox}>
          <SkeletonBox width={40} height={24} style={styles.statNumber} />
          <SkeletonBox width={50} height={10} style={styles.statLabel} />
        </View>
        <View style={styles.statBox}>
          <SkeletonBox width={40} height={24} style={styles.statNumber} />
          <SkeletonBox width={55} height={10} style={styles.statLabel} />
        </View>
        <View style={styles.statBox}>
          <SkeletonBox width={40} height={24} style={styles.statNumber} />
          <SkeletonBox width={55} height={10} style={styles.statLabel} />
        </View>
      </SkeletonRow>

      {/* Menu Actions placeholders */}
      <View style={styles.menuContainer}>
        <SkeletonBox height={54} borderRadius={12} style={styles.menuItem} />
        <SkeletonBox height={54} borderRadius={12} style={styles.menuItem} />
        <SkeletonBox height={54} borderRadius={12} style={styles.menuItem} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: 12,
  },
  avatar: {
    marginBottom: 4,
  },
  username: {
    borderRadius: 4,
  },
  email: {
    borderRadius: 4,
  },
  statsRow: {
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.xl,
  },
  statBox: {
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    borderRadius: 4,
  },
  statLabel: {
    borderRadius: 4,
  },
  menuContainer: {
    gap: SPACING.md,
  },
  menuItem: {
    width: '100%',
  },
});

export default ProfileSkeleton;
