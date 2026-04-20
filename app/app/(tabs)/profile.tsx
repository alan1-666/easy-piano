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
  IconUser,
  SettingsIcon,
  Chevron,
  LogOutIcon,
  Flame,
} from '../../src/components/Icons';
import { Palette, FontWeight } from '../../src/theme';
import { ProgressBar, Pill, RadialBg } from '../../src/components/common';
import {
  mockUser,
  mockXpToNextLevel,
  mockAchievements,
} from '../../src/utils/mockData';

export default function ProfileScreen() {
  const xpProgress = mockUser.xp / mockXpToNextLevel;

  return (
    <View style={styles.root}>
      <View style={styles.radial} pointerEvents="none">
        <RadialBg from={Palette.primarySoft} to={Palette.bg} cx={0.5} cy={0} rx={0.9} ry={0.6} />
      </View>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400).delay(0)}>
            <View style={styles.headerCard}>
              <View style={styles.avatar}>
                <IconUser size={36} color={Palette.ink2} />
              </View>
              <Text style={styles.username}>{mockUser.username}</Text>
              <Pill bg={Palette.primarySoft} color={Palette.primary} size="sm" style={{ marginTop: 8 }}>
                Lv.{mockUser.level} · 业余琴手
              </Pill>
              <View style={styles.xpRow}>
                <ProgressBar
                  progress={xpProgress}
                  height={6}
                  gradient={[Palette.primary, Palette.lilacInk]}
                  backgroundColor={Palette.chip}
                />
                <Text style={styles.xpText}>
                  {mockUser.xp} / {mockXpToNextLevel} XP
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(60)}>
            <View style={styles.statsRow}>
              <StatCard label="总时长" value="12.5h" tint={Palette.primary} />
              <StatCard label="完成曲目" value="23" tint={Palette.lilacInk} />
              <StatCard label="最长连续" value="15" tint={Palette.mintInk} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(120)}>
            <View style={styles.achievementCard}>
              <View style={styles.achHeader}>
                <Text style={styles.achTitle}>成就</Text>
                <Text style={styles.achCount}>
                  {mockAchievements.filter((a) => !!a.unlockedAt).length} / {mockAchievements.length}
                </Text>
              </View>
              <View style={styles.achGrid}>
                {mockAchievements.map((a) => {
                  const unlocked = !!a.unlockedAt;
                  return (
                    <View key={a.id} style={styles.achItem}>
                      <View
                        style={[
                          styles.achCircle,
                          {
                            backgroundColor: unlocked ? Palette.primarySoft : Palette.chip,
                            opacity: unlocked ? 1 : 0.55,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 22 }}>{a.icon}</Text>
                      </View>
                      <Text
                        style={[
                          styles.achName,
                          { color: unlocked ? Palette.ink : Palette.ink3 },
                        ]}
                        numberOfLines={1}
                      >
                        {a.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(180)}>
            <View style={styles.streakCard}>
              <Flame size={20} color={Palette.primary} />
              <Text style={styles.streakText}>今日已完成练习目标</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(220)}>
            <TouchableOpacity style={styles.row} activeOpacity={0.85}>
              <View style={styles.rowLeft}>
                <SettingsIcon size={18} color={Palette.ink2} />
                <Text style={styles.rowText}>设置</Text>
              </View>
              <Chevron size={14} color={Palette.ink3} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85}>
              <LogOutIcon size={16} color={Palette.coralInk} />
              <Text style={styles.logoutText}>退出登录</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatCard({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: tint }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    paddingTop: 16,
  },
  headerCard: {
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Palette.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.5,
    marginTop: 12,
  },
  xpRow: {
    width: '100%',
    marginTop: 18,
    gap: 6,
  },
  xpText: {
    fontSize: 11,
    color: Palette.ink3,
    textAlign: 'right',
  },
  statsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 18,
    padding: 14,
    alignItems: 'flex-start',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: Palette.ink3,
    fontWeight: FontWeight.medium,
  },
  achievementCard: {
    marginTop: 14,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 24,
    padding: 16,
  },
  achHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  achTitle: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.3,
  },
  achCount: {
    fontSize: 12,
    color: Palette.ink3,
    fontWeight: FontWeight.medium,
  },
  achGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achItem: {
    width: '33.333%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  achCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achName: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  streakCard: {
    marginTop: 14,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakText: {
    fontSize: 13,
    color: Palette.ink2,
    fontWeight: FontWeight.medium,
  },
  row: {
    marginTop: 14,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 14,
    color: Palette.ink,
    fontWeight: FontWeight.semibold,
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    color: Palette.coralInk,
    fontWeight: FontWeight.semibold,
  },
});
