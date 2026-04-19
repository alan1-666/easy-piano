import { useMIDIStore } from '../stores/midiStore';

export function useMIDI() {
  const connectionStatus = useMIDIStore((s) => s.connectionStatus);
  const connectedDevice = useMIDIStore((s) => s.connectedDevice);
  const availableDevices = useMIDIStore((s) => s.availableDevices);
  const activeNotes = useMIDIStore((s) => s.activeNotes);
  const isNativeSupported = useMIDIStore((s) => s.isNativeSupported);
  const lastNoteEvent = useMIDIStore((s) => s.lastNoteEvent);
  const startScan = useMIDIStore((s) => s.startScan);
  const stopScan = useMIDIStore((s) => s.stopScan);
  const connectDevice = useMIDIStore((s) => s.connectDevice);
  const disconnect = useMIDIStore((s) => s.disconnect);
  const addActiveNote = useMIDIStore((s) => s.addActiveNote);
  const removeActiveNote = useMIDIStore((s) => s.removeActiveNote);
  const handleNoteEvent = useMIDIStore((s) => s.handleNoteEvent);
  const clearActiveNotes = useMIDIStore((s) => s.clearActiveNotes);

  return {
    connectionStatus,
    connectedDevice,
    availableDevices,
    activeNotes,
    isNativeSupported,
    lastNoteEvent,
    startScan,
    stopScan,
    connectDevice,
    disconnect,
    addActiveNote,
    removeActiveNote,
    handleNoteEvent,
    clearActiveNotes,
  };
}
