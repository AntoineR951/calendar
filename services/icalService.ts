import { CalendarEvent } from '../types';
import { formatDateISO } from './dateUtils';

export const parseICS = (icsContent: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  // Split lines broadly to handle different EOL styles
  const lines = icsContent.split(/\r\n|\n|\r/);
  
  let inEvent = false;
  let currentEvent: Partial<CalendarEvent> = {};
  
  const parseDate = (value: string): string => {
    // Clean up the value (remove whitespace)
    const v = value.trim();
    
    // Handle format YYYYMMDD (8 chars)
    if (v.length === 8) {
      const y = v.substring(0, 4);
      const m = v.substring(4, 6);
      const d = v.substring(6, 8);
      return `${y}-${m}-${d}`;
    }
    
    // Handle format YYYYMMDDTHHMMSS (w/ or w/o Z)
    if (v.length >= 15 && v.includes('T')) {
       const y = v.substring(0, 4);
       const m = v.substring(4, 6);
       const d = v.substring(6, 8);
       return `${y}-${m}-${d}`;
    }
    
    return '';
  };

  for (const line of lines) {
    // Normalize line
    const cleanLine = line.trim();
    
    if (cleanLine.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = { id: crypto.randomUUID(), summary: 'Reserved' };
    } else if (cleanLine.startsWith('END:VEVENT')) {
      inEvent = false;
      if (currentEvent.start && currentEvent.end) {
        // Tokeet and standard iCal use Exclusive End Dates for all-day events.
        // E.g., Start: 11th, End: 14th -> The stay is 11, 12, 13.
        // The 14th is the checkout day.
        
        // We calculate the logical "inclusive" end date for visualization
        const dStart = new Date(currentEvent.start);
        const dEnd = new Date(currentEvent.end);
        
        if (dEnd > dStart) {
             const prevDay = new Date(dEnd);
             prevDay.setDate(prevDay.getDate() - 1);
             currentEvent.end = formatDateISO(prevDay);
        }
        
        events.push(currentEvent as CalendarEvent);
      }
    } else if (inEvent) {
      // Handle properties that might have parameters like DTSTART;VALUE=DATE:2027...
      if (cleanLine.startsWith('DTSTART')) {
        const parts = cleanLine.split(':');
        // parts[0] is property name/params, parts[1] is value
        if (parts.length >= 2) currentEvent.start = parseDate(parts[1]);
      } else if (cleanLine.startsWith('DTEND')) {
        const parts = cleanLine.split(':');
        if (parts.length >= 2) currentEvent.end = parseDate(parts[1]);
      } else if (cleanLine.startsWith('SUMMARY')) {
         const parts = cleanLine.split(':');
         if (parts.length >= 2) currentEvent.summary = parts.slice(1).join(':');
      } else if (cleanLine.startsWith('UID')) {
         const parts = cleanLine.split(':');
         if (parts.length >= 2) currentEvent.id = parts.slice(1).join(':');
      }
    }
  }
  
  return events;
};

export const generateICS = (events: CalendarEvent[]): string => {
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ZenCalendar//Availability//EN\n";
  
  events.forEach(evt => {
    const startStr = evt.start.replace(/-/g, '');
    const endDateObj = new Date(evt.end);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const endStr = formatDateISO(endDateObj).replace(/-/g, '');

    ics += "BEGIN:VEVENT\n";
    ics += `UID:${evt.id}\n`;
    ics += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
    ics += `DTSTART;VALUE=DATE:${startStr}\n`;
    ics += `DTEND;VALUE=DATE:${endStr}\n`;
    ics += `SUMMARY:${evt.summary || 'Reserved'}\n`;
    ics += "END:VEVENT\n";
  });
  
  ics += "END:VCALENDAR";
  return ics;
};

export const downloadICS = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};