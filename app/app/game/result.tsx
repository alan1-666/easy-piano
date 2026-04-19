import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme';
import { Button, ProgressBar } from '../../src/components/common';
import { mockUser, mockXpToNextLevel } from '../../src/utils/mockData';
import type { GameResult, HandResultSummary } from '../../src/types/game';

const DEFAULT_RESULT: GameResult & {
  songId: number;
  songTitle: string;
  artist: string;
} = {
  songId: 2,
  songTitle: '欢乐颂',
  artist: '贝多芬',
  score: 8750,
  stars: 2,
  maxCombo: 45,
  perfectCount: 38,
  greatCount: 12,
  goodCount: 5,
  missCount: 3,
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
  if (value === undefined) {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function getHandSummaryParam(
  value: string | undefined,
  fallback: HandResultSummary
): HandResultSummary {
  if (!value) {
    return fallback;
  }

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
  if (score >= 9500) return { letter: 'S', color: Colors.accent };
  if (score >= 8000) return { letter: 'A', color: Colors.leftHand };
  if (score >= 6000) return { letter: 'B', color: Colors.rightHand };
  return { letter: 'C', color: Colors.textSecondary };
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
    result.perfectCount +
    result.greatCount +
    result.goodCount +
    result.missCount;
  const safeTotalNotes = Math.max(totalNotes, 1);

  const xpAfter = mockUser.xp + result.xpEarned;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.completedTitle}>演奏完成！</Text>
        <Text style={styles.songInfo}>
          {result.songTitle} - {result.artist}
        </Text>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3].map((star) => (
            <Text
              key={star}
              style={[
                styles.star,
                star === 2 && styles.starCenter,
                star <= result.stars
                  ? styles.starFilled
                  : styles.starEmpty,
              ]}
            >
              ★
            </Text>
          ))}
        </View>

        {/* Score */}
        <Text style={styles.scoreValue}>
          {result.score.toLocaleString()}
        </Text>
        <Text style={[styles.rankLetter, { color: rank.color }]}>
          {rank.letter}
        </Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: Colors.perfect }]}>
              Perfect
            </Text>
            <Text style={[styles.statNumber, { color: Colors.perfect }]}>
              {result.perfectCount}
            </Text>
            <View
              style={[
                styles.statBar,
                {
                  backgroundColor: Colors.perfect,
                  width: `${(result.perfectCount / safeTotalNotes) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: Colors.great }]}>
              Great
            </Text>
            <Text style={[styles.statNumber, { color: Colors.great }]}>
              {result.greatCount}
            </Text>
            <View
              style={[
                styles.statBar,
                {
                  backgroundColor: Colors.great,
                  width: `${(result.greatCount / safeTotalNotes) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: Colors.good }]}>
              Good
            </Text>
            <Text style={[styles.statNumber, { color: Colors.good }]}>
              {result.goodCount}
            </Text>
            <View
              style={[
                styles.statBar,
                {
                  backgroundColor: Colors.good,
                  width: `${(result.goodCount / safeTotalNotes) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: Colors.miss }]}>
              Miss
            </Text>
            <Text style={[styles.statNumber, { color: Colors.miss }]}>
              {result.missCount}
            </Text>
            <View
              style={[
                styles.statBar,
                {
                  backgroundColor: Colors.miss,
                  width: `${(result.missCount / safeTotalNotes) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Max Combo */}
        <View style={styles.comboCard}>
          <Text style={styles.comboLabel}>🔥 最大连击</Text>
          <Text style={styles.comboValue}>{result.maxCombo}x</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>左右手表现</Text>
        </View>
        <View style={styles.handCards}>
          <View style={styles.handCard}>
            <View style={styles.handCardHeader}>
              <Text style={styles.handCardTitle}>左手</Text>
              <Text style={[styles.handAccuracy, { color: Colors.leftHand }]}>
                {result.leftHand.accuracy.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.handMeta}>音符 {result.leftHand.totalNotes}</Text>
            <Text style={styles.handDetail}>
              P {result.leftHand.perfectCount} / G {result.leftHand.greatCount}
            </Text>
            <Text style={styles.handDetail}>
              Good {result.leftHand.goodCount} / Miss {result.leftHand.missCount}
            </Text>
          </View>
          <View style={styles.handCard}>
            <View style={styles.handCardHeader}>
              <Text style={styles.handCardTitle}>右手</Text>
              <Text style={[styles.handAccuracy, { color: Colors.rightHand }]}>
                {result.rightHand.accuracy.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.handMeta}>音符 {result.rightHand.totalNotes}</Text>
            <Text style={styles.handDetail}>
              P {result.rightHand.perfectCount} / G {result.rightHand.greatCount}
            </Text>
            <Text style={styles.handDetail}>
              Good {result.rightHand.goodCount} / Miss {result.rightHand.missCount}
            </Text>
          </View>
        </View>

        {/* XP Earned */}
        <View style={styles.xpCard}>
          <Text style={styles.xpEarned}>+{result.xpEarned} XP</Text>
          <View style={styles.xpLevelRow}>
            <Text style={styles.xpLevelText}>Lv.{mockUser.level}</Text>
            <View style={styles.xpBarWrapper}>
              <ProgressBar
                progress={xpAfter / mockXpToNextLevel}
                height={8}
                color={Colors.leftHand}
              />
            </View>
            <Text style={styles.xpLevelText}>Lv.{mockUser.level + 1}</Text>
          </View>
          <Text style={styles.xpProgress}>
            {xpAfter} / {mockXpToNextLevel} XP
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <Button
            title="重试"
            variant="secondary"
            onPress={() => router.replace(`/game/${result.songId}`)}
            style={styles.retryButton}
          />
          <Button
            title="返回曲库"
            variant="ghost"
            onPress={() => router.replace('/(tabs)/songs')}
            style={styles.backButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: FontSize.h2,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  songInfo: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  star: {
    fontSize: 48,
  },
  starCenter: {
    fontSize: 56,
  },
  starFilled: {
    color: Colors.accent,
  },
  starEmpty: {
    color: Colors.textTertiary,
  },
  scoreValue: {
    fontSize: FontSize.score,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  rankLetter: {
    fontSize: FontSize.h1,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.base,
  },
  statBox: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  statNumber: {
    fontSize: FontSize.h3,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  statBar: {
    height: 4,
    borderRadius: 2,
    minWidth: 4,
  },
  comboCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    width: '100%',
    marginBottom: Spacing.base,
  },
  comboLabel: {
    fontSize: FontSize.body,
    color: Colors.white,
  },
  comboValue: {
    fontSize: FontSize.h3,
    fontWeight: '700',
    color: Colors.accent,
  },
  sectionHeader: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.white,
  },
  handCards: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  handCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handCardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  handCardTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.white,
  },
  handAccuracy: {
    fontSize: FontSize.h3,
    fontWeight: '700',
  },
  handMeta: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  handDetail: {
    fontSize: FontSize.caption,
    color: Colors.white,
    lineHeight: 18,
  },
  xpCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  xpEarned: {
    fontSize: FontSize.h3,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  xpLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.sm,
  },
  xpBarWrapper: {
    flex: 1,
  },
  xpLevelText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  xpProgress: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  buttonGroup: {
    width: '100%',
    gap: Spacing.md,
  },
  retryButton: {
    width: '100%',
  },
  backButton: {
    width: '100%',
  },
});
