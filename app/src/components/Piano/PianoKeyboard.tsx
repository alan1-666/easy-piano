import React, { useCallback, useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, FontSize } from '../../theme';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEY_INDICES = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

interface PianoKeyboardProps {
  startNote?: number; // MIDI note number for first key (default C4 = 60)
  numOctaves?: number;
  activeNotes: Set<number>;
  hitGrades?: Map<number, string>; // note -> grade for visual feedback
  onKeyPress: (note: number) => void;
  onKeyRelease?: (note: number) => void;
  width: number;
  height: number;
}

interface KeyInfo {
  note: number;
  name: string;
  isBlack: boolean;
  octave: number;
  whiteIndex: number; // index among white keys
}

export default function PianoKeyboard({
  startNote = 60,
  numOctaves = 2,
  activeNotes,
  hitGrades,
  onKeyPress,
  onKeyRelease,
  width,
  height,
}: PianoKeyboardProps) {
  // Build key info
  const keys = useMemo(() => {
    const result: KeyInfo[] = [];
    let whiteIdx = 0;

    for (let oct = 0; oct < numOctaves; oct++) {
      for (let n = 0; n < 12; n++) {
        const midiNote = startNote + oct * 12 + n;
        const isBlack = BLACK_KEY_INDICES.includes(n);
        const name = NOTE_NAMES[n];
        const octaveNum = Math.floor(midiNote / 12) - 1;

        result.push({
          note: midiNote,
          name: isBlack ? name : name,
          isBlack,
          octave: octaveNum,
          whiteIndex: isBlack ? -1 : whiteIdx,
        });

        if (!isBlack) whiteIdx++;
      }
    }

    return result;
  }, [startNote, numOctaves]);

  const whiteKeys = useMemo(() => keys.filter((k) => !k.isBlack), [keys]);
  const blackKeys = useMemo(() => keys.filter((k) => k.isBlack), [keys]);

  const whiteKeyWidth = width / whiteKeys.length;
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const blackKeyHeight = height * 0.6;

  // Calculate black key X positions
  const getBlackKeyX = useCallback(
    (note: number): number => {
      const noteInOctave = ((note - startNote) % 12 + 12) % 12;
      const octaveOffset = Math.floor((note - startNote) / 12);
      const whiteKeysPerOctave = 7;
      const baseX = octaveOffset * whiteKeysPerOctave * whiteKeyWidth;

      // Position relative to the white keys
      // Black keys sit between white keys
      const blackPositions: Record<number, number> = {
        1: 1, // C# between C(0) and D(1)
        3: 2, // D# between D(1) and E(2)
        6: 4, // F# between F(3) and G(4)
        8: 5, // G# between G(4) and A(5)
        10: 6, // A# between A(5) and B(6)
      };

      const whiteIdx = blackPositions[noteInOctave] ?? 0;
      return baseX + whiteIdx * whiteKeyWidth - blackKeyWidth / 2;
    },
    [startNote, whiteKeyWidth, blackKeyWidth]
  );

  const getKeyColor = useCallback(
    (note: number, isBlack: boolean): string => {
      if (activeNotes.has(note)) {
        const grade = hitGrades?.get(note);
        if (grade === 'perfect') return Colors.perfect;
        if (grade === 'great') return Colors.great;
        if (grade === 'good') return Colors.good;
        if (grade === 'miss') return Colors.miss;
        return Colors.accent;
      }
      return isBlack ? '#2C2C2E' : '#F5F5F5';
    },
    [activeNotes, hitGrades]
  );

  return (
    <View style={[styles.container, { width, height }]}>
      {/* White keys */}
      {whiteKeys.map((key, index) => {
        const isActive = activeNotes.has(key.note);
        const bgColor = getKeyColor(key.note, false);
        const showLabel = key.name === 'C';

        return (
          <TouchableOpacity
            key={key.note}
            activeOpacity={0.7}
            onPressIn={() => onKeyPress(key.note)}
            onPressOut={() => onKeyRelease?.(key.note)}
            style={[
              styles.whiteKey,
              {
                left: index * whiteKeyWidth,
                width: whiteKeyWidth,
                height,
                backgroundColor: bgColor,
                borderColor: '#D0D0D0',
              },
              isActive && styles.whiteKeyActive,
            ]}
          >
            {showLabel && (
              <Text style={styles.keyLabel}>
                {key.name}
                {key.octave}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Black keys (rendered on top) */}
      {blackKeys.map((key) => {
        const x = getBlackKeyX(key.note);
        const isActive = activeNotes.has(key.note);
        const bgColor = getKeyColor(key.note, true);

        return (
          <TouchableOpacity
            key={key.note}
            activeOpacity={0.7}
            onPressIn={() => onKeyPress(key.note)}
            onPressOut={() => onKeyRelease?.(key.note)}
            style={[
              styles.blackKey,
              {
                left: x,
                width: blackKeyWidth,
                height: blackKeyHeight,
                backgroundColor: bgColor,
              },
              isActive && styles.blackKeyActive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  whiteKey: {
    position: 'absolute',
    top: 0,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 6,
  },
  whiteKeyActive: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  blackKey: {
    position: 'absolute',
    top: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    zIndex: 10,
  },
  blackKeyActive: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  keyLabel: {
    fontSize: FontSize.keyLabel,
    fontWeight: '500',
    color: '#888888',
  },
});
