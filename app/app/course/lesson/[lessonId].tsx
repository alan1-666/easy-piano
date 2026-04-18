import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../src/theme';
import { Button } from '../../../src/components/common';
import { mockLessons } from '../../../src/utils/mockData';

interface StepInfo {
  icon: string;
  title: string;
  description: string;
}

const STEPS: StepInfo[] = [
  { icon: '📖', title: '知识讲解', description: '学习本课的核心知识点' },
  { icon: '▶️', title: '示范演奏', description: '观看示范演奏' },
  { icon: '🎹', title: '跟弹练习', description: '在等待模式下跟着练习' },
  { icon: '⭐', title: '挑战关卡', description: '标准模式评分，1星通关' },
];

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const [currentStep] = useState(0);

  const lesson = mockLessons.find((l) => l.id === Number(lessonId));

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>课时未找到</Text>
      </SafeAreaView>
    );
  }

  const course = lesson.courseId;

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

        {/* Lesson Title */}
        <Text style={styles.levelCaption}>
          Level {course} · 第 {lesson.orderIndex} 课
        </Text>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDesc}>{lesson.description}</Text>

        {/* Step Stepper */}
        <View style={styles.stepperCard}>
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isLast = index === STEPS.length - 1;

            return (
              <View key={index}>
                <View style={styles.stepRow}>
                  {/* Step Indicator */}
                  <View style={styles.stepIndicatorColumn}>
                    <View
                      style={[
                        styles.stepDot,
                        isActive && styles.stepDotActive,
                        isCompleted && styles.stepDotCompleted,
                      ]}
                    >
                      <Text style={styles.stepDotText}>
                        {isCompleted ? '✓' : step.icon}
                      </Text>
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          (isCompleted || isActive) &&
                            styles.stepLineActive,
                        ]}
                      />
                    )}
                  </View>

                  {/* Step Content */}
                  <View
                    style={[
                      styles.stepContent,
                      isActive && styles.stepContentActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepTitle,
                        isActive && styles.stepTitleActive,
                      ]}
                    >
                      {step.icon} {step.title}
                    </Text>
                    <Text style={styles.stepDescription}>
                      {step.description}
                    </Text>
                    {isActive && (
                      <Text style={styles.stepCurrent}>← 当前</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Start Button */}
        <Button
          title="开始练习 →"
          onPress={() => {
            if (lesson.songId) {
              router.push(`/game/${lesson.songId}`);
            }
          }}
          style={styles.startButton}
        />
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
  levelCaption: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  lessonTitle: {
    fontSize: FontSize.h2,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  lessonDesc: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  stepperCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepIndicatorColumn: {
    alignItems: 'center',
    width: 36,
    marginRight: Spacing.md,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
  stepDotActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceLight,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepDotText: {
    fontSize: 14,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: Colors.surfaceLight,
  },
  stepLineActive: {
    backgroundColor: Colors.accent,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing.base,
  },
  stepContentActive: {
    opacity: 1,
  },
  stepTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  stepTitleActive: {
    color: Colors.accent,
  },
  stepDescription: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  stepCurrent: {
    fontSize: FontSize.small,
    color: Colors.accent,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  startButton: {
    marginTop: Spacing.sm,
  },
});
