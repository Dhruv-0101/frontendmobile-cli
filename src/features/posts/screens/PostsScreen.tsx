import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/postsApi';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import Loader from '../../../shared/components/Loader/Loader';
import { formatDate } from '../../../shared/utils/date';

export const PostsScreen = () => {
  const { data: posts, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['posts'],
    queryFn: postsApi.getPosts,
  });

  const renderPostItem = ({ item }: { item: any }) => {
    // Generate initials for avatar if no profile picture
    const authorName = item.user?.username || 'Creator';
    const authorInitial = authorName[0].toUpperCase();

    return (
      <View style={styles.postCard}>
        {/* Author Header */}
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            {item.user?.profilePicture ? (
              <Image source={{ uri: item.user.profilePicture }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarTxt}>{authorInitial}</Text>
            )}
          </View>
          <View>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.description}>{item.description}</Text>

        {/* Post Image */}
        {!!item.image && (
          <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
        )}

        {/* Bottom Actions Mock */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionEmoji}>❤️</Text>
            <Text style={styles.actionLabel}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={styles.actionLabel}>Comment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <Loader message="Fetching the latest stories..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📡</Text>
          <Text style={styles.errorText}>Could not fetch posts</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContainer}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No posts available. Write one!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  listContainer: {
    padding: SPACING.md,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarTxt: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
  },
  postDate: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLightPrimary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.borderLight,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
    gap: SPACING.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionEmoji: {
    fontSize: 16,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLightSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLightSecondary,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
  },
  retryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textLightSecondary,
    fontWeight: '500',
  },
});

export default PostsScreen;
