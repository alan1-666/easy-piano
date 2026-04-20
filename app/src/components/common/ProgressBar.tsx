import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Palette } from '../../theme';
import { LinearBar } from './Gradient';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  gradient?: [string, string];
}

export default function ProgressBar({
  progress,
  height = 8,
  color = Palette.primary,
  backgroundColor = Palette.chip,
  gradient,
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
          { height, borderRadius: height / 2 },
          fillStyle,
        ]}
      >
        {gradient ? (
          <LinearBar from={gradient[0]} to={gradient[1]} radius={height / 2} />
        ) : (
          <View style={{ flex: 1, backgroundColor: color, borderRadius: height / 2 }} />
        )}
      </Animated.View>
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
    overflow: 'hidden',
  },
});
