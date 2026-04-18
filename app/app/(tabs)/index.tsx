import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme';
import { ProgressBar } from '../../src/components/common';
import {
  mockUser,
  mockSongs,
  mockStreak,
  mockTodayPracticeMinutes,
  mockDailyGoalMinutes,
  mockWeeklyPractice,
  getGreeting,
  getDifficultyStars,
  formatDuration,
} from '../../src/utils/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SONG_CARD_WIDTH = 120;

export default function HomeScreen() {
  const router = useRouter();
  const quickPlaySongs = mockSongs.slice(0, 5);
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const todayIndex = new Date().getDay();
  // Convert: Sunday=0 -> 6, Monday=1 -> 0, etc.
  const todayBarIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const maxMinutes = Math.max(...mockWeeklyPractice, 1);
  const totalWeekMinutes = mockWeeklyPractice.reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={styles.greeting}>
          {getGreeting()}，{mockUser.username} 👋
        </Text>
        <Text style={styles.streak}>🔥 连续练习 {mockStreak} 天</Text>

        {/* MIDI Status Bar */}
        <TouchableOpacity
          style={styles.midiBar}
          onPress={() => router.push('/midi/connect')}
          activeOpacity={0.7}
        >
          <View style={styles.midiDot} />
          <Text style={styles.midiText}>未连接设备 | 点击连接</Text>
          <Text style={styles.midiArrow}>→</Text>
        </TouchableOpacity>

        {/* Current Course Card */}
        <TouchableOpacity
          style={styles.courseCard}
          onPress={() => router.push('/course/1')}
          activeOpacity={0.7}
        >
          <View style={styles.courseCardInner}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>30%</Text>
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>Level 1: 钢琴启蒙</Text>
              <Text style={styles.courseProgress}>3/10 课完成</Text>
              <View style={styles.courseProgressBarWrapper}>
                <ProgressBar progress={0.3} height={6} />
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/course/1')}
            activeOpacity={0.7}
          >
            <Text style={styles.continueButtonText}>继续学习 →</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Today's Goal */}
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>🎯 今日练习目标</Text>
          <Text style={styles.goalText}>
            已练 {mockTodayPracticeMinutes} 分钟 / 目标{' '}
            {mockDailyGoalMinutes} 分钟
          </Text>
          <ProgressBar
            progress={mockTodayPracticeMinutes / mockDailyGoalMinutes}
            height={8}
          />
          <Text style={styles.goalPercent}>
            {Math.round(
              (mockTodayPracticeMinutes / mockDailyGoalMinutes) * 100
            )}
            %
          </Text>
        </View>

        {/* Quick Play Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>快速开始</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/songs')}>
            <Text style={styles.sectionMore}>查看全部</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.songListContent}
          style={styles.songList}
        >
          {quickPlaySongs.map((song) => (
            <TouchableOpacity
              key={song.id}
              style={styles.songCard}
              onPress={() => router.push(`/game/${song.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.songCover}>
                <Text style={styles.songCoverEmoji}>🎹</Text>
              </View>
              <Text style={styles.songTitle} numberOfLines={1}>
                {song.title}
              </Text>
              <Text style={styles.songDifficulty}>
                {getDifficultyStars(song.difficulty)}
              </Text>
              <Text style={styles.songDuration}>
                {formatDuration(song.duration)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Weekly Stats */}
        <View style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <Text style={styles.weeklyTitle}>📊 本周练习</Text>
            <Text style={styles.weeklyTotal}>
              本周共 {(totalWeekMinutes / 60).toFixed(1)} 小时
            </Text>
          </View>
          <View style={styles.barsContainer}>
            {mockWeeklyPractice.map((minutes, index) => (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max((minutes / maxMinutes) * 100, 4)}%`,
                        backgroundColor:
                          index === todayBarIndex
                            ? Colors.accent
                            : Colors.leftHand,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    index === todayBarIndex && styles.barLabelActive,
                  ]}
                >
                  {weekDays[index]}
                </Text>
              </View>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSize.h2,
    fontWeight: '600',
    color: Colors.white,
    marginTop: Spacing.base,
  },
  streak: {
    fontSize: FontSize.caption,
    color: Colors.accent,
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  midiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 36,
    marginBottom: Spacing.base,
  },
  midiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textDisabled,
    marginRight: Spacing.sm,
  },
  midiText: {
    flex: 1,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  midiArrow: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  courseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  courseCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  progressCircleText: {
    fontSize: FontSize.caption,
    fontWeight: '700',
    color: Colors.accent,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  courseProgress: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  courseProgressBarWrapper: {
    width: '100%',
  },
  continueButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.background,
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  goalTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  goalText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  goalPercent: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
  },
  sectionMore: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  songList: {
    marginHorizontal: -Spacing.base,
    marginBottom: Spacing.base,
  },
  songListContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  songCard: {
    width: SONG_CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  songCover: {
    width: SONG_CARD_WIDTH,
    height: 80,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songCoverEmoji: {
    fontSize: 28,
  },
  songTitle: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  songDifficulty: {
    fontSize: FontSize.small,
    color: Colors.accent,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
  },
  songDuration: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  weeklyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  weeklyTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.white,
  },
  weeklyTotal: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barTrack: {
    flex: 1,
    width: 24,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: BorderRadius.sm,
    minHeight: 3,
  },
  barLabel: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  barLabelActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
