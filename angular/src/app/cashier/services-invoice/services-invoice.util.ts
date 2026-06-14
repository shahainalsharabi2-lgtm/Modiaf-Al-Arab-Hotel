export function isWithinDateRange(ymd: string, from: string, to: string): boolean {
  if (!ymd) {
    return false;
  }
  if (from && ymd < from) {
    return false;
  }
  if (to && ymd > to) {
    return false;
  }
  return true;
}
