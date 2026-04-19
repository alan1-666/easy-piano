import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Eye, EyeOff, Music } from '../../src/components/Icons';
import { ScreenContainer, Button } from '../../src/components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/theme';
import { useUserStore } from '../../src/stores/userStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) { setError('请输入邮箱地址'); return; }
    if (!validateEmail(email)) { setError('请输入有效的邮箱地址'); return; }
    if (!password) { setError('请输入密码'); return; }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '登录失败，请重试';
      setError(message);
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
        <Animated.View entering={FadeInDown.duration(400)} style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Music size={36} color={Colors.accent} />
          </View>
          <Text style={styles.logoText}>EasyPiano</Text>
          <Text style={styles.tagline}>让学钢琴像玩游戏一样有趣</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="请输入邮箱地址"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="请输入密码"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye size={18} color={Colors.textSecondary} />
              ) : (
                <EyeOff size={18} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="登 录"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password}
            style={styles.loginButton}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Alert.alert('提示', 'Apple 登录功能即将上线')}
            activeOpacity={0.85}
          >
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.wechatButton]}
            onPress={() => Alert.alert('提示', '微信登录功能即将上线')}
            activeOpacity={0.85}
          >
            <Text style={styles.socialButtonTextLight}>微信登录</Text>
          </TouchableOpacity>

          <View style={styles.bottomLink}>
            <Text style={styles.bottomText}>没有账号？</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.linkText}>立即注册</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipText}>跳过，稍后再说</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    paddingBottom: Spacing.xxl,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 50,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.body,
    height: '100%',
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.caption,
    marginBottom: Spacing.md,
  },
  loginButton: {
    marginTop: Spacing.sm,
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textTertiary,
    fontSize: FontSize.caption,
    marginHorizontal: Spacing.md,
  },
  socialButton: {
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  socialButtonText: {
    color: '#000000',
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  wechatButton: {
    backgroundColor: '#07C160',
  },
  socialButtonTextLight: {
    color: '#FFFFFF',
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.base,
  },
  bottomText: {
    color: Colors.textSecondary,
    fontSize: FontSize.body,
  },
  linkText: {
    color: Colors.accent,
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    color: Colors.textTertiary,
    fontSize: FontSize.caption,
  },
});
