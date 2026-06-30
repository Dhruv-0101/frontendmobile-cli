import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';

const INITIAL_FOLLOWINGS = [
  {
    id: '1',
    name: 'Tech Insider',
    handle: '@techinsider',
    isFollowing: true,
    initial: 'T',
    color: '#8b5cf6',
  },
  {
    id: '2',
    name: 'Design Matters',
    handle: '@designmatters',
    isFollowing: true,
    initial: 'D',
    color: '#a855f7',
  },
  {
    id: '3',
    name: 'AI Journal',
    handle: '@ai_journal',
    isFollowing: true,
    initial: 'A',
    color: '#f43f5e',
  },
  {
    id: '4',
    name: 'React Native Team',
    handle: '@reactnative',
    isFollowing: false,
    initial: 'R',
    color: '#06b6d4',
  },
];

export const MyFollowingScreen = ({ navigation }: any) => {
  const [followings, setFollowings] = useState(INITIAL_FOLLOWINGS);

  const handleToggleFollowing = (id: string) => {
    setFollowings(
      followings.map(f => {
        if (f.id === id) {
          return { ...f, isFollowing: !f.isFollowing };
        }
        return f;
      }),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Following</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {followings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>👤</Text>
            <Text style={styles.emptyStateText}>You aren't following anyone yet</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {followings.map(item => (
              <View key={item.id} style={styles.userListItem}>
                <View style={[styles.avatarCircle, { backgroundColor: item.color }]}>
                  <Text style={styles.avatarLetter}>{item.initial}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userHandle}>{item.handle}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.followToggleBtn,
                    item.isFollowing ? styles.followingBtn : styles.followBtn,
                  ]}
                  onPress={() => handleToggleFollowing(item.id)}
                >
                  <Text
                    style={[
                      styles.followToggleBtnText,
                      item.isFollowing ? styles.followingBtnText : styles.followBtnText,
                    ]}
                  >
                    {item.isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
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
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
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
  followToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  followBtn: {
    backgroundColor: COLORS.primary,
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
  followBtnText: {
    color: COLORS.white,
  },
  followingBtnText: {
    color: COLORS.textLightSecondary,
  },
});

export default MyFollowingScreen;
