import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { Chevron, Play, Lock, Check } from '../../src/components/Icons';
import { Palette, FontWeight } from '../../src/theme';
import { Pill, RadialBg } from '../../src/components/common';
import { getCourses, getLessons } from '../../src/api/courses';
import { useUserStore } from '../../src/stores/userStore';
import type { Lesson, Course } from '../../src/types/user';

// Until the backend exposes a per-user progress endpoint, treat the first
// lesson of an active level as "current" and everything else as unlocked.
// Nothing is shown as completed — that prevents lying to the user.
type LessonState = {
  lesson: Lesson;
  done: boolean;
  current: boolean;
  locked: boolean;
};

function buildLessonStates(lessons: Lesson[]): LessonState[] {
  return lessons.map((lesson, idx) => ({
    lesson,
    done: false,
    current: idx === 0,
    locked: false,
  }));
}

function RadialProgress({ pct }: { pct: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <Svg width={52} height={52} viewBox="0 0 52 52">
      <Circle cx={26} cy={26} r={r} stroke={Palette.chip} strokeWidth={4} fill="none" />
      <Circle
        cx={26}
        cy={26}
        r={r}
        stroke={Palette.primary}
        strokeWidth={4}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <SvgText
        x={26}
        y={30}
        textAnchor="middle"
        fontSize={12}
        fontWeight="700"
        fill={Palette.primary}
      >
        {`${Math.round(pct * 100)}%`}
      </SvgText>
    </Svg>
  );
}

export default function CoursesScreen() {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
    enabled: isLoggedIn,
    staleTime: 60_000,
  });

  const courses: Course[] = coursesQuery.data ?? [];
  const sortedCourses = [...courses].sort((a, b) => a.level - b.level);
  const level1 = sortedCourses[0];
  const level2 = sortedCourses[1];
  const level3 = sortedCourses[2];

  const lessonsQuery = useQuery({
    queryKey: ['lessons', level1?.id],
    queryFn: () => (level1 ? getLessons(level1.id) : Promise.resolve([])),
    enabled: !!level1,
    staleTime: 60_000,
  });

  const lessons = lessonsQuery.data ?? [];
  const lessonStates = buildLessonStates(lessons);
  const totalCount = lessons.length;
  const doneCount = lessonStates.filter((s) => s.done).length;
  const pct = doneCount / Math.max(1, totalCount);

  if (!isLoggedIn) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.gateContainer}>
            <Text style={styles.gateTitle}>请先登录</Text>
            <Text style={styles.gateSubtitle}>登录后查看你的学习路径</Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.gateLink}>去登录 →</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (coursesQuery.isLoading || !level1) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.gateContainer}>
            <ActivityIndicator size="small" color={Palette.primary} />
            <Text style={[styles.gateSubtitle, { marginTop: 10 }]}>
              {coursesQuery.isError ? '加载失败' : '加载课程…'}
            </Text>
            {coursesQuery.isError && (
              <TouchableOpacity onPress={() => coursesQuery.refetch()}>
                <Text style={styles.gateLink}>重试</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.radial} pointerEvents="none">
        <RadialBg from={Palette.lilac} to={Palette.bg} cx={1} cy={0} rx={0.9} ry={0.7} />
      </View>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400).delay(0)}>
            <Text style={styles.pageTitle}>学习路径</Text>
            <Text style={styles.pageSubtitle}>系统化的钢琴课程 · 从零到进阶</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <RadialProgress pct={pct} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.levelTag}>LEVEL {level1.level}</Text>
                  <Text style={styles.levelTitle}>{level1.title}</Text>
                  <Text style={styles.levelMeta}>
                    {totalCount} 课 · {doneCount} / {totalCount} 完成
                  </Text>
                </View>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => router.push(`/course/${level1.id}`)}
                >
                  <Chevron size={14} color={Palette.ink3} />
                </TouchableOpacity>
              </View>
              <View style={styles.lessonsList}>
                {lessonStates.map((s) => (
                  <TouchableOpacity
                    key={s.lesson.id}
                    style={[styles.lessonRow, s.current && styles.lessonRowCurrent]}
                    activeOpacity={s.locked ? 1 : 0.85}
                    disabled={s.locked}
                    onPress={() => {
                      if (!s.locked) router.push(`/course/lesson/${s.lesson.id}`);
                    }}
                  >
                    <View
                      style={[
                        styles.lessonDot,
                        s.done && { backgroundColor: Palette.mint },
                        s.current && { backgroundColor: Palette.primary },
                        s.locked && { backgroundColor: Palette.chip },
                      ]}
                    >
                      {s.done && <Check size={12} color={Palette.mintInk} />}
                      {s.current && <Play size={10} color="#fff" />}
                      {s.locked && <Lock size={11} color={Palette.ink3} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.lessonText,
                          s.locked && { color: Palette.ink3 },
                        ]}
                      >
                        {level1.level}.{s.lesson.orderIndex} {s.lesson.title}
                      </Text>
                    </View>
                    {s.current && <Pill bg={Palette.primary} color="#fff" size="xs">开始</Pill>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {level2 && (
            <Animated.View entering={FadeInDown.duration(400).delay(150)}>
              <LockedLevelCard
                level={level2.level}
                title={level2.title}
                meta={`完成 L${level2.level - 1} 解锁`}
                opacity={0.82}
              />
            </Animated.View>
          )}

          {level3 && (
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <LockedLevelCard
                level={level3.level}
                title={level3.title}
                meta={`完成 L${level3.level - 1} 解锁`}
                opacity={0.6}
              />
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function LockedLevelCard({
  level,
  title,
  meta,
  opacity,
}: {
  level: number;
  title: string;
  meta: string;
  opacity: number;
}) {
  return (
    <View style={[styles.lockedCard, { opacity }]}>
      <View style={styles.lockedIconWrap}>
        <Lock size={18} color={Palette.ink3} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.levelTag}>LEVEL {level}</Text>
        <Text style={styles.levelTitle}>{title}</Text>
        <Text style={styles.levelMeta}>{meta}</Text>
      </View>
      <Chevron size={14} color={Palette.ink3} />
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
    height: 280,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 10,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -1,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Palette.ink2,
    marginTop: 4,
  },
  levelCard: {
    marginTop: 18,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 24,
    overflow: 'hidden',
  },
  levelHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.line,
  },
  levelTag: {
    fontSize: 10,
    color: Palette.ink3,
    letterSpacing: 1,
    fontWeight: FontWeight.bold,
  },
  levelTitle: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  levelMeta: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 2,
  },
  lessonsList: {
    padding: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  lessonRowCurrent: {
    backgroundColor: Palette.primarySoft,
  },
  lessonDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonText: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
    letterSpacing: -0.1,
  },
  starRow: {
    fontSize: 11,
    color: Palette.sunInk,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  lockedCard: {
    marginTop: 12,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  lockedIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  gateTitle: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.5,
  },
  gateSubtitle: {
    fontSize: 13,
    color: Palette.ink2,
  },
  gateLink: {
    marginTop: 14,
    fontSize: 14,
    color: Palette.primary,
    fontWeight: FontWeight.semibold,
  },
});
