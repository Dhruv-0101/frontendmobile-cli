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
import { usePosts } from '../hooks/postHooks';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import Loader from '../../../shared/components/Loader/Loader';
import { formatDate } from '../../../shared/utils/date';
import ROUTES from '../../../shared/constants/routes';
import TopHeader from '../../../shared/components/TopHeader/TopHeader';

export const PostsScreen = ({ navigation }: any) => {
  const { data: posts, isLoading, error, refetch, isRefetching } = usePosts();

  const renderPostItem = ({ item }: { item: any }) => {
    const authorName = item.user?.username || 'Creator';
    const authorInitial = authorName[0].toUpperCase();
    
    // Stats calculation from fetched relations
    const viewsCount = item.postviewers?.length || 0;
    const likesCount = item.likedislikes?.filter((l: any) => l.liked).length || 0;
    const commentsCount = item.comments?.length || 0;

    // Truncate description text cleanly
    const rawDescription = item.description ? item.description.replace(/<[^>]*>?/gm, '') : '';
    const isTruncated = rawDescription.length > 120;
    const shortDescription = isTruncated ? rawDescription.slice(0, 120) + '...' : rawDescription;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.postCard}
        onPress={() => navigation.navigate(ROUTES.POST_DETAILS, { postId: item.id })}
      >
        {/* Author Header */}
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            {item.user?.profilePicture ? (
              <Image source={{ uri: item.user.profilePicture }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarTxt}>{authorInitial}</Text>
            )}
          </View>
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
          </View>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category.categoryName}</Text>
            </View>
          )}
        </View>

        {/* Content Preview */}
        <Text style={styles.description}>
          {shortDescription}
          {isTruncated && <Text style={styles.readMoreText}> Read More</Text>}
        </Text>

        {/* Post Image */}
        {!!item.image && (
          <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
        )}

        {/* Dynamic Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>👁️</Text>
            <Text style={styles.statLabel}>{viewsCount} Views</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>❤️</Text>
            <Text style={styles.statLabel}>{likesCount} Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>💬</Text>
            <Text style={styles.statLabel}>{commentsCount} Comments</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <Loader message="Fetching the latest stories..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      <TopHeader />

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
  headerBar: {
    height: 56,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  listContainer: {
    padding: SPACING.md,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarTxt: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
  },
  postDate: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
    marginTop: 1,
  },
  categoryBadge: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textLightPrimary,
    marginVertical: SPACING.xs,
  },
  readMoreText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  postImage: {
    height: 180,
    borderRadius: 12,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 14,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLightSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLightSecondary,
    marginBottom: SPACING.md,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
  },
  retryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textLightSecondary,
  },
});

export default PostsScreen;
