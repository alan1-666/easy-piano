export type MIDIConnectionStatus =
  | 'disconnected'
  | 'scanning'
  | 'connecting'
  | 'connected';

export type MIDIDeviceType = 'usb' | 'bluetooth';

export type MIDIDevice = {
  id: string;
  name: string;
  type: MIDIDeviceType;
  connected: boolean;
  manufacturer?: string;
  isAvailable?: boolean;
};

export type MIDINoteEvent = {
  type: 'noteOn' | 'noteOff';
  note: number;
  velocity: number;
  channel: number;
  timestamp: number;
};

export type MIDIConnectionEventPayload = {
  status: MIDIConnectionStatus;
  device: MIDIDevice | null;
};

export type MIDIDevicesEventPayload = {
  devices: MIDIDevice[];
};

export type EasyPianoMidiModuleEvents = {
  devicesChanged: (params: MIDIDevicesEventPayload) => void;
  connectionChanged: (params: MIDIConnectionEventPayload) => void;
  note: (params: MIDINoteEvent) => void;
};
