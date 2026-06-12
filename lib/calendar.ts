export const MONTH_NAMES_SPANISH = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const MONTH_SHORT_NAMES_SPANISH = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export const WEEKDAYS_SPANISH = ["D", "L", "M", "M", "J", "V", "S"];

export const COLOR_CONFIGS = {
  red: {
    badgeColor: "bg-red-950/30 border-red-900/30 text-red-400",
    calendarCell: "bg-red-950/20 text-red-300 border-red-900/30",
    accentText: "text-red-400",
  },
  orange: {
    badgeColor: "bg-orange-950/30 border-orange-900/30 text-orange-400",
    calendarCell: "bg-orange-950/20 text-orange-300 border-orange-900/30",
    accentText: "text-orange-400",
  },
  amber: {
    badgeColor: "bg-amber-950/30 border-amber-900/30 text-amber-400",
    calendarCell: "bg-amber-950/20 text-amber-300 border-amber-900/30",
    accentText: "text-amber-400",
  },
  emerald: {
    badgeColor: "bg-emerald-950/30 border-emerald-900/30 text-emerald-400",
    calendarCell: "bg-emerald-950/20 text-emerald-300 border-emerald-900/30",
    accentText: "text-emerald-400",
  },
  blue: {
    badgeColor: "bg-blue-950/30 border-blue-900/30 text-blue-400",
    calendarCell: "bg-blue-950/20 text-blue-300 border-blue-900/30",
    accentText: "text-blue-400",
  },
  purple: {
    badgeColor: "bg-purple-950/30 border-purple-900/30 text-purple-400",
    calendarCell: "bg-purple-950/20 text-purple-300 border-purple-900/30",
    accentText: "text-purple-400",
  },
  pink: {
    badgeColor: "bg-pink-950/30 border-pink-900/30 text-pink-400",
    calendarCell: "bg-pink-950/20 text-pink-300 border-pink-900/30",
    accentText: "text-pink-400",
  },
  slate: {
    badgeColor: "bg-slate-800/30 border-slate-700/30 text-slate-400",
    calendarCell: "bg-slate-800/20 text-slate-300 border-slate-700/30",
    accentText: "text-slate-400",
  },
};

export function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days: (number | null)[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function formatDateToISO(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}
