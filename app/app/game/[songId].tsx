import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// @ts-ignore - Skia types may not fully resolve in all environments
import { Canvas, RoundedRect, Line as SkiaLine, vec } from '@shopify/react-native-skia';

import PianoKeyboard from '../../src/components/Piano/PianoKeyboard';
import { GameEngine, noteToKeyPosition, isBlackKey } from '../../src/engine/GameEngine';
import { ScoreCalculator } from '../../src/engine/ScoreCalculator';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/theme';
import type { HitGrade, VisibleNote } from '../../src/types/game';

// ---------------------------------------------------------------------------
// Demo song data: Twinkle Twinkle Little Star
// ---------------------------------------------------------------------------
const DEMO_SONG = {
  id: 1,
  title: '\u5C0F\u661F\u661F',
  bpm: 120,
  duration: 8,
  tracks: [
    {
      hand: 'right' as const,
      notes: [
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
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOP_BAR_HEIGHT = 44;
const MODE_BAR_HEIGHT = 20;
const KEYBOARD_HEIGHT = 135;
const PROGRESS_BAR_HEIGHT = 3;
const JUDGMENT_FEEDBACK_HEIGHT = 60;
const SAFE_TOP = 50; // approximate safe area
const SAFE_BOTTOM = 34;

const CANVAS_TOP = SAFE_TOP + TOP_BAR_HEIGHT + MODE_BAR_HEIGHT;
const CANVAS_BOTTOM_ABSOLUTE =
  SCREEN_HEIGHT - SAFE_BOTTOM - PROGRESS_BAR_HEIGHT - KEYBOARD_HEIGHT - JUDGMENT_FEEDBACK_HEIGHT;
const CANVAS_HEIGHT = CANVAS_BOTTOM_ABSOLUTE - CANVAS_TOP;
const JUDGMENT_LINE_Y = CANVAS_HEIGHT; // judgment line at bottom of canvas

const START_NOTE = 60; // C4
const NUM_OCTAVES = 2;

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
}

// ---------------------------------------------------------------------------
// Game Screen Component
// ---------------------------------------------------------------------------
export default function GameScreen() {
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const router = useRouter();

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

  // Game state
  const [gameStatus, setGameStatus] = useState<'countdown' | 'playing' | 'paused' | 'completed'>(
    'countdown'
  );
  const [countdownValue, setCountdownValue] = useState(3);

  const frameIdRef = useRef<number>(0);
  const hitEffectIdRef = useRef(0);

  // ------ Initialize engine ------
  useEffect(() => {
    engineRef.current.init(DEMO_SONG, CANVAS_HEIGHT, JUDGMENT_LINE_Y);
    scoreCalcRef.current.reset();
  }, []);

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

    // Check missed notes
    const missedIds = engine.checkMissedNotes(now);
    for (const _id of missedIds) {
      scoreCalcRef.current.calculateHit('miss');
    }

    // Get visible notes
    const notes = engine.getVisibleNotes(now, SCREEN_WIDTH, START_NOTE);
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
      // Song complete
      setTimeout(() => {
        setGameStatus('completed');
      }, 1500);
    }
  }, []);

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

  // ------ Handle key press ------
  const handleKeyPress = useCallback(
    (noteNumber: number) => {
      if (gameStatus !== 'playing') return;

      const now = performance.now();
      const result = engineRef.current.handleNoteInput(noteNumber, now);

      // Add to active notes
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(noteNumber);
        return next;
      });

      if (result) {
        const scoreResult = scoreCalcRef.current.calculateHit(result.grade);
        setScore(scoreCalcRef.current.getScore());
        setCombo(scoreCalcRef.current.getCombo());

        // Set hit grade for key color
        setHitGrades((prev) => {
          const next = new Map(prev);
          next.set(noteNumber, result.grade);
          return next;
        });

        // Show hit effect
        const x = noteToKeyPosition(noteNumber, SCREEN_WIDTH, START_NOTE);
        const effectId = hitEffectIdRef.current++;
        setHitEffects((prev) => [
          ...prev,
          { id: effectId, grade: result.grade, startTime: now, x },
        ]);

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
    [gameStatus]
  );

  const handleKeyRelease = useCallback((noteNumber: number) => {
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(noteNumber);
      return next;
    });
  }, []);

  // ------ Pause / Resume ------
  const handlePause = useCallback(() => {
    if (gameStatus === 'playing') {
      cancelAnimationFrame(frameIdRef.current);
      setGameStatus('paused');
    }
  }, [gameStatus]);

  const handleResume = useCallback(() => {
    if (gameStatus === 'paused') {
      // Adjust start time to account for pause duration
      engineRef.current.start(performance.now() - progress * DEMO_SONG.duration * 1000);
      setGameStatus('playing');
    }
  }, [gameStatus, progress]);

  const handleRestart = useCallback(() => {
    cancelAnimationFrame(frameIdRef.current);
    engineRef.current.reset();
    engineRef.current.init(DEMO_SONG, CANVAS_HEIGHT, JUDGMENT_LINE_Y);
    scoreCalcRef.current.reset();
    setScore(0);
    setCombo(0);
    setProgress(0);
    setVisibleNotes([]);
    setHitEffects([]);
    setCountdownValue(3);
    setGameStatus('countdown');
  }, []);

  const handleExit = useCallback(() => {
    cancelAnimationFrame(frameIdRef.current);
    router.back();
  }, [router]);

  // ------ Render ------
  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {'\u266A'} {DEMO_SONG.title}
        </Text>
        <View style={styles.topRight}>
          <TouchableOpacity onPress={handlePause} style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>{'\u2699'}</Text>
          </TouchableOpacity>
          <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
        </View>
      </View>

      {/* Mode / Speed bar */}
      <View style={styles.modeBar}>
        <View style={styles.modeTag}>
          <Text style={styles.modeTagText}>{'\u6807\u51C6\u6A21\u5F0F'}</Text>
        </View>
        <Text style={styles.speedText}>1.0x</Text>
      </View>

      {/* Falling notes canvas */}
      <View style={[styles.canvasContainer, { height: CANVAS_HEIGHT }]}>
        <Canvas style={styles.canvas}>
          {/* Lane lines */}
          {Array.from({ length: 15 }).map((_, i) => {
            const x = (SCREEN_WIDTH / 14) * i;
            return (
              <SkiaLine
                key={`lane_${i}`}
                p1={vec(x, 0)}
                p2={vec(x, CANVAS_HEIGHT)}
                color="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
            );
          })}

          {/* Falling notes */}
          {visibleNotes.map((note) => {
            const color =
              note.hand === 'left'
                ? isBlackKey(note.note)
                  ? '#3A73B5'
                  : Colors.leftHand
                : isBlackKey(note.note)
                  ? '#3DA863'
                  : Colors.rightHand;

            return (
              <RoundedRect
                key={note.id}
                x={noteToKeyPosition(note.note, SCREEN_WIDTH, START_NOTE) + 1}
                y={note.currentY}
                width={note.width}
                height={note.height}
                r={4}
                color={color}
                opacity={note.opacity}
              />
            );
          })}

          {/* Judgment line */}
          <SkiaLine
            p1={vec(0, JUDGMENT_LINE_Y)}
            p2={vec(SCREEN_WIDTH, JUDGMENT_LINE_Y)}
            color={Colors.accent}
            strokeWidth={3}
          />
        </Canvas>
      </View>

      {/* Judgment feedback area */}
      <View style={styles.feedbackArea}>
        {hitEffects.length > 0 && (
          <View style={styles.gradeContainer}>
            {hitEffects.slice(-1).map((effect) => (
              <Text
                key={effect.id}
                style={[styles.gradeText, { color: GRADE_COLORS[effect.grade] }]}
              >
                {GRADE_LABELS[effect.grade]}
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
      <View style={[styles.keyboardContainer, { height: KEYBOARD_HEIGHT }]}>
        <PianoKeyboard
          startNote={START_NOTE}
          numOctaves={NUM_OCTAVES}
          activeNotes={activeNotes}
          hitGrades={hitGrades}
          onKeyPress={handleKeyPress}
          onKeyRelease={handleKeyRelease}
          width={SCREEN_WIDTH}
          height={KEYBOARD_HEIGHT}
        />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
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

            <TouchableOpacity style={styles.primaryButton} onPress={handleRestart}>
              <Text style={styles.primaryButtonText}>{'\u518D\u6765\u4E00\u6B21'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ghostButton} onPress={handleExit}>
              <Text style={styles.ghostButtonText}>{'\u8FD4\u56DE'}</Text>
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
    paddingTop: SAFE_TOP,
    height: SAFE_TOP + TOP_BAR_HEIGHT,
  },
  songTitle: {
    fontSize: FontSize.h4,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 22,
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
    height: MODE_BAR_HEIGHT,
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
    width: SCREEN_WIDTH,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },

  // Feedback area
  feedbackArea: {
    height: JUDGMENT_FEEDBACK_HEIGHT,
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
    width: SCREEN_WIDTH,
  },

  // Progress
  progressContainer: {
    height: PROGRESS_BAR_HEIGHT + SAFE_BOTTOM,
    paddingBottom: SAFE_BOTTOM,
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressFill: {
    height: PROGRESS_BAR_HEIGHT,
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
    fontSize: FontSize.h4,
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
    fontSize: FontSize.h4,
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
    fontSize: FontSize.h4,
    color: Colors.white,
  },
  ghostButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  ghostButtonText: {
    fontSize: FontSize.h4,
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
