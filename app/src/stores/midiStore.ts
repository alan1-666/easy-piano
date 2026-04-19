import { create } from 'zustand';
import EasyPianoMidiModule from '../../modules/easy-piano-midi';
import type {
  MIDIDevice,
  MIDINoteEvent,
  MIDIConnectionStatus,
} from '../types/midi';

interface MIDIState {
  connectionStatus: MIDIConnectionStatus;
  connectedDevice: MIDIDevice | null;
  availableDevices: MIDIDevice[];
  activeNotes: Set<number>;
  isNativeSupported: boolean | null;
  lastNoteEvent: MIDINoteEvent | null;

  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  connectDevice: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  addActiveNote: (note: number) => void;
  removeActiveNote: (note: number) => void;
  handleNoteEvent: (event: MIDINoteEvent) => void;
  clearActiveNotes: () => void;
  setAvailableDevices: (devices: MIDIDevice[]) => void;
  setConnectionState: (status: MIDIConnectionStatus, device: MIDIDevice | null) => void;
  setNativeSupport: (supported: boolean) => void;
}

export const useMIDIStore = create<MIDIState>((set, get) => ({
  connectionStatus: 'disconnected',
  connectedDevice: null,
  availableDevices: [],
  activeNotes: new Set<number>(),
  isNativeSupported: null,
  lastNoteEvent: null,

  startScan: async () => {
    set({ connectionStatus: 'scanning' });

    try {
      await EasyPianoMidiModule.startScan();
      const devices = await EasyPianoMidiModule.listDevices();
      get().setAvailableDevices(devices);
    } catch (error) {
      console.warn('[midi] Failed to start scan', error);
      set((state) => ({
        connectionStatus: state.connectedDevice ? 'connected' : 'disconnected',
      }));
    }
  },

  stopScan: async () => {
    try {
      await EasyPianoMidiModule.stopScan();
    } catch (error) {
      console.warn('[midi] Failed to stop scan', error);
    }

    set((state) => ({
      connectionStatus: state.connectedDevice ? 'connected' : 'disconnected',
    }));
  },

  connectDevice: async (deviceId: string) => {
    set({ connectionStatus: 'connecting' });

    try {
      await EasyPianoMidiModule.connectDevice(deviceId);

      const state = get();
      if (state.connectionStatus === 'connecting') {
        const matchedDevice =
          state.availableDevices.find((device) => device.id === deviceId) ?? null;
        get().setConnectionState('connected', matchedDevice);
      }
    } catch (error) {
      console.warn('[midi] Failed to connect device', error);
      set((state) => ({
        connectionStatus: state.connectedDevice ? 'connected' : 'disconnected',
      }));
    }
  },

  disconnect: async () => {
    try {
      await EasyPianoMidiModule.disconnect();
    } catch (error) {
      console.warn('[midi] Failed to disconnect device', error);
    }

    get().setConnectionState('disconnected', null);
  },

  addActiveNote: (note: number) =>
    set((state) => {
      const newNotes = new Set(state.activeNotes);
      newNotes.add(note);
      return { activeNotes: newNotes };
    }),

  removeActiveNote: (note: number) =>
    set((state) => {
      const newNotes = new Set(state.activeNotes);
      newNotes.delete(note);
      return { activeNotes: newNotes };
    }),

  handleNoteEvent: (event: MIDINoteEvent) =>
    set((state) => {
      const newNotes = new Set(state.activeNotes);
      if (event.type === 'noteOn' && event.velocity > 0) {
        newNotes.add(event.note);
      } else {
        newNotes.delete(event.note);
      }

      return {
        activeNotes: newNotes,
        lastNoteEvent: event,
      };
    }),

  clearActiveNotes: () => set({ activeNotes: new Set<number>() }),

  setAvailableDevices: (devices: MIDIDevice[]) =>
    set((state) => {
      const connectedDeviceId = state.connectedDevice?.id;
      const nextDevices = devices.map((device) => ({
        ...device,
        connected: device.connected || device.id === connectedDeviceId,
      }));

      const connectedDevice =
        nextDevices.find((device) => device.connected) ??
        (connectedDeviceId
          ? nextDevices.find((device) => device.id === connectedDeviceId) ?? null
          : null);

      return {
        availableDevices: nextDevices,
        connectedDevice,
      };
    }),

  setConnectionState: (status: MIDIConnectionStatus, device: MIDIDevice | null) =>
    set((state) => {
      const connected = status === 'connected' ? device : null;
      const nextDevices = state.availableDevices.map((availableDevice) => ({
        ...availableDevice,
        connected: connected ? availableDevice.id === connected.id : false,
      }));

      if (connected && !nextDevices.some((availableDevice) => availableDevice.id === connected.id)) {
        nextDevices.unshift({
          ...connected,
          connected: true,
        });
      }

      return {
        connectionStatus: status,
        connectedDevice: connected,
        availableDevices: nextDevices,
        activeNotes: connected ? state.activeNotes : new Set<number>(),
        lastNoteEvent: connected ? state.lastNoteEvent : null,
      };
    }),

  setNativeSupport: (supported: boolean) => set({ isNativeSupported: supported }),
}));
