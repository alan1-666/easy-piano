import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Palette, BorderRadius, Spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: number;
  dark?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Card({ children, style, onPress, padding = Spacing.base, dark }: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const baseStyle: ViewStyle = {
    backgroundColor: dark ? Palette.ink : Palette.card,
    borderRadius: BorderRadius.xxl,
    padding,
    borderWidth: dark ? 0 : StyleSheet.hairlineWidth,
    borderColor: Palette.line,
  };

  if (onPress) {
    return (
      <AnimatedTouchable
        style={[baseStyle, animatedStyle, style]}
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98, { damping: 15, stiffness: 300 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 300 }))}
        activeOpacity={0.9}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return <View style={[baseStyle, style]}>{children}</View>;
}
