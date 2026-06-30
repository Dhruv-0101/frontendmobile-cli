import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';
import ROUTES from '../../constants/routes';
import { useAppSelector } from '../../../store/hooks';
import { useNotifications } from '../../../features/profile/hooks/profileHooks';

export const TopHeader = () => {
  const navigation = useNavigation<any>();
  const user = useAppSelector((state) => state.auth.user);

  // Dynamic notifications count
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount || 0;

  const username = user?.username || 'Creator';
  const initial = username[0].toUpperCase();

  return (
    <View style={styles.headerContainer}>
      {/* Brand logo title */}
      <TouchableOpacity onPress={() => navigation.navigate(ROUTES.HOME)}>
        <Text style={styles.brandTitle}>
          Blog<Text style={styles.brandTitleSec}>Mapp</Text>
        </Text>
      </TouchableOpacity>

      {/* Right Controls */}
      <View style={styles.controlsRow}>
        {/* Rankings */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate(ROUTES.RANKINGS)}
          activeOpacity={0.7}
        >
          <Text style={styles.iconEmoji}>🏆</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          activeOpacity={0.7}
        >
          <Text style={styles.iconEmoji}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Avatar trigger */}
        <TouchableOpacity
          style={styles.avatarTrigger}
          onPress={() => navigation.navigate(ROUTES.PROFILE)}
          activeOpacity={0.7}
        >
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  brandTitleSec: {
    color: COLORS.success,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconEmoji: {
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
  },
  avatarTrigger: {
    marginLeft: 2,
  },
  avatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
});

export default TopHeader;
