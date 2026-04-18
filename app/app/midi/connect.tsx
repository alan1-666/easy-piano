import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, Card, Header } from '../../src/components/common';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/theme';
import { useMIDIStore } from '../../src/stores/midiStore';
import type { MIDIDevice } from '../../src/types/midi';

// Mock devices for UI development
const MOCK_DEVICES: MIDIDevice[] = [
  { id: '1', name: 'Yamaha P-125', type: 'bluetooth', connected: false },
  { id: '2', name: 'Roland FP-30X', type: 'bluetooth', connected: false },
  { id: '3', name: 'Kawai ES-120', type: 'bluetooth', connected: false },
];

const MOCK_HISTORY: MIDIDevice[] = [
  { id: 'h1', name: 'Yamaha P-125', type: 'bluetooth', connected: false },
];

export default function MIDIConnectScreen() {
  const router = useRouter();
  const connectionStatus = useMIDIStore((s) => s.connectionStatus);
  const connectedDevice = useMIDIStore((s) => s.connectedDevice);
  const availableDevices = useMIDIStore((s) => s.availableDevices);
  const startScan = useMIDIStore((s) => s.startScan);
  const stopScan = useMIDIStore((s) => s.stopScan);
  const disconnect = useMIDIStore((s) => s.disconnect);

  const [mockDevices, setMockDevices] = useState<MIDIDevice[]>([]);
  const [mockConnected, setMockConnected] = useState<MIDIDevice | null>(null);
  const [mockStatus, setMockStatus] = useState<'disconnected' | 'scanning' | 'connected'>(
    'disconnected'
  );
  const [lastNote, setLastNote] = useState<string | null>(null);

  const handleStartBleScan = useCallback(() => {
    setMockStatus('scanning');
    setMockDevices([]);
    startScan();

    // Simulate devices appearing one by one
    setTimeout(() => {
      setMockDevices([MOCK_DEVICES[0]]);
    }, 800);
    setTimeout(() => {
      setMockDevices([MOCK_DEVICES[0], MOCK_DEVICES[1]]);
    }, 1500);
    setTimeout(() => {
      setMockDevices([MOCK_DEVICES[0], MOCK_DEVICES[1], MOCK_DEVICES[2]]);
    }, 2200);
  }, [startScan]);

  const handleStopScan = useCallback(() => {
    setMockStatus('disconnected');
    stopScan();
  }, [stopScan]);

  const handleConnectDevice = useCallback((device: MIDIDevice) => {
    setMockStatus('connected');
    setMockConnected(device);
  }, []);

  const handleDisconnect = useCallback(() => {
    setMockStatus('disconnected');
    setMockConnected(null);
    setMockDevices([]);
    setLastNote(null);
    disconnect();
  }, [disconnect]);

  const handleTestNote = useCallback(() => {
    setLastNote('C4  力度: 80');
    setTimeout(() => setLastNote('E4  力度: 92'), 600);
  }, []);

  const handleStartPlaying = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  // Disconnected state
  if (mockStatus === 'disconnected') {
    return (
      <ScreenContainer scrollable>
        <Header title="MIDI 连接" showBack />

        {/* Illustration */}
        <View style={styles.illustration}>
          <Text style={styles.illustrationEmoji}>🎹</Text>
        </View>

        <Text style={styles.heroTitle}>连接设备开始弹琴</Text>
        <Text style={styles.heroSubtitle}>
          选择连接方式，将电钢琴与 App 进行配对
        </Text>

        {/* Connection Method Cards */}
        <View style={styles.cardRow}>
          <Card
            style={styles.methodCard}
            onPress={() => {
              // USB: just show a hint since we can't really detect
              // In a real app this would check for USB devices
            }}
          >
            <Text style={styles.methodIcon}>🔌</Text>
            <Text style={styles.methodTitle}>USB 连接</Text>
            <Text style={styles.methodDesc}>即插即用</Text>
          </Card>

          <Card style={styles.methodCard} onPress={handleStartBleScan}>
            <Text style={styles.methodIcon}>📶</Text>
            <Text style={styles.methodTitle}>蓝牙连接</Text>
            <Text style={styles.methodDesc}>无线配对</Text>
          </Card>
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 提示: USB 连接延迟更低，推荐使用 Camera Adapter
          </Text>
        </View>

        {/* History Devices */}
        {MOCK_HISTORY.length > 0 && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>历史设备</Text>
              <View style={styles.sectionLine} />
            </View>

            {MOCK_HISTORY.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={styles.historyItem}
                onPress={() => handleConnectDevice(device)}
                activeOpacity={0.7}
              >
                <Text style={styles.historyIcon}>🎹</Text>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{device.name}</Text>
                  <Text style={styles.historyType}>
                    {device.type === 'bluetooth' ? 'BLE' : 'USB'}
                  </Text>
                </View>
                <Text style={styles.historyArrow}>{'>'}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScreenContainer>
    );
  }

  // Scanning state
  if (mockStatus === 'scanning') {
    return (
      <ScreenContainer scrollable>
        <Header title="MIDI 连接" showBack />

        {/* Scanning indicator */}
        <View style={styles.scanArea}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.scanText}>正在搜索蓝牙设备...</Text>
        </View>

        {/* Discovered devices section */}
        {mockDevices.length > 0 && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>发现的设备</Text>
              <View style={styles.sectionLine} />
            </View>

            {mockDevices.map((device) => (
              <Card key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceRow}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <View style={styles.deviceMeta}>
                      <Text style={styles.deviceType}>蓝牙 MIDI</Text>
                      <Text style={styles.deviceSignal}>信号: ████░</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.connectBtn}
                    onPress={() => handleConnectDevice(device)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.connectBtnText}>连接</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}

        <Button
          title="停止搜索"
          variant="secondary"
          onPress={handleStopScan}
          style={styles.actionButton}
        />
      </ScreenContainer>
    );
  }

  // Connected state
  return (
    <ScreenContainer scrollable>
      <Header title="MIDI 连接" showBack />

      {/* Connected device card */}
      <View style={styles.connectedCard}>
        <View style={styles.connectedIndicator} />
        <View style={styles.connectedBody}>
          <View style={styles.connectedTop}>
            <View>
              <Text style={styles.connectedName}>
                {mockConnected?.name ?? '未知设备'}
              </Text>
              <Text style={styles.connectedType}>蓝牙 MIDI</Text>
            </View>
          </View>
          <View style={styles.connectedStatusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>已连接</Text>
          </View>
        </View>
      </View>

      {/* Signal Test Section */}
      <View style={styles.sectionDivider}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionLabel}>信号测试</Text>
        <View style={styles.sectionLine} />
      </View>

      <Text style={styles.testPrompt}>请按任意琴键测试连接</Text>

      {/* Virtual keyboard test area */}
      <TouchableOpacity
        style={styles.testArea}
        onPress={handleTestNote}
        activeOpacity={0.7}
      >
        <View style={styles.miniKeyboard}>
          {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => (
            <View key={note} style={styles.whiteKey}>
              <Text style={styles.keyLabelText}>{note}</Text>
            </View>
          ))}
        </View>
        {lastNote && (
          <Text style={styles.lastNoteText}>最后接收: {lastNote}</Text>
        )}
      </TouchableOpacity>

      {/* Connection quality */}
      <View style={styles.qualityCard}>
        <Text style={styles.qualityText}>✓ 延迟: 12ms</Text>
        <Text style={styles.qualitySep}>|</Text>
        <Text style={styles.qualityText}>状态: 正常</Text>
      </View>

      {/* Action buttons */}
      <Button
        title="开始弹琴"
        onPress={handleStartPlaying}
        style={styles.actionButton}
      />

      <Button
        title="断开连接"
        variant="secondary"
        onPress={handleDisconnect}
        style={styles.disconnectButton}
      />
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
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.base,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
  },
  methodIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  methodTitle: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  methodDesc: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  tipCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tipText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.textDisabled,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.caption,
    marginHorizontal: Spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  historyIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: FontSize.h4,
    fontWeight: '500',
    color: Colors.white,
  },
  historyType: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  historyArrow: {
    color: Colors.textSecondary,
    fontSize: FontSize.h4,
  },

  // Scanning
  scanArea: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  scanText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
  },
  deviceCard: {
    marginBottom: Spacing.md,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: FontSize.h4,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  deviceType: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  deviceSignal: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  connectBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  connectBtnText: {
    color: Colors.background,
    fontSize: FontSize.caption,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: Spacing.lg,
  },

  // Connected
  connectedCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.base,
    ...Shadows.card,
  },
  connectedIndicator: {
    width: 3,
    backgroundColor: Colors.success,
  },
  connectedBody: {
    flex: 1,
    padding: Spacing.base,
  },
  connectedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  connectedName: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
  },
  connectedType: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  connectedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: FontSize.caption,
    color: Colors.success,
  },
  testPrompt: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  testArea: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  miniKeyboard: {
    flexDirection: 'row',
    height: 60,
    gap: 2,
    marginBottom: Spacing.sm,
  },
  whiteKey: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
  },
  keyLabelText: {
    fontSize: FontSize.keyLabel,
    color: Colors.background,
    fontWeight: '500',
  },
  lastNoteText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  qualityCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  qualityText: {
    fontSize: FontSize.caption,
    color: Colors.success,
  },
  qualitySep: {
    color: Colors.textDisabled,
    marginHorizontal: Spacing.md,
  },
  disconnectButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
});
