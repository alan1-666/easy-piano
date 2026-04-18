import { useMIDIStore } from '../stores/midiStore';

export function useMIDI() {
  const connectionStatus = useMIDIStore((s) => s.connectionStatus);
  const connectedDevice = useMIDIStore((s) => s.connectedDevice);
  const availableDevices = useMIDIStore((s) => s.availableDevices);
  const activeNotes = useMIDIStore((s) => s.activeNotes);
  const startScan = useMIDIStore((s) => s.startScan);
  const stopScan = useMIDIStore((s) => s.stopScan);
  const connectDevice = useMIDIStore((s) => s.connectDevice);
  const disconnect = useMIDIStore((s) => s.disconnect);

  return {
    connectionStatus,
    connectedDevice,
    availableDevices,
    activeNotes,
    startScan,
    stopScan,
    connectDevice,
    disconnect,
  };
}
