import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Clipboard,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import Input from '../../../shared/components/Input/Input';
import Button from '../../../shared/components/Button/Button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { updateTwoFactorStatus } from '../slice/authSlice';

export const TwoFactorSetupScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);

  // Fetch setup details from backend
  const fetchSetupDetails = async () => {
    try {
      setIsLoadingSetup(true);
      console.log('Fetching 2FA setup configuration from backend...');
      const data = await authApi.setup2FA();
      console.log('2FA setup configuration retrieved successfully.');
      setSetupData(data);
    } catch (err: any) {
      console.error('Failed to retrieve 2FA setup configuration:', err);
      if (err.response) {
        console.error('Response Data:', err.response.data);
        console.error('Response Status:', err.response.status);
      }
      const apiErrMsg = err.response?.data?.message || err.message || '';
      Alert.alert(
        'Error',
        `Failed to retrieve 2FA setup configuration. ${apiErrMsg}`
      );
    } finally {
      setIsLoadingSetup(false);
    }
  };

  useEffect(() => {
    if (!user?.isTwoFactorEnabled) {
      fetchSetupDetails();
    } else {
      setIsLoadingSetup(false);
    }
  }, [user?.isTwoFactorEnabled]);

  // Enable 2FA mutation
  const enableMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: (data) => {
      dispatch(updateTwoFactorStatus(true));
      Alert.alert(
        'Success', 
        'Two-Factor Authentication is now active on your account!', 
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to enable 2FA. Please verify the code.');
    },
  });

  const handleEnable = () => {
    setError(null);
    if (!setupData) return;
    if (code.trim().length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }
    enableMutation.mutate({ secret: setupData.secret, code: code.trim() });
  };

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: authApi.disable2FA,
    onSuccess: () => {
      dispatch(updateTwoFactorStatus(false));
      Alert.alert(
        'Success',
        'Two-Factor Authentication has been successfully disabled.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to disable 2FA. Please verify the code.');
    },
  });

  const handleDisable = () => {
    setError(null);
    if (code.trim().length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }
    disableMutation.mutate(code.trim());
  };

  const copyToClipboard = () => {
    if (setupData?.secret) {
      Clipboard.setString(setupData.secret);
      Alert.alert('Copied', 'Secret key copied to clipboard.');
    }
  };

  if (isLoadingSetup) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Generating secure setup...</Text>
      </View>
    );
  }

  if (user?.isTwoFactorEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>
              Manage the extra security layer for your account.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.statusBox}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>ACTIVE</Text>
              </View>
              <Text style={styles.statusTitle}>Two-Factor Auth is Enabled</Text>
              <Text style={styles.statusDesc}>
                Currently enabled for one device. To secure your account, you will be prompted for a verification code when signing in.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.stepTitle}>Disable 2FA</Text>
            <Text style={styles.stepDesc}>
              To disable 2FA, enter the current 6-digit verification code from your authenticator app below.
            </Text>

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
              title="Disable 2FA"
              onPress={handleDisable}
              isLoading={disableMutation.isPending}
              style={[styles.activateBtn, { backgroundColor: COLORS.danger }]}
            />

            <Button
              title="Go Back"
              onPress={() => navigation.goBack()}
              variant="outline"
              disabled={disableMutation.isPending}
              style={styles.cancelBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <Text style={styles.title}>Secure your Account</Text>
          <Text style={styles.subtitle}>
            Enable Two-Factor Authentication (2FA) to add an extra layer of security when logging in.
          </Text>
        </View>

        {setupData && (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>1. Scan QR Code</Text>
            <Text style={styles.stepDesc}>
              Scan this QR code using Google Authenticator, Authy, or your preferred TOTP app.
            </Text>

            <View style={styles.qrContainer}>
              <Image 
                source={{ uri: setupData.qrCodeDataUrl }} 
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.stepTitle}>Or enter secret manually</Text>
            <Text style={styles.stepDesc}>
              If you can't scan, copy the secret key below and paste it into your authenticator app.
            </Text>

            <TouchableOpacity style={styles.secretBox} onPress={copyToClipboard}>
              <Text style={styles.secretText} numberOfLines={1}>{setupData.secret}</Text>
              <Text style={styles.copyText}>Copy Key</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text style={styles.stepTitle}>2. Verify Setup</Text>
            <Text style={styles.stepDesc}>
              Enter the 6-digit verification code generated by your authenticator app.
            </Text>

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
              title="Activate 2FA"
              onPress={handleEnable}
              isLoading={enableMutation.isPending}
              style={styles.activateBtn}
            />

            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              disabled={enableMutation.isPending}
              style={styles.cancelBtn}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textLightSecondary,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLightSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
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
    marginBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  stepDesc: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  secretBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  secretText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  copyText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
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
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  activateBtn: {
    marginTop: SPACING.md,
  },
  cancelBtn: {
    borderColor: COLORS.borderLight,
    marginTop: SPACING.sm,
  },
  statusBox: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginBottom: SPACING.sm,
  },
  statusBadgeText: {
    color: '#065f46',
    fontWeight: '800',
    fontSize: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  statusDesc: {
    fontSize: 13,
    color: COLORS.textLightSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.sm,
  },
});

export default TwoFactorSetupScreen;
