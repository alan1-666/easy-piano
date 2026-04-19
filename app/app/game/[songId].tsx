import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PianoKeyboard from '../../src/components/Piano/PianoKeyboard';
import { GameEngine, noteToKeyPosition, isBlackKey } from '../../src/engine/GameEngine';
import { ScoreCalculator } from '../../src/engine/ScoreCalculator';
import { useMIDIStore } from '../../src/stores/midiStore';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/theme';
import { mockSongs } from '../../src/utils/mockData';
import type { HitGrade, HandResultSummary, SongHand, VisibleNote } from '../../src/types/game';
import type { NoteData, Song, Track } from '../../src/types/song';

// ---------------------------------------------------------------------------
// Demo song data: Twinkle Twinkle Little Star
// ---------------------------------------------------------------------------
const DEMO_MELODY: NoteData[] = [
  { note: 60, start: 0, duration: 500, velocity: 80 },
  { note: 60, start: 500, duration: 500, velocity: 80 },
  { note: 67, start: 1000, duration: 500, velocity: 85 },
  { note: 67, start: 1500, duration: 500, velocity: 85 },
  { note: 69, start: 2000, duration: 500, velocity: 85 },
  { note: 69, start: 2500, duration: 500, velocity: 85 },
  { note: 67, start: 3000, duration: 1000, velocity: 80 },
  { note: 65, start: 4000, duration: 500, velocity: 80 },
  { note: 65, start: 4500, duration: 500, velocity: 80 },
  { note: 64, start: 5000, duration: 500, velocity: 80 },
  { note: 64, start: 5500, duration: 500, velocity: 80 },
  { note: 62, start: 6000, duration: 500, velocity: 80 },
  { note: 62, start: 6500, duration: 500, velocity: 80 },
  { note: 60, start: 7000, duration: 1000, velocity: 80 },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MIN_OCTAVES = 2;
const MAX_OCTAVES = 3;

// Grade display config
const GRADE_COLORS: Record<HitGrade, string> = {
  perfect: Colors.perfect,
  great: Colors.great,
  good: Colors.good,
  miss: Colors.miss,
};

const GRADE_LABELS: Record<HitGrade, string> = {
  perfect: 'Perfect!',
  great: 'Great!',
  good: 'Good!',
  miss: 'Miss!',
};

// ---------------------------------------------------------------------------
// Hit effect type
// ---------------------------------------------------------------------------
interface ActiveHitEffect {
  id: number;
  grade: HitGrade;
  startTime: number;
  x: number;
  label?: string;
}

type HandStatsMap = Record<SongHand, HandResultSummary>;
type GradeCountKey = keyof Pick<
  HandResultSummary,
  'perfectCount' | 'greatCount' | 'goodCount' | 'missCount'
>;

interface PlayableSong {
  id: number;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  difficulty: number;
  tracks: Track[];
}

const DEFAULT_SONG = mockSongs[0];

function getSelectedSong(songIdParam?: string): Song {
  const songId = Number(songIdParam);

  if (Number.isFinite(songId)) {
    const matchedSong = mockSongs.find((song) => song.id === songId);
    if (matchedSong) {
      return matchedSong;
    }
  }

  return DEFAULT_SONG;
}

function buildDemoTracks(songId: number): Track[] {
  const transpose = (songId % 4) * 2;

  return [
    {
      hand: 'right',
      notes: DEMO_MELODY.map((note) => ({
        ...note,
        note: note.note + transpose,
      })),
    },
  ];
}

function buildPlayableSong(song: Song): PlayableSong {
  const tracks = song.tracks.length > 0 ? song.tracks : buildDemoTracks(song.id);
  const lastNoteEnd = tracks.reduce((maxEnd, track) => {
    const trackEnd = track.notes.reduce(
      (noteEnd, note) => Math.max(noteEnd, note.start + note.duration),
      0
    );

    return Math.max(maxEnd, trackEnd);
  }, 0);

  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    bpm: song.bpm,
    difficulty: song.difficulty,
    duration: Math.max(4, Math.ceil(lastNoteEnd / 1000)),
    tracks,
  };
}

function getKeyboardConfig(song: PlayableSong) {
  const notes = song.tracks.flatMap((track) => track.notes.map((note) => note.note));

  if (notes.length === 0) {
    return {
      startNote: 60,
      numOctaves: MIN_OCTAVES,
      numWhiteKeys: MIN_OCTAVES * 7,
    };
  }

  const minNote = Math.min(...notes);
  const maxNote = Math.max(...notes);
  let startNote = Math.floor(minNote / 12) * 12;
  let numOctaves = Math.max(
    MIN_OCTAVES,
    Math.ceil((maxNote - startNote + 1) / 12)
  );

  if (numOctaves > MAX_OCTAVES) {
    numOctaves = MAX_OCTAVES;
    const maxVisibleNote = startNote + numOctaves * 12 - 1;

    if (maxNote > maxVisibleNote) {
      const shiftOctaves = Math.ceil((maxNote - maxVisibleNote) / 12);
      startNote += shiftOctaves * 12;
    }
  }

  return {
    startNote,
    numOctaves,
    numWhiteKeys: numOctaves * 7,
  };
}

function calculateAccuracy(perfectCount: number, greatCount: number, goodCount: number, missCount: number) {
  const totalNotes = perfectCount + greatCount + goodCount + missCount;

  if (totalNotes === 0) {
    return 0;
  }

  const weightedHits = perfectCount * 1 + greatCount * 0.85 + goodCount * 0.65;
  return Math.round((weightedHits / totalNotes) * 1000) / 10;
}

function calculateStars(accuracy: number): number {
  if (accuracy >= 95) return 3;
  if (accuracy >= 85) return 2;
  if (accuracy >= 70) return 1;
  return 0;
}

function calculateXpEarned(score: number, accuracy: number, difficulty: number): number {
  const baseXp = 60 + difficulty * 20;
  const scoreBonus = Math.round(score / 40);
  const accuracyBonus = Math.round(accuracy);
  return baseXp + scoreBonus + accuracyBonus;
}

function getGradeCountKey(grade: HitGrade): GradeCountKey {
  switch (grade) {
    case 'perfect':
      return 'perfectCount';
    case 'great':
      return 'greatCount';
    case 'good':
      return 'goodCount';
    case 'miss':
      return 'missCount';
  }
}

function createEmptyHandSummary(totalNotes = 0): HandResultSummary {
  return {
    perfectCount: 0,
    greatCount: 0,
    goodCount: 0,
    missCount: 0,
    totalNotes,
    accuracy: 0,
  };
}

function calculateHandAccuracy(summary: HandResultSummary) {
  return calculateAccuracy(
    summary.perfectCount,
    summary.greatCount,
    summary.goodCount,
    summary.missCount
  );
}

function buildInitialHandStats(song: PlayableSong): HandStatsMap {
  const totals = song.tracks.reduce(
    (accumulator, track) => {
      accumulator[track.hand] += track.notes.length;
      return accumulator;
    },
    { left: 0, right: 0 } as Record<SongHand, number>
  );

  return {
    left: createEmptyHandSummary(totals.left),
    right: createEmptyHandSummary(totals.right),
  };
}

// ---------------------------------------------------------------------------
// Game Screen Component
// ---------------------------------------------------------------------------
export default function GameScreen() {
  const { songId: songIdParam } = useLocalSearchParams<{ songId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const midiActiveNotes = useMIDIStore((s) => s.activeNotes);
  const selectedSong = useMemo(() => getSelectedSong(songIdParam), [songIdParam]);
  const gameSong = useMemo(() => buildPlayableSong(selectedSong), [selectedSong]);
  const keyboardConfig = useMemo(() => getKeyboardConfig(gameSong), [gameSong]);
  const isLandscape = windowWidth > windowHeight;
  const layout = useMemo(() => {
    const topInset = Math.max(insets.top, isLandscape ? 10 : 18);
    const bottomInset = Math.max(insets.bottom, isLandscape ? 10 : 18);
    const topBarHeight = isLandscape ? 38 : 44;
    const modeBarHeight = isLandscape ? 18 : 20;
    const progressBarHeight = 3;
    const keyboardHeight = isLandscape
      ? Math.min(Math.max(windowHeight * 0.28, 160), 220)
      : 135;
    const feedbackHeight = isLandscape ? 44 : 60;
    const canvasTop = topInset + topBarHeight + modeBarHeight;
    const canvasBottom =
      windowHeight - bottomInset - progressBarHeight - keyboardHeight - feedbackHeight;
    const canvasHeight = Math.max(180, canvasBottom - canvasTop);

    return {
      topInset,
      bottomInset,
      topBarHeight,
      modeBarHeight,
      progressBarHeight,
      keyboardHeight,
      feedbackHeight,
      canvasHeight,
      judgmentLineY: canvasHeight,
    };
  }, [insets.bottom, insets.top, isLandscape, windowHeight]);

  // Engine refs (avoid re-renders on every frame)
  const engineRef = useRef(new GameEngine());
  const scoreCalcRef = useRef(new ScoreCalculator());

  // Rendering state driven by requestAnimationFrame
  const [visibleNotes, setVisibleNotes] = useState<VisibleNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hitEffects, setHitEffects] = useState<ActiveHitEffect[]>([]);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [hitGrades, setHitGrades] = useState<Map<number, string>>(new Map());
  const [handStats, setHandStats] = useState<HandStatsMap>(() => buildInitialHandStats(gameSong));

  // Game state
  const [gameStatus, setGameStatus] = useState<'countdown' | 'playing' | 'paused' | 'completed'>(
    'countdown'
  );
  const [countdownValue, setCountdownValue] = useState(3);

  const frameIdRef = useRef<number>(0);
  const hitEffectIdRef = useRef(0);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const activeNotesRef = useRef<Set<number>>(new Set());
  const previousMIDINotesRef = useRef<Set<number>>(new Set());
  const lanePositions = useMemo(
    () =>
      Array.from(
        { length: keyboardConfig.numWhiteKeys + 1 },
        (_, index) => (windowWidth / keyboardConfig.numWhiteKeys) * index
      ),
    [keyboardConfig.numWhiteKeys, windowWidth]
  );

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // ------ Initialize engine ------
  useEffect(() => {
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }

    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }

    engineRef.current.reset();
    engineRef.current.init(gameSong, layout.canvasHeight, layout.judgmentLineY);
    scoreCalcRef.current.reset();
    setVisibleNotes([]);
    setScore(0);
    setCombo(0);
    setProgress(0);
    setHitEffects([]);
    setActiveNotes(new Set());
    activeNotesRef.current = new Set();
    setHitGrades(new Map());
    setHandStats(buildInitialHandStats(gameSong));
    setCountdownValue(3);
    setGameStatus('countdown');

    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }

      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current);
      }
    };
  }, [gameSong, layout.canvasHeight, layout.judgmentLineY]);

  const recordHandGrade = useCallback((hand: SongHand, grade: HitGrade) => {
    setHandStats((prev) => {
      const countKey = getGradeCountKey(grade);
      const nextSummary = {
        ...prev[hand],
        [countKey]: prev[hand][countKey] + 1,
      };

      return {
        ...prev,
        [hand]: {
          ...nextSummary,
          accuracy: calculateHandAccuracy(nextSummary),
        },
      };
    });
  }, []);

  const pushHitEffect = useCallback(
    (noteNumber: number, grade: HitGrade, timestamp: number, label?: string) => {
      const x = noteToKeyPosition(
        noteNumber,
        windowWidth,
        keyboardConfig.startNote,
        keyboardConfig.numOctaves
      );
      const effectId = hitEffectIdRef.current++;
      setHitEffects((prev) => [
        ...prev,
        { id: effectId, grade, startTime: timestamp, x, label },
      ]);
    },
    [keyboardConfig.numOctaves, keyboardConfig.startNote, windowWidth]
  );

  // ------ Countdown ------
  useEffect(() => {
    if (gameStatus !== 'countdown') return;

    if (countdownValue <= 0) {
      setGameStatus('playing');
      engineRef.current.start(performance.now());
      return;
    }

    const timer = setTimeout(() => {
      setCountdownValue((v) => v - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameStatus, countdownValue]);

  // ------ Game loop ------
  const gameLoop = useCallback(() => {
    const now = performance.now();
    const engine = engineRef.current;
    const holdJudgments = engine.updateHoldNotes(now, activeNotesRef.current);

    for (const judgment of holdJudgments) {
      scoreCalcRef.current.calculateHit(judgment.grade);
      recordHandGrade(judgment.hand, judgment.grade);
      pushHitEffect(judgment.note, judgment.grade, now);
    }

    // Check missed notes
    const missedNotes = engine.checkMissedNotes(now);
    for (const missedNote of missedNotes) {
      scoreCalcRef.current.calculateHit(missedNote.grade);
      recordHandGrade(missedNote.hand, missedNote.grade);
    }

    // Get visible notes
    const notes = engine.getVisibleNotes(
      now,
      windowWidth,
      keyboardConfig.startNote,
      keyboardConfig.numOctaves
    );
    const prog = engine.getProgress(now);

    setVisibleNotes(notes);
    setProgress(prog);
    setScore(scoreCalcRef.current.getScore());
    setCombo(scoreCalcRef.current.getCombo());

    // Clean up old hit effects
    setHitEffects((prev) => prev.filter((e) => now - e.startTime < 600));

    if (prog < 1) {
      frameIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      completionTimerRef.current = setTimeout(() => {
        setGameStatus('completed');
      }, 1200);
    }
  }, [keyboardConfig.numOctaves, keyboardConfig.startNote, pushHitEffect, recordHandGrade, windowWidth]);

  useEffect(() => {
    if (gameStatus === 'playing') {
      frameIdRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [gameStatus, gameLoop]);

  const handleViewResults = useCallback(() => {
    const counts = scoreCalcRef.current.getCounts();
    const accuracy = calculateAccuracy(
      counts.perfect,
      counts.great,
      counts.good,
      counts.miss
    );
    const stars = calculateStars(accuracy);
    const xpEarned = calculateXpEarned(
      scoreCalcRef.current.getScore(),
      accuracy,
      gameSong.difficulty
    );
    const finalizedHandStats = {
      left: {
        ...handStats.left,
        accuracy: calculateHandAccuracy(handStats.left),
      },
      right: {
        ...handStats.right,
        accuracy: calculateHandAccuracy(handStats.right),
      },
    };

    router.replace({
      pathname: '/game/result',
      params: {
        songId: String(gameSong.id),
        songTitle: gameSong.title,
        artist: gameSong.artist,
        score: String(scoreCalcRef.current.getScore()),
        stars: String(stars),
        maxCombo: String(scoreCalcRef.current.getMaxCombo()),
        perfectCount: String(counts.perfect),
        greatCount: String(counts.great),
        goodCount: String(counts.good),
        missCount: String(counts.miss),
        xpEarned: String(xpEarned),
        accuracy: accuracy.toFixed(1),
        leftHand: JSON.stringify(finalizedHandStats.left),
        rightHand: JSON.stringify(finalizedHandStats.right),
      },
    });
  }, [gameSong, handStats, router]);

  useEffect(() => {
    if (gameStatus !== 'completed') {
      return;
    }

    resultTimerRef.current = setTimeout(() => {
      handleViewResults();
    }, 900);

    return () => {
      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current);
        resultTimerRef.current = null;
      }
    };
  }, [gameStatus, handleViewResults]);

  // ------ Handle key press ------
  const handleKeyPress = useCallback(
    (noteNumber: number) => {
      if (gameStatus !== 'playing') return;

      const now = performance.now();
      const nextActiveNotes = new Set(activeNotesRef.current);
      nextActiveNotes.add(noteNumber);
      activeNotesRef.current = nextActiveNotes;

      // Add to active notes
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(noteNumber);
        return next;
      });

      const result = engineRef.current.handleNoteInput(noteNumber, now);

      if (result) {
        if (!result.requiresHold) {
          scoreCalcRef.current.calculateHit(result.grade);
          setScore(scoreCalcRef.current.getScore());
          setCombo(scoreCalcRef.current.getCombo());
          recordHandGrade(result.hand, result.grade);
        }

        // Set hit grade for key color
        setHitGrades((prev) => {
          const next = new Map(prev);
          next.set(noteNumber, result.grade);
          return next;
        });

        pushHitEffect(
          noteNumber,
          result.grade,
          now,
          result.requiresHold ? 'Hold' : undefined
        );

        // Clear grade highlight after 300ms
        setTimeout(() => {
          setHitGrades((prev) => {
            const next = new Map(prev);
            next.delete(noteNumber);
            return next;
          });
        }, 300);
      }
    },
    [gameStatus, pushHitEffect, recordHandGrade]
  );

  const handleKeyRelease = useCallback((noteNumber: number) => {
    const nextActiveNotes = new Set(activeNotesRef.current);
    nextActiveNotes.delete(noteNumber);
    activeNotesRef.current = nextActiveNotes;

    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(noteNumber);
      return next;
    });
  }, []);

  useEffect(() => {
    const previousNotes = previousMIDINotesRef.current;

    for (const note of midiActiveNotes) {
      if (!previousNotes.has(note)) {
        handleKeyPress(note);
      }
    }

    for (const note of previousNotes) {
      if (!midiActiveNotes.has(note)) {
        handleKeyRelease(note);
      }
    }

    previousMIDINotesRef.current = new Set(midiActiveNotes);
  }, [handleKeyPress, handleKeyRelease, midiActiveNotes]);

  // ------ Pause / Resume ------
  const handlePause = useCallback(() => {
    if (gameStatus === 'playing') {
      cancelAnimationFrame(frameIdRef.current);
      setGameStatus('paused');
    }
  }, [gameStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState !== 'active') {
        handlePause();
      }

      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [handlePause]);

  const handleResume = useCallback(() => {
    if (gameStatus === 'paused') {
      // Adjust start time to account for pause duration
      engineRef.current.start(performance.now() - progress * gameSong.duration * 1000);
      setGameStatus('playing');
    }
  }, [gameStatus, gameSong.duration, progress]);

  const handleRestart = useCallback(() => {
    cancelAnimationFrame(frameIdRef.current);
    engineRef.current.reset();
    engineRef.current.init(gameSong, layout.canvasHeight, layout.judgmentLineY);
    scoreCalcRef.current.reset();
    setScore(0);
    setCombo(0);
    setProgress(0);
    setVisibleNotes([]);
    setHitEffects([]);
    setActiveNotes(new Set());
    activeNotesRef.current = new Set();
    setHitGrades(new Map());
    setHandStats(buildInitialHandStats(gameSong));
    setCountdownValue(3);
    setGameStatus('countdown');
  }, [gameSong, layout.canvasHeight, layout.judgmentLineY]);

  const handleExit = useCallback(() => {
    cancelAnimationFrame(frameIdRef.current);
    router.replace('/(tabs)/songs');
  }, [router]);

  // ------ Render ------
  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />

      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: layout.topInset,
            height: layout.topInset + layout.topBarHeight,
          },
        ]}
      >
        <Text style={styles.songTitle} numberOfLines={1}>
          {'\u266A'} {gameSong.title}
        </Text>
        <View style={styles.topRight}>
          <TouchableOpacity onPress={handlePause} style={styles.pauseButton}>
            <Text style={styles.pauseIcon}>{'\u23F8'}</Text>
            <Text style={styles.pauseButtonText}>{'\u6682\u505C'}</Text>
          </TouchableOpacity>
          <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
        </View>
      </View>

      {/* Mode / Speed bar */}
      <View style={[styles.modeBar, { height: layout.modeBarHeight }]}>
        <View style={styles.modeTag}>
          <Text style={styles.modeTagText}>{'\u6807\u51C6\u6A21\u5F0F'}</Text>
        </View>
        <Text style={styles.speedText}>1.0x</Text>
      </View>

      {/* Falling notes canvas */}
      <View style={[styles.canvasContainer, { width: windowWidth, height: layout.canvasHeight }]}>
        <View style={styles.canvas}>
          {lanePositions.map((x, index) => (
            <View
              key={`lane_${index}`}
              pointerEvents="none"
              style={[styles.laneLine, { left: x }]}
            />
          ))}

          {visibleNotes.map((note) => {
            const color =
              note.hand === 'left'
                ? isBlackKey(note.note)
                  ? '#3A73B5'
                  : Colors.leftHand
                : isBlackKey(note.note)
                  ? '#3DA863'
                  : Colors.rightHand;
            const capColor =
              note.hand === 'left'
                ? '#9FC4F2'
                : '#9AF0BC';
            const noteCapHeight = note.isSustain
              ? Math.min(20, Math.max(12, note.height * 0.16))
              : note.height;

            return (
              <View
                key={note.id}
                pointerEvents="none"
                style={[
                  styles.noteBlock,
                  {
                    left: note.x,
                    top: note.currentY,
                    width: note.width,
                    height: note.height,
                    opacity: note.opacity,
                  },
                ]}
              >
                <View
                  style={[
                    styles.noteBody,
                    {
                      backgroundColor: color,
                      opacity: note.isSustain ? 0.8 : 1,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.noteHead,
                    {
                      height: noteCapHeight,
                      backgroundColor: note.isSustain ? capColor : color,
                    },
                  ]}
                />
              </View>
            );
          })}

          <View pointerEvents="none" style={styles.judgmentLine} />
        </View>
      </View>

      {/* Judgment feedback area */}
      <View style={[styles.feedbackArea, { height: layout.feedbackHeight }]}>
        {hitEffects.length > 0 && (
          <View style={styles.gradeContainer}>
            {hitEffects.slice(-1).map((effect) => (
              <Text
                key={effect.id}
                style={[styles.gradeText, { color: GRADE_COLORS[effect.grade] }]}
              >
                {effect.label ?? GRADE_LABELS[effect.grade]}
              </Text>
            ))}
          </View>
        )}
        {combo > 0 && (
          <View style={styles.comboContainer}>
            <Text
              style={[
                styles.comboText,
                combo >= 10 && styles.comboTextHigh,
                combo >= 50 && styles.comboTextSuper,
              ]}
            >
              {combo}x COMBO{combo >= 10 ? ' \uD83D\uDD25' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Virtual keyboard */}
      <View style={[styles.keyboardContainer, { width: windowWidth, height: layout.keyboardHeight }]}>
        <PianoKeyboard
          startNote={keyboardConfig.startNote}
          numOctaves={keyboardConfig.numOctaves}
          activeNotes={activeNotes}
          hitGrades={hitGrades}
          onKeyPress={handleKeyPress}
          onKeyRelease={handleKeyRelease}
          width={windowWidth}
          height={layout.keyboardHeight}
        />
      </View>

      {/* Progress bar */}
      <View
        style={[
          styles.progressContainer,
          {
            height: layout.progressBarHeight + layout.bottomInset,
            paddingBottom: layout.bottomInset,
          },
        ]}
      >
        <View style={[styles.progressFill, { width: `${progress * 100}%` as unknown as number }]} />
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      {/* Countdown overlay */}
      {gameStatus === 'countdown' && countdownValue > 0 && (
        <View style={styles.overlay}>
          <Text style={styles.countdownText}>{countdownValue}</Text>
          <Text style={styles.countdownSubtext}>{'\u266A'} {'\u51C6\u5907...'}</Text>
        </View>
      )}

      {/* Pause overlay */}
      {gameStatus === 'paused' && (
        <View style={styles.overlay}>
          <View style={styles.pausePanel}>
            <Text style={styles.pauseTitle}>{'\u5DF2\u6682\u505C'}</Text>

            <TouchableOpacity style={styles.primaryButton} onPress={handleResume}>
              <Text style={styles.primaryButtonText}>{'\u7EE7\u7EED\u5F39\u594F'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleRestart}>
              <Text style={styles.secondaryButtonText}>{'\u91CD\u65B0\u5F00\u59CB'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ghostButton} onPress={handleExit}>
              <Text style={styles.ghostButtonText}>{'\u9000\u51FA'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Completed overlay */}
      {gameStatus === 'completed' && (
        <View style={styles.overlay}>
          <View style={styles.pausePanel}>
            <Text style={styles.pauseTitle}>{'\u6F14\u594F\u5B8C\u6210'}</Text>
            <Text style={styles.finalScore}>{score.toLocaleString()}</Text>
            <Text style={styles.finalCombo}>
              {'\u6700\u9AD8\u8FDE\u51FB'}: {scoreCalcRef.current.getMaxCombo()}x
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={handleViewResults}>
              <Text style={styles.primaryButtonText}>{'\u67E5\u770B\u7ED3\u679C'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleRestart}>
              <Text style={styles.secondaryButtonText}>{'\u518D\u6765\u4E00\u6B21'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ghostButton} onPress={handleExit}>
              <Text style={styles.ghostButtonText}>{'\u8FD4\u56DE\u66F2\u5E93'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  songTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  pauseButton: {
    minHeight: 38,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  pauseIcon: {
    fontSize: FontSize.body,
    color: Colors.white,
  },
  pauseButtonText: {
    fontSize: FontSize.caption,
    fontWeight: '600',
    color: Colors.white,
  },
  scoreText: {
    fontSize: FontSize.h3,
    fontWeight: 'bold',
    color: Colors.white,
    fontVariant: ['tabular-nums'],
    minWidth: 60,
    textAlign: 'right',
  },

  // Mode bar
  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  modeTag: {
    backgroundColor: 'rgba(15,52,96,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  modeTagText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  speedText: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },

  // Canvas
  canvasContainer: {
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
  laneLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  noteBlock: {
    position: 'absolute',
    borderRadius: 10,
    overflow: 'hidden',
  },
  noteBody: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  noteHead: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  judgmentLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: Colors.accent,
  },

  // Feedback area
  feedbackArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeContainer: {
    alignItems: 'center',
  },
  gradeText: {
    fontSize: FontSize.grade,
    fontWeight: 'bold',
  },
  comboContainer: {
    marginTop: 4,
  },
  comboText: {
    fontSize: FontSize.body,
    color: Colors.white,
  },
  comboTextHigh: {
    fontSize: FontSize.h3,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  comboTextSuper: {
    fontSize: FontSize.h2,
    fontWeight: '900',
    color: Colors.accent,
  },

  // Keyboard
  keyboardContainer: {
  },

  // Progress
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.accent,
  },
  progressText: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    position: 'absolute',
    right: Spacing.base,
  },

  // Countdown overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: Colors.white,
  },
  countdownSubtext: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  // Pause panel
  pausePanel: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: 280,
    alignItems: 'center',
    gap: Spacing.base,
  },
  pauseTitle: {
    fontSize: FontSize.h2,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.background,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: FontSize.body,
    color: Colors.white,
  },
  ghostButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  ghostButtonText: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },

  // Completed
  finalScore: {
    fontSize: FontSize.score,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  finalCombo: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
});
