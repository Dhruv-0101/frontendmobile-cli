import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonRow, SkeletonCircle, SkeletonBox, SkeletonText } from './SkeletonBlocks';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

export const CommentSkeleton = () => {
  return (
    <View style={styles.commentCard}>
      <SkeletonRow style={styles.header}>
        <SkeletonCircle size={32} style={styles.avatar} />
        <View style={styles.meta}>
          <SkeletonBox width={80} height={12} style={styles.user} />
          <SkeletonBox width={50} height={8} style={styles.date} />
        </View>
      </SkeletonRow>
      <SkeletonText lines={2} lineHeight={12} style={styles.body} />
    </View>
  );
};

const styles = StyleSheet.create({
  commentCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  avatar: {
    marginRight: SPACING.sm,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  user: {
    borderRadius: 4,
  },
  date: {
    borderRadius: 4,
  },
  body: {
    marginTop: 4,
  },
});

export default CommentSkeleton;
