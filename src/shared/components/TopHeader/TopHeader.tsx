import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';
import ROUTES from '../../constants/routes';
import { useAppSelector } from '../../../store/hooks';
import { useNotifications } from '../../../features/profile/hooks/profileHooks';
import { RankingsIcon, AlertsIcon } from '../Icons';
import { getAvatarUri } from '../../utils/avatar';

export const TopHeader = () => {
  const navigation = useNavigation<any>();
  const user = useAppSelector((state) => state.auth.user);

  // Dynamic notifications count
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount || 0;

  const username = user?.username || 'Creator';
  const initial = username[0].toUpperCase();
  const avatarUrl = getAvatarUri(user?.profilePicture);

  return (
    <View style={styles.headerContainer}>
      {/* Brand logo title */}
      <TouchableOpacity onPress={() => navigation.navigate(ROUTES.HOME)}>
        <Text style={styles.brandTitle}>
          BLOG<Text style={styles.brandTitleSec}>MAPP</Text>
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
          <RankingsIcon color={COLORS.warning} size={18} />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          activeOpacity={0.7}
        >
          <AlertsIcon color={COLORS.primary} size={18} />
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
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
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
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  brandTitleSec: {
    color: COLORS.secondary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.secondary,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
});

export default TopHeader;
