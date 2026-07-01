import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonRow, SkeletonCircle, SkeletonBox, SkeletonText } from './SkeletonBlocks';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

export const PostCardSkeleton = () => {
  return (
    <View style={styles.postCard}>
      {/* Header (Author Info) */}
      <SkeletonRow style={styles.authorRow}>
        <SkeletonCircle size={38} style={styles.avatar} />
        <View style={styles.authorMeta}>
          <SkeletonBox width={100} height={14} style={styles.authorName} />
          <SkeletonBox width={60} height={10} style={styles.postDate} />
        </View>
        <SkeletonBox width={70} height={26} borderRadius={13} style={styles.followBtn} />
      </SkeletonRow>

      {/* Description Preview */}
      <SkeletonText lines={2} style={styles.description} />

      {/* Post Image Placeholder */}
      <SkeletonBox height={200} borderRadius={8} style={styles.postImage} />

      {/* Stats Row */}
      <SkeletonBox width={180} height={12} style={styles.statsRow} />
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  authorRow: {
    marginBottom: SPACING.sm,
  },
  avatar: {
    marginRight: SPACING.sm,
  },
  authorMeta: {
    flex: 1,
    gap: 4,
  },
  authorName: {
    borderRadius: 4,
  },
  postDate: {
    borderRadius: 4,
  },
  followBtn: {
    marginLeft: 'auto',
  },
  description: {
    marginBottom: SPACING.md,
  },
  postImage: {
    marginBottom: SPACING.md,
  },
  statsRow: {
    borderRadius: 4,
  },
});

export default PostCardSkeleton;
