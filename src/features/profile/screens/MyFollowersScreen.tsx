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
  Image,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import { useFollowers } from '../hooks/profileHooks';

export const MyFollowersScreen = ({ navigation }: any) => {
  const { data: followers = [], isLoading } = useFollowers();

  // Helper to generate initials & select a color based on initials
  const getAvatarStyle = (name: string) => {
    const initial = name ? name[0].toUpperCase() : 'C';
    const charCode = initial.charCodeAt(0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
    const color = colors[charCode % colors.length];
    return { initial, color };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Followers</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching followers...</Text>
          </View>
        ) : followers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>👥</Text>
            <Text style={styles.emptyStateText}>No followers yet</Text>
            <Text style={styles.emptyStateSub}>When other creators follow you, they will appear here.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {followers.map((item: any) => {
              const { initial, color } = getAvatarStyle(item.username);
              return (
                <View key={item.id} style={styles.userListItem}>
                  <View style={styles.avatarWrapper}>
                    {item.profilePicture ? (
                      <Image source={{ uri: item.profilePicture }} style={styles.avatarImg} />
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
});

export default MyFollowersScreen;
