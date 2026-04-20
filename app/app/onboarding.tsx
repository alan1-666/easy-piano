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
import { Palette, FontWeight } from '../src/theme';
import { Button, Pill, RadialBg } from '../src/components/common';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  description: string;
}

const PAGES: OnboardingPage[] = [
  {
    id: '1',
    title: '连接你的电钢琴',
    description: '通过 USB 或蓝牙连接你的电钢琴，享受毫秒级精准识别。',
  },
  {
    id: '2',
    title: '像玩游戏\n一样练琴。',
    description: '连接电钢琴，音符从天而降。在节拍上按下琴键，获得连击与评分。',
  },
  {
    id: '3',
    title: '系统化\n学习路径。',
    description: '从零基础到进阶，完整的钢琴学习课程体系陪你一步步成长。',
  },
];

function FallingNotesIllustration() {
  // schematic falling notes + judgment line + mini keyboard
  const notes = [
    { x: 12, y: 20, c: Palette.primary, h: 40 },
    { x: 54, y: 50, c: Palette.lilacInk, h: 28 },
    { x: 96, y: 10, c: Palette.mintInk, h: 56 },
    { x: 140, y: 70, c: Palette.primary, h: 24 },
    { x: 180, y: 30, c: Palette.lilacInk, h: 48 },
  ];
  return (
    <View style={styles.illustration}>
      <View style={[styles.cardLayerBack]} />
      <View style={[styles.cardLayerFront]}>
        <View style={styles.lane}>
          {notes.map((n, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: n.x,
                top: n.y,
                width: 22,
                height: n.h,
                borderRadius: 6,
                backgroundColor: n.c,
                opacity: 0.9,
              }}
            />
          ))}
          <View style={styles.judgeLine} />
          <View style={styles.keyRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={styles.keyMini} />
            ))}
          </View>
        </View>
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <Pill bg={Palette.primarySoft} color={Palette.primary}>Perfect ✦ 23x</Pill>
        </View>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      setCurrentPage(Math.round(offsetX / SCREEN_WIDTH));
    },
    [],
  );

  const handleSkip = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const handleStart = useCallback(() => {
    if (currentPage === PAGES.length - 1) {
      router.replace('/(tabs)');
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      });
    }
  }, [router, currentPage]);

  const renderPage = useCallback(
    ({ item, index }: ListRenderItemInfo<OnboardingPage>) => {
      const isLast = index === PAGES.length - 1;
      return (
        <View style={styles.page}>
          <View style={styles.skipRow}>
            {!isLast && (
              <TouchableOpacity hitSlop={12} onPress={handleSkip}>
                <Text style={styles.skipText}>跳过</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.heroArea}>
            <FallingNotesIllustration />
          </View>

          <View style={styles.bottom}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.dotsContainer}>
              {PAGES.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentPage && styles.dotActive,
                  ]}
                />
              ))}
            </View>
            <Button
              variant="primary"
              size="lg"
              block
              onPress={handleStart}
              trailing={<Text style={{ color: '#fff', fontSize: 17, fontWeight: FontWeight.semibold }}>→</Text>}
            >
              {isLast ? '开始探索' : '继续'}
            </Button>
          </View>
        </View>
      );
    },
    [currentPage, handleSkip, handleStart],
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.radial} pointerEvents="none">
        <RadialBg from={Palette.primarySoft} to={Palette.bg} cx={0.5} cy={0} rx={1.2} ry={0.8} />
      </View>
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
    backgroundColor: Palette.bg,
  },
  radial: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 480,
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 40,
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    minHeight: 24,
  },
  skipText: {
    fontSize: 14,
    color: Palette.ink2,
    fontWeight: FontWeight.medium,
  },
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: 260,
    height: 320,
    position: 'relative',
  },
  cardLayerBack: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    right: '5%',
    bottom: '10%',
    backgroundColor: Palette.card,
    borderRadius: 48,
    transform: [{ rotate: '-4deg' }],
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.18,
    shadowRadius: 60,
    elevation: 6,
  },
  cardLayerFront: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    right: '5%',
    bottom: '10%',
    backgroundColor: Palette.card,
    borderRadius: 48,
    transform: [{ rotate: '3deg' }],
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.1,
    shadowRadius: 60,
    elevation: 6,
  },
  lane: {
    height: 180,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    position: 'relative',
  },
  judgeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 28,
    height: 2,
    backgroundColor: Palette.primary,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  keyRow: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 4,
    height: 20,
    flexDirection: 'row',
    gap: 1,
  },
  keyMini: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 3,
  },
  bottom: {},
  title: {
    fontSize: 34,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -1.2,
    lineHeight: 38,
  },
  description: {
    fontSize: 15,
    color: Palette.ink2,
    marginTop: 14,
    lineHeight: 22,
    maxWidth: 280,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 28,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.line,
  },
  dotActive: {
    width: 24,
    backgroundColor: Palette.primary,
  },
});
