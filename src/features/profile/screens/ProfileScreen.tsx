import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import { useAppSelector } from '../../../store/hooks';
import { useLogout } from '../../auth/hooks/authHooks';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../shared/constants/routes';

const DRAWER_WIDTH = 280;

export const ProfileScreen = () => {
  const user = useAppSelector((state) => state.auth.user);
  const logoutMutation = useLogout();
  const navigation = useNavigation<any>();
  
  // Drawer open state & sliding animation controller
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: DRAWER_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setIsDrawerOpen(false));
  };

  const handleLogout = () => {
    closeDrawer();
    logoutMutation.mutate();
  };



  const username = user?.username || 'Creator';
  const email = user?.email || 'creator@blogmapp.com';
  const initial = username[0].toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Settings Menu trigger in Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.menuTrigger} onPress={openDrawer}>
          <Text style={styles.menuTriggerText}>⚙️</Text>
        </TouchableOpacity>
      </View>

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

      {/* Custom Sliding Side Drawer Overlay */}
      {isDrawerOpen && (
        <View style={StyleSheet.absoluteFill}>
          {/* Backdrop overlay */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Slide-out Drawer Panel */}
          <Animated.View
            style={[
              styles.drawer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Menu List Options */}
            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate(ROUTES.MY_POSTS);
                }}
              >
                <Text style={styles.menuItemIcon}>📝</Text>
                <Text style={styles.menuItemText}>My Posts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate(ROUTES.MY_FOLLOWERS);
                }}
              >
                <Text style={styles.menuItemIcon}>👥</Text>
                <Text style={styles.menuItemText}>My Followers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate(ROUTES.MY_FOLLOWING);
                }}
              >
                <Text style={styles.menuItemIcon}>👤</Text>
                <Text style={styles.menuItemText}>My Followings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate(ROUTES.MY_EARNINGS);
                }}
              >
                <Text style={styles.menuItemIcon}>💰</Text>
                <Text style={styles.menuItemText}>My Earnings</Text>
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate(ROUTES.TWO_FACTOR_SETUP);
                }}
              >
                <Text style={styles.menuItemIcon}>🔑</Text>
                <Text style={styles.menuItemText}>Two-Factor Auth</Text>
              </TouchableOpacity>

              {user?.isAdmin && (
                <>
                  <View style={styles.drawerDivider} />
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      closeDrawer();
                      navigation.navigate(ROUTES.ADMIN_PANEL);
                    }}
                  >
                    <Text style={styles.menuItemIcon}>🛡️</Text>
                    <Text style={styles.menuItemText}>Admin Panel</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={[styles.menuItem, styles.menuItemLogout]} onPress={handleLogout}>
                <Text style={styles.menuItemIcon}>🚪</Text>
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  {logoutMutation.isPending ? 'Logging Out...' : 'Log Out'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.lg,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  menuTrigger: {
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  menuTriggerText: {
    fontSize: 18,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
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
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 999,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
    marginTop: Platform.OS === 'ios' ? SPACING.xl : 0,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  closeBtnText: {
    fontSize: 18,
    color: COLORS.textLightSecondary,
    fontWeight: '600',
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLightPrimary,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  menuItemLogout: {
    marginTop: 'auto',
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: COLORS.danger,
  },
});

export default ProfileScreen;
