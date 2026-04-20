import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Chevron } from '../src/components/Icons';
import { Palette, FontWeight } from '../src/theme';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useMIDIStore } from '../src/stores/midiStore';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useSettingsStore();
  const midiConnected = useMIDIStore(
    (s) => s.connectionStatus === 'connected',
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Chevron size={14} color={Palette.ink} rotate={180} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>设置</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Section title="音频">
            <Row
              label="按键回声"
              caption={
                midiConnected
                  ? '你已连接 MIDI 键盘。如果真琴本身有声音，建议关闭以避免叠加'
                  : '按下虚拟键盘或 MIDI 键时，由 App 合成发声'
              }
              value={settings.keyEcho}
              onValueChange={(v) => settings.updateSettings({ keyEcho: v })}
            />
            <Divider />
            <Row
              label="自动伴奏"
              caption="音符经过判定线时，App 自动奏出目标音。关闭后只在你按键时才有声音"
              value={settings.autoPlay}
              onValueChange={(v) => settings.updateSettings({ autoPlay: v })}
            />
          </Section>

          <Section title="游戏">
            <Row
              label="每日目标（分钟）"
              caption="今日目标进度条的终点"
              value={settings.dailyGoalMin}
              kind="number"
              onNumberChange={(v) => settings.updateSettings({ dailyGoalMin: v })}
            />
            <Divider />
            <Row
              label="下落速度"
              caption="音符从顶部到判定线所需时间的倍率"
              value={settings.fallSpeed}
              kind="number-float"
              onNumberChange={(v) => settings.updateSettings({ fallSpeed: v })}
            />
          </Section>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => settings.reset()}
              style={styles.resetBtn}
            >
              <Text style={styles.resetText}>恢复默认设置</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

type RowProps =
  | {
      label: string;
      caption?: string;
      value: boolean;
      onValueChange: (next: boolean) => void;
      kind?: 'switch';
    }
  | {
      label: string;
      caption?: string;
      value: number;
      onNumberChange: (next: number) => void;
      kind: 'number' | 'number-float';
    };

function Row(props: RowProps) {
  if (props.kind === 'number' || props.kind === 'number-float') {
    const step = props.kind === 'number-float' ? 0.1 : 5;
    const min = props.kind === 'number-float' ? 0.5 : 5;
    const max = props.kind === 'number-float' ? 2.0 : 180;
    const fmt = (v: number) => (props.kind === 'number-float' ? v.toFixed(1) : String(v));
    return (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>{props.label}</Text>
          {props.caption && <Text style={styles.rowCaption}>{props.caption}</Text>}
        </View>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() =>
              props.onNumberChange(Math.max(min, +(props.value - step).toFixed(2)))
            }
          >
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{fmt(props.value)}</Text>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() =>
              props.onNumberChange(Math.min(max, +(props.value + step).toFixed(2)))
            }
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{props.label}</Text>
        {props.caption && <Text style={styles.rowCaption}>{props.caption}</Text>}
      </View>
      <Switch
        value={props.value}
        onValueChange={props.onValueChange}
        trackColor={{ false: Palette.chip, true: Palette.primary }}
        thumbColor="#fff"
        ios_backgroundColor={Palette.chip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.bg },
  topBar: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 20,
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    color: Palette.ink3,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
    letterSpacing: -0.2,
  },
  rowCaption: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 4,
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.line,
    marginLeft: 0,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.chip,
    borderRadius: 999,
    padding: 3,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
  },
  stepperValue: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    marginTop: 18,
    alignItems: 'center',
  },
  resetBtn: { padding: 10 },
  resetText: {
    fontSize: 13,
    color: Palette.coralInk,
    fontWeight: FontWeight.semibold,
  },
});
