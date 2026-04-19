import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  type ListRenderItemInfo,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Wifi, Gamepad2, BookOpen } from '../src/components/Icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../src/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  Icon: any;
  title: string;
  description: string;
}

const PAGES: OnboardingPage[] = [
  {
    id: '1',
    Icon: Wifi,
    title: '连接你的电钢琴',
    description: '通过 USB 或蓝牙连接你的电钢琴，享受毫秒级精准识别',
  },
  {
    id: '2',
    Icon: Gamepad2,
    title: '像玩游戏一样练琴',
    description: '音符从上方落下，在正确时机弹奏，获得评分和连击奖励',
  },
  {
    id: '3',
    Icon: BookOpen,
    title: '系统化学习路径',
    description: '从零基础到进阶，完整的钢琴学习课程体系',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      setCurrentPage(Math.round(offsetX / SCREEN_WIDTH));
    },
    []
  );

  const handleSkip = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const handleStart = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const goToPage = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const renderPage = useCallback(
    ({ item, index }: ListRenderItemInfo<OnboardingPage>) => {
      const isLast = index === PAGES.length - 1;
      const IconComp = item.Icon;

      return (
        <View style={styles.page}>
          {!isLast && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>跳过</Text>
            </TouchableOpacity>
          )}

          <View style={styles.iconContainer}>
            <IconComp size={56} color={Colors.accent} strokeWidth={1.5} />
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.dotsContainer}>
            {PAGES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goToPage(i)}
                style={[styles.dot, i === currentPage && styles.dotActive]}
              />
            ))}
          </View>

          {isLast && (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>开始探索</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [currentPage, handleSkip, handleStart, goToPage]
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  description: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bgElevated,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 24,
  },
  startButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    width: 280,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.bgPrimary,
  },
});
