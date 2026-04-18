import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme';
import { ProgressBar } from '../../src/components/common';
import {
  mockUser,
  mockXpToNextLevel,
  mockAchievements,
} from '../../src/utils/mockData';

export default function ProfileScreen() {
  const xpProgress = mockUser.xp / mockXpToNextLevel;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.username}>{mockUser.username}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>
                  Lv.{mockUser.level} 业余琴手
                </Text>
              </View>
              <View style={styles.xpRow}>
                <View style={styles.xpBarWrapper}>
                  <ProgressBar
                    progress={xpProgress}
                    height={8}
                    color={Colors.leftHand}
                  />
                </View>
                <Text style={styles.xpText}>
                  {mockUser.xp} / {mockXpToNextLevel} XP
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12.5</Text>
            <Text style={styles.statUnit}>小时</Text>
            <Text style={styles.statLabel}>总练习</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statUnit}>首</Text>
            <Text style={styles.statLabel}>完成曲目</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statUnit}>天</Text>
            <Text style={styles.statLabel}>最长连续</Text>
          </View>
        </View>

        {/* Achievement Section */}
        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>成就</Text>
          <View style={styles.achievementGrid}>
            {mockAchievements.map((achievement) => {
              const isUnlocked = !!achievement.unlockedAt;
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
                    <Text
                      style={[
                        styles.achievementIcon,
                        !isUnlocked && styles.achievementIconLocked,
                      ]}
                    >
                      {isUnlocked ? achievement.icon : '🔒'}
                    </Text>
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

        {/* Settings Entry */}
        <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
          <Text style={styles.settingsText}>设置</Text>
          <Text style={styles.settingsChevron}>›</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
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
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: FontSize.h3,
    fontWeight: '600',
    color: Colors.white,
  },
  levelBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  levelText: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    color: Colors.background,
  },
  xpRow: {
    marginTop: Spacing.sm,
  },
  xpBarWrapper: {
    marginBottom: Spacing.xs,
  },
  xpText: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.h2,
    fontWeight: '700',
    color: Colors.white,
  },
  statUnit: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  achievementCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  achievementTitle: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.md,
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
    borderWidth: 2,
    marginBottom: Spacing.xs,
  },
  achievementUnlocked: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceLight,
  },
  achievementLocked: {
    borderColor: Colors.textDisabled,
    backgroundColor: Colors.surface,
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 20,
  },
  achievementIconLocked: {
    opacity: 0.6,
  },
  achievementName: {
    fontSize: FontSize.small,
    color: Colors.white,
    textAlign: 'center',
  },
  achievementNameLocked: {
    color: Colors.textDisabled,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  settingsText: {
    fontSize: FontSize.h4,
    color: Colors.white,
  },
  settingsChevron: {
    fontSize: FontSize.h2,
    color: Colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: FontSize.h4,
    color: Colors.error,
    fontWeight: '600',
  },
});
