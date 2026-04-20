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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EyeIcon, EyeOffIcon } from '../../src/components/Icons';
import { ScreenContainer, Button, RadialBg } from '../../src/components/common';
import { Palette, FontWeight } from '../../src/theme';
import { useUserStore } from '../../src/stores/userStore';

function getPasswordStrength(password: string): {
  label: string;
  color: string;
  progress: number;
} {
  if (password.length === 0) return { label: '', color: Palette.ink3, progress: 0 };
  if (password.length < 6) return { label: '弱', color: Palette.coralInk, progress: 0.33 };
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (hasLetter && hasNumber && password.length >= 8) {
    return { label: '强', color: Palette.mintInk, progress: 1 };
  }
  if (hasLetter && hasNumber) {
    return { label: '中等', color: Palette.sunInk, progress: 0.66 };
  }
  return { label: '弱', color: Palette.coralInk, progress: 0.33 };
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
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = '密码至少6位，需包含字母和数字';
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
    <View style={styles.root}>
      <View style={styles.radial} pointerEvents="none">
        <RadialBg from={Palette.lilac} to={Palette.bg} cx={0.5} cy={0} rx={1.1} ry={0.7} />
      </View>
      <ScreenContainer scrollable bg="transparent">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text style={styles.title}>欢迎加入 EasyPiano</Text>
            <Text style={styles.subtitle}>创建账号开始你的钢琴之旅</Text>
          </Animated.View>

          {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

          <Animated.View entering={FadeInDown.duration(400).delay(50)}>
            <Field
              placeholder="请输入用户名"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
            />
            <Field
              placeholder="请输入邮箱地址"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
            />

            <View style={styles.fieldGroup}>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="请输入密码 (至少6位)"
                  placeholderTextColor={Palette.ink3}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
                </TouchableOpacity>
              </View>
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBarBg}>
                    <View
                      style={[
                        styles.strengthBarFill,
                        { width: `${strength.progress * 100}%`, backgroundColor: strength.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              )}
              {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="确认密码"
                  placeholderTextColor={Palette.ink3}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  autoCapitalize="none"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            <View style={{ marginTop: 8 }}>
              <Button
                title="注 册"
                onPress={handleRegister}
                loading={loading}
                disabled={!username || !email || !password || !confirmPassword}
                variant="primary"
                size="lg"
                block
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <View style={styles.bottomLink}>
              <Text style={styles.bottomText}>已有账号？</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.linkText}>立即登录</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </View>
  );
}

function Field({
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType,
}: {
  placeholder: string;
  value: string;
  onChangeText: (s: string) => void;
  error?: string;
  keyboardType?: 'email-address';
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={[styles.inputContainer, !!error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Palette.ink3}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
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
  header: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.7,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.ink2,
  },
  fieldGroup: { marginBottom: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
  },
  inputError: {
    borderColor: Palette.coralInk,
  },
  input: {
    flex: 1,
    color: Palette.ink,
    fontSize: 15,
    height: '100%',
  },
  eyeButton: { padding: 8 },
  fieldError: {
    color: Palette.coralInk,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    color: Palette.coralInk,
    fontSize: 13,
    marginBottom: 12,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBarBg: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Palette.chip,
    marginRight: 8,
  },
  strengthBarFill: {
    height: 3,
    borderRadius: 1.5,
  },
  strengthLabel: {
    fontSize: 13,
    width: 30,
    fontWeight: FontWeight.semibold,
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
});
