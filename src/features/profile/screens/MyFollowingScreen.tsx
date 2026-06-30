import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import { useFollowing } from '../hooks/profileHooks';
import { useFollowUser, useUnfollowUser } from '../../posts/hooks/postHooks';
import { getAvatarUri } from '../../../shared/utils/avatar';

export const MyFollowingScreen = ({ navigation }: any) => {
  const { data: following = [], isLoading, refetch } = useFollowing();
  
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleUnfollow = (id: number, username: string) => {
    Alert.alert(
      'Unfollow Creator',
      `Are you sure you want to stop following ${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: () => {
            unfollowMutation.mutate(id, {
              onSuccess: () => {
                refetch();
              },
            });
          },
        },
      ]
    );
  };

  const getAvatarStyle = (name: string) => {
    const initial = name ? name[0].toUpperCase() : 'C';
    const charCode = name ? name.charCodeAt(0) : 67;
    const hue = (charCode * 37) % 360;
    const color = `hsl(${hue}, 50%, 40%)`;
    return { initial, color };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Following</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching creators you follow...</Text>
          </View>
        ) : following.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>👤</Text>
            <Text style={styles.emptyStateText}>You aren't following anyone yet</Text>
            <Text style={styles.emptyStateSub}>Follow other creators from the story feed to see them here.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {following.map((item: any) => {
              const { initial, color } = getAvatarStyle(item.username);
              const isToggling = unfollowMutation.isPending && unfollowMutation.variables === item.id;
              const avatarUrl = getAvatarUri(item.profilePicture);
              
              return (
                <View key={item.id} style={styles.userListItem}>
                  <View style={styles.avatarWrapper}>
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                    ) : (
                      <View style={[styles.avatarCircle, { backgroundColor: color }]}>
                        <Text style={styles.avatarLetter}>{initial}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.username}</Text>
                    <Text style={styles.userHandle}>@{item.username.toLowerCase()}</Text>
                    {item.email && <Text style={styles.userSubText}>{item.email}</Text>}
                  </View>
                  <TouchableOpacity
                    style={[styles.followToggleBtn, styles.followingBtn]}
                    onPress={() => handleUnfollow(item.id, item.username)}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Text style={[styles.followToggleBtnText, styles.followingBtnText]}>
                        Following
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: 100,
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
    paddingHorizontal: SPACING.md,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatarWrapper: {
    marginRight: SPACING.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarLetter: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
  },
  userHandle: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    marginTop: 2,
  },
  userSubText: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  followToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingBtn: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  followToggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  followingBtnText: {
    color: COLORS.textLightSecondary,
  },
});

export default MyFollowingScreen;
