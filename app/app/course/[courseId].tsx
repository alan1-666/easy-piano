import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme';
import { ProgressBar } from '../../src/components/common';
import {
  mockCourses,
  mockUserProgress,
} from '../../src/utils/mockData';

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();

  const course = mockCourses.find((c) => c.id === Number(courseId));
  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>课程未找到</Text>
      </SafeAreaView>
    );
  }

  const completedCount = mockUserProgress.filter(
    (p) => p.status === 'completed'
  ).length;
  const totalLessons = course.lessons.length;
  const progress = totalLessons > 0 ? completedCount / totalLessons : 0;

  function getProgressForLesson(lessonId: number) {
    return mockUserProgress.find((p) => p.lessonId === lessonId);
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return '✅';
      case 'unlocked':
        return '▶️';
      case 'locked':
      default:
        return '🔒';
    }
  }

  function getStatusTextColor(status: string) {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'unlocked':
        return Colors.accent;
      case 'locked':
      default:
        return Colors.textTertiary;
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'teach':
        return '讲解';
      case 'practice':
        return '练习';
      case 'challenge':
        return '挑战';
      default:
        return type;
    }
  }

  function getTypeBadgeColor(type: string) {
    switch (type) {
      case 'teach':
        return Colors.leftHand;
      case 'practice':
        return Colors.rightHand;
      case 'challenge':
        return Colors.accent;
      default:
        return Colors.textSecondary;
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>

        {/* Course Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.levelLabel}>Level {course.level}</Text>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseDesc}>{course.description}</Text>
              <Text style={styles.courseProgress}>
                {completedCount}/{totalLessons} 课完成
              </Text>
              <ProgressBar progress={progress} height={6} />
            </View>
          </View>
        </View>

        {/* Lesson List */}
        <Text style={styles.sectionTitle}>课程内容</Text>
        {course.lessons.map((lesson) => {
          const prog = getProgressForLesson(lesson.id);
          const status = prog?.status ?? 'locked';
          const isLocked = status === 'locked';

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonItem,
                isLocked && styles.lessonItemLocked,
              ]}
              onPress={() => {
                if (!isLocked) {
                  router.push(`/course/lesson/${lesson.id}`);
                }
              }}
              activeOpacity={isLocked ? 1 : 0.7}
            >
              <Text style={styles.lessonIcon}>
                {getStatusIcon(status)}
              </Text>
              <View style={styles.lessonInfo}>
                <View style={styles.lessonTitleRow}>
                  <Text
                    style={[
                      styles.lessonNumber,
                      { color: getStatusTextColor(status) },
                    ]}
                  >
                    {course.level}.{lesson.orderIndex}
                  </Text>
                  <Text
                    style={[
                      styles.lessonTitle,
                      isLocked && styles.lessonTitleLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {lesson.title}
                  </Text>
                </View>
                <View style={styles.lessonMeta}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: getTypeBadgeColor(lesson.type) },
                      isLocked && styles.typeBadgeLocked,
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {getTypeLabel(lesson.type)}
                    </Text>
                  </View>
                  {status === 'completed' && prog?.stars != null && prog.stars > 0 && (
                    <Text style={styles.lessonStars}>
                      {'★'.repeat(prog.stars)}
                      {'☆'.repeat(3 - prog.stars)}
                    </Text>
                  )}
                  {status === 'locked' && (
                    <Text style={styles.lessonLockedText}>未解锁</Text>
                  )}
                  {status === 'unlocked' && (
                    <Text style={styles.lessonUnlockedText}>未完成</Text>
                  )}
                </View>
              </View>
              {!isLocked && (
                <Text style={styles.lessonArrow}>›</Text>
              )}
            </TouchableOpacity>
          );
        })}
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
    paddingBottom: Spacing.xl,
  },
  errorText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
  backButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: FontSize.caption,
    color: Colors.accent,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: FontSize.h3,
    fontWeight: '600',
    color: Colors.white,
    marginTop: Spacing.xs,
  },
  courseDesc: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  courseProgress: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  lessonItemLocked: {
    opacity: 0.5,
  },
  lessonIcon: {
    fontSize: 18,
    marginRight: Spacing.md,
    width: 24,
    textAlign: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  lessonNumber: {
    fontSize: FontSize.caption,
    fontWeight: '600',
  },
  lessonTitle: {
    fontSize: FontSize.body,
    fontWeight: '500',
    color: Colors.white,
    flex: 1,
  },
  lessonTitleLocked: {
    color: Colors.textTertiary,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeLocked: {
    opacity: 0.5,
  },
  typeBadgeText: {
    fontSize: FontSize.small,
    color: Colors.white,
    fontWeight: '600',
  },
  lessonStars: {
    fontSize: FontSize.small,
    color: Colors.accent,
  },
  lessonLockedText: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
  },
  lessonUnlockedText: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
  },
  lessonArrow: {
    fontSize: FontSize.h2,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
});
