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
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Chevron, Play, Lock, Check } from '../../src/components/Icons';
import { Palette, FontWeight } from '../../src/theme';
import { Pill, RadialBg } from '../../src/components/common';
import { mockCourses, mockLessons, mockUserProgress } from '../../src/utils/mockData';
import type { Lesson, UserProgress } from '../../src/types/user';

type LessonState = {
  lesson: Lesson;
  progress?: UserProgress;
  done: boolean;
  current: boolean;
  locked: boolean;
};

function buildLessonStates(): LessonState[] {
  const byId = new Map(mockUserProgress.map((p) => [p.lessonId, p]));
  let foundCurrent = false;
  return mockLessons.map((lesson) => {
    const progress = byId.get(lesson.id);
    const done = progress?.status === 'completed';
    const unlocked = progress?.status === 'unlocked';
    const current = !done && !foundCurrent && (unlocked || progress === undefined);
    if (current) foundCurrent = true;
    return {
      lesson,
      progress,
      done,
      current,
      locked: !done && !current,
    };
  });
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
  const lessonStates = buildLessonStates();
  const level1 = mockCourses[0];
  const level2 = mockCourses[1];
  const level3 = mockCourses[2];
  const doneCount = lessonStates.filter((s) => s.done).length;
  const totalCount = lessonStates.length;
  const pct = doneCount / Math.max(1, totalCount);

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
                    {s.done && s.progress && s.progress.stars > 0 && (
                      <Text style={styles.starRow}>
                        {'★'.repeat(s.progress.stars) + '☆'.repeat(3 - s.progress.stars)}
                      </Text>
                    )}
                    {s.current && <Pill bg={Palette.primary} color="#fff" size="xs">开始</Pill>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(150)}>
            <LockedLevelCard
              level={level2.level}
              title={level2.title}
              meta={`12 课 · 完成 L${level2.level - 1} 解锁`}
              opacity={0.82}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <LockedLevelCard
              level={level3.level}
              title={level3.title}
              meta={`12 课 · 完成 L${level3.level - 1} 解锁`}
              opacity={0.6}
            />
          </Animated.View>
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
});
