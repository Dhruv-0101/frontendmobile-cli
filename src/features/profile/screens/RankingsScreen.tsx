import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import { useRankings } from '../hooks/profileHooks';
import { useAppSelector } from '../../../store/hooks';
import { getAvatarUri } from '../../../shared/utils/avatar';
import EmptyState from '../../../shared/components/empty/EmptyState';
import { UserCardSkeleton } from '../../../shared/components/skeleton';

export const RankingsScreen = ({ navigation }: any) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: rankings = [], isLoading, refetch, isRefetching } = useRankings();

  // Helper to generate initials & select color based on name
  const getAvatarStyle = (name: string) => {
    const initial = name ? name[0].toUpperCase() : 'C';
    const charCode = initial.charCodeAt(0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
    const color = colors[charCode % colors.length];
    return { initial, color };
  };

  // Helper to render rank indicator
  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <Text style={styles.rankMedal}>🥇</Text>;
    if (rank === 2) return <Text style={styles.rankMedal}>🥈</Text>;
    if (rank === 3) return <Text style={styles.rankMedal}>🥉</Text>;
    return (
      <View style={styles.rankNumberCircle}>
        <Text style={styles.rankNumberText}>{rank}</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={styles.leaderboardTitle}>🏆 Top Creators Leaderboard</Text>
      <Text style={styles.leaderboardSub}>
        Rankings are calculated dynamically based on total accumulated post earnings.
      </Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const { initial, color } = getAvatarStyle(item.username);
      const isMe = item.userId === currentUser?.id;

      return (
        <View 
          style={[
            styles.rankRow,
            isMe && styles.myRankRow,
            { marginBottom: SPACING.sm }
          ]}
        >
          {/* Rank Number / Medal */}
          <View style={styles.rankBadgeContainer}>
            {renderRankBadge(item.rank)}
          </View>

          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            {getAvatarUri(item.profilePicture) ? (
              <Image source={{ uri: getAvatarUri(item.profilePicture)! }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: color }]}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
            )}
          </View>

          {/* User Meta */}
          <View style={styles.userMeta}>
            <Text style={[styles.userName, isMe && styles.myText]}>
              {item.username} {isMe && '(You)'}
            </Text>
            <Text style={[styles.postsCount, isMe && styles.mySubText]}>
              {item.totalPosts || 0} stories published
            </Text>
          </View>

          {/* Earnings */}
          <View style={styles.earningsContainer}>
            <Text style={[styles.earningsValue, isMe && styles.myEarningsText]}>
              ${(item.totalEarnings || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      );
    },
    [currentUser?.id]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings Rankings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <FlatList
            data={Array(5).fill(0)}
            keyExtractor={(_, index) => `skeleton-${index}`}
            renderItem={() => <UserCardSkeleton />}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
          />
        ) : (
          <FlatList
            data={rankings}
            renderItem={renderItem}
            keyExtractor={(item) => item.userId.toString()}
            onRefresh={refetch}
            refreshing={isRefetching}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                title="No rankings calculated yet"
                subtitle="Earn revenue through views to scale the rankings leaderboard!"
                icon="🏆"
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 120,
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
    marginBottom: SPACING.xs,
  },
  emptyStateSub: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    textAlign: 'center',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  leaderboardSub: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  rankingsList: {
    gap: SPACING.sm,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  myRankRow: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
  },
  rankBadgeContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  rankMedal: {
    fontSize: 22,
  },
  rankNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rankNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLightSecondary,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarLetter: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
  },
  postsCount: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
    marginTop: 2,
  },
  myText: {
    fontWeight: '800',
  },
  mySubText: {
    opacity: 0.8,
  },
  earningsContainer: {
    alignItems: 'flex-end',
  },
  earningsValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.success,
  },
  myEarningsText: {
    color: COLORS.primary,
  },
});

export default RankingsScreen;
