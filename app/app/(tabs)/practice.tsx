import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme';
import {
  mockPracticeLogs,
  mockWeeklyPractice,
  mockStreak,
  getSongById,
  getDifficultyStars,
} from '../../src/utils/mockData';
import type { PracticeLog } from '../../src/types/user';

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

function getStarsFromScore(score: number): number {
  if (score >= 9000) return 3;
  if (score >= 7000) return 2;
  if (score >= 5000) return 1;
  return 0;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

export default function PracticeScreen() {
  const totalHours = 12.5;
  const songsCompleted = 23;

  const renderPracticeItem = ({ item }: { item: PracticeLog }) => {
    const song = getSongById(item.songId);
    const stars = getStarsFromScore(item.score);
    return (
      <View style={styles.practiceItem}>
        <View style={styles.practiceItemLeft}>
          <Text style={styles.practiceTitle} numberOfLines={1}>
            {song?.title ?? `曲目 #${item.songId}`}
          </Text>
          <Text style={styles.practiceDate}>{formatDate(item.playedAt)}</Text>
        </View>
        <View style={styles.practiceItemRight}>
          <Text style={styles.practiceScore}>{item.score.toLocaleString()}</Text>
          <View style={styles.practiceMetaRow}>
            <Text style={styles.practiceAccuracy}>
              {item.accuracy.toFixed(1)}%
            </Text>
            <Text style={styles.practiceStars}>
              {getDifficultyStars(stars).substring(0, stars + (5 - stars))}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <>
      {/* Stats Overview */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalHours}</Text>
          <Text style={styles.statUnit}>小时</Text>
          <Text style={styles.statLabel}>总练习时长</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{songsCompleted}</Text>
          <Text style={styles.statUnit}>首</Text>
          <Text style={styles.statLabel}>完成曲目</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mockStreak}</Text>
          <Text style={styles.statUnit}>天</Text>
          <Text style={styles.statLabel}>当前连续</Text>
        </View>
      </View>

      {/* Practice Calendar (simplified heat map) */}
      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>本周练习</Text>
        <View style={styles.calendarRow}>
          {weekDays.map((day, index) => {
            const minutes = mockWeeklyPractice[index];
            let opacity = 0.15;
            if (minutes > 0 && minutes < 15) opacity = 0.35;
            else if (minutes >= 15 && minutes < 30) opacity = 0.6;
            else if (minutes >= 30) opacity = 1;
            return (
              <View key={index} style={styles.calendarDayWrapper}>
                <View
                  style={[
                    styles.calendarSquare,
                    {
                      backgroundColor: Colors.leftHand,
                      opacity,
                    },
                  ]}
                />
                <Text style={styles.calendarLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Practice Header */}
      <Text style={styles.sectionTitle}>最近练习记录</Text>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        还没有练习记录，开始你的第一次练习吧！
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.pageTitle}>练习</Text>
      <FlatList
        data={mockPracticeLogs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPracticeItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pageTitle: {
    fontSize: FontSize.h1,
    fontWeight: '700',
    color: Colors.white,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.h2,
    fontWeight: '700',
    color: Colors.white,
  },
  statUnit: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  calendarCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  calendarTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDayWrapper: {
    alignItems: 'center',
  },
  calendarSquare: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
  },
  calendarLabel: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  separator: {
    height: Spacing.sm,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  practiceItemLeft: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
  },
  practiceDate: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  practiceItemRight: {
    alignItems: 'flex-end',
  },
  practiceScore: {
    fontSize: FontSize.h4,
    fontWeight: '700',
    color: Colors.accent,
  },
  practiceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  practiceAccuracy: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  practiceStars: {
    fontSize: FontSize.small,
    color: Colors.accent,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
