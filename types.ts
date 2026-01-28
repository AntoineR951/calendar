export interface CalendarEvent {
  id: string;
  start: string; // ISO Date String YYYY-MM-DD
  end: string;   // ISO Date String YYYY-MM-DD
  summary: string;
}

export enum ViewMode {
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export interface DayCell {
  date: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}
