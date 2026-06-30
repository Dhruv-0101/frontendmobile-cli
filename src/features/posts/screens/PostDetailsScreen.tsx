import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import Button from '../../../shared/components/Button/Button';
import Loader from '../../../shared/components/Loader/Loader';
import { formatDate } from '../../../shared/utils/date';
import { getAvatarUri } from '../../../shared/utils/avatar';
import { useAppSelector } from '../../../store/hooks';
import {
  useSinglePost,
  useLikePost,
  useDislikePost,
  useFollowUser,
  useUnfollowUser,
  useCheckFollowing,
  useCreateComment,
} from '../hooks/postHooks';

export const PostDetailsScreen = ({ route, navigation }: any) => {
  const { postId } = route.params;
  const currentUser = useAppSelector((state) => state.auth.user);
  
  // Comment input state
  const [commentContent, setCommentContent] = useState('');

  // Fetch post details query (auto-increments view counter on call)
  const { data: postDetails, isLoading, error } = useSinglePost(Number(postId));

  const post = postDetails?.postFound;
  const comments = postDetails?.comments || [];
  const viewsCount = postDetails?.viewersCount || 0;

  // Follow Query for Post Creator
  const creatorId = post?.userId;
  const { data: followStatus, isLoading: isLoadingFollow } = useCheckFollowing(creatorId);
  const isFollowingCreator = followStatus?.following || false;

  // Mutations
  const likeMutation = useLikePost();
  const dislikeMutation = useDislikePost();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const commentMutation = useCreateComment();

  // User relations
  const isOwnPost = currentUser?.id === creatorId;

  // Calculate likes and dislikes counts
  const likesCount = post?.likedislikes?.filter((l: any) => l.liked).length || 0;
  const dislikesCount = post?.likedislikes?.filter((l: any) => !l.liked).length || 0;

  // Check if current user liked/disliked
  const hasLiked = post?.likedislikes?.some((l: any) => l.userId === currentUser?.id && l.liked) || false;
  const hasDisliked = post?.likedislikes?.some((l: any) => l.userId === currentUser?.id && !l.liked) || false;

  // Toggle Like/Dislike Actions
  const handleLike = () => {
    likeMutation.mutate(Number(postId), {
      onError: (err: any) => {
        Alert.alert('Error', err.response?.data?.message || 'Could not like the post.');
      },
    });
  };

  const handleDislike = () => {
    dislikeMutation.mutate(Number(postId), {
      onError: (err: any) => {
        Alert.alert('Error', err.response?.data?.message || 'Could not dislike the post.');
      },
    });
  };

  // Toggle Follow/Unfollow Creator
  const handleFollowToggle = () => {
    if (!creatorId) return;
    if (isFollowingCreator) {
      unfollowMutation.mutate(creatorId, {
        onSuccess: () => {
          Alert.alert('Unfollowed', `You unfollowed ${post.user?.username}.`);
        },
        onError: (err: any) => {
          Alert.alert('Error', err.response?.data?.message || 'Failed to unfollow.');
        },
      });
    } else {
      followMutation.mutate(creatorId, {
        onSuccess: () => {
          Alert.alert('Followed', `You are now following ${post.user?.username}.`);
        },
        onError: (err: any) => {
          Alert.alert('Error', err.response?.data?.message || 'Failed to follow.');
        },
      });
    }
  };

  // Submit comment
  const handleAddComment = () => {
    if (!commentContent.trim()) {
      Alert.alert('Empty Comment', 'Please enter some text to comment.');
      return;
    }

    commentMutation.mutate(
      {
        postId: Number(postId),
        content: commentContent.trim(),
      },
      {
        onSuccess: () => {
          setCommentContent('');
        },
        onError: (err: any) => {
          Alert.alert('Error', err.response?.data?.message || 'Failed to add comment.');
        },
      }
    );
  };

  // Custom Inline HTML Parser
  const renderHtml = (htmlText: string) => {
    if (!htmlText || !htmlText.trim()) return null;

    const blocks = htmlText
      .replace(/<br\s*\/?>/gi, '\n')
      .split(/(<h1>.*?<\/h1>|<h2>.*?<\/h2>|<h3>.*?<\/h3>|<li>.*?<\/li>|<p>.*?<\/p>|<div>.*?<\/div>)/gi)
      .filter(Boolean);

    return blocks.map((block, index) => {
      const cleanBlock = block.trim();
      if (!cleanBlock) return null;

      // H1 Header
      if (/^<h1>(.*?)<\/h1>$/i.test(cleanBlock)) {
        const match = cleanBlock.match(/^<h1>(.*?)<\/h1>$/i);
        return <Text key={index} style={styles.mdHeader1}>{parseInlineHtml(match?.[1] || '')}</Text>;
      }
      // H2 Header
      if (/^<h2>(.*?)<\/h2>$/i.test(cleanBlock)) {
        const match = cleanBlock.match(/^<h2>(.*?)<\/h2>$/i);
        return <Text key={index} style={styles.mdHeader2}>{parseInlineHtml(match?.[1] || '')}</Text>;
      }
      // H3 Header
      if (/^<h3>(.*?)<\/h3>$/i.test(cleanBlock)) {
        const match = cleanBlock.match(/^<h3>(.*?)<\/h3>$/i);
        return <Text key={index} style={styles.mdHeader3}>{parseInlineHtml(match?.[1] || '')}</Text>;
      }
      // List item
      if (/^<li>(.*?)<\/li>$/i.test(cleanBlock)) {
        const match = cleanBlock.match(/^<li>(.*?)<\/li>$/i);
        return (
          <View key={index} style={styles.mdListItem}>
            <Text style={styles.mdBullet}>• </Text>
            <Text style={styles.mdListText}>{parseInlineHtml(match?.[1] || '')}</Text>
          </View>
        );
      }

      // Structural cleanup
      const isPara = /^<p>(.*?)<\/p>$/i.test(cleanBlock);
      const isDiv = /^<div>(.*?)<\/div>$/i.test(cleanBlock);
      let content = cleanBlock;
      if (isPara) content = cleanBlock.match(/^<p>(.*?)<\/p>$/i)?.[1] || '';
      if (isDiv) content = cleanBlock.match(/^<div>(.*?)<\/div>$/i)?.[1] || '';

      if (content.startsWith('<') && content.endsWith('>')) {
        return null;
      }

      return (
        <Text key={index} style={styles.mdParagraph}>
          {parseInlineHtml(content)}
        </Text>
      );
    });
  };

  const parseInlineHtml = (text: string) => {
    const parts: any[] = [];
    let currentText = text;
    let match;
    const regex = /(<b>.*?<\/b>|<strong>.*?<\/strong>|<i>.*?<\/i>|<em>.*?<\/em>|<u>.*?<\/u>|<a href=".*?">.*?<\/a>)/gi;

    let keyIdx = 0;
    while ((match = regex.exec(currentText)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;

      if (matchIndex > 0) {
        parts.push(<Text key={`text-${keyIdx++}`}>{currentText.slice(0, matchIndex).replace(/<[^>]*>?/gm, '')}</Text>);
      }

      if (/^<b>(.*?)<\/b>$/i.test(matchText) || /^<strong>(.*?)<\/strong>$/i.test(matchText)) {
        const innerText = matchText.replace(/<[^>]*>?/gm, '');
        parts.push(<Text key={`bold-${keyIdx++}`} style={styles.mdBold}>{innerText}</Text>);
      } else if (/^<i>(.*?)<\/i>$/i.test(matchText) || /^<em>(.*?)<\/em>$/i.test(matchText)) {
        const innerText = matchText.replace(/<[^>]*>?/gm, '');
        parts.push(<Text key={`italic-${keyIdx++}`} style={styles.mdItalic}>{innerText}</Text>);
      } else if (/^<u>(.*?)<\/u>$/i.test(matchText)) {
        const innerText = matchText.replace(/<[^>]*>?/gm, '');
        parts.push(<Text key={`underline-${keyIdx++}`} style={styles.mdUnderline}>{innerText}</Text>);
      } else if (/^<a href="(.*?)">(.*?)<\/a>$/i.test(matchText)) {
        const matchHref = matchText.match(/^<a href="(.*?)">(.*?)<\/a>$/i);
        const linkText = matchHref?.[2] || '';
        parts.push(<Text key={`link-${keyIdx++}`} style={styles.mdLink}>{linkText}</Text>);
      }

      currentText = currentText.slice(matchIndex + matchText.length);
      regex.lastIndex = 0;
    }

    if (currentText.length > 0) {
      parts.push(<Text key={`text-end-${keyIdx++}`}>{currentText.replace(/<[^>]*>?/gm, '')}</Text>);
    }

    return parts.length > 0 ? parts : text.replace(/<[^>]*>?/gm, '');
  };

  if (isLoading) {
    return <Loader message="Opening story details..." />;
  }

  if (error || !post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>Could not load post details.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const authorName = post.user?.username || 'Creator';
  const authorInitial = authorName[0].toUpperCase();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Story Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Creator Info Card */}
        <View style={styles.creatorCard}>
          <View style={styles.avatar}>
            {getAvatarUri(post.user?.profilePicture) ? (
              <Image source={{ uri: getAvatarUri(post.user?.profilePicture)! }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarTxt}>{authorInitial}</Text>
            )}
          </View>
          <View style={styles.creatorMeta}>
            <Text style={styles.creatorName}>{authorName}</Text>
            <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
          </View>

          {/* Follow/Unfollow CTA */}
          {!isOwnPost && creatorId && (
            <TouchableOpacity
              style={[
                styles.followBtn,
                isFollowingCreator && styles.followingBtn,
              ]}
              onPress={handleFollowToggle}
              disabled={isLoadingFollow || followMutation.isPending || unfollowMutation.isPending}
            >
              {isLoadingFollow || followMutation.isPending || unfollowMutation.isPending ? (
                <ActivityIndicator size="small" color={isFollowingCreator ? COLORS.primary : COLORS.white} />
              ) : (
                <Text style={[styles.followBtnText, isFollowingCreator && styles.followingBtnText]}>
                  {isFollowingCreator ? 'Following' : '+ Follow'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tag */}
        {post.category && (
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>📁 {post.category.categoryName}</Text>
            </View>
          </View>
        )}

        {/* Cover Image */}
        {!!post.image && (
          <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
        )}

        {/* Main Post Content */}
        <View style={styles.postContent}>
          {renderHtml(post.description)}
        </View>

        {/* Interactive Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.viewStat}>
            <Text style={styles.statEmoji}>👁️</Text>
            <Text style={styles.statText}>{viewsCount} views</Text>
          </View>
          
          <View style={styles.likeDislikeRow}>
            {/* Like */}
            <TouchableOpacity
              style={[styles.likeBtn, hasLiked && styles.likedActiveBtn]}
              onPress={handleLike}
              disabled={likeMutation.isPending}
            >
              <Text style={styles.statEmoji}>❤️</Text>
              <Text style={[styles.statText, hasLiked && styles.activeText]}>
                {likesCount} Likes
              </Text>
            </TouchableOpacity>

            {/* Dislike */}
            <TouchableOpacity
              style={[styles.likeBtn, hasDisliked && styles.dislikedActiveBtn]}
              onPress={handleDislike}
              disabled={dislikeMutation.isPending}
            >
              <Text style={styles.statEmoji}>👎</Text>
              <Text style={[styles.statText, hasDisliked && styles.activeText]}>
                {dislikesCount}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

        {/* Comments List */}
        {comments.length === 0 ? (
          <View style={styles.emptyCommentsBox}>
            <Text style={styles.emptyCommentsText}>No comments on this story yet.</Text>
            <Text style={styles.emptyCommentsSubtext}>Be the first to share your thoughts below!</Text>
          </View>
        ) : (
          <View style={styles.commentsList}>
            {comments.map((comment: any) => {
              const cName = comment.user?.username || 'Guest';
              const cInitial = cName[0].toUpperCase();
              return (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      {getAvatarUri(comment.user?.profilePicture) ? (
                        <Image source={{ uri: getAvatarUri(comment.user?.profilePicture)! }} style={styles.cAvatarImg} />
                      ) : (
                        <Text style={styles.cAvatarTxt}>{cInitial}</Text>
                      )}
                    </View>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentUser}>{cName}</Text>
                      <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentBody}>{comment.content}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky Comment Compose Footer */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a public comment..."
          placeholderTextColor={COLORS.textLightSecondary}
          value={commentContent}
          onChangeText={setCommentContent}
          multiline={true}
          maxLength={500}
        />
        <TouchableOpacity
          style={styles.sendCommentBtn}
          onPress={handleAddComment}
          disabled={commentMutation.isPending || !commentContent.trim()}
        >
          {commentMutation.isPending ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.sendCommentText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
    textAlign: 'center',
  },
  scrollContainer: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  creatorCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarTxt: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
  creatorMeta: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
  },
  postDate: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  followingBtn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
  },
  followBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  followingBtnText: {
    color: COLORS.textLightSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  postImage: {
    height: 220,
    borderRadius: 16,
    marginBottom: SPACING.md,
    width: '100%',
  },
  postContent: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  
  // Tag rendering elements
  mdHeader1: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  mdHeader2: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  mdHeader3: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  mdListItem: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingLeft: SPACING.sm,
  },
  mdBullet: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },
  mdListText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textLightPrimary,
  },
  mdParagraph: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textLightPrimary,
    marginVertical: 4,
  },
  mdBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  mdItalic: {
    fontStyle: 'italic',
  },
  mdUnderline: {
    textDecorationLine: 'underline',
  },
  mdLink: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },

  // Interactive Stats block
  statsContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  viewStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeDislikeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 10,
  },
  likedActiveBtn: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  dislikedActiveBtn: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  statEmoji: {
    fontSize: 14,
  },
  statText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLightSecondary,
  },
  activeText: {
    color: COLORS.primary,
  },

  // Comments Header
  commentsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  emptyCommentsBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
    marginBottom: 4,
  },
  emptyCommentsSubtext: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
  },
  commentsList: {
    gap: SPACING.md,
  },
  commentCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: SPACING.md,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  cAvatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  cAvatarTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
  },
  commentMeta: {
    flex: 1,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
  },
  commentDate: {
    fontSize: 10,
    color: COLORS.textLightSecondary,
  },
  commentBody: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textLightPrimary,
    paddingLeft: 36,
  },

  // Comment input sticky compose bar
  commentInputContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 6,
    maxHeight: 100,
    fontSize: 14,
    color: COLORS.textLightPrimary,
  },
  sendCommentBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendCommentText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },

  // Error views
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.backgroundLight,
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
});

export default PostDetailsScreen;
