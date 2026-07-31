import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function toDate(value: Date | string | number): Date | null {
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  if (typeof value === 'number') {
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : null;
  }
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

/** 例：2026年5月19日 */
export function formatDateZh(value: Date | string | number): string {
  const date = toDate(value);
  if (!date) {
    return '—';
  }
  return format(date, 'yyyy年M月d日', { locale: zhCN });
}

/** 例：3 天前 */
export function formatRelativeZh(value: Date | string | number): string {
  const date = toDate(value);
  if (!date) {
    return '—';
  }
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
}
