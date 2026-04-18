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
import { ScreenContainer, Button } from '../../src/components/common';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme';
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

    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    if (!validateEmail(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

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

  const handleAppleLogin = () => {
    Alert.alert('提示', 'Apple 登录功能即将上线');
  };

  const handleWeChatLogin = () => {
    Alert.alert('提示', '微信登录功能即将上线');
  };

  return (
    <ScreenContainer scrollable>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Logo Area */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🎹</Text>
          <Text style={styles.logoText}>EasyPiano</Text>
          <Text style={styles.tagline}>让学钢琴像玩游戏一样有趣</Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
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

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="请输入密码"
            placeholderTextColor={Colors.textDisabled}
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
            <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Login Button */}
        <Button
          title="登 录"
          onPress={handleLogin}
          loading={loading}
          disabled={!email || !password}
          style={styles.loginButton}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>或</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Apple Login */}
        <TouchableOpacity
          style={styles.appleButton}
          onPress={handleAppleLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.appleButtonText}> Continue with Apple</Text>
        </TouchableOpacity>

        {/* WeChat Login */}
        <TouchableOpacity
          style={styles.wechatButton}
          onPress={handleWeChatLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.wechatButtonText}>微信登录</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.bottomLink}>
          <Text style={styles.bottomText}>没有账号？</Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.linkText}>立即注册</Text>
          </TouchableOpacity>
        </View>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.skipText}>跳过，稍后再说</Text>
        </TouchableOpacity>
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
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  logoText: {
    fontSize: FontSize.h2,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    height: 48,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
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
    backgroundColor: Colors.textDisabled,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: FontSize.caption,
    marginHorizontal: Spacing.md,
  },
  appleButton: {
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appleButtonText: {
    color: '#000000',
    fontSize: FontSize.h4,
    fontWeight: '600',
  },
  wechatButton: {
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  wechatButtonText: {
    color: Colors.white,
    fontSize: FontSize.h4,
    fontWeight: '600',
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
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
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.caption,
  },
});
