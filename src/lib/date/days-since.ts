const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysSince(isoDate: string, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(isoDate).getTime()) / MS_PER_DAY);
}
