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
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { Chevron, Play } from '../../src/components/Icons';
import { Palette, FontWeight } from '../../src/theme';
import { Pill, RadialBg } from '../../src/components/common';
import { getCourses, getLessons } from '../../src/api/courses';

const TYPE_LABELS: Record<string, string> = {
  teach: '讲解',
  practice: '练习',
  challenge: '挑战',
};

const TYPE_COLORS: Record<string, { bg: string; ink: string }> = {
  teach: { bg: Palette.lilac, ink: Palette.lilacInk },
  practice: { bg: Palette.mint, ink: Palette.mintInk },
  challenge: { bg: Palette.primarySoft, ink: Palette.primary },
};

function RadialProgress({ pct }: { pct: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
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
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <SvgText x={26} y={30} textAnchor="middle" fontSize={12} fontWeight="700" fill={Palette.primary}>
        {`${Math.round(pct * 100)}%`}
      </SvgText>
    </Svg>
  );
}

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const id = Number(courseId);

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
    staleTime: 60_000,
  });

  const lessonsQuery = useQuery({
    queryKey: ['lessons', id],
    queryFn: () => getLessons(id),
    enabled: Number.isFinite(id),
    staleTime: 60_000,
  });

  const course = coursesQuery.data?.find((c) => c.id === id);
  const lessons = lessonsQuery.data ?? [];

  if (coursesQuery.isLoading || lessonsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={Palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.errorText}>课程未找到</Text>
      </SafeAreaView>
    );
  }

  const totalLessons = lessons.length;
  // No backend progress endpoint yet — display 0% until that's wired.
  const completedCount = 0;
  const progress = totalLessons > 0 ? completedCount / totalLessons : 0;

  return (
    <View style={styles.root}>
      <View style={styles.radial} pointerEvents="none">
        <RadialBg from={Palette.primarySoft} to={Palette.bg} cx={0.3} cy={0} rx={0.9} ry={0.6} />
      </View>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Chevron size={14} color={Palette.ink} rotate={180} />
            </TouchableOpacity>
            <Text style={styles.topTitle}>课程详情</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <RadialProgress pct={progress} />
              <View style={{ flex: 1 }}>
                <Text style={styles.levelTag}>LEVEL {course.level}</Text>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseDesc}>{course.description}</Text>
              </View>
            </View>
            <Text style={styles.courseProgress}>
              {completedCount} / {totalLessons} 课完成
            </Text>
          </View>

          <Text style={styles.sectionTitle}>课程内容</Text>

          <View style={styles.lessonList}>
            {lessons.map((lesson, idx) => {
              // Until /progress endpoint exists, treat the first lesson as
              // current and the rest as plain unlocked. Nothing is shown
              // as completed.
              const isCurrent = idx === 0;
              const tone = TYPE_COLORS[lesson.type] ?? TYPE_COLORS.practice;

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonItem,
                    isCurrent && styles.lessonItemCurrent,
                  ]}
                  onPress={() => router.push(`/course/lesson/${lesson.id}`)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.lessonDot,
                      { backgroundColor: isCurrent ? Palette.primary : Palette.chip },
                    ]}
                  >
                    {isCurrent ? (
                      <Play size={10} color="#fff" />
                    ) : (
                      <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, color: Palette.ink3 }}>
                        {lesson.orderIndex}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.lessonTitle} numberOfLines={1}>
                      {course.level}.{lesson.orderIndex} {lesson.title}
                    </Text>
                    <View style={styles.lessonMeta}>
                      <Pill bg={tone.bg} color={tone.ink} size="xs">
                        {TYPE_LABELS[lesson.type] ?? lesson.type}
                      </Pill>
                    </View>
                  </View>

                  <Chevron size={14} color={Palette.ink3} />
                </TouchableOpacity>
              );
            })}
          </View>
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
    height: 280,
  },
  container: { flex: 1, backgroundColor: Palette.bg },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 15,
    color: Palette.ink2,
    textAlign: 'center',
    marginTop: 80,
  },
  topBar: {
    marginTop: 8,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
    letterSpacing: -0.3,
  },
  headerCard: {
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 24,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  levelTag: {
    fontSize: 10,
    color: Palette.ink3,
    letterSpacing: 1,
    fontWeight: FontWeight.bold,
  },
  courseTitle: {
    fontSize: 19,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  courseDesc: {
    fontSize: 12,
    color: Palette.ink2,
    marginTop: 4,
  },
  courseProgress: {
    fontSize: 12,
    color: Palette.ink3,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.3,
    marginTop: 24,
    marginBottom: 10,
  },
  lessonList: {
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 8,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  lessonItemCurrent: {
    backgroundColor: Palette.primarySoft,
  },
  lessonDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
    letterSpacing: -0.1,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  lessonStars: {
    fontSize: 11,
    color: Palette.sunInk,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  lessonStateText: {
    fontSize: 11,
    color: Palette.ink3,
  },
});
