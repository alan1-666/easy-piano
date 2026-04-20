import React, { useMemo } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { Flame, Chevron, Play, WifiIcon } from '../../src/components/Icons';
import { Palette, FontWeight } from '../../src/theme';
import { ProgressBar, RadialBg } from '../../src/components/common';
import { mockDailyGoalMinutes, getGreeting, formatDuration } from '../../src/utils/mockData';
import { songHue } from '../../src/utils/songColors';
import { useUserStore } from '../../src/stores/userStore';
import { getMyStats, getMyProgress } from '../../src/api/users';
import { getSongs } from '../../src/api/songs';
import { getCourses, getLessons } from '../../src/api/courses';
import { getHistory } from '../../src/api/practice';

export default function HomeScreen() {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const user = useUserStore((s) => s.user);

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: getMyStats,
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  const songsQuery = useQuery({
    queryKey: ['songs', null, ''],
    queryFn: () => getSongs(1, 5),
    enabled: isLoggedIn,
    staleTime: 60_000,
  });

  const historyQuery = useQuery({
    queryKey: ['history', 1, 50],
    queryFn: () => getHistory(1, 50),
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
    enabled: isLoggedIn,
    staleTime: 60_000,
  });

  const progressQuery = useQuery({
    queryKey: ['progress'],
    queryFn: getMyProgress,
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  // "Current course" picks the lowest-level course that isn't fully
  // complete. The lesson list for that course feeds the "3/10 完成" +
  // "下一课" copy.
  const sortedCourses = (coursesQuery.data ?? []).slice().sort((a, b) => a.level - b.level);
  const activeCourse = sortedCourses[0]; // Level 1 for brand-new users

  const activeCourseLessonsQuery = useQuery({
    queryKey: ['lessons', activeCourse?.id],
    queryFn: () => (activeCourse ? getLessons(activeCourse.id) : Promise.resolve([])),
    enabled: !!activeCourse,
    staleTime: 60_000,
  });

  const activeLessons = activeCourseLessonsQuery.data ?? [];
  const progress = progressQuery.data ?? [];
  const progressById = new Map(progress.map((p) => [p.lessonId, p]));
  const completedLessonCount = activeLessons.filter(
    (l) => progressById.get(l.id)?.status === 'completed',
  ).length;
  const nextLesson = activeLessons.find(
    (l) => progressById.get(l.id)?.status !== 'completed',
  );
  const courseProgressPct =
    activeLessons.length > 0 ? completedLessonCount / activeLessons.length : 0;

  const quickPlaySongs = (songsQuery.data?.items ?? []).slice(0, 5);
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const todayIndex = new Date().getDay();
  const todayBarIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  // Derive weekly minutes from history client-side. The backend doesn't
  // expose a weekly-aggregated endpoint, so we bin recent logs into
  // Mon..Sun ourselves. This is good enough for the home dashboard.
  const { weeklyMinutes, todayMinutes } = useMemo(() => {
    const bins = [0, 0, 0, 0, 0, 0, 0];
    let today = 0;
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    // Beginning of this week (Monday at 00:00 local).
    const monday = new Date(now);
    const dow = (now.getDay() + 6) % 7; // Mon=0..Sun=6
    monday.setDate(now.getDate() - dow);
    monday.setHours(0, 0, 0, 0);
    for (const log of historyQuery.data?.items ?? []) {
      const played = new Date(log.playedAt);
      if (played < monday) continue;
      const idx = (played.getDay() + 6) % 7;
      const minutes = Math.round(log.duration / 60);
      bins[idx] += minutes;
      if (played.toISOString().slice(0, 10) === todayKey) today += minutes;
    }
    return { weeklyMinutes: bins, todayMinutes: today };
  }, [historyQuery.data]);

  const maxMinutes = Math.max(...weeklyMinutes, 1);
  const totalWeekMinutes = weeklyMinutes.reduce((a, b) => a + b, 0);
  const goalPct = Math.min(1, todayMinutes / mockDailyGoalMinutes);
  const streak = statsQuery.data?.currentStreak ?? 0;
  const username = user?.username ?? '钢琴学习者';

  return (
    <View style={styles.root}>
      <View style={styles.radialWrap} pointerEvents="none">
        <RadialBg from={Palette.primarySoft} to={Palette.bg} cx={0.3} cy={0} rx={0.9} ry={0.7} />
      </View>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400).delay(0)}>
            <Text style={styles.greetingSmall}>{getGreeting()}</Text>
            <Text style={styles.greetingBig}>{username}</Text>
            <View style={styles.streakRow}>
              <Flame size={14} color={Palette.primary} />
              <Text style={styles.streak}>连续练习 {streak} 天</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(50)}>
            <TouchableOpacity
              style={styles.midiBar}
              onPress={() => router.push('/midi/connect')}
              activeOpacity={0.85}
            >
              <View style={styles.midiIconWrap}>
                <WifiIcon size={14} color={Palette.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.midiTitle}>未连接设备</Text>
                <Text style={styles.midiSubtitle}>点击配对你的电钢琴</Text>
              </View>
              <Chevron size={14} color={Palette.ink3} />
            </TouchableOpacity>
          </Animated.View>

          {activeCourse && (
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <TouchableOpacity
                style={styles.courseCard}
                onPress={() => {
                  if (nextLesson) {
                    router.push(`/course/lesson/${nextLesson.id}`);
                  } else {
                    router.push(`/course/${activeCourse.id}`);
                  }
                }}
                activeOpacity={0.92}
              >
                <View style={styles.courseGlow} pointerEvents="none">
                  <RadialBg from={Palette.primary} to="transparent" cx={1} cy={0} rx={0.7} ry={0.7} />
                </View>
                <Text style={styles.courseLabel}>当前课程</Text>
                <Text style={styles.courseTitle}>
                  Level {activeCourse.level} · {activeCourse.title}
                </Text>
                <Text style={styles.courseProgress}>
                  {completedLessonCount}/{activeLessons.length} 课完成
                </Text>
                <View style={{ marginTop: 16 }}>
                  <ProgressBar
                    progress={courseProgressPct}
                    height={6}
                    color={Palette.primary}
                    backgroundColor="rgba(255,255,255,0.14)"
                  />
                </View>
                <View style={styles.courseFoot}>
                  <Text style={styles.courseNext} numberOfLines={1}>
                    {nextLesson
                      ? `下一课：${nextLesson.title}`
                      : '已完成所有课时 🎉'}
                  </Text>
                  <View style={styles.courseCta}>
                    <Play size={11} color="#fff" />
                    <Text style={styles.courseCtaText}>
                      {nextLesson ? '继续' : '复习'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.duration(400).delay(150)}>
            <View style={styles.goalCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>今日目标</Text>
                <Text style={styles.goalPercent}>{Math.round(goalPct * 100)}%</Text>
              </View>
              <View style={{ marginTop: 10 }}>
                <ProgressBar
                  progress={goalPct}
                  height={8}
                  gradient={[Palette.primary, Palette.lilacInk]}
                  backgroundColor={Palette.chip}
                />
              </View>
              <Text style={styles.goalText}>
                {todayMinutes} / {mockDailyGoalMinutes} 分钟
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <View style={[styles.rowBetween, { marginTop: 22, marginBottom: 12 }]}>
              <Text style={styles.sectionTitle}>快速开始</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/songs')} hitSlop={8}>
                <Text style={styles.sectionMore}>全部 →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScrollContent}
              style={styles.hScroll}
            >
              {quickPlaySongs.map((song) => {
                const { hue, ink } = songHue(song.id);
                return (
                  <TouchableOpacity
                    key={song.id}
                    style={styles.songCard}
                    onPress={() => router.push(`/game/${song.id}`)}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.songCover, { backgroundColor: hue }]}>
                      <View style={styles.playDot}>
                        <Play size={12} color={Palette.ink} />
                      </View>
                      <Text style={[styles.songDiffStars, { color: ink }]}>
                        {stars(song.difficulty)}
                      </Text>
                    </View>
                    <View style={styles.songBody}>
                      <Text style={styles.songTitle} numberOfLines={1}>
                        {song.title}
                      </Text>
                      <Text style={styles.songMeta} numberOfLines={1}>
                        {song.artist} · {formatDuration(song.duration)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(250)}>
            <View style={styles.weeklyCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>本周练习</Text>
                <Text style={styles.weeklyTotal}>
                  {(totalWeekMinutes / 60).toFixed(1)} 小时
                </Text>
              </View>
              <View style={styles.barsContainer}>
                {weeklyMinutes.map((minutes, index) => {
                  const isToday = index === todayBarIndex;
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${Math.max((minutes / maxMinutes) * 100, 4)}%`,
                              backgroundColor: isToday ? Palette.primary : Palette.chip,
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
    </View>
  );
}

const stars = (d: number) => '●'.repeat(d) + '○'.repeat(Math.max(0, 5 - d));

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  radialWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  greetingSmall: {
    fontSize: 13,
    color: Palette.ink2,
    fontWeight: FontWeight.medium,
    marginTop: 12,
  },
  greetingBig: {
    fontSize: 30,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -1,
    marginTop: 2,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  streak: {
    fontSize: 13,
    color: Palette.ink2,
    fontWeight: FontWeight.medium,
  },
  midiBar: {
    marginTop: 18,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  midiIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  midiTitle: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
  },
  midiSubtitle: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 1,
  },
  courseCard: {
    marginTop: 14,
    backgroundColor: Palette.ink,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  courseGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    opacity: 0.5,
  },
  courseLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
    fontWeight: FontWeight.semibold,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  courseProgress: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  courseFoot: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseNext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
    marginRight: 8,
  },
  courseCta: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseCtaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: FontWeight.semibold,
  },
  goalCard: {
    marginTop: 14,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 20,
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
  },
  goalPercent: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Palette.primary,
  },
  goalText: {
    marginTop: 8,
    fontSize: 12,
    color: Palette.ink3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.3,
  },
  sectionMore: {
    fontSize: 13,
    color: Palette.ink2,
    fontWeight: FontWeight.medium,
  },
  hScroll: {
    marginHorizontal: -20,
  },
  hScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  songCard: {
    width: 150,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 18,
    overflow: 'hidden',
  },
  songCover: {
    height: 96,
    padding: 10,
    justifyContent: 'flex-end',
  },
  playDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  songDiffStars: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  songBody: {
    padding: 12,
  },
  songTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.2,
  },
  songMeta: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 2,
  },
  weeklyCard: {
    marginTop: 18,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 20,
    padding: 16,
  },
  weeklyTotal: {
    fontSize: 13,
    color: Palette.ink2,
  },
  barsContainer: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 72,
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    gap: 6,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 3,
  },
  barLabel: {
    fontSize: 10,
    color: Palette.ink3,
    fontWeight: FontWeight.medium,
  },
  barLabelActive: {
    color: Palette.primary,
    fontWeight: FontWeight.bold,
  },
});
