import type { HitGrade, HitResult } from '../types/game';

/**
 * ScoreCalculator handles scoring, combo tracking, and grade calculation.
 */
export class ScoreCalculator {
  private score: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private counts: Record<HitGrade, number> = {
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
  };

  /**
   * Calculate score for a hit with the given grade.
   * Returns the hit result with earned points and current combo.
   */
  calculateHit(grade: HitGrade): { score: number; combo: number } {
    if (grade === 'miss') {
      this.combo = 0;
      this.counts.miss++;
      return { score: 0, combo: 0 };
    }

    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.counts[grade]++;

    const baseScore = grade === 'perfect' ? 100 : grade === 'great' ? 75 : 50;
    const multiplier = this.getComboMultiplier();
    const points = Math.round(baseScore * multiplier);
    this.score += points;

    return { score: points, combo: this.combo };
  }

  /**
   * Record a miss (no matching note or wrong key).
   */
  recordMiss(): void {
    this.combo = 0;
    this.counts.miss++;
  }

  /**
   * Get the current total score.
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Get the current combo count.
   */
  getCombo(): number {
    return this.combo;
  }

  /**
   * Get the max combo achieved.
   */
  getMaxCombo(): number {
    return this.maxCombo;
  }

  /**
   * Get counts for each grade.
   */
  getCounts(): Record<HitGrade, number> {
    return { ...this.counts };
  }

  /**
   * Reset all scoring state.
   */
  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.counts = { perfect: 0, great: 0, good: 0, miss: 0 };
  }

  private getComboMultiplier(): number {
    if (this.combo >= 100) return 3.0;
    if (this.combo >= 50) return 2.0;
    if (this.combo >= 30) return 1.5;
    if (this.combo >= 10) return 1.2;
    return 1.0;
  }
}
