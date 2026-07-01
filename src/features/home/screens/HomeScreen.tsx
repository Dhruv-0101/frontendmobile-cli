import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import { useAppSelector } from '../../../store/hooks';
import TopHeader from '../../../shared/components/TopHeader/TopHeader';
import ROUTES from '../../../shared/constants/routes';
import {
  useMyPosts,
  useFollowers,
  useFollowing,
  useEarnings,
} from '../../profile/hooks/profileHooks';
import { getAvatarUri } from '../../../shared/utils/avatar';

export const HomeScreen = ({ navigation }: any) => {
  const user = useAppSelector(state => state.auth.user);
  const queryClient = useQueryClient();

  // Queries for dynamic dashboard analytics
  const { data: userPosts = [], isLoading: isLoadingPosts } = useMyPosts();
  const { data: followers = [], isLoading: isLoadingFollowers } =
    useFollowers();
  const { data: following = [], isLoading: isLoadingFollowing } =
    useFollowing();
  const { data: earnings = 0, isLoading: isLoadingEarnings } = useEarnings();

  const [refreshing, setRefreshing] = useState(false);

  const username = user?.username || 'Creator';
  const initial = username[0].toUpperCase();
  const avatarUrl = getAvatarUri(user?.profilePicture);

  // Focus effect to refetch all home screen data and notifications when screen is focused
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      queryClient.invalidateQueries({ queryKey: ['my-followers'] });
      queryClient.invalidateQueries({ queryKey: ['my-following'] });
      queryClient.invalidateQueries({ queryKey: ['my-earnings'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }, [queryClient])
  );

  // Manual pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
      queryClient.invalidateQueries({ queryKey: ['my-followers'] }),
      queryClient.invalidateQueries({ queryKey: ['my-following'] }),
      queryClient.invalidateQueries({ queryKey: ['my-earnings'] }),
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  // Performance calculations
  const totalPosts = Array.isArray(userPosts) ? userPosts.length : 0;

  // Safe calculate views using postviewers array length or viewsCount property
  const totalViews = Array.isArray(userPosts)
    ? userPosts.reduce((sum: number, p: any) => {
        const views = typeof p.viewsCount === 'number' ? p.viewsCount : 0;
        const pvs = Array.isArray(p.postviewers) ? p.postviewers.length : 0;
        return sum + (pvs || views || 0);
      }, 0)
    : 0;

  const totalLikes = userPosts.reduce(
    (sum: number, p: any) =>
      sum + (p.likedislikes?.filter((l: any) => l.liked).length || 0),
    0,
  );

  const totalDislikes = userPosts.reduce(
    (sum: number, p: any) =>
      sum + (p.likedislikes?.filter((l: any) => !l.liked).length || 0),
    0,
  );

  const totalComments = userPosts.reduce(
    (sum: number, p: any) => sum + (p.comments?.length || 0),
    0,
  );

  const isPageLoading =
    isLoadingPosts ||
    isLoadingFollowers ||
    isLoadingFollowing ||
    isLoadingEarnings;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.backgroundLight}
      />
      <TopHeader />

      {isPageLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Syncing creator workspace...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* User Greeting Section */}
          {/* <View style={styles.welcomeRow}>
            <View>
              <Text style={styles.greeting}>Good day,</Text>
              <Text style={styles.userName}>{username} 👋</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.PROFILE)}
              style={styles.avatarWrapper}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View> */}

          {/* Dynamic Earnings Card */}
          <View style={styles.earningsCard}>
            <View>
              <Text style={styles.earningsLabel}>ESTIMATED REVENUE</Text>
              <Text style={styles.earningsValue}>${earnings.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.payoutBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.MY_EARNINGS)}
            >
              <Text style={styles.payoutBtnText}>Payout</Text>
            </TouchableOpacity>
          </View>

          {/* Performance Dashboard Title */}
          <Text style={styles.sectionTitle}>Dashboard Performance</Text>

          {/* Performance Grid */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: COLORS.primary }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(ROUTES.MY_POSTS)}
            >
              <Text style={styles.statValue}>{totalPosts}</Text>
              <Text style={styles.statLabel}>Stories Created</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: COLORS.secondary }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(ROUTES.MY_POSTS)}
            >
              <Text style={styles.statValue}>{totalViews}</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <View style={[styles.statCard, { borderLeftColor: '#0f766e' }]}>
              <Text style={styles.statValue}>{totalLikes}</Text>
              <Text style={styles.statLabel}>Total Likes</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: COLORS.danger }]}>
              <Text style={styles.statValue}>{totalDislikes}</Text>
              <Text style={styles.statLabel}>Total Dislikes</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: COLORS.warning }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(ROUTES.MY_FOLLOWERS)}
            >
              <Text style={styles.statValue}>{followers.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(ROUTES.MY_FOLLOWING)}
            >
              <Text style={styles.statValue}>{following.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          {/* Comments and Growth summary */}
          <View style={styles.gridRowSingle}>
            <TouchableOpacity
              style={[styles.statCardSingle, { borderLeftColor: '#0ea5e9' }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate(ROUTES.MY_POSTS)}
            >
              <View style={styles.commentsRow}>
                <View>
                  <Text style={styles.statLabelSingle}>
                    Total Comments Received
                  </Text>
                </View>
                <Text style={styles.statValueSingle}>{totalComments}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Tips */}
          <Text style={styles.sectionTitle}>Growth Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>High engagement formatting</Text>
            <Text style={styles.tipDesc}>
              Use headers (H1/H2/H3) and lists when formatting with the rich
              editor to improve readability.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Active Audience</Text>
            <Text style={styles.tipDesc}>
              Reply to comments on your post details screen to build community
              relationships and increase views.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContainer: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textLightSecondary,
    fontSize: 14,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textLightSecondary,
    fontWeight: '600',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
    marginTop: 2,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderLeftWidth: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLightSecondary,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridRowSingle: {
    marginBottom: SPACING.md,
  },
  statCardSingle: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderLeftWidth: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  commentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabelSingle: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValueSingle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  earningsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  earningsLabel: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  earningsValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  payoutBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: 8,
  },
  payoutBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  tipCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipDesc: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    lineHeight: 18,
  },
});

export default HomeScreen;
