import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, BorderRadius } from '../../theme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export default function ProgressBar({
  progress,
  height = 6,
  color = Colors.accent,
  backgroundColor = Colors.bgTertiary,
}: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withSpring(clampedProgress, {
      damping: 20,
      stiffness: 100,
    });
  }, [clampedProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.container,
        { height, borderRadius: height / 2, backgroundColor },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: color,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
