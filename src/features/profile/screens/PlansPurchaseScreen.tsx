import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import Button from '../../../shared/components/Button/Button';
import { usePlans, useCreatePaymentIntent, useVerifyPayment } from '../hooks/adminHooks';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateUserPlan } from '../../auth/slice/authSlice';

export const PlansPurchaseScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  // Stripe hooks
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Selected plan state
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Queries & Mutations
  const { data: plansData, isLoading: isLoadingPlans } = usePlans();
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const verifyPaymentMutation = useVerifyPayment();

  const plans = plansData?.plans || [];

  const handlePurchase = async () => {
    if (!selectedPlanId) {
      Alert.alert('Selection Required', 'Please select a subscription plan to continue.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Request clientSecret from the backend
      const paymentData = await createPaymentIntentMutation.mutateAsync(selectedPlanId);
      const { clientSecret, payment } = paymentData;

      // 2. Initialize the Stripe Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'BlogMapp Inc.',
        defaultBillingDetails: {
          name: user?.username || 'Guest Creator',
          email: user?.email || '',
        },
        googlePay: {
          merchantCountryCode: 'IN',
          testEnv: true,
        },
        allowsDelayedPaymentMethods: false,
      });

      if (initError) {
        Alert.alert('Payment Error', initError.message);
        setIsProcessingPayment(false);
        return;
      }

      // 3. Display the Stripe Payment Sheet UI
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', presentError.message);
        }
        setIsProcessingPayment(false);
        return;
      }

      // 4. Request the backend to verify the successful charge status
      await verifyPaymentMutation.mutateAsync(payment.reference);

      // 5. Update local Redux store user credentials
      dispatch(
        updateUserPlan({
          hasSelectedPlan: true,
          planId: selectedPlanId,
        })
      );

      Alert.alert(
        'Success',
        'Your payment was verified. Subscription tier activated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (err: any) {
      console.error('Payment flow error:', err);
      Alert.alert(
        'Payment Failed',
        err.response?.data?.message || err.message || 'An error occurred during payment processing.'
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Subscription Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.pageTitle}>Choose Your Plan</Text>
        <Text style={styles.pageSubtitle}>
          Unlock story publishing capabilities, higher audience reach, and creator rewards by upgrading your subscription.
        </Text>

        {isLoadingPlans ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Plans Available</Text>
            <Text style={styles.emptySubtitle}>
              Administrators have not published any premium subscription models yet. Please check back later.
            </Text>
          </View>
        ) : (
          <View style={styles.plansList}>
            {plans.map((plan: any) => {
              const isSelected = selectedPlanId === plan.id;
              
              // Handle features formatting safely
              const featuresList = Array.isArray(plan.features)
                ? plan.features
                : typeof plan.features === 'string'
                ? plan.features.split(',')
                : [];

              return (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.9}
                  style={[
                    styles.planCard,
                    isSelected && styles.selectedPlanCard,
                  ]}
                  onPress={() => setSelectedPlanId(plan.id)}
                >
                  <View style={styles.planHeaderRow}>
                    <Text style={[styles.planName, isSelected && styles.selectedText]}>
                      {plan.planName}
                    </Text>
                    {isSelected && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>SELECTED</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.planPrice, isSelected && styles.selectedText]}>
                    ${plan.price}
                    <Text style={styles.pricePeriod}>/month</Text>
                  </Text>

                  <View style={styles.divider} />

                  <Text style={[styles.featuresLabel, isSelected && styles.selectedTextSecondary]}>
                    INCLUDED FEATURES
                  </Text>
                  
                  {featuresList.map((feat: string, idx: number) => (
                    <View key={idx} style={styles.featureRow}>
                      <Text style={[styles.featureBullet, isSelected && styles.selectedText]}>✓</Text>
                      <Text style={[styles.featureText, isSelected && styles.selectedTextSecondary]}>
                        {feat.trim()}
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Pay CTA Action */}
      {!isLoadingPlans && plans.length > 0 && (
        <View style={styles.footerContainer}>
          <Button
            title={isProcessingPayment ? 'Processing Securely...' : 'Upgrade with Stripe'}
            onPress={handlePurchase}
            isLoading={isProcessingPayment}
            style={styles.payBtn}
          />
          <Text style={styles.secureText}>🔒 Secure transactions processed via Stripe</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  headerBar: {
    height: 56,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scrollContainer: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textLightSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  plansList: {
    gap: SPACING.lg,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  selectedPlanCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    elevation: 6,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  selectedText: {
    color: COLORS.white,
  },
  selectedTextSecondary: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  planPrice: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  pricePeriod: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLightSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  featuresLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLightSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  featureBullet: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textLightPrimary,
    lineHeight: 20,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
  },
  payBtn: {
    width: '100%',
  },
  secureText: {
    fontSize: 11,
    color: COLORS.textLightSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default PlansPurchaseScreen;
