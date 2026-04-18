import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme';
import { Button, ProgressBar } from '../../src/components/common';
import { mockUser, mockXpToNextLevel } from '../../src/utils/mockData';

// Mock result data
const mockResult = {
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
};

function getRank(score: number): { letter: string; color: string } {
  if (score >= 9500) return { letter: 'S', color: Colors.accent };
  if (score >= 8000) return { letter: 'A', color: Colors.leftHand };
  if (score >= 6000) return { letter: 'B', color: Colors.rightHand };
  return { letter: 'C', color: Colors.textSecondary };
}

export default function GameResultScreen() {
  const router = useRouter();
  const rank = getRank(mockResult.score);

  const totalNotes =
    mockResult.perfectCount +
    mockResult.greatCount +
    mockResult.goodCount +
    mockResult.missCount;

  const xpAfter = mockUser.xp + mockResult.xpEarned;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.completedTitle}>演奏完成！</Text>
        <Text style={styles.songInfo}>
          {mockResult.songTitle} - {mockResult.artist}
        </Text>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3].map((star) => (
            <Text
              key={star}
              style={[
                styles.star,
                star === 2 && styles.starCenter,
                star <= mockResult.stars
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
          {mockResult.score.toLocaleString()}
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
              {mockResult.perfectCount}
            </Text>
            <View
              style={[
                styles.statBar,
                {
                  backgroundColor: Colors.perfect,
                  width: `${(mockResult.perfectCount / totalNotes) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: Colors.great }]}>
              Great
            </Text>
            <Text style={[styles.statNumber, { color: Colors.great }]}>
              {mockResult.greatCount}
            </Text>
            <View
              style={[
                styles.statBar,
                {
                  backgroundColor: Colors.great,
                  width: `${(mockResult.greatCount / totalNotes) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: Colors.good }]}>
              Good
            </Text>
            <Text style={[styles.statNumber, { color: Colors.good }]}>
              {mockResult.goodCount}
            </Text>
            <View
              style={[
                styles.statBar,
                {
                  backgroundColor: Colors.good,
                  width: `${(mockResult.goodCount / totalNotes) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: Colors.miss }]}>
              Miss
            </Text>
            <Text style={[styles.statNumber, { color: Colors.miss }]}>
              {mockResult.missCount}
            </Text>
            <View
              style={[
                styles.statBar,
                {
                  backgroundColor: Colors.miss,
                  width: `${(mockResult.missCount / totalNotes) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Max Combo */}
        <View style={styles.comboCard}>
          <Text style={styles.comboLabel}>🔥 最大连击</Text>
          <Text style={styles.comboValue}>{mockResult.maxCombo}x</Text>
        </View>

        {/* XP Earned */}
        <View style={styles.xpCard}>
          <Text style={styles.xpEarned}>+{mockResult.xpEarned} XP</Text>
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
            onPress={() => router.back()}
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
    color: Colors.textDisabled,
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
