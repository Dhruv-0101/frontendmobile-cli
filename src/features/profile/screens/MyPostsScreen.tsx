import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import ROUTES from '../../../shared/constants/routes';

const INITIAL_POSTS = [
  {
    id: '1',
    title: 'The Future of AI in Mobile App Development',
    excerpt:
      'Explore how deep learning and large language models are transforming user experience in React Native applications.',
    date: 'June 25, 2026',
    views: 342,
    likes: 89,
    status: 'published',
  },
  {
    id: '2',
    title: 'Mastering TypeScript & Redux Toolkit',
    excerpt:
      'A comprehensive guide on structuring scaleable React Native state managers with strict type safety.',
    date: 'June 18, 2026',
    views: 189,
    likes: 45,
    status: 'published',
  },
  {
    id: '3',
    title: 'Building Premium Micro-Animations',
    excerpt:
      'Draft about making components feel premium using React Native Animated API.',
    date: 'Draft',
    views: 0,
    likes: 0,
    status: 'draft',
  },
];

export const MyPostsScreen = ({ navigation }: any) => {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [activePostTab, setActivePostTab] = useState<'published' | 'draft'>('published');

  const handleDeletePost = (id: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPosts(posts.filter(p => p.id !== id));
        },
      },
    ]);
  };

  const filteredPosts = posts.filter(p => p.status === activePostTab);

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
              Published ({posts.filter(p => p.status === 'published').length})
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
              Drafts ({posts.filter(p => p.status === 'draft').length})
            </Text>
          </TouchableOpacity>
        </View>

        {filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📝</Text>
            <Text style={styles.emptyStateText}>No {activePostTab} posts found</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate(ROUTES.WRITE)}
            >
              <Text style={styles.actionButtonText}>Write a Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {filteredPosts.map(post => (
              <View key={post.id} style={styles.card}>
                <View style={styles.postHeader}>
                  <Text style={styles.postDate}>{post.date}</Text>
                  <TouchableOpacity onPress={() => handleDeletePost(post.id)}>
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postExcerpt} numberOfLines={2}>
                  {post.excerpt}
                </Text>
                {post.status === 'published' && (
                  <View style={styles.postStats}>
                    <Text style={styles.statText}>👁️ {post.views} views</Text>
                    <Text style={styles.statText}>❤️ {post.likes} likes</Text>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={[styles.actionButton, { marginTop: SPACING.md }]}
              onPress={() => navigation.navigate(ROUTES.WRITE)}
            >
              <Text style={styles.actionButtonText}>+ Create New Post</Text>
            </TouchableOpacity>
          </ScrollView>
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
    backgroundColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontWeight: '600',
    color: COLORS.textLightSecondary,
    fontSize: 14,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textLightSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  postDate: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 16,
    opacity: 0.7,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
    marginBottom: 6,
  },
  postExcerpt: {
    fontSize: 14,
    color: COLORS.textLightSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  postStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    marginRight: SPACING.md,
    fontWeight: '500',
  },
});

export default MyPostsScreen;
