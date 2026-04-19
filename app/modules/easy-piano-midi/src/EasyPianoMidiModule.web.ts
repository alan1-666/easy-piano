import { registerWebModule, NativeModule } from 'expo';

import type {
  EasyPianoMidiModuleEvents,
  MIDIDevice,
} from './EasyPianoMidi.types';

class EasyPianoMidiModule extends NativeModule<EasyPianoMidiModuleEvents> {
  implementationStatus = 'scaffold' as const;
  platform = 'web' as const;

  async isSupported(): Promise<boolean> {
    return false;
  }

  async listDevices(): Promise<MIDIDevice[]> {
    return [];
  }

  async startScan(): Promise<void> {}

  async stopScan(): Promise<void> {}

  async connectDevice(_deviceId: string): Promise<void> {}

  async disconnect(): Promise<void> {}
}

export default registerWebModule(EasyPianoMidiModule);
