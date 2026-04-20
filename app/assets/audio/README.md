# Piano samples

Three real piano recordings (A3 / A4 / A5, 192 kbps mono MP3) sourced
from [nbrosowsky/tonejs-instruments][1] on GitHub, MIT licensed.

The audio engine (`src/services/audio.ts`) loads these three files
and pitch-shifts via expo-av's `setRateAsync(..., shouldCorrectPitch:
false)` to cover MIDI notes ~45..93. Each base sample covers ±12
semitones.

Replacing / upgrading:
- Any mono 44.1 kHz file (wav / mp3) works. Keep filenames stable —
  the engine's `require()` paths are wired to these three names.
- For better fidelity, consider full velocity layers from
  [Salamander Grand V3][2] (CC-BY), or the velocity-layered FreePats
  piano (CC0). Each layer is ~500 KB so the app bundle would balloon;
  only worth it once the rest of the product is nailed down.

[1]: https://github.com/nbrosowsky/tonejs-instruments
[2]: https://sfzinstruments.github.io/pianos/salamander/
