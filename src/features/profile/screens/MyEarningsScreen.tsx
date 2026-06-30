import React, { useState } from 'react';
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

const INITIAL_TRANSACTIONS = [
  {
    id: '1',
    type: 'Payout',
    title: 'Bank Transfer to Sparkasse',
    date: 'June 28, 2026',
    amount: -350.0,
    status: 'Completed',
  },
  {
    id: '2',
    type: 'Bonus',
    title: 'High-Engagement Post Reward',
    date: 'June 24, 2026',
    amount: 50.0,
    status: 'Completed',
  },
  {
    id: '3',
    type: 'Revenue',
    title: 'June Subscription Share',
    date: 'June 15, 2026',
    amount: 845.8,
    status: 'Completed',
  },
  {
    id: '4',
    type: 'Bonus',
    title: 'Early Adopter Creator Award',
    date: 'June 01, 2026',
    amount: 700.0,
    status: 'Completed',
  },
];

export const MyEarningsScreen = ({ navigation }: any) => {
  const [balance, setBalance] = useState(1245.8);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Cashout Modal States
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [isProcessingCashout, setIsProcessingCashout] = useState(false);

  const handleCashoutSubmit = () => {
    const amountNum = parseFloat(cashoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid cash-out amount.');
      return;
    }
    if (amountNum > balance) {
      Alert.alert(
        'Insufficient Balance',
        'You cannot cash out more than your current balance.',
      );
      return;
    }

    setIsProcessingCashout(true);
    setTimeout(() => {
      setIsProcessingCashout(false);
      setIsCashoutModalOpen(false);
      setBalance(prev => Number((prev - amountNum).toFixed(2)));

      // Add transaction
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
          2,
        )}. It should arrive in your bank account in 2-3 business days.`,
      );
    }, 1500);
  };

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

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Wallet Card */}
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Current Earnings Balance</Text>
            <Text style={styles.walletBalance}>${balance.toFixed(2)}</Text>
            <View style={styles.walletFooter}>
              <Text style={styles.walletSec}>Account: **** 5829</Text>
              <Text style={styles.walletSec}>Verified Creator</Text>
            </View>
          </View>

          {/* Quick Action Button */}
          <TouchableOpacity
            style={styles.cashoutBtn}
            onPress={() => {
              setCashoutAmount(balance.toFixed(2));
              setIsCashoutModalOpen(true);
            }}
          >
            <Text style={styles.cashoutBtnText}>Cash Out Balance</Text>
          </TouchableOpacity>

          {/* Transaction History Title */}
          <Text style={styles.sectionHeader}>Transaction History</Text>

          {/* Transaction List */}
          {transactions.map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                <View
                  style={[
                    styles.txIconBg,
                    {
                      backgroundColor:
                        tx.amount < 0
                          ? COLORS.primaryLight
                          : COLORS.success + '20',
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
    fontSize: 14,
    fontWeight: '500',
  },
  walletBalance: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: '800',
    marginVertical: SPACING.sm,
  },
  walletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    paddingTop: SPACING.sm,
  },
  walletSec: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 12,
  },
  cashoutBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cashoutBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
    marginBottom: SPACING.md,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  txDetails: {
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
  },
  txDate: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  txStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textLightPrimary,
    marginBottom: SPACING.xs,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.textLightSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    height: 56,
    marginBottom: SPACING.xs,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
    marginRight: 6,
  },
  modalInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textLightPrimary,
    padding: 0,
  },
  modalInfoText: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: COLORS.backgroundLight,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  modalBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  modalBtnTextSecondary: {
    color: COLORS.textLightSecondary,
    fontWeight: '600',
  },
  modalBtnTextPrimary: {
    color: COLORS.white,
    fontWeight: '700',
  },
});

export default MyEarningsScreen;
