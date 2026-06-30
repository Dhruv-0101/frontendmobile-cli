import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import COLORS from '../../constants/colors';
import SPACING from '../../constants/spacing';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  containerStyle,
  style,
  helperText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [secureText, setSecureText] = useState(isPassword);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedBorder,
          !!error && styles.errorBorder,
          props.multiline && { height: 'auto', minHeight: 52, paddingVertical: SPACING.xs },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            props.multiline && { minHeight: 40, textAlignVertical: 'top' },
            style,
          ]}
          placeholderTextColor={COLORS.textLightSecondary}
          secureTextEntry={secureText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            activeOpacity={0.7}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>{secureText ? '👁️' : '🔒'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {!!helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLightSecondary,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
  },
  focusedBorder: {
    borderColor: COLORS.primary,
  },
  errorBorder: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.textLightPrimary,
    fontSize: 15,
    padding: 0,
  },
  eyeButton: {
    paddingLeft: SPACING.sm,
  },
  eyeText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLightSecondary,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default Input;
