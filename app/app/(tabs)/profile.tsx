import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  User,
  Settings,
  ChevronRight,
  LogOut,
  Award,
  Clock,
  Music,
  Flame,
  Star,
  Target,
  Zap,
  Trophy,
  Heart,
  Headphones,
} from '../../src/components/Icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../src/theme';
import { ProgressBar } from '../../src/components/common';
import {
  mockUser,
  mockXpToNextLevel,
  mockAchievements,
} from '../../src/utils/mockData';

const ACHIEVEMENT_ICONS: Record<string, any> = {
  'first-note': Zap,
  'streak-7': Flame,
  'songs-10': Music,
  'perfect': Star,
  'level-5': Trophy,
  'practice-100': Clock,
  'combo-50': Target,
  'all-stars': Award,
  'marathon': Heart,
};

export default function ProfileScreen() {
  const xpProgress = mockUser.xp / mockXpToNextLevel;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <View style={styles.headerCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={28} color={Colors.textSecondary} />
              </View>
              <View style={styles.levelRing} />
            </View>
            <Text style={styles.username}>{mockUser.username}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                Lv.{mockUser.level} 业余琴手
              </Text>
            </View>
            <View style={styles.xpRow}>
              <ProgressBar
                progress={xpProgress}
                height={4}
                color={Colors.accent}
              />
              <Text style={styles.xpText}>
                {mockUser.xp} / {mockXpToNextLevel} XP
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Clock size={16} color={Colors.accent} />
              <Text style={styles.statValue}>12.5</Text>
              <Text style={styles.statLabel}>总时长(h)</Text>
            </View>
            <View style={styles.statCard}>
              <Music size={16} color={Colors.success} />
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>完成曲目</Text>
            </View>
            <View style={styles.statCard}>
              <Flame size={16} color={Colors.warning} />
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>最长连续</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <View style={styles.achievementCard}>
            <View style={styles.achievementHeader}>
              <Award size={18} color={Colors.textPrimary} />
              <Text style={styles.achievementTitle}>成就</Text>
            </View>
            <View style={styles.achievementGrid}>
              {mockAchievements.map((achievement) => {
                const isUnlocked = !!achievement.unlockedAt;
                const IconComponent =
                  ACHIEVEMENT_ICONS[achievement.id] || Headphones;
                return (
                  <View key={achievement.id} style={styles.achievementItem}>
                    <View
                      style={[
                        styles.achievementCircle,
                        isUnlocked
                          ? styles.achievementUnlocked
                          : styles.achievementLocked,
                      ]}
                    >
                      <IconComponent
                        size={20}
                        color={
                          isUnlocked ? Colors.accent : Colors.textTertiary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.achievementName,
                        !isUnlocked && styles.achievementNameLocked,
                      ]}
                      numberOfLines={1}
                    >
                      {achievement.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.85}>
            <View style={styles.settingsLeft}>
              <Settings size={18} color={Colors.textSecondary} />
              <Text style={styles.settingsText}>设置</Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85}>
            <LogOut size={16} color={Colors.error} />
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  headerCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  username: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  levelBadge: {
    backgroundColor: Colors.bgTertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  levelText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    color: Colors.accent,
  },
  xpRow: {
    width: '100%',
    marginTop: Spacing.base,
    gap: Spacing.xs,
  },
  xpText: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
    textAlign: 'right',
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
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.small,
    color: Colors.textTertiary,
  },
  achievementCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  achievementTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  achievementCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: Spacing.xs,
  },
  achievementUnlocked: {
    borderColor: Colors.accent,
    backgroundColor: Colors.bgTertiary,
  },
  achievementLocked: {
    borderColor: Colors.border,
    backgroundColor: Colors.bgSecondary,
    opacity: 0.5,
  },
  achievementName: {
    fontSize: FontSize.small,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  achievementNameLocked: {
    color: Colors.textTertiary,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingsText: {
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
  },
  logoutText: {
    fontSize: FontSize.body,
    color: Colors.error,
    fontWeight: FontWeight.medium,
  },
});
