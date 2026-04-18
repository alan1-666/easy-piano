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
import { Colors, FontSize, Spacing, BorderRadius } from '../src/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const PAGES: OnboardingPage[] = [
  {
    id: '1',
    icon: '\uD83C\uDFB9',
    title: '\u8FDE\u63A5\u4F60\u7684\u7535\u94A2\u7434',
    description:
      '\u901A\u8FC7 USB \u6216\u84DD\u7259\u8FDE\u63A5\u4F60\u7684\u7535\u94A2\u7434\uFF0C\u4EAB\u53D7\u6BEB\u79D2\u7EA7\u7CBE\u51C6\u8BC6\u522B',
  },
  {
    id: '2',
    icon: '\uD83C\uDFAE',
    title: '\u50CF\u73A9\u6E38\u620F\u4E00\u6837\u7EC3\u7434',
    description:
      '\u97F3\u7B26\u4ECE\u4E0A\u65B9\u843D\u4E0B\uFF0C\u5728\u6B63\u786E\u65F6\u673A\u5F39\u594F\uFF0C\u83B7\u5F97\u8BC4\u5206\u548C\u8FDE\u51FB\u5956\u52B1',
  },
  {
    id: '3',
    icon: '\uD83D\uDCDA',
    title: '\u7CFB\u7EDF\u5316\u5B66\u4E60\u8DEF\u5F84',
    description:
      '\u4ECE\u96F6\u57FA\u7840\u5230\u8FDB\u9636\uFF0C\u5B8C\u6574\u7684\u94A2\u7434\u5B66\u4E60\u8BFE\u7A0B\u4F53\u7CFB',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.round(offsetX / SCREEN_WIDTH);
      setCurrentPage(page);
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

      return (
        <View style={styles.page}>
          {/* Skip button (not on last page) */}
          {!isLast && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>{'\u8DF3\u8FC7'}</Text>
            </TouchableOpacity>
          )}

          {/* Icon area */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{item.description}</Text>

          {/* Dot indicators */}
          <View style={styles.dotsContainer}>
            {PAGES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goToPage(i)}
                style={[styles.dot, i === currentPage && styles.dotActive]}
              />
            ))}
          </View>

          {/* Start button (last page only) */}
          {isLast && (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>{'\u5F00\u59CB\u63A2\u7D22'}</Text>
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
    backgroundColor: Colors.background,
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
    width: 220,
    height: 220,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: FontSize.h2,
    fontWeight: '600',
    color: Colors.white,
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
    backgroundColor: '#555570',
  },
  dotActive: {
    backgroundColor: Colors.accent,
  },
  startButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    width: 280,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.background,
  },
});
