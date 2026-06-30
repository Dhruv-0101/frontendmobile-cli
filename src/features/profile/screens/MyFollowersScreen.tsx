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

const INITIAL_FOLLOWERS = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    handle: '@sarahj',
    followers: '12.4K',
    initial: 'S',
    color: '#3b82f6',
  },
  {
    id: '2',
    name: 'Alex Rivera',
    handle: '@alexr',
    followers: '3.1K',
    initial: 'A',
    color: '#10b981',
  },
  {
    id: '3',
    name: 'Elena Rostova',
    handle: '@elena_r',
    followers: '850',
    initial: 'E',
    color: '#f59e0b',
  },
  {
    id: '4',
    name: 'Marcus Chen',
    handle: '@mchen_dev',
    followers: '45.2K',
    initial: 'M',
    color: '#ec4899',
  },
];

export const MyFollowersScreen = ({ navigation }: any) => {
  const [followers, setFollowers] = useState(INITIAL_FOLLOWERS);

  const handleRemoveFollower = (id: string, name: string) => {
    Alert.alert('Remove Follower', `Remove ${name} from your followers?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setFollowers(followers.filter(f => f.id !== id));
        },
      },
    ]);
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
        {followers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>👥</Text>
            <Text style={styles.emptyStateText}>No followers yet</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {followers.map(item => (
              <View key={item.id} style={styles.userListItem}>
                <View style={[styles.avatarCircle, { backgroundColor: item.color }]}>
                  <Text style={styles.avatarLetter}>{item.initial}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userHandle}>{item.handle}</Text>
                  <Text style={styles.userSubText}>{item.followers} followers</Text>
                </View>
                <TouchableOpacity
                  style={styles.userListBtn}
                  onPress={() => handleRemoveFollower(item.id, item.name)}
                >
                  <Text style={styles.userListBtnText}>Remove</Text>
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
  userSubText: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  userListBtn: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  userListBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MyFollowersScreen;
