const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysSince(
  isoDate: string,
  now: Date = new Date(),
): number | null {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) {
    return null;
  }
  return Math.floor((now.getTime() - then) / MS_PER_DAY);
}
