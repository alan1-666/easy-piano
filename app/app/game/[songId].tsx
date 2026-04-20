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

import { useQuery } from '@tanstack/react-query';
import PianoKeyboard from '../../src/components/Piano/PianoKeyboard';
import { GameEngine, noteToKeyPosition, isBlackKey } from '../../src/engine/GameEngine';
import { ScoreCalculator } from '../../src/engine/ScoreCalculator';
import { useMIDIStore } from '../../src/stores/midiStore';
import { audio } from '../../src/services/audio';
import { getSong } from '../../src/api/songs';
import { Palette, FontWeight } from '../../src/theme';
import { Pill } from '../../src/components/common';
import { Pause, Flame } from '../../src/components/Icons';
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

const MIN_OCTAVES = 2;
const MAX_OCTAVES = 3;

const GRADE_COLORS: Record<HitGrade, string> = {
  perfect: Palette.primary,
  great: Palette.lilacInk,
  good: Palette.mintInk,
  miss: Palette.coralInk,
};

const GRADE_LABELS: Record<HitGrade, string> = {
  perfect: 'Perfect!',
  great: 'Great!',
  good: 'Good!',
  miss: 'Miss!',
};

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
    if (matchedSong) return matchedSong;
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
      0,
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
    return { startNote: 60, numOctaves: MIN_OCTAVES, numWhiteKeys: MIN_OCTAVES * 7 };
  }
  const minNote = Math.min(...notes);
  const maxNote = Math.max(...notes);
  let startNote = Math.floor(minNote / 12) * 12;
  let numOctaves = Math.max(MIN_OCTAVES, Math.ceil((maxNote - startNote + 1) / 12));
  if (numOctaves > MAX_OCTAVES) {
    numOctaves = MAX_OCTAVES;
    const maxVisibleNote = startNote + numOctaves * 12 - 1;
    if (maxNote > maxVisibleNote) {
      const shiftOctaves = Math.ceil((maxNote - maxVisibleNote) / 12);
      startNote += shiftOctaves * 12;
    }
  }
  return { startNote, numOctaves, numWhiteKeys: numOctaves * 7 };
}

function calculateAccuracy(perfectCount: number, greatCount: number, goodCount: number, missCount: number) {
  const totalNotes = perfectCount + greatCount + goodCount + missCount;
  if (totalNotes === 0) return 0;
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
    case 'perfect': return 'perfectCount';
    case 'great': return 'greatCount';
    case 'good': return 'goodCount';
    case 'miss': return 'missCount';
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
    summary.missCount,
  );
}

function buildInitialHandStats(song: PlayableSong): HandStatsMap {
  const totals = song.tracks.reduce(
    (acc, track) => {
      acc[track.hand] += track.notes.length;
      return acc;
    },
    { left: 0, right: 0 } as Record<SongHand, number>,
  );
  return {
    left: createEmptyHandSummary(totals.left),
    right: createEmptyHandSummary(totals.right),
  };
}

export default function GameScreen() {
  const { songId: songIdParam, lessonId: lessonIdParam } = useLocalSearchParams<{
    songId?: string;
    lessonId?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const midiActiveNotes = useMIDIStore((s) => s.activeNotes);

  // Fetch the song from the API so we pick up midi_data uploaded via
  // POST /v1/admin/songs/:id/midi. Fall back to the mockData entry
  // (same id) while the request is in flight so the UI can render
  // immediately with the demo melody rather than flashing a spinner.
  const songQuery = useQuery({
    queryKey: ['song', songIdParam],
    queryFn: () => getSong(Number(songIdParam)),
    enabled: Number.isFinite(Number(songIdParam)),
    staleTime: 60_000,
  });
  const selectedSong = useMemo<Song>(() => {
    return songQuery.data ?? getSelectedSong(songIdParam);
  }, [songQuery.data, songIdParam]);
  const gameSong = useMemo(() => buildPlayableSong(selectedSong), [selectedSong]);
  const keyboardConfig = useMemo(() => getKeyboardConfig(gameSong), [gameSong]);
  const isLandscape = windowWidth > windowHeight;
  const layout = useMemo(() => {
    const topInset = Math.max(insets.top, isLandscape ? 10 : 18);
    const bottomInset = Math.max(insets.bottom, isLandscape ? 10 : 18);
    const topBarHeight = isLandscape ? 50 : 56;
    const progressBarHeight = 2;
    const keyboardHeight = isLandscape
      ? Math.min(Math.max(windowHeight * 0.28, 160), 220)
      : 135;
    const feedbackHeight = isLandscape ? 50 : 60;
    const canvasTop = topInset + topBarHeight;
    const canvasBottom =
      windowHeight - bottomInset - progressBarHeight - keyboardHeight - feedbackHeight;
    const canvasHeight = Math.max(180, canvasBottom - canvasTop);
    return {
      topInset,
      bottomInset,
      topBarHeight,
      progressBarHeight,
      keyboardHeight,
      feedbackHeight,
      canvasHeight,
      judgmentLineY: canvasHeight,
    };
  }, [insets.bottom, insets.top, isLandscape, windowHeight]);

  const engineRef = useRef(new GameEngine());
  const scoreCalcRef = useRef(new ScoreCalculator());

  const [visibleNotes, setVisibleNotes] = useState<VisibleNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hitEffects, setHitEffects] = useState<ActiveHitEffect[]>([]);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [hitGrades, setHitGrades] = useState<Map<number, string>>(new Map());
  const [handStats, setHandStats] = useState<HandStatsMap>(() => buildInitialHandStats(gameSong));

  const [gameStatus, setGameStatus] = useState<'countdown' | 'playing' | 'paused' | 'completed'>(
    'countdown',
  );
  const [countdownValue, setCountdownValue] = useState(3);

  const frameIdRef = useRef<number>(0);
  const hitEffectIdRef = useRef(0);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const activeNotesRef = useRef<Set<number>>(new Set());
  const previousMIDINotesRef = useRef<Set<number>>(new Set());
  // Track actual play time so we can POST duration to /practice/log.
  // Accumulates only while gameStatus === 'playing' (paused gaps don't count).
  const playStartRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);
  // Auto-play bookkeeping: a flat sorted list of every note in every
  // track (by start time) plus the index of the next unplayed one.
  // Each game loop tick advances the index and fires audio.playNote for
  // notes whose start has elapsed in song-time.
  const songStartPerfRef = useRef<number | null>(null);
  const scheduledNotesRef = useRef<Array<{ note: number; start: number; velocity: number }>>([]);
  const nextAutoIdxRef = useRef(0);
  const lanePositions = useMemo(
    () =>
      Array.from(
        { length: keyboardConfig.numWhiteKeys + 1 },
        (_, index) => (windowWidth / keyboardConfig.numWhiteKeys) * index,
      ),
    [keyboardConfig.numWhiteKeys, windowWidth],
  );

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  useEffect(() => {
    // Wait until the API song fetch settles (success or error) before
    // starting the countdown. Otherwise we init the engine with the
    // mock fallback and then reset when the real data arrives, which
    // looks like the countdown glitches back to 3 mid-song.
    if (songQuery.isLoading) return;
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
    songStartPerfRef.current = null;
    scheduledNotesRef.current = [];
    nextAutoIdxRef.current = 0;
    setCountdownValue(3);
    setGameStatus('countdown');
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, [gameSong, layout.canvasHeight, layout.judgmentLineY, songQuery.isLoading]);

  const recordHandGrade = useCallback((hand: SongHand, grade: HitGrade) => {
    setHandStats((prev) => {
      const countKey = getGradeCountKey(grade);
      const nextSummary = {
        ...prev[hand],
        [countKey]: prev[hand][countKey] + 1,
      };
      return {
        ...prev,
        [hand]: { ...nextSummary, accuracy: calculateHandAccuracy(nextSummary) },
      };
    });
  }, []);

  const pushHitEffect = useCallback(
    (noteNumber: number, grade: HitGrade, timestamp: number, label?: string) => {
      const x = noteToKeyPosition(
        noteNumber,
        windowWidth,
        keyboardConfig.startNote,
        keyboardConfig.numOctaves,
      );
      const effectId = hitEffectIdRef.current++;
      setHitEffects((prev) => [
        ...prev,
        { id: effectId, grade, startTime: timestamp, x, label },
      ]);
    },
    [keyboardConfig.numOctaves, keyboardConfig.startNote, windowWidth],
  );

  useEffect(() => {
    if (gameStatus !== 'countdown') return;
    if (countdownValue <= 0) {
      setGameStatus('playing');
      const t = performance.now();
      engineRef.current.start(t);
      songStartPerfRef.current = t;
      playStartRef.current = Date.now();
      // Freeze the full note timeline for autoplay. Sorted ascending by
      // start so the tick loop can walk it with a single index.
      const flat: Array<{ note: number; start: number; velocity: number }> = [];
      for (const track of gameSong.tracks) {
        for (const n of track.notes) {
          flat.push({ note: n.note, start: n.start, velocity: n.velocity });
        }
      }
      flat.sort((a, b) => a.start - b.start);
      scheduledNotesRef.current = flat;
      nextAutoIdxRef.current = 0;
      return;
    }
    const timer = setTimeout(() => {
      setCountdownValue((v) => v - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [gameStatus, countdownValue]);

  const gameLoop = useCallback(() => {
    const now = performance.now();
    const engine = engineRef.current;
    const holdJudgments = engine.updateHoldNotes(now, activeNotesRef.current);
    for (const judgment of holdJudgments) {
      scoreCalcRef.current.calculateHit(judgment.grade);
      recordHandGrade(judgment.hand, judgment.grade);
      pushHitEffect(judgment.note, judgment.grade, now);
    }
    const missedNotes = engine.checkMissedNotes(now);
    for (const missedNote of missedNotes) {
      scoreCalcRef.current.calculateHit(missedNote.grade);
      recordHandGrade(missedNote.hand, missedNote.grade);
    }
    // Autoplay: walk scheduledNotesRef by the engine's elapsed time and
    // fire audio.playNote for any notes whose start has gone by. Cheap
    // O(notes-just-crossed) per tick thanks to the sorted list + index.
    if (songStartPerfRef.current !== null) {
      const elapsedMs = now - songStartPerfRef.current;
      const scheduled = scheduledNotesRef.current;
      let idx = nextAutoIdxRef.current;
      while (idx < scheduled.length && scheduled[idx].start <= elapsedMs) {
        const n = scheduled[idx];
        void audio.playNote(n.note, n.velocity);
        idx++;
      }
      nextAutoIdxRef.current = idx;
    }

    const notes = engine.getVisibleNotes(
      now,
      windowWidth,
      keyboardConfig.startNote,
      keyboardConfig.numOctaves,
    );
    const prog = engine.getProgress(now);
    setVisibleNotes(notes);
    setProgress(prog);
    setScore(scoreCalcRef.current.getScore());
    setCombo(scoreCalcRef.current.getCombo());
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
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameStatus, gameLoop]);

  const handleViewResults = useCallback(() => {
    const counts = scoreCalcRef.current.getCounts();
    const accuracy = calculateAccuracy(counts.perfect, counts.great, counts.good, counts.miss);
    const stars = calculateStars(accuracy);
    const xpEarned = calculateXpEarned(scoreCalcRef.current.getScore(), accuracy, gameSong.difficulty);
    const finalizedHandStats = {
      left: { ...handStats.left, accuracy: calculateHandAccuracy(handStats.left) },
      right: { ...handStats.right, accuracy: calculateHandAccuracy(handStats.right) },
    };
    // Wall-clock seconds of actual play time (paused gaps excluded).
    const liveMs = playStartRef.current !== null ? Date.now() - playStartRef.current : 0;
    const durationSec = Math.max(1, Math.round((accumulatedMsRef.current + liveMs) / 1000));
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
        duration: String(durationSec),
        ...(lessonIdParam ? { lessonId: String(lessonIdParam) } : {}),
        leftHand: JSON.stringify(finalizedHandStats.left),
        rightHand: JSON.stringify(finalizedHandStats.right),
      },
    });
  }, [gameSong, handStats, router, lessonIdParam]);

  useEffect(() => {
    if (gameStatus !== 'completed') return;
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

  const handleKeyPress = useCallback(
    (noteNumber: number) => {
      if (gameStatus !== 'playing') return;
      // Kick off audio first — we don't want judging or state bookkeeping
      // to block the synth. audio.playNote is fire-and-forget.
      void audio.playNote(noteNumber);
      const now = performance.now();
      const nextActiveNotes = new Set(activeNotesRef.current);
      nextActiveNotes.add(noteNumber);
      activeNotesRef.current = nextActiveNotes;
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
        setHitGrades((prev) => {
          const next = new Map(prev);
          next.set(noteNumber, result.grade);
          return next;
        });
        pushHitEffect(noteNumber, result.grade, now, result.requiresHold ? 'Hold' : undefined);
        setTimeout(() => {
          setHitGrades((prev) => {
            const next = new Map(prev);
            next.delete(noteNumber);
            return next;
          });
        }, 300);
      }
    },
    [gameStatus, pushHitEffect, recordHandGrade],
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
      if (!previousNotes.has(note)) handleKeyPress(note);
    }
    for (const note of previousNotes) {
      if (!midiActiveNotes.has(note)) handleKeyRelease(note);
    }
    previousMIDINotesRef.current = new Set(midiActiveNotes);
  }, [handleKeyPress, handleKeyRelease, midiActiveNotes]);

  const handlePause = useCallback(() => {
    if (gameStatus === 'playing') {
      cancelAnimationFrame(frameIdRef.current);
      // Bank the elapsed ms so pause gaps don't inflate duration.
      if (playStartRef.current !== null) {
        accumulatedMsRef.current += Date.now() - playStartRef.current;
        playStartRef.current = null;
      }
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
      const t = performance.now() - progress * gameSong.duration * 1000;
      engineRef.current.start(t);
      // Autoplay timeline is anchored to the same virtual-start time as
      // the engine; re-anchor here so paused time doesn't advance the
      // note index (otherwise we'd skip notes on resume).
      songStartPerfRef.current = t;
      playStartRef.current = Date.now();
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
    playStartRef.current = null;
    accumulatedMsRef.current = 0;
    songStartPerfRef.current = null;
    scheduledNotesRef.current = [];
    nextAutoIdxRef.current = 0;
    setCountdownValue(3);
    setGameStatus('countdown');
  }, [gameSong, layout.canvasHeight, layout.judgmentLineY]);

  const handleExit = useCallback(() => {
    cancelAnimationFrame(frameIdRef.current);
    router.replace('/(tabs)/songs');
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" hidden />

      <View
        style={[
          styles.topBar,
          { paddingTop: layout.topInset, height: layout.topInset + layout.topBarHeight },
        ]}
      >
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={handlePause} style={styles.pauseChip} activeOpacity={0.85}>
            <Pause size={12} color={Palette.ink} />
          </TouchableOpacity>
          <View>
            <Text style={styles.songTitle} numberOfLines={1}>{gameSong.title}</Text>
            <View style={styles.songTagsRow}>
              <Pill bg={Palette.primarySoft} color={Palette.primary} size="xs">标准模式</Pill>
              <Pill bg={Palette.chip} color={Palette.ink2} size="xs">1.0×</Pill>
            </View>
          </View>
        </View>
        <View style={styles.topRight}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
        </View>
      </View>

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
            const isRight = note.hand === 'right';
            const color = isRight ? Palette.primary : Palette.lilacInk;
            const shadowColor = isRight ? 'rgba(255,0,122,0.32)' : 'rgba(90,63,214,0.32)';
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
                    backgroundColor: color,
                    shadowColor,
                  },
                ]}
              />
            );
          })}

          <View pointerEvents="none" style={styles.judgmentLine} />
          <View pointerEvents="none" style={styles.judgmentGlow} />
        </View>
      </View>

      <View style={[styles.feedbackArea, { height: layout.feedbackHeight }]}>
        {hitEffects.length > 0 && (
          <Text
            style={[
              styles.gradeText,
              { color: GRADE_COLORS[hitEffects[hitEffects.length - 1].grade] },
            ]}
          >
            {hitEffects[hitEffects.length - 1].label ?? GRADE_LABELS[hitEffects[hitEffects.length - 1].grade]}
          </Text>
        )}
        {combo > 0 && (
          <View style={styles.comboRow}>
            <Text style={styles.comboText}>{combo}× COMBO</Text>
            {combo >= 10 && <Flame size={12} color={Palette.primary} />}
          </View>
        )}
      </View>

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
      </View>

      {gameStatus === 'countdown' && countdownValue > 0 && (
        <View style={styles.overlay}>
          <Text style={styles.countdownText}>{countdownValue}</Text>
          <Text style={styles.countdownSubtext}>♪ 准备...</Text>
        </View>
      )}

      {gameStatus === 'paused' && (
        <View style={styles.overlay}>
          <View style={styles.pausePanel}>
            <Text style={styles.pauseTitle}>已暂停</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleResume}>
              <Text style={styles.primaryButtonText}>继续弹奏</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRestart}>
              <Text style={styles.secondaryButtonText}>重新开始</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={handleExit}>
              <Text style={styles.ghostButtonText}>退出</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {gameStatus === 'completed' && (
        <View style={styles.overlay}>
          <View style={styles.pausePanel}>
            <Text style={styles.pauseTitle}>演奏完成</Text>
            <Text style={styles.finalScore}>{score.toLocaleString()}</Text>
            <Text style={styles.finalCombo}>
              最高连击: {scoreCalcRef.current.getMaxCombo()}×
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleViewResults}>
              <Text style={styles.primaryButtonText}>查看结果</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRestart}>
              <Text style={styles.secondaryButtonText}>再来一次</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={handleExit}>
              <Text style={styles.ghostButtonText}>返回曲库</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pauseChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.3,
  },
  songTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  topRight: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 11,
    color: Palette.ink3,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: FontWeight.heavy,
    color: Palette.ink,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  canvasContainer: { overflow: 'hidden' },
  canvas: { flex: 1, position: 'relative' },
  laneLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(14,14,16,0.04)',
  },
  noteBlock: {
    position: 'absolute',
    borderRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  judgmentLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: Palette.primary,
    borderRadius: 2,
  },
  judgmentGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -10,
    height: 30,
    backgroundColor: Palette.primary,
    opacity: 0.18,
  },
  feedbackArea: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  gradeText: {
    fontSize: 22,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.5,
  },
  comboRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comboText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.2,
  },
  keyboardContainer: {},
  progressContainer: {
    backgroundColor: Palette.chip,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressFill: {
    height: 2,
    backgroundColor: Palette.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(247,246,244,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countdownText: {
    fontSize: 96,
    fontWeight: FontWeight.heavy,
    color: Palette.primary,
    letterSpacing: -3,
  },
  countdownSubtext: {
    fontSize: 14,
    color: Palette.ink2,
    marginTop: 12,
    fontWeight: FontWeight.medium,
  },
  pausePanel: {
    backgroundColor: Palette.card,
    borderRadius: 24,
    padding: 28,
    width: 320,
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.18,
    shadowRadius: 60,
    elevation: 8,
  },
  pauseTitle: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Palette.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: Palette.primary,
    borderRadius: 27,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: Palette.card,
    borderRadius: 27,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.line,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: Palette.ink,
  },
  ghostButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  ghostButtonText: {
    fontSize: 14,
    color: Palette.ink2,
    fontWeight: FontWeight.medium,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: FontWeight.heavy,
    color: Palette.primary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  finalCombo: {
    fontSize: 13,
    color: Palette.ink2,
    fontWeight: FontWeight.medium,
  },
});
