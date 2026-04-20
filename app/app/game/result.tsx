import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Palette, FontWeight } from '../../src/theme';
import { Button, Pill, RadialBg } from '../../src/components/common';
import { Flame, StarIcon } from '../../src/components/Icons';
import { mockUser, mockXpToNextLevel } from '../../src/utils/mockData';
import type { GameResult, HandResultSummary } from '../../src/types/game';

const DEFAULT_RESULT: GameResult & {
  songId: number;
  songTitle: string;
  artist: string;
} = {
  songId: 1,
  songTitle: '小星星',
  artist: '莫扎特',
  score: 1280,
  stars: 3,
  maxCombo: 35,
  perfectCount: 42,
  greatCount: 18,
  goodCount: 8,
  missCount: 2,
  xpEarned: 150,
  accuracy: 92.0,
  leftHand: {
    perfectCount: 12,
    greatCount: 4,
    goodCount: 1,
    missCount: 1,
    totalNotes: 18,
    accuracy: 90.6,
  },
  rightHand: {
    perfectCount: 26,
    greatCount: 8,
    goodCount: 4,
    missCount: 2,
    totalNotes: 40,
    accuracy: 92.1,
  },
};

function getNumberParam(value: string | undefined, fallback: number) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getHandSummaryParam(
  value: string | undefined,
  fallback: HandResultSummary,
): HandResultSummary {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value) as Partial<HandResultSummary>;
    return {
      perfectCount: Number(parsed.perfectCount ?? fallback.perfectCount),
      greatCount: Number(parsed.greatCount ?? fallback.greatCount),
      goodCount: Number(parsed.goodCount ?? fallback.goodCount),
      missCount: Number(parsed.missCount ?? fallback.missCount),
      totalNotes: Number(parsed.totalNotes ?? fallback.totalNotes),
      accuracy: Number(parsed.accuracy ?? fallback.accuracy),
    };
  } catch {
    return fallback;
  }
}

function getRank(score: number): { letter: string; color: string } {
  if (score >= 9500) return { letter: 'S', color: Palette.primary };
  if (score >= 8000) return { letter: 'A', color: Palette.primary };
  if (score >= 6000) return { letter: 'B', color: Palette.lilacInk };
  return { letter: 'C', color: Palette.ink2 };
}

export default function GameResultScreen() {
  const router = useRouter();
  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  const params = useLocalSearchParams<{
    songId?: string;
    songTitle?: string;
    artist?: string;
    score?: string;
    stars?: string;
    maxCombo?: string;
    perfectCount?: string;
    greatCount?: string;
    goodCount?: string;
    missCount?: string;
    xpEarned?: string;
    accuracy?: string;
    leftHand?: string;
    rightHand?: string;
  }>();
  const result = {
    songId: getNumberParam(params.songId, DEFAULT_RESULT.songId),
    songTitle: params.songTitle ?? DEFAULT_RESULT.songTitle,
    artist: params.artist ?? DEFAULT_RESULT.artist,
    score: getNumberParam(params.score, DEFAULT_RESULT.score),
    stars: getNumberParam(params.stars, DEFAULT_RESULT.stars),
    maxCombo: getNumberParam(params.maxCombo, DEFAULT_RESULT.maxCombo),
    perfectCount: getNumberParam(params.perfectCount, DEFAULT_RESULT.perfectCount),
    greatCount: getNumberParam(params.greatCount, DEFAULT_RESULT.greatCount),
    goodCount: getNumberParam(params.goodCount, DEFAULT_RESULT.goodCount),
    missCount: getNumberParam(params.missCount, DEFAULT_RESULT.missCount),
    xpEarned: getNumberParam(params.xpEarned, DEFAULT_RESULT.xpEarned),
    accuracy: getNumberParam(params.accuracy, DEFAULT_RESULT.accuracy),
    leftHand: getHandSummaryParam(params.leftHand, DEFAULT_RESULT.leftHand),
    rightHand: getHandSummaryParam(params.rightHand, DEFAULT_RESULT.rightHand),
  };
  const rank = getRank(result.score);

  const totalNotes =
    result.perfectCount + result.greatCount + result.goodCount + result.missCount;
  const safeTotalNotes = Math.max(totalNotes, 1);
  const xpAfter = mockUser.xp + result.xpEarned;

  const stats: Array<{ label: string; value: number; color: string; pct: number }> = [
    { label: 'Perfect', value: result.perfectCount, color: Palette.primary, pct: result.perfectCount / safeTotalNotes },
    { label: 'Great', value: result.greatCount, color: Palette.lilacInk, pct: result.greatCount / safeTotalNotes },
    { label: 'Good', value: result.goodCount, color: Palette.mintInk, pct: result.goodCount / safeTotalNotes },
    { label: 'Miss', value: result.missCount, color: Palette.coralInk, pct: result.missCount / safeTotalNotes },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.radial} pointerEvents="none">
        <RadialBg from={Palette.primarySoft} to={Palette.bg} cx={0.5} cy={0} rx={1.0} ry={0.6} />
      </View>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center' }}>
            <Pill bg={Palette.mint} color={Palette.mintInk}>✦ 演奏完成</Pill>
          </View>
          <Text style={styles.songTitle}>{result.songTitle}</Text>
          <Text style={styles.songArtist}>{result.artist}</Text>

          <View style={styles.starsRow}>
            {[0, 1, 2].map((i) => {
              const filled = i < result.stars;
              const isCenter = i === 1;
              const size = isCenter ? 68 : 54;
              const iconSize = isCenter ? 42 : 32;
              return (
                <View
                  key={i}
                  style={[
                    styles.starCircle,
                    {
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      transform: [{ translateY: isCenter ? -10 : 0 }],
                    },
                  ]}
                >
                  <StarIcon
                    size={iconSize}
                    color={filled ? Palette.primary : Palette.chip}
                    fill
                  />
                </View>
              );
            })}
          </View>

          <Text style={styles.scoreValue}>{result.score.toLocaleString()}</Text>
          <View style={styles.rankPill}>
            <Text style={styles.rankPillLabel}>评级</Text>
            <Text style={[styles.rankPillLetter, { color: rank.color }]}>{rank.letter}</Text>
          </View>

          <View style={styles.statsGrid}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statBox}>
                <View style={styles.statBoxHeader}>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                </View>
                <View style={styles.statBarTrack}>
                  <View
                    style={[
                      styles.statBarFill,
                      { backgroundColor: s.color, width: `${Math.max(s.pct * 100, 2)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.comboCard}>
            <Flame size={18} color={Palette.primary} />
            <Text style={styles.comboLabel}>最大连击</Text>
            <Text style={styles.comboValue}>{result.maxCombo}</Text>
          </View>

          <View style={styles.xpCard}>
            <View style={styles.xpHeaderRow}>
              <Text style={styles.xpHeaderLabel}>经验奖励</Text>
              <Text style={styles.xpHeaderValue}>+{result.xpEarned} XP</Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View
                style={[
                  styles.xpBarFill,
                  { width: `${Math.min(xpAfter / mockXpToNextLevel, 1) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.xpFoot}>
              Lv.{mockUser.level} · {xpAfter} / {mockXpToNextLevel} XP
            </Text>
          </View>

          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <Button variant="secondary" block onPress={() => router.replace(`/game/${result.songId}`)}>
                重试
              </Button>
            </View>
            <View style={{ flex: 1.3 }}>
              <Button
                variant="primary"
                block
                onPress={() => router.replace('/(tabs)/songs')}
                trailing={<Text style={{ color: '#fff', fontSize: 15, fontWeight: FontWeight.semibold }}>→</Text>}
              >
                下一曲
              </Button>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.replace('/(tabs)/songs')}
          >
            <Text style={styles.backLinkText}>返回曲库</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  songTitle: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  songArtist: {
    fontSize: 13,
    color: Palette.ink2,
    marginTop: 2,
    textAlign: 'center',
  },
  starsRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  starCircle: {
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 4,
  },
  scoreValue: {
    marginTop: 28,
    fontSize: 60,
    fontWeight: FontWeight.heavy,
    color: Palette.ink,
    letterSpacing: -2,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  rankPill: {
    alignSelf: 'center',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Palette.ink,
  },
  rankPillLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  rankPillLetter: {
    fontSize: 17,
    fontWeight: FontWeight.heavy,
  },
  statsGrid: {
    marginTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    flexBasis: '48.5%',
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 16,
    padding: 12,
  },
  statBoxHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 11,
    color: Palette.ink2,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: FontWeight.heavy,
    fontVariant: ['tabular-nums'],
  },
  statBarTrack: {
    marginTop: 6,
    height: 4,
    backgroundColor: Palette.chip,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  comboCard: {
    marginTop: 12,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  comboLabel: {
    fontSize: 13,
    color: Palette.ink2,
    fontWeight: FontWeight.medium,
  },
  comboValue: {
    marginLeft: 'auto',
    fontSize: 18,
    fontWeight: FontWeight.heavy,
    color: Palette.ink,
    fontVariant: ['tabular-nums'],
  },
  xpCard: {
    marginTop: 10,
    backgroundColor: Palette.ink,
    borderRadius: 16,
    padding: 14,
  },
  xpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpHeaderLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  xpHeaderValue: {
    fontSize: 18,
    fontWeight: FontWeight.heavy,
    color: Palette.primary,
  },
  xpBarTrack: {
    marginTop: 10,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: Palette.primary,
    borderRadius: 3,
  },
  xpFoot: {
    marginTop: 6,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  backLink: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 4,
  },
  backLinkText: {
    fontSize: 13,
    color: Palette.ink2,
    fontWeight: FontWeight.medium,
  },
});
