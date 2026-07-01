import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import EmptyState from '../../../shared/components/empty/EmptyState';
import { PostCardSkeleton } from '../../../shared/components/skeleton';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import ROUTES from '../../../shared/constants/routes';
import { useMyPosts } from '../hooks/profileHooks';
import { useDeletePost } from '../../posts/hooks/postHooks';
import { storage } from '../../../services/storage';
import { formatDate } from '../../../shared/utils/date';

export const MyPostsScreen = ({ navigation }: any) => {
  const [activePostTab, setActivePostTab] = useState<'published' | 'draft'>('published');
  const [drafts, setDrafts] = useState<any[]>([]);

  // Queries & Mutations
  const { data: userPosts = [], isLoading: isLoadingPosts, refetch, isRefetching } = useMyPosts();
  const deletePostMutation = useDeletePost();

  // Load offline drafts from AsyncStorage
  const loadDrafts = async () => {
    try {
      const storedDrafts = await storage.getDrafts();
      setDrafts(storedDrafts);
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  };

  useEffect(() => {
    loadDrafts();
    refetch();
  }, []);

  const handleDeletePost = (id: number | string, isDraft: boolean) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to permanently delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (isDraft) {
              await storage.deleteDraft(id.toString());
              await loadDrafts();
            } else {
              deletePostMutation.mutate(Number(id), {
                onSuccess: () => {
                  Alert.alert('Success', 'Post deleted successfully.');
                },
                onError: (err: any) => {
                  Alert.alert(
                    'Error',
                    err.response?.data?.message || 'Failed to delete the post.'
                  );
                },
              });
            }
          },
        },
      ]
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const isDraft = activePostTab === 'draft';
      const rawExcerpt = item.description ? item.description.replace(/<[^>]*>?/gm, '') : '';
      const shortExcerpt = rawExcerpt.length > 120 ? rawExcerpt.slice(0, 120) + '...' : rawExcerpt;

      if (isDraft) {
        return (
          <View style={styles.card}>
            <View style={styles.postHeader}>
              <Text style={styles.postDate}>Saved Draft</Text>
              <TouchableOpacity onPress={() => handleDeletePost(item.id, true)}>
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.postExcerpt} numberOfLines={3}>
              {shortExcerpt}
            </Text>
            <TouchableOpacity
              style={styles.loadDraftBtn}
              onPress={() => navigation.navigate(ROUTES.WRITE, { loadDraftId: item.id })}
            >
              <Text style={styles.loadDraftBtnText}>✏️ Edit Draft</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={() => navigation.navigate(ROUTES.POST_DETAILS, { postId: item.id })}
        >
          <View style={styles.postHeader}>
            <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
            <TouchableOpacity onPress={() => handleDeletePost(item.id, false)}>
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.postExcerpt} numberOfLines={3}>
            {shortExcerpt}
          </Text>
          <View style={styles.postStats}>
            <Text style={styles.statText}>
              {Array.isArray(item.postviewers) ? item.postviewers.length : (item.viewsCount || 0)} views  •  {item.likedislikes?.filter((l: any) => l.liked).length || 0} likes
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [activePostTab, navigation]
  );

  const renderFooter = () => (
    <TouchableOpacity
      style={[styles.actionButton, { marginTop: SPACING.md }]}
      onPress={() => navigation.navigate(ROUTES.WRITE)}
    >
      <Text style={styles.actionButtonText}>+ Create New Post</Text>
    </TouchableOpacity>
  );

  const listData = activePostTab === 'published' ? userPosts : drafts;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Posts</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Sub-Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activePostTab === 'published' && styles.tabButtonActive,
            ]}
            onPress={() => setActivePostTab('published')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activePostTab === 'published' && styles.tabButtonTextActive,
              ]}
            >
              Published ({userPosts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activePostTab === 'draft' && styles.tabButtonActive,
            ]}
            onPress={() => setActivePostTab('draft')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activePostTab === 'draft' && styles.tabButtonTextActive,
              ]}
            >
              Drafts ({drafts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {isLoadingPosts ? (
          <FlatList
            data={Array(3).fill(0)}
            keyExtractor={(_, index) => `skeleton-${index}`}
            renderItem={() => <PostCardSkeleton />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={listData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            onRefresh={refetch}
            refreshing={isRefetching}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                title={activePostTab === 'published' ? 'No published posts found' : 'No drafts found'}
                subtitle="Share your thoughts with the world by writing a new post!"
                icon={activePostTab === 'published' ? '📝' : '📂'}
                buttonText="Write a Post"
                onPress={() => navigation.navigate(ROUTES.WRITE)}
              />
            }
            // Optimizations
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            updateCellsBatchingPeriod={50}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    padding: SPACING.sm,
    width: 40,
    alignItems: 'flex-start',
  },
  backBtnText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLightSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.white,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textLightSecondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  postDate: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
  },
  deleteText: {
    fontSize: 15,
  },
  postExcerpt: {
    fontSize: 14,
    color: COLORS.textLightPrimary,
    lineHeight: 20,
    marginVertical: SPACING.xs,
  },
  postStats: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
  },
  statText: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadDraftBtn: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  loadDraftBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.textLightSecondary,
    marginBottom: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default MyPostsScreen;
