import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import { useAppSelector } from '../../../store/hooks';
import TopHeader from '../../../shared/components/TopHeader/TopHeader';

export const HomeScreen = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      <TopHeader />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* User Greeting Section */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.userName}>{user?.username || 'Creator'} 👋</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.username ? user.username[0].toUpperCase() : 'B'}
            </Text>
          </View>
        </View>

        {/* Dashboard stats cards */}
        <Text style={styles.sectionTitle}>Dashboard Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✍️</Text>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Total Posts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📈</Text>
            <Text style={styles.statValue}>1.4k</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <View>
            <Text style={styles.earningsLabel}>ESTIMATED EARNINGS</Text>
            <Text style={styles.earningsValue}>$184.50</Text>
          </View>
          <TouchableOpacity style={styles.payoutBtn} activeOpacity={0.8}>
            <Text style={styles.payoutBtnText}>Payout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <Text style={styles.sectionTitle}>Quick Tips for Growth</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Write engaging headlines</Text>
          <Text style={styles.tipDesc}>
            Articles with high click-through rates usually start with direct, active, and interesting headlines.
          </Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>⚡ Keep consistent schedule</Text>
          <Text style={styles.tipDesc}>
            Publishing twice a week increases reader loyalty and gets picked up by search recommendations.
          </Text>
        </View>
      </ScrollView>
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
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textLightSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
    marginTop: SPACING.xs,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
    marginVertical: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  earningsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  earningsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
    letterSpacing: 1.5,
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  payoutBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
  },
  payoutBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  tipCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
    marginBottom: SPACING.xs,
  },
  tipDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textLightSecondary,
  },
});

export default HomeScreen;
