import { create } from 'zustand';
import type { MIDIDevice } from '../types/midi';

type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected';

interface MIDIState {
  connectionStatus: ConnectionStatus;
  connectedDevice: MIDIDevice | null;
  availableDevices: MIDIDevice[];
  activeNotes: Set<number>;

  startScan: () => void;
  stopScan: () => void;
  connectDevice: (deviceId: string) => void;
  disconnect: () => void;
  addActiveNote: (note: number) => void;
  removeActiveNote: (note: number) => void;
}

export const useMIDIStore = create<MIDIState>((set) => ({
  connectionStatus: 'disconnected',
  connectedDevice: null,
  availableDevices: [],
  activeNotes: new Set<number>(),

  startScan: () => set({ connectionStatus: 'scanning' }),

  stopScan: () =>
    set((state) => ({
      connectionStatus: state.connectedDevice ? 'connected' : 'disconnected',
    })),

  connectDevice: (_deviceId: string) =>
    set({ connectionStatus: 'connecting' }),

  disconnect: () =>
    set({
      connectionStatus: 'disconnected',
      connectedDevice: null,
      activeNotes: new Set<number>(),
    }),

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
}));
