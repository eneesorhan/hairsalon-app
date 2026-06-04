import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const LONDON_TZ = 'Europe/London';

/**
 * Tarih-saati London zaman dilimine göre al.
 * - Argümansız: şu anki London zamanı
 * - string/Date: o anı London'da göster
 * - string + format: string'i London zamanı olarak parse et
 */
export function getLondonTime(date?: Date | string, format?: string) {
  if (date === undefined) return dayjs().tz(LONDON_TZ);
  if (typeof date === 'string' && format) return dayjs.tz(date, format, LONDON_TZ);
  return dayjs.tz(date, LONDON_TZ);
}

/**
 * Bugünün tarihini London'da al (YYYY-MM-DD)
 */
export function getTodayInLondon() {
  return getLondonTime().format('YYYY-MM-DD');
}

/**
 * Belirtilen gün sayısı sonrasının tarihini al (YYYY-MM-DD)
 */
export function getDateInDays(days: number) {
  return getLondonTime().add(days, 'day').format('YYYY-MM-DD');
}

/**
 * İki saatin arasındaki farkı dakika cinsinden döndür
 */
export function getMinutesDifference(startTime: string, endTime: string): number {
  const start = dayjs(`2024-01-01 ${startTime}`, 'YYYY-MM-DD HH:mm');
  const end = dayjs(`2024-01-01 ${endTime}`, 'YYYY-MM-DD HH:mm');
  return end.diff(start, 'minute');
}

/**
 * Başlangıç saatine verilen dakika kadar ekleyerek bitiş saatini bul
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const endTime = dayjs(`2024-01-01 ${startTime}`, 'YYYY-MM-DD HH:mm').add(durationMinutes, 'minute');
  return endTime.format('HH:mm');
}

/**
 * UTC'deki timestamp'i London zamanına çevir (YYYY-MM-DD HH:mm)
 */
export function convertUTCToLondon(utcDate: Date): string {
  return getLondonTime(utcDate).format('YYYY-MM-DD HH:mm');
}

/**
 * London'daki tarih ve saati UTC timestamp'e çevir
 */
export function convertLondonToUTC(dateStr: string, timeStr: string): Date {
  const londonTime = dayjs.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', LONDON_TZ);
  return londonTime.toDate();
}

/**
 * İnsan tarafından okunabilir format (örn: "4 Haziran 2026, Çarşamba")
 */
export function formatDateReadable(dateStr: string): string {
  return getLondonTime(dateStr).locale('tr').format('D MMMM YYYY, dddd');
}

/**
 * Hafta günü sayısını al (0 = Pazar, 6 = Cumartesi)
 */
export function getDayOfWeek(dateStr: string): number {
  return getLondonTime(dateStr).day();
}

/**
 * Belirtilen tarih geçmiş mi?
 */
export function isDateInPast(dateStr: string): boolean {
  return getLondonTime(dateStr).isBefore(getLondonTime(), 'day');
}

/**
 * Belirtilen tarih ve saat şimdiden sonra mı?
 */
export function isTimeInFuture(dateStr: string, timeStr: string): boolean {
  const appointmentTime = dayjs.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', LONDON_TZ);
  return appointmentTime.isAfter(getLondonTime());
}
