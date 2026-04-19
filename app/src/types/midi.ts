export type MIDIConnectionStatus =
  | 'disconnected'
  | 'scanning'
  | 'connecting'
  | 'connected';

export interface MIDIDevice {
  id: string;
  name: string;
  type: 'usb' | 'bluetooth';
  connected: boolean;
  manufacturer?: string;
  isAvailable?: boolean;
}

export interface MIDINoteEvent {
  type: 'noteOn' | 'noteOff';
  note: number; // 0-127
  velocity: number; // 0-127
  channel: number; // 0-15
  timestamp: number;
}
