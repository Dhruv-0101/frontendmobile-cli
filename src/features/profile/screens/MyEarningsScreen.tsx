import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import { useEarnings, useMyPosts } from '../hooks/profileHooks';
import {
  SkeletonRow,
  SkeletonCircle,
  SkeletonBox,
  GenericCardSkeleton,
} from '../../../shared/components/skeleton';

const INITIAL_TRANSACTIONS = [
  {
    id: 't-1',
    type: 'Bonus',
    title: 'High-Engagement Post Reward',
    date: 'June 24, 2026',
    amount: 50.0,
    status: 'Completed',
  },
  {
    id: 't-2',
    type: 'Revenue',
    title: 'June Subscription Share',
    date: 'June 15, 2026',
    amount: 15.8,
    status: 'Completed',
  },
];

export const MyEarningsScreen = ({ navigation }: any) => {
  // Queries
  const { data: dbEarnings = 0, isLoading: isLoadingEarnings } = useEarnings();
  const { data: userPosts = [], isLoading: isLoadingPosts } = useMyPosts();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Cashout Modal States
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [isProcessingCashout, setIsProcessingCashout] = useState(false);

  // Sync state when DB earnings data loads
  useEffect(() => {
    if (dbEarnings !== undefined) {
      setBalance(dbEarnings);
    }
  }, [dbEarnings]);

  const handleCashoutSubmit = () => {
    const amountNum = parseFloat(cashoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid cash-out amount.');
      return;
    }
    if (amountNum > balance) {
      Alert.alert(
        'Insufficient Balance',
        'You cannot cash out more than your current balance.'
      );
      return;
    }

    setIsProcessingCashout(true);
    setTimeout(() => {
      setIsProcessingCashout(false);
      setIsCashoutModalOpen(false);
      setBalance((prev) => Number((prev - amountNum).toFixed(2)));

      // Add payout transaction
      const newTx = {
        id: Date.now().toString(),
        type: 'Payout',
        title: 'Bank Transfer Requested',
        date: 'Today',
        amount: -amountNum,
        status: 'Pending',
      };
      setTransactions([newTx, ...transactions]);
      setCashoutAmount('');

      Alert.alert(
        'Success 🎉',
        `Successfully requested cash-out of $${amountNum.toFixed(
          2
        )}. It should arrive in your bank account in 2-3 business days.`
      );
    }, 1500);
  };

  const isPageLoading = isLoadingEarnings || isLoadingPosts;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Earnings</Text>
        <View style={{ width: 40 }} />
      </View>

      {isPageLoading ? (
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Wallet Card Skeleton */}
            <GenericCardSkeleton />
            
            {/* Cashout button skeleton */}
            <SkeletonBox height={48} borderRadius={8} style={{ marginBottom: SPACING.md }} />
            
            {/* Breakdown title skeleton */}
            <SkeletonBox width={150} height={20} style={{ marginBottom: SPACING.md }} />
            
            {/* Breakdown rows skeletons */}
            <SkeletonRow style={{ justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderColor: COLORS.borderLight, marginBottom: SPACING.sm }}>
              <View style={{ gap: 6 }}>
                <SkeletonBox width={180} height={14} style={{ borderRadius: 4 }} />
                <SkeletonBox width={80} height={10} style={{ borderRadius: 4 }} />
              </View>
              <SkeletonBox width={60} height={16} style={{ borderRadius: 4 }} />
            </SkeletonRow>
            <SkeletonRow style={{ justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderColor: COLORS.borderLight, marginBottom: SPACING.sm }}>
              <View style={{ gap: 6 }}>
                <SkeletonBox width={150} height={14} style={{ borderRadius: 4 }} />
                <SkeletonBox width={80} height={10} style={{ borderRadius: 4 }} />
              </View>
              <SkeletonBox width={60} height={16} style={{ borderRadius: 4 }} />
            </SkeletonRow>

            {/* Transaction title skeleton */}
            <SkeletonBox width={150} height={20} style={{ marginBottom: SPACING.md, marginTop: SPACING.md }} />

            {/* Transaction row skeletons */}
            <SkeletonRow style={{ justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderColor: COLORS.borderLight, marginBottom: SPACING.sm }}>
              <SkeletonRow style={{ gap: SPACING.sm }}>
                <SkeletonCircle size={40} />
                <View style={{ gap: 6 }}>
                  <SkeletonBox width={120} height={14} style={{ borderRadius: 4 }} />
                  <SkeletonBox width={70} height={10} style={{ borderRadius: 4 }} />
                </View>
              </SkeletonRow>
              <SkeletonBox width={50} height={16} style={{ borderRadius: 4 }} />
            </SkeletonRow>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Wallet Card */}
            <View style={styles.walletCard}>
              <Text style={styles.walletLabel}>Current Earnings Balance</Text>
              <Text style={styles.walletBalance}>${balance.toFixed(2)}</Text>
              <View style={styles.walletFooter}>
                <Text style={styles.walletSec}>Account: **** 5829</Text>
                <Text style={styles.walletSec}>Verified Creator ✓</Text>
              </View>
            </View>

            {/* Quick Action Button */}
            <TouchableOpacity
              style={[styles.cashoutBtn, balance <= 0 && styles.disabledBtn]}
              onPress={() => {
                setCashoutAmount(balance.toFixed(2));
                setIsCashoutModalOpen(true);
              }}
              disabled={balance <= 0}
            >
              <Text style={styles.cashoutBtnText}>Cash Out Balance</Text>
            </TouchableOpacity>

            {/* Story-by-story Breakdown */}
            <Text style={styles.sectionHeader}>Breakdown by Post</Text>
            {userPosts.length === 0 ? (
              <View style={styles.emptyPostsBox}>
                <Text style={styles.emptyPostsText}>No posts with views history found.</Text>
                <Text style={styles.emptyPostsSub}>Earnings are calculated based on view metrics.</Text>
              </View>
            ) : (
              <View style={styles.postsList}>
                {userPosts.map((post: any) => {
                  const titleClean = post.description ? post.description.replace(/<[^>]*>?/gm, '').slice(0, 45) + '...' : 'Untitled Post';
                  return (
                    <View key={post.id} style={styles.postBreakdownRow}>
                      <View style={styles.postBreakdownLeft}>
                        <Text style={styles.postBreakdownTitle}>{titleClean}</Text>
                        <Text style={styles.postBreakdownViews}>{post.viewsCount || 0} unique views</Text>
                      </View>
                      <View style={styles.postBreakdownRight}>
                        <Text style={styles.postBreakdownEarnings}>+${(post.totalEarnings || 0).toFixed(2)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Transaction History Title */}
            <Text style={styles.sectionHeader}>Transaction History</Text>

            {/* Transaction List */}
            {transactions.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txLeft}>
                  <View
                    style={[
                      styles.txIconBg,
                      {
                        backgroundColor:
                          tx.amount < 0
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(16, 185, 129, 0.1)',
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {tx.amount < 0 ? '📤' : '📥'}
                    </Text>
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                </View>
                <View style={styles.txRight}>
                  <Text
                    style={[
                      styles.txAmount,
                      {
                        color:
                          tx.amount < 0
                            ? COLORS.textLightPrimary
                            : COLORS.success,
                      },
                    ]}
                  >
                    {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.txStatus,
                      {
                        color:
                          tx.status === 'Completed'
                            ? COLORS.success
                            : COLORS.warning,
                      },
                    ]}
                  >
                    {tx.status}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Cashout Modal */}
          <Modal
            visible={isCashoutModalOpen}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsCashoutModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Cash Out Balance</Text>
                <Text style={styles.modalDesc}>
                  Enter the amount to transfer to your linked bank account.
                </Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={cashoutAmount}
                    onChangeText={setCashoutAmount}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textLightSecondary}
                  />
                </View>

                <Text style={styles.modalInfoText}>
                  Maximum available: ${balance.toFixed(2)}
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSecondary]}
                    onPress={() => setIsCashoutModalOpen(false)}
                    disabled={isProcessingCashout}
                  >
                    <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnPrimary]}
                    onPress={handleCashoutSubmit}
                    disabled={isProcessingCashout}
                  >
                    <Text style={styles.modalBtnTextPrimary}>
                      {isProcessingCashout ? 'Processing...' : 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
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
  walletCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: SPACING.md,
  },
  walletLabel: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  walletBalance: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: '900',
    marginVertical: SPACING.sm,
  },
  walletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  walletSec: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  cashoutBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  cashoutBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyPostsBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyPostsText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
    marginBottom: 2,
  },
  emptyPostsSub: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
  },
  postsList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  postBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postBreakdownLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  postBreakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
  },
  postBreakdownViews: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
    marginTop: 2,
  },
  postBreakdownRight: {
    alignItems: 'flex-end',
  },
  postBreakdownEarnings: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.success,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
  },
  txDate: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  txStatus: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 4,
  },
  modalInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    paddingVertical: 10,
  },
  modalInfoText: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  modalBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  modalBtnTextSecondary: {
    color: COLORS.textLightSecondary,
    fontWeight: '700',
  },
  modalBtnTextPrimary: {
    color: COLORS.white,
    fontWeight: '700',
  },
});

export default MyEarningsScreen;
