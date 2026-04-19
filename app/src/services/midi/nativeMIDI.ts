import type { EventSubscription } from 'expo-modules-core';
import EasyPianoMidiModule, {
  type MIDIConnectionEventPayload,
  type MIDIDevicesEventPayload,
  type MIDINoteEvent,
} from '../../../modules/easy-piano-midi';
import { useMIDIStore } from '../../stores/midiStore';

let subscriptions: EventSubscription[] = [];
let initializePromise: Promise<void> | null = null;

function attachListeners() {
  if (subscriptions.length > 0) {
    return;
  }

  subscriptions = [
    EasyPianoMidiModule.addListener('devicesChanged', (payload: MIDIDevicesEventPayload) => {
      useMIDIStore.getState().setAvailableDevices(payload.devices);
    }),
    EasyPianoMidiModule.addListener('connectionChanged', (payload: MIDIConnectionEventPayload) => {
      useMIDIStore.getState().setConnectionState(payload.status, payload.device);
    }),
    EasyPianoMidiModule.addListener('note', (payload: MIDINoteEvent) => {
      useMIDIStore.getState().handleNoteEvent(payload);
    }),
  ];
}

async function syncDevices() {
  const devices = await EasyPianoMidiModule.listDevices();
  useMIDIStore.getState().setAvailableDevices(devices);
}

export async function initializeNativeMIDIBridge() {
  if (initializePromise) {
    return initializePromise;
  }

  initializePromise = (async () => {
    try {
      const supported = await EasyPianoMidiModule.isSupported();
      useMIDIStore.getState().setNativeSupport(supported);

      if (!supported) {
        return;
      }

      attachListeners();
      await syncDevices();
    } catch (error) {
      console.warn('[midi] Failed to initialize native MIDI bridge', error);
      useMIDIStore.getState().setNativeSupport(false);
    }
  })();

  return initializePromise;
}
