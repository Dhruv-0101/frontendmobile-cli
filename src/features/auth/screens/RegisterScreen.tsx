import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import COLORS from '../../../shared/constants/colors';
import SPACING from '../../../shared/constants/spacing';
import ROUTES from '../../../shared/constants/routes';
import Input from '../../../shared/components/Input/Input';
import Button from '../../../shared/components/Button/Button';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { validateUsername, validateEmail, validatePassword } from '../../../shared/utils/validation';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export const RegisterScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const googleLoginMutation = useGoogleLogin();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '42825930077-qvlf0jo47m0082gg2orpmg284ddf26sv.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google Sign-In (Register)...');
      googleLoginMutation.reset();
      setApiError(null);
      await GoogleSignin.hasPlayServices();
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignored
      }
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In response received (Register):', JSON.stringify(userInfo));

      if (userInfo.type === 'success') {
        const idToken = userInfo.data.idToken;
        if (!idToken) {
          throw new Error('Google Sign-In did not return an ID token');
        }
        console.log('ID Token retrieved, sending to backend...');
        googleLoginMutation.mutate(idToken);
      } else {
        console.log('Google Sign-In returned non-success type (Register):', userInfo.type);
        setApiError(`Sign-In status: ${userInfo.type}. If this was not expected, please check your Google Console configuration.`);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error details (Register):', error);
      console.error('Error Code:', error.code);
      console.error('Error Message:', error.message);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setApiError('Sign-In cancelled by user.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setApiError('Sign-in is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setApiError('Google Play Services not available or outdated.');
      } else {
        setApiError(`Google Sign-In failed: Code ${error.code}. ${error.message || ''}`);
      }
    }
  };

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate(ROUTES.LOGIN) },
      ]);
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Registration failed. Try again.';
      setApiError(errMsg);
    },
  });

  const handleRegister = () => {
    setApiError(null);
    const newErrors: typeof errors = {};

    if (!validateUsername(username)) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    registerMutation.mutate({ username, email, password });
  };

  const googleErrorMsg = googleLoginMutation.error ? ((googleLoginMutation.error as any).response?.data?.message || googleLoginMutation.error.message) : null;
  const displayedError = apiError || googleErrorMsg;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.subtitle}>Join BlogMapp to start writing articles ✍️</Text>
        </View>

        <View style={styles.formCard}>
          {!!displayedError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{displayedError}</Text>
            </View>
          )}

          <Input
            label="Username"
            placeholder="Choose username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
            }}
            error={errors.username}
          />

          <Input
            label="Email"
            placeholder="Enter email address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Choose secure password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            isPassword
          />

          <Button
            title="Register"
            onPress={handleRegister}
            isLoading={registerMutation.isPending}
            style={styles.registerBtn}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue with Google"
            onPress={handleGoogleLogin}
            variant="outline"
            isLoading={googleLoginMutation.isPending}
            style={styles.googleBtn}
            textStyle={styles.googleBtnText}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
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
    marginBottom: SPACING.xl,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLightSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: '500',
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
  registerBtn: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textLightSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textLightSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  googleBtn: {
    borderColor: '#dadce0',
    marginTop: 0,
  },
  googleBtnText: {
    color: '#3c4043',
  },
});

export default RegisterScreen;
