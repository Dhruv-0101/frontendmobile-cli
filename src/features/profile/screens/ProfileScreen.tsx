import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar, TouchableOpacity } from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import { useAppSelector } from '../../../store/hooks';
import { useLogout } from '../../auth/hooks/useLogout';

export const ProfileScreen = () => {
  const user = useAppSelector((state) => state.auth.user);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const username = user?.username || 'Creator';
  const email = user?.email || 'creator@blogmapp.com';
  const initial = username[0].toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
        </View>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Profile Info Cards */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Account Status</Text>
          <Text style={styles.infoValue}>Verified Creator ✓</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Subscription Tier</Text>
          <Text style={styles.infoValue}>Premium Professional</Text>
        </View>
      </View>

      {/* Settings / Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>
            {logoutMutation.isPending ? 'Logging Out...' : 'Log Out Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
  },
  email: {
    fontSize: 14,
    color: COLORS.textLightSecondary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  infoContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
    marginTop: SPACING.xs,
  },
  actionsContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.md,
  },
  actionBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
