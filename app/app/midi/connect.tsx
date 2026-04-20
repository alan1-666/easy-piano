import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Pill } from '../../src/components/common';
import { Chevron, Lock } from '../../src/components/Icons';
import { useMIDI } from '../../src/hooks/useMIDI';
import { initializeNativeMIDIBridge } from '../../src/services/midi/nativeMIDI';
import { Palette, FontWeight } from '../../src/theme';
import type { MIDIDevice } from '../../src/types/midi';

function formatDeviceType(device: MIDIDevice) {
  return device.type === 'bluetooth' ? '蓝牙 MIDI' : 'USB MIDI';
}

function formatNoteName(note: number) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(note / 12) - 1;
  return `${notes[note % 12]}${octave}`;
}

const WHITE_KEY_LABELS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E'];
const BLACK_KEY_INDICES = [0, 1, 3, 4, 5, 7, 8];

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <View style={topStyles.row}>
      <TouchableOpacity onPress={onBack} style={topStyles.btn} activeOpacity={0.85}>
        <Chevron size={14} color={Palette.ink} rotate={180} />
      </TouchableOpacity>
      <Text style={topStyles.title}>MIDI 连接</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

const topStyles = StyleSheet.create({
  row: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginRight: 36,
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
    letterSpacing: -0.3,
  },
});

export default function MIDIConnectScreen() {
  const router = useRouter();
  const {
    connectionStatus,
    connectedDevice,
    availableDevices,
    isNativeSupported,
    lastNoteEvent,
    startScan,
    stopScan,
    connectDevice,
    disconnect,
  } = useMIDI();

  useEffect(() => {
    void initializeNativeMIDIBridge();
  }, []);

  const lastNoteLabel = useMemo(() => {
    if (!lastNoteEvent) return null;
    return { name: formatNoteName(lastNoteEvent.note), velocity: lastNoteEvent.velocity };
  }, [lastNoteEvent]);

  const handleRefreshDevices = useCallback(() => {
    void startScan();
  }, [startScan]);

  const handleStopScan = useCallback(() => {
    void stopScan();
  }, [stopScan]);

  const handleConnectDevice = useCallback(
    (device: MIDIDevice) => {
      void connectDevice(device.id);
    },
    [connectDevice],
  );

  const handleDisconnect = useCallback(() => {
    void disconnect();
  }, [disconnect]);

  const handleStartPlaying = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const isBusy = connectionStatus === 'scanning' || connectionStatus === 'connecting';

  if (connectionStatus === 'connected' && connectedDevice) {
    const lastKeyName = lastNoteLabel?.name.replace(/\d+$/, '') ?? null;

    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TopBar onBack={() => router.back()} />

          <View style={styles.connectedCard}>
            <View style={styles.connectedRow}>
              <View style={styles.deviceIcon}>
                <Text style={{ fontSize: 22 }}>🎹</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.connectedDotRow}>
                  <View style={styles.greenDot} />
                  <Text style={styles.connectedTag}>CONNECTED</Text>
                </View>
                <Text style={styles.connectedName}>{connectedDevice.name}</Text>
                <Text style={styles.connectedMeta}>
                  {formatDeviceType(connectedDevice)} · 延迟 12ms
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>信号测试</Text>
          <View style={styles.signalCard}>
            <Text style={styles.signalPrompt}>按下电钢琴上任意键</Text>
            <View style={styles.miniKeyboard}>
              {WHITE_KEY_LABELS.map((label, i) => {
                const hit = lastKeyName === label && i === WHITE_KEY_LABELS.indexOf(label);
                return (
                  <View
                    key={i}
                    style={[
                      styles.whiteKey,
                      hit && { backgroundColor: Palette.primary },
                    ]}
                  >
                    {hit && <Text style={styles.whiteKeyHitLabel}>{label}</Text>}
                  </View>
                );
              })}
              {BLACK_KEY_INDICES.map((i, k) => (
                <View
                  key={k}
                  style={[
                    styles.blackKey,
                    {
                      left: `${((i + 1) / WHITE_KEY_LABELS.length) * 100 - 3.2}%`,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.lastNote}>
              <Text style={styles.lastNoteLabel}>最后接收</Text>
              {lastNoteLabel ? (
                <>
                  <Text style={styles.lastNoteValue}>{lastNoteLabel.name}</Text>
                  <Text style={styles.lastNoteVelocity}>力度 {lastNoteLabel.velocity}</Text>
                </>
              ) : (
                <Text style={styles.lastNoteHint}>等待 noteOn / noteOff…</Text>
              )}
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <Button
              variant="primary"
              size="lg"
              block
              onPress={handleStartPlaying}
              trailing={<Text style={{ color: '#fff', fontSize: 17, fontWeight: FontWeight.semibold }}>→</Text>}
            >
              开始弹琴
            </Button>
          </View>

          <View style={{ marginTop: 10 }}>
            <Button variant="secondary" block onPress={handleDisconnect}>
              断开连接
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TopBar onBack={() => router.back()} />

        <View style={styles.heroCard}>
          <Text style={{ fontSize: 56 }}>🎹</Text>
          <Text style={styles.heroTitle}>连接设备开始弹琴</Text>
          <Text style={styles.heroSubtitle}>支持 USB 与蓝牙 MIDI · 优先 USB</Text>
        </View>

        {isNativeSupported === false && (
          <View style={styles.warnCard}>
            <Lock size={14} color={Palette.sunInk} />
            <View style={{ flex: 1 }}>
              <Text style={styles.warnTitle}>当前环境不支持原生 MIDI</Text>
              <Text style={styles.warnText}>
                需要真机 Development Build 才能完整接入电钢琴；模拟器可看流程，外设事件不会到达。
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionLabel}>{isBusy ? '刷新中的设备' : '其他设备'}</Text>

        {isBusy && (
          <View style={styles.scanArea}>
            <ActivityIndicator size="small" color={Palette.primary} />
            <Text style={styles.scanText}>
              {connectionStatus === 'connecting' ? '正在连接设备…' : '正在刷新系统 MIDI 设备列表…'}
            </Text>
          </View>
        )}

        {availableDevices.length > 0 ? (
          <View style={styles.deviceList}>
            {availableDevices.map((device, i, arr) => (
              <View
                key={device.id}
                style={[
                  styles.deviceRow,
                  i < arr.length - 1 && styles.deviceRowDivider,
                ]}
              >
                <View style={styles.deviceIconSm}>
                  <Text style={{ fontSize: 18 }}>🎹</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceMeta}>
                    {formatDeviceType(device)}
                    {device.manufacturer ? ` · ${device.manufacturer}` : ''}
                  </Text>
                </View>
                <Button size="sm" variant="secondary" onPress={() => handleConnectDevice(device)}>
                  连接
                </Button>
              </View>
            ))}
          </View>
        ) : (
          !isBusy && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>还没有发现可用设备</Text>
              <Text style={styles.emptyText}>
                USB 设备插入后点一次刷新；蓝牙设备先去系统设置完成配对再回来刷新。
              </Text>
            </View>
          )
        )}

        <View style={{ marginTop: 20 }}>
          {isBusy ? (
            <Button
              variant="secondary"
              block
              onPress={handleStopScan}
            >
              {connectionStatus === 'connecting' ? '返回设备列表' : '停止刷新'}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              block
              onPress={handleRefreshDevices}
            >
              刷新设备列表
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.bg },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    marginTop: 14,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Palette.ink2,
  },
  warnCard: {
    marginTop: 14,
    backgroundColor: Palette.sun,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  warnTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Palette.sunInk,
  },
  warnText: {
    fontSize: 12,
    color: Palette.sunInk,
    lineHeight: 18,
    marginTop: 2,
  },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 11,
    color: Palette.ink3,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  scanArea: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  scanText: {
    fontSize: 13,
    color: Palette.ink2,
  },
  deviceList: {
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 20,
    overflow: 'hidden',
  },
  deviceRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.line,
  },
  deviceIconSm: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
  },
  deviceMeta: {
    fontSize: 11,
    color: Palette.ink3,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
  },
  emptyText: {
    fontSize: 12,
    color: Palette.ink2,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Connected state
  connectedCard: {
    marginTop: 14,
    backgroundColor: Palette.ink,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.mint,
    shadowColor: Palette.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  connectedTag: {
    fontSize: 11,
    color: Palette.mint,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  connectedName: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
    color: '#fff',
    marginTop: 3,
    letterSpacing: -0.3,
  },
  connectedMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  signalCard: {
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    borderRadius: 20,
    padding: 16,
  },
  signalPrompt: {
    fontSize: 13,
    color: Palette.ink2,
  },
  miniKeyboard: {
    marginTop: 14,
    height: 110,
    flexDirection: 'row',
    backgroundColor: Palette.chip,
    borderRadius: 12,
    padding: 4,
    gap: 2,
    position: 'relative',
  },
  whiteKey: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  whiteKeyHitLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: FontWeight.heavy,
  },
  blackKey: {
    position: 'absolute',
    top: 4,
    width: '6.4%',
    height: 66,
    backgroundColor: Palette.ink,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  lastNote: {
    marginTop: 12,
    backgroundColor: Palette.primarySoft,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lastNoteLabel: {
    fontSize: 11,
    color: Palette.primary,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  lastNoteValue: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
  },
  lastNoteVelocity: {
    marginLeft: 'auto',
    fontSize: 11,
    color: Palette.ink2,
  },
  lastNoteHint: {
    fontSize: 11,
    color: Palette.ink3,
  },
});
