export type LevelInfo = {
  level: number;
  progress: number;
  xpInCurrentLevel: number;
  xpNeededForLevel: number;
};

export function calculateLevelInfo(xp: number): LevelInfo {
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 150;

  while (xp >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel += 150 * level;
  }

  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const rawProgress =
    xpNeededForLevel > 0 ? (xpInCurrentLevel / xpNeededForLevel) * 100 : 0;

  const progress = Math.max(0, Math.min(100, rawProgress));

  return { level, progress, xpInCurrentLevel, xpNeededForLevel };
}
