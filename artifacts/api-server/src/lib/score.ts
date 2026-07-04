/**
 * mzt custom 90-point scoring system.
 *
 * Base criteria (each 1–10): rhymes, structure, styleExecution, individuality
 * Multiplier (1–10): atmosphere
 *
 * Formula:
 *   step1 = (rhymes + structure + styleExecution + individuality) * 1.4
 *   step2 = step1 * ATMOSPHERE_MULTIPLIERS[atmosphere]
 *   score = min(90, round(step2))
 */
const ATMOSPHERE_MULTIPLIERS: Record<number, number> = {
  1: 1.0000,
  2: 1.0675,
  3: 1.1349,
  4: 1.2024,
  5: 1.2699,
  6: 1.3373,
  7: 1.4048,
  8: 1.4723,
  9: 1.5397,
  10: 1.6072,
};

export function calculateScore(
  rhymes: number,
  structure: number,
  styleExecution: number,
  individuality: number,
  atmosphere: number
): number {
  const base = (rhymes + structure + styleExecution + individuality) * 1.4;
  const multiplier = ATMOSPHERE_MULTIPLIERS[atmosphere] ?? 1.0;
  return Math.min(90, Math.round(base * multiplier));
}
