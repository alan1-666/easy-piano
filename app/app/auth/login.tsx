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
import { EyeIcon, EyeOffIcon } from '../../src/components/Icons';
import { ScreenContainer, Button, RadialBg } from '../../src/components/common';
import { Palette, FontWeight } from '../../src/theme';
import { useUserStore } from '../../src/stores/userStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
      // eslint-disable-next-line
      const err: any = e;
      console.log('[login] error:', err?.message, {
        code: err?.code,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      const status = err?.response?.status;
      if (status === 401) {
        setError('邮箱或密码不正确');
      } else if (status === 400) {
        setError(err?.response?.data?.message ?? '请求格式不正确');
      } else if (err?.code === 'ERR_NETWORK') {
        setError('网络连接失败，检查网络或服务是否可用');
      } else {
        setError(err instanceof Error ? err.message : '登录失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.radial} pointerEvents="none">
        <RadialBg from={Palette.primarySoft} to={Palette.bg} cx={0.5} cy={0} rx={1.1} ry={0.7} />
      </View>
      <ScreenContainer scrollable bg="transparent">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View entering={FadeInDown.duration(400)} style={styles.logoArea}>
            <View style={styles.logoIcon}>
              <Text style={{ fontSize: 32 }}>🎹</Text>
            </View>
            <Text style={styles.logoText}>EasyPiano</Text>
            <Text style={styles.tagline}>让学钢琴像玩游戏一样有趣</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(50)}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="请输入邮箱地址"
                placeholderTextColor={Palette.ink3}
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
                placeholderTextColor={Palette.ink3}
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
                {showPassword ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={{ marginTop: 8 }}>
              <Button
                title="登 录"
                onPress={handleLogin}
                loading={loading}
                disabled={!email || !password}
                variant="primary"
                size="lg"
                block
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Button
                variant="dark"
                size="lg"
                block
                onPress={() => Alert.alert('提示', 'Apple 登录功能即将上线')}
              >
                Continue with Apple
              </Button>
            </View>

            <TouchableOpacity
              style={styles.wechatButton}
              onPress={() => Alert.alert('提示', '微信登录功能即将上线')}
              activeOpacity={0.85}
            >
              <Text style={styles.wechatText}>微信登录</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.bg },
  radial: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 32,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: Palette.ink2,
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    height: 50,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: Palette.ink,
    fontSize: 15,
    height: '100%',
  },
  eyeButton: { padding: 8 },
  errorText: {
    color: Palette.coralInk,
    fontSize: 13,
    marginBottom: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.line,
  },
  dividerText: {
    color: Palette.ink3,
    fontSize: 13,
    marginHorizontal: 12,
  },
  wechatButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#07C160',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  wechatText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: FontWeight.semibold,
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    gap: 4,
  },
  bottomText: {
    color: Palette.ink2,
    fontSize: 14,
  },
  linkText: {
    color: Palette.primary,
    fontSize: 14,
    fontWeight: FontWeight.semibold,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: Palette.ink3,
    fontSize: 13,
  },
});
