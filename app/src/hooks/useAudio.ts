/**
 * Placeholder hook for audio engine.
 * Will wrap the native audio module (AUGraph + SoundFont)
 * for virtual keyboard sounds, demo playback, and metronome.
 */
export function useAudio() {
  const playNote = (_note: number, _velocity: number) => {
    // TODO: trigger SoundFont note via native module
  };

  const stopNote = (_note: number) => {
    // TODO: stop SoundFont note via native module
  };

  const playMetronomeTick = () => {
    // TODO: play metronome click sound
  };

  const setSoundFont = (_fontName: string) => {
    // TODO: switch SoundFont preset
  };

  return {
    playNote,
    stopNote,
    playMetronomeTick,
    setSoundFont,
  };
}
