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
import { Chevron, Check } from '../../../src/components/Icons';
import { Palette, FontWeight } from '../../../src/theme';
import { Button, RadialBg } from '../../../src/components/common';
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.errorText}>课时未找到</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.radial} pointerEvents="none">
        <RadialBg from={Palette.primarySoft} to={Palette.bg} cx={0.3} cy={0} rx={0.9} ry={0.5} />
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
            <View style={{ width: 36 }} />
          </View>

          <Text style={styles.levelCaption}>
            Level {lesson.courseId} · 第 {lesson.orderIndex} 课
          </Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDesc}>{lesson.description}</Text>

          <View style={styles.stepperCard}>
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isLast = index === STEPS.length - 1;

              return (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepCol}>
                    <View
                      style={[
                        styles.stepDot,
                        isActive && {
                          backgroundColor: Palette.primary,
                          borderColor: Palette.primary,
                        },
                        isCompleted && {
                          backgroundColor: Palette.mint,
                          borderColor: Palette.mint,
                        },
                      ]}
                    >
                      {isCompleted ? (
                        <Check size={14} color={Palette.mintInk} />
                      ) : (
                        <Text style={styles.stepIconText}>{step.icon}</Text>
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          (isCompleted || isActive) && { backgroundColor: Palette.primary },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isActive && { color: Palette.primary },
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                    {isActive && <Text style={styles.stepCurrent}>当前</Text>}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ marginTop: 8 }}>
            <Button
              variant="primary"
              size="lg"
              block
              onPress={() => {
                if (lesson.songId) {
                  // Pass lessonId through so the result screen can fire
                  // POST /lessons/:id/complete after the song ends.
                  router.push(`/game/${lesson.songId}?lessonId=${lesson.id}`);
                }
              }}
              trailing={<Text style={{ color: '#fff', fontSize: 17, fontWeight: FontWeight.semibold }}>→</Text>}
            >
              开始练习
            </Button>
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
    height: 240,
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
  levelCaption: {
    fontSize: 12,
    color: Palette.ink2,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.7,
    marginTop: 6,
  },
  lessonDesc: {
    fontSize: 14,
    color: Palette.ink2,
    marginTop: 6,
    lineHeight: 20,
  },
  stepperCard: {
    marginTop: 22,
    marginBottom: 16,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 24,
    padding: 18,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepCol: {
    alignItems: 'center',
    width: 36,
    marginRight: 14,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.chip,
    borderWidth: 2,
    borderColor: Palette.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconText: { fontSize: 14 },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: Palette.chip,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 18,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Palette.ink2,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: Palette.ink3,
    lineHeight: 18,
  },
  stepCurrent: {
    fontSize: 11,
    color: Palette.primary,
    fontWeight: FontWeight.bold,
    marginTop: 4,
  },
});
