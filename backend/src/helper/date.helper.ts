export const BUSINESS_TIMEZONE = 'Asia/Jakarta';

// Normalisasi calendar date (YYYY-MM-DD) berdasarkan business timezone, bukan timezone runtime.
export function getBusinessCalendarDateString(
  date: Date | string | null | undefined,
  timeZone: string = BUSINESS_TIMEZONE,
): string | null {
  if (date === null || date === undefined) {
    return null;
  }

  if (typeof date === 'string') {
    const trimmed = date.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-').map(Number);
      const testDate = new Date(Date.UTC(year, month - 1, day));
      if (
        testDate.getUTCFullYear() === year &&
        testDate.getUTCMonth() === month - 1 &&
        testDate.getUTCDate() === day
      ) {
        return trimmed;
      }
      return null;
    }
  }

  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(parsedDate);
  } catch {
    return null;
  }
}

// Gunakan business timezone agar perbandingan tanggal deterministik di setiap environment.
export function isBusinessDateOnOrAfterToday(
  pickupDate: Date | string | null | undefined,
  referenceNow: Date = new Date(),
  timeZone: string = BUSINESS_TIMEZONE,
): boolean {
  const targetDateStr = getBusinessCalendarDateString(pickupDate, timeZone);
  if (!targetDateStr) {
    return false;
  }

  const todayStr = getBusinessCalendarDateString(referenceNow, timeZone);
  if (!todayStr) {
    return false;
  }

  return targetDateStr >= todayStr;
}
