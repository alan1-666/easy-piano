import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Clock, Music, Flame, TrendingUp } from '../../src/components/Icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/theme';
import {
  mockPracticeLogs,
  mockWeeklyPractice,
  mockStreak,
  getSongById,
} from '../../src/utils/mockData';
import type { PracticeLog } from '../../src/types/user';

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

function getRankLetter(score: number): { letter: string; color: string } {
  if (score >= 9000) return { letter: 'S', color: Colors.accent };
  if (score >= 7000) return { letter: 'A', color: Colors.success };
  if (score >= 5000) return { letter: 'B', color: Colors.warning };
  return { letter: 'C', color: Colors.textSecondary };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function PracticeScreen() {
  const totalHours = 12.5;
  const songsCompleted = 23;

  const renderPracticeItem = ({ item, index }: { item: PracticeLog; index: number }) => {
    const song = getSongById(item.songId);
    const rank = getRankLetter(item.score);
    return (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 30)}>
        <View style={styles.practiceItem}>
          <View style={[styles.rankCircle, { borderColor: rank.color }]}>
            <Text style={[styles.rankText, { color: rank.color }]}>
              {rank.letter}
            </Text>
          </View>
          <View style={styles.practiceItemCenter}>
            <Text style={styles.practiceTitle} numberOfLines={1}>
              {song?.title ?? `曲目 #${item.songId}`}
            </Text>
            <Text style={styles.practiceDate}>{formatDate(item.playedAt)}</Text>
          </View>
          <View style={styles.practiceItemRight}>
            <Text style={styles.practiceScore}>
              {item.score.toLocaleString()}
            </Text>
            <Text style={styles.practiceAccuracy}>
              {item.accuracy.toFixed(1)}%
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <>
      <Animated.View entering={FadeInDown.duration(400).delay(0)}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Clock size={18} color={Colors.accent} />
            <Text style={styles.statValue}>{totalHours}</Text>
            <Text style={styles.statLabel}>总时长(h)</Text>
          </View>
          <View style={styles.statCard}>
            <Music size={18} color={Colors.success} />
            <Text style={styles.statValue}>{songsCompleted}</Text>
            <Text style={styles.statLabel}>完成曲目</Text>
          </View>
          <View style={styles.statCard}>
            <Flame size={18} color={Colors.warning} />
            <Text style={styles.statValue}>{mockStreak}</Text>
            <Text style={styles.statLabel}>连续天数</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(50)}>
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>本周练习</Text>
          <View style={styles.calendarRow}>
            {weekDays.map((day, index) => {
              const minutes = mockWeeklyPractice[index];
              let opacity = 0.08;
              if (minutes > 0 && minutes < 15) opacity = 0.25;
              else if (minutes >= 15 && minutes < 30) opacity = 0.5;
              else if (minutes >= 30) opacity = 0.85;
              return (
                <View key={index} style={styles.calendarDayWrapper}>
                  <View
                    style={[
                      styles.calendarSquare,
                      { backgroundColor: Colors.accent, opacity },
                    ]}
                  />
                  <Text style={styles.calendarLabel}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={16} color={Colors.textSecondary} />
          <Text style={styles.sectionTitle}>最近练习</Text>
        </View>
      </Animated.View>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Music size={40} color={Colors.textTertiary} />
      <Text style={styles.emptyText}>
        还没有练习记录，开始第一次练习吧
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
    backgroundColor: Colors.bgPrimary,
  },
  pageTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.base,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
  },
  calendarCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  calendarTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDayWrapper: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  calendarSquare: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
  },
  calendarLabel: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  separator: {
    height: Spacing.sm,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
  },
  practiceItemCenter: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  practiceDate: {
    fontSize: FontSize.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  practiceItemRight: {
    alignItems: 'flex-end',
  },
  practiceScore: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  practiceAccuracy: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl * 2,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
