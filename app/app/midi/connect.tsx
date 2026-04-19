import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Header, ScreenContainer } from '../../src/components/common';
import { useMIDI } from '../../src/hooks/useMIDI';
import { initializeNativeMIDIBridge } from '../../src/services/midi/nativeMIDI';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '../../src/theme';
import type { MIDIDevice } from '../../src/types/midi';

function formatDeviceType(device: MIDIDevice) {
  return device.type === 'bluetooth' ? '蓝牙 MIDI' : 'USB MIDI';
}

function formatNoteName(note: number) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(note / 12) - 1;
  return `${notes[note % 12]}${octave}`;
}

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
    if (!lastNoteEvent) {
      return null;
    }

    return `${formatNoteName(lastNoteEvent.note)}  力度: ${lastNoteEvent.velocity}`;
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
    [connectDevice]
  );

  const handleDisconnect = useCallback(() => {
    void disconnect();
  }, [disconnect]);

  const handleStartPlaying = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const isBusy = connectionStatus === 'scanning' || connectionStatus === 'connecting';

  if (connectionStatus === 'connected' && connectedDevice) {
    return (
      <ScreenContainer scrollable>
        <Header title="MIDI 连接" showBack />

        <View style={styles.connectedCard}>
          <View style={styles.connectedIndicator} />
          <View style={styles.connectedBody}>
            <Text style={styles.connectedName}>{connectedDevice.name}</Text>
            <Text style={styles.connectedType}>{formatDeviceType(connectedDevice)}</Text>
            <View style={styles.connectedStatusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>已连接，可直接进入游戏</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionDivider}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionLabel}>信号测试</Text>
          <View style={styles.sectionLine} />
        </View>

        <Card style={styles.noteCard}>
          <Text style={styles.notePrompt}>请按电钢琴任意琴键</Text>
          <View style={styles.keyboardPreview}>
            {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => (
              <View key={note} style={styles.whiteKey}>
                <Text style={styles.keyLabel}>{note}</Text>
              </View>
            ))}
          </View>
          {lastNoteLabel ? (
            <Text style={styles.noteValue}>最后接收: {lastNoteLabel}</Text>
          ) : (
            <Text style={styles.noteHint}>接收到的 `noteOn / noteOff` 会实时显示在这里。</Text>
          )}
        </Card>

        <View style={styles.qualityCard}>
          <Text style={styles.qualityText}>输入链路: 已建立</Text>
          <Text style={styles.qualitySep}>|</Text>
          <Text style={styles.qualityText}>
            模式: {connectedDevice.type === 'bluetooth' ? '无线' : '有线'}
          </Text>
        </View>

        <Button title="开始弹琴" onPress={handleStartPlaying} style={styles.actionButton} />
        <Button
          title="断开连接"
          variant="secondary"
          onPress={handleDisconnect}
          style={styles.disconnectButton}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <Header title="MIDI 连接" showBack />

      <View style={styles.illustration}>
        <Text style={styles.illustrationEmoji}>🎹</Text>
      </View>

      <Text style={styles.heroTitle}>连接设备开始弹琴</Text>
      <Text style={styles.heroSubtitle}>支持 USB MIDI 和蓝牙 MIDI，推荐优先使用 USB。</Text>

      {isNativeSupported === false && (
        <Card style={styles.supportCard}>
          <Text style={styles.supportTitle}>当前环境不支持原生 MIDI</Text>
          <Text style={styles.supportText}>
            需要使用真机上的 Development Build 才能完整验证电钢琴接入。模拟器里可以继续看页面流程，但系统外设事件不会完整到位。
          </Text>
        </Card>
      )}

      <View style={styles.cardRow}>
        <Card style={styles.methodCard} onPress={handleRefreshDevices}>
          <Text style={styles.methodIcon}>🔌</Text>
          <Text style={styles.methodTitle}>USB 连接</Text>
          <Text style={styles.methodDesc}>接线后刷新设备</Text>
        </Card>

        <Card style={styles.methodCard} onPress={handleRefreshDevices}>
          <Text style={styles.methodIcon}>📶</Text>
          <Text style={styles.methodTitle}>蓝牙连接</Text>
          <Text style={styles.methodDesc}>完成系统配对后刷新</Text>
        </Card>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipText}>USB 延迟更低，课堂和游戏判定建议优先走有线接入。</Text>
      </View>

      <View style={styles.sectionDivider}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionLabel}>{isBusy ? '刷新中的设备' : '可用设备'}</Text>
        <View style={styles.sectionLine} />
      </View>

      {isBusy && (
        <View style={styles.scanArea}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.scanText}>
            {connectionStatus === 'connecting' ? '正在连接设备...' : '正在刷新系统 MIDI 设备列表...'}
          </Text>
        </View>
      )}

      {availableDevices.length > 0 ? (
        availableDevices.map((device) => (
          <Card key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceRow}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceMeta}>
                  {formatDeviceType(device)}
                  {device.manufacturer ? ` · ${device.manufacturer}` : ''}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.connectBtn}
                onPress={() => handleConnectDevice(device)}
                activeOpacity={0.8}
              >
                <Text style={styles.connectBtnText}>连接</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>还没有发现可用设备</Text>
          <Text style={styles.emptyText}>
            USB 设备接入后点一次刷新；蓝牙设备请先在系统设置里完成配对，再回来刷新列表。
          </Text>
        </Card>
      )}

      {isBusy ? (
        <Button
          title={connectionStatus === 'connecting' ? '返回设备列表' : '停止刷新'}
          variant="secondary"
          onPress={handleStopScan}
          style={styles.actionButton}
        />
      ) : (
        <Button title="刷新设备列表" onPress={handleRefreshDevices} style={styles.actionButton} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  heroTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  supportCard: {
    marginBottom: Spacing.base,
    backgroundColor: Colors.bgTertiary,
  },
  supportTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
    marginBottom: Spacing.sm,
  },
  supportText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.base,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  methodIcon: {
    fontSize: 32,
  },
  methodTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  methodDesc: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tipCard: {
    padding: Spacing.base,
    backgroundColor: Colors.bgTertiary,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  tipText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  sectionLabel: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scanArea: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  scanText: {
    marginTop: Spacing.base,
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  deviceCard: {
    marginBottom: Spacing.base,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  deviceInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  deviceName: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  deviceMeta: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  connectBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
  },
  connectBtnText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.bgPrimary,
  },
  emptyCard: {
    marginBottom: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgTertiary,
  },
  emptyTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    marginTop: Spacing.base,
  },
  connectedCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    gap: Spacing.base,
    ...Shadows.card,
  },
  connectedIndicator: {
    width: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
  },
  connectedBody: {
    flex: 1,
    gap: Spacing.xs,
  },
  connectedName: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  connectedType: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  connectedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  noteCard: {
    gap: Spacing.base,
    marginBottom: Spacing.base,
  },
  notePrompt: {
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  keyboardPreview: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  whiteKey: {
    flex: 1,
    height: 68,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.sm,
  },
  keyLabel: {
    fontSize: FontSize.small,
    color: Colors.bgPrimary,
    fontWeight: FontWeight.medium,
  },
  noteValue: {
    fontSize: FontSize.body,
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  noteHint: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  qualityCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    marginBottom: Spacing.base,
  },
  qualityText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  qualitySep: {
    fontSize: FontSize.caption,
    color: Colors.textTertiary,
  },
  disconnectButton: {
    marginTop: Spacing.sm,
  },
});
