// NOTE: today is intentionally hardcoded to match mock data (2026-02-24).
// Replace with `new Date()` when connecting to a real backend.
export const today = new Date(2026, 1, 24);

export const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function cloneDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const next = cloneDate(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  const next = cloneDate(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDate(date: Date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function formatMonth(date: Date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
}

export function getWeekDays(anchorDate: Date) {
  const mondayOffset = (anchorDate.getDay() + 6) % 7;
  const monday = addDays(anchorDate, -mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    return {
      date: date.getDate(),
      fullDate: date,
      weekday: weekdayNames[date.getDay()],
    };
  });
}
