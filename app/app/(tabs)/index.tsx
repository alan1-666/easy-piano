import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Flame, ChevronRight, Play, Wifi, Music } from '../../src/components/Icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/theme';
import { ProgressBar } from '../../src/components/common';
import {
  mockUser,
  mockSongs,
  mockStreak,
  mockTodayPracticeMinutes,
  mockDailyGoalMinutes,
  mockWeeklyPractice,
  getGreeting,
  formatDuration,
} from '../../src/utils/mockData';

const SONG_CARD_WIDTH = 140;

export default function HomeScreen() {
  const router = useRouter();
  const quickPlaySongs = mockSongs.slice(0, 5);
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const todayIndex = new Date().getDay();
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
        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <Text style={styles.greeting}>
            {getGreeting()}，{mockUser.username}
          </Text>
          <View style={styles.streakRow}>
            <Flame size={14} color={Colors.warning} />
            <Text style={styles.streak}>连续练习 {mockStreak} 天</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <TouchableOpacity
            style={styles.midiBar}
            onPress={() => router.push('/midi/connect')}
            activeOpacity={0.7}
          >
            <Wifi size={14} color={Colors.textTertiary} />
            <Text style={styles.midiText}>未连接设备</Text>
            <ChevronRight size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() => router.push('/course/1')}
            activeOpacity={0.85}
          >
            <View style={styles.courseCardInner}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleText}>30%</Text>
              </View>
              <View style={styles.courseInfo}>
                <Text style={styles.courseLabel}>当前课程</Text>
                <Text style={styles.courseTitle}>Level 1: 钢琴启蒙</Text>
                <Text style={styles.courseProgress}>3/10 课完成</Text>
                <ProgressBar progress={0.3} height={4} />
              </View>
            </View>
            <View style={styles.continueButton}>
              <Play size={16} color={Colors.bgPrimary} fill={Colors.bgPrimary} />
              <Text style={styles.continueButtonText}>继续学习</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>今日目标</Text>
              <Text style={styles.goalPercent}>
                {Math.round(
                  (mockTodayPracticeMinutes / mockDailyGoalMinutes) * 100
                )}%
              </Text>
            </View>
            <ProgressBar
              progress={mockTodayPracticeMinutes / mockDailyGoalMinutes}
              height={4}
            />
            <Text style={styles.goalText}>
              {mockTodayPracticeMinutes} / {mockDailyGoalMinutes} 分钟
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>快速开始</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/songs')}
              hitSlop={8}
            >
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
                activeOpacity={0.85}
              >
                <View style={styles.songCover}>
                  <Music size={24} color={Colors.textTertiary} />
                </View>
                <View style={styles.songCardBody}>
                  <Text style={styles.songTitle} numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>
                    {song.artist}
                  </Text>
                  <Text style={styles.songDuration}>
                    {formatDuration(song.duration)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyHeader}>
              <Text style={styles.weeklyTitle}>本周练习</Text>
              <Text style={styles.weeklyTotal}>
                {(totalWeekMinutes / 60).toFixed(1)} 小时
              </Text>
            </View>
            <View style={styles.barsContainer}>
              {mockWeeklyPractice.map((minutes, index) => {
                const isToday = index === todayBarIndex;
                return (
                  <View key={index} style={styles.barWrapper}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${Math.max((minutes / maxMinutes) * 100, 4)}%`,
                            backgroundColor: isToday
                              ? Colors.accent
                              : Colors.bgElevated,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.barLabel,
                        isToday && styles.barLabelActive,
                      ]}
                    >
                      {weekDays[index]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  streak: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  midiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    height: 40,
    marginBottom: Spacing.lg,
  },
  midiText: {
    flex: 1,
    fontSize: FontSize.caption,
    color: Colors.textTertiary,
  },
  courseCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  courseCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  progressCircleText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
  },
  courseInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  courseLabel: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  courseTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  courseProgress: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    height: 44,
  },
  continueButtonText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.bgPrimary,
  },
  goalCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  goalTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  goalPercent: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.accent,
  },
  goalText: {
    fontSize: FontSize.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sectionMore: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  songList: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  songListContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  songCard: {
    width: SONG_CARD_WIDTH,
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  songCover: {
    width: SONG_CARD_WIDTH,
    height: 90,
    backgroundColor: Colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songCardBody: {
    padding: Spacing.md,
    gap: 2,
  },
  songTitle: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  songArtist: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
  },
  songDuration: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  weeklyCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  weeklyTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
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
    width: 20,
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: BorderRadius.sm,
    minHeight: 3,
  },
  barLabel: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  barLabelActive: {
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
  },
});
