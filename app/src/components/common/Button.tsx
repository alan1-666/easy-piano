import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Palette, FontWeight } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
type ButtonSize = 'lg' | 'md' | 'sm';

interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const HEIGHTS: Record<ButtonSize, number> = { lg: 54, md: 46, sm: 36 };
const FONT_SIZES: Record<ButtonSize, number> = { lg: 17, md: 15, sm: 13 };
const PADDING_X: Record<ButtonSize, number> = { lg: 22, md: 22, sm: 14 };

export default function Button({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  block,
  loading = false,
  disabled = false,
  leading,
  trailing,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const h = HEIGHTS[size];
  const fontSize = FONT_SIZES[size];
  const paddingX = PADDING_X[size];

  const variantStyle: ViewStyle = (() => {
    if (variant === 'primary') return { backgroundColor: Palette.primary, ...styles.primaryShadow };
    if (variant === 'dark') return { backgroundColor: Palette.ink };
    if (variant === 'ghost') return { backgroundColor: 'transparent' };
    return {
      backgroundColor: '#fff',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Palette.line,
    };
  })();

  const textColor =
    variant === 'primary' || variant === 'dark'
      ? '#fff'
      : variant === 'ghost'
      ? Palette.ink2
      : Palette.ink;

  return (
    <AnimatedTouchable
      style={[
        {
          height: h,
          borderRadius: h / 2,
          paddingHorizontal: paddingX,
          alignSelf: block ? 'stretch' : 'flex-start',
        },
        styles.base,
        variantStyle,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 300 }))}
      activeOpacity={0.88}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.row}>
          {leading}
          {(title || children) && (
            <Text style={{ fontSize, fontWeight: FontWeight.semibold, color: textColor, letterSpacing: -0.2 }}>
              {title ?? children}
            </Text>
          )}
          {trailing}
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryShadow: {
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
  },
  disabled: {
    opacity: 0.4,
  },
});
