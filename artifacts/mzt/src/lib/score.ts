export const ATMOSPHERE_MULTIPLIERS: Record<number, number> = {
  1: 1.0000, 2: 1.0675, 3: 1.1349, 4: 1.2024, 5: 1.2699,
  6: 1.3373, 7: 1.4048, 8: 1.4723, 9: 1.5397, 10: 1.6072,
};

export function calculateScore(
  rhymes: number,
  structure: number,
  styleExecution: number,
  individuality: number,
  atmosphere: number
): number {
  const base = (rhymes + structure + styleExecution + individuality) * 1.4;
  const score = base * ATMOSPHERE_MULTIPLIERS[atmosphere];
  return Math.min(90, Math.round(score));
}
