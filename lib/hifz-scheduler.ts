// SM-2 inspired interval calculator for Hifz spaced repetition.
// quality: 0-5  (0-2 = needs repeat, 3 = pass, 4 = good, 5 = perfect)
// Returns next interval in days.
export function nextIntervalDays(
  quality: number,
  previousIntervalDays: number,
  easeFactor: number
): { intervalDays: number; easeFactor: number } {
  const ef = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  let interval: number;
  if (quality < 3) {
    interval = 1; // repeat tomorrow
  } else if (previousIntervalDays <= 1) {
    interval = 3;
  } else if (previousIntervalDays <= 3) {
    interval = 7;
  } else {
    interval = Math.round(previousIntervalDays * ef);
  }

  return { intervalDays: interval, easeFactor: ef };
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Default initial interval (first review after memorization)
export const INITIAL_INTERVAL_DAYS = 1;
export const DEFAULT_EASE_FACTOR = 2.5;
