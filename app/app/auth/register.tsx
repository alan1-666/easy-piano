import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components/common';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme';
import { useUserStore } from '../../src/stores/userStore';

function getPasswordStrength(password: string): {
  label: string;
  color: string;
  progress: number;
} {
  if (password.length === 0) return { label: '', color: Colors.textDisabled, progress: 0 };
  if (password.length < 6) return { label: '弱', color: Colors.error, progress: 0.33 };
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (hasLetter && hasNumber && password.length >= 8) {
    return { label: '强', color: Colors.success, progress: 1 };
  }
  if (hasLetter && hasNumber) {
    return { label: '中等', color: Colors.warning, progress: 0.66 };
  }
  return { label: '弱', color: Colors.error, progress: 0.33 };
}

export default function RegisterScreen() {
  const router = useRouter();
  const register = useUserStore((s) => s.register);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(password);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username.trim() || username.trim().length < 2 || username.trim().length > 20) {
      newErrors.username = '用户名需 2-20 个字符';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!password || password.length < 6) {
      newErrors.password = '密码至少6位，需包含字母和数字';
    } else {
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (!hasLetter || !hasNumber) {
        newErrors.password = '密码至少6位，需包含字母和数字';
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次密码输入不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '注册失败，请重试';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>欢迎加入 EasyPiano</Text>
          <Text style={styles.subtitle}>创建账号开始你的钢琴之旅</Text>
        </View>

        {/* General error */}
        {errors.general ? (
          <Text style={styles.errorText}>{errors.general}</Text>
        ) : null}

        {/* Username */}
        <View style={styles.fieldGroup}>
          <View
            style={[
              styles.inputContainer,
              errors.username ? styles.inputError : null,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="请输入用户名"
              placeholderTextColor={Colors.textDisabled}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          {errors.username ? (
            <Text style={styles.fieldError}>{errors.username}</Text>
          ) : null}
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <View
            style={[
              styles.inputContainer,
              errors.email ? styles.inputError : null,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="请输入邮箱地址"
              placeholderTextColor={Colors.textDisabled}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          {errors.email ? (
            <Text style={styles.fieldError}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <View
            style={[
              styles.inputContainer,
              errors.password ? styles.inputError : null,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="请输入密码 (至少6位)"
              placeholderTextColor={Colors.textDisabled}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="next"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          </View>

          {/* Password Strength */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthBarBg}>
                <View
                  style={[
                    styles.strengthBarFill,
                    {
                      width: `${strength.progress * 100}%`,
                      backgroundColor: strength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          {errors.password ? (
            <Text style={styles.fieldError}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Confirm Password */}
        <View style={styles.fieldGroup}>
          <View
            style={[
              styles.inputContainer,
              errors.confirmPassword ? styles.inputError : null,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="确认密码"
              placeholderTextColor={Colors.textDisabled}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showConfirmPassword ? '👁' : '👁‍🗨'}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        {/* Register Button */}
        <Button
          title="注 册"
          onPress={handleRegister}
          loading={loading}
          disabled={!username || !email || !password || !confirmPassword}
          style={styles.registerButton}
        />

        {/* Login Link */}
        <View style={styles.bottomLink}>
          <Text style={styles.bottomText}>已有账号？</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>立即登录</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.h2,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    height: 48,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.body,
    height: '100%',
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  eyeIcon: {
    fontSize: 18,
  },
  fieldError: {
    color: Colors.error,
    fontSize: FontSize.caption,
    marginTop: Spacing.xs,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.caption,
    marginBottom: Spacing.md,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceLight,
    marginRight: Spacing.sm,
  },
  strengthBarFill: {
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: FontSize.caption,
    width: 30,
  },
  registerButton: {
    marginTop: Spacing.base,
    width: '100%',
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  bottomText: {
    color: Colors.textSecondary,
    fontSize: FontSize.body,
  },
  linkText: {
    color: Colors.accent,
    fontSize: FontSize.body,
    fontWeight: '600',
  },
});
