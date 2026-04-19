import { requireOptionalNativeModule } from 'expo';
import type { EventSubscription } from 'expo-modules-core';

import type {
  EasyPianoMidiModuleEvents,
  MIDIDevice,
} from './EasyPianoMidi.types';

type EasyPianoMidiModule = {
  implementationStatus: 'scaffold' | 'ready';
  platform: 'ios' | 'android' | 'web';

  isSupported(): Promise<boolean>;
  listDevices(): Promise<MIDIDevice[]>;
  startScan(): Promise<void>;
  stopScan(): Promise<void>;
  connectDevice(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;

  addListener<EventName extends keyof EasyPianoMidiModuleEvents>(
    eventName: EventName,
    listener: EasyPianoMidiModuleEvents[EventName]
  ): EventSubscription;
  removeListener<EventName extends keyof EasyPianoMidiModuleEvents>(
    eventName: EventName,
    listener: EasyPianoMidiModuleEvents[EventName]
  ): void;
  removeAllListeners(eventName: keyof EasyPianoMidiModuleEvents): void;
  emit<EventName extends keyof EasyPianoMidiModuleEvents>(
    eventName: EventName,
    ...args: Parameters<EasyPianoMidiModuleEvents[EventName]>
  ): void;
  listenerCount(eventName: keyof EasyPianoMidiModuleEvents): number;
};

const noopSubscription: EventSubscription = {
  remove() {},
};

const unavailableModule = {
  implementationStatus: 'scaffold' as const,
  platform: 'web' as const,
  async isSupported() {
    return false;
  },
  async listDevices() {
    return [];
  },
  async startScan() {},
  async stopScan() {},
  async connectDevice(_deviceId: string) {},
  async disconnect() {},
  addListener() {
    return noopSubscription;
  },
  removeListener() {},
  removeAllListeners() {},
  emit() {},
  listenerCount() {
    return 0;
  },
} as EasyPianoMidiModule;

export default requireOptionalNativeModule<EasyPianoMidiModule>('EasyPianoMidi') ?? unavailableModule;
