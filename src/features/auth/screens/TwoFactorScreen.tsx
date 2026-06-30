import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import ROUTES from '../../../shared/constants/routes';
import Input from '../../../shared/components/Input/Input';
import Button from '../../../shared/components/Button/Button';
import { useAppDispatch } from '../../../store/hooks';
import { setAuthError } from '../slice/authSlice';
import { useVerify2FA } from '../hooks/authHooks';

export const TwoFactorScreen = ({ route, navigation }: any) => {
  const { tempToken } = route.params || {};
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // ==========================================================================
  // [APP EXECUTION FLOW - STEP 7A: 2FA Verification Success & Final Access]
  // Runs when 2FA code is confirmed by backend. Utilizes useVerify2FA hook.
  // ==========================================================================
  const verifyMutation = useVerify2FA();

  // ==========================================================================
  // [APP EXECUTION FLOW - STEP 7: 2FA Screen Verification Code Input]
  // Runs when user clicks "Verify Code". Submits code & tempToken to backend API.
  // Calls API: POST /users/2fa/verify. -> Next, onSuccess executes (STEP 7A).
  // ==========================================================================
  const handleVerify = () => {
    setError(null);
    if (code.trim().length !== 6) {
      setError('Please enter a 6-digit authentication code');
      return;
    }
    // Submits code and temporary token to backend
    verifyMutation.mutate(
      { tempToken, code: code.trim() },
      {
        onError: (err: any) => {
          setError(err.response?.data?.message || 'Verification failed. Please check the code.');
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>2FA Verification</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code from your authenticator app</Text>
        </View>

        <View style={styles.formCard}>
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Input
            label="Verification Code"
            placeholder="e.g. 123456"
            value={code}
            onChangeText={(text) => {
              setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
              if (error) setError(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button
            title="Verify Code"
            onPress={handleVerify}
            isLoading={verifyMutation.isPending}
            style={styles.verifyBtn}
          />

          <Button
            title="Cancel"
            onPress={() => {
              dispatch(setAuthError(null));
              navigation.navigate(ROUTES.LOGIN);
            }}
            variant="outline"
            disabled={verifyMutation.isPending}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLightSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: SPACING.md,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  verifyBtn: {
    marginTop: SPACING.md,
  },
  cancelBtn: {
    borderColor: COLORS.borderLight,
    marginTop: SPACING.sm,
  },
});

export default TwoFactorScreen;
