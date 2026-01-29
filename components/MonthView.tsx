import React from 'react';
import { CalendarEvent, DayCell } from '../types';
import { getMonthGrid, formatDateISO, isDateInRange, monthNames } from '../services/dateUtils';

interface MonthViewProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  compact?: boolean; // For Year View
  onDateClick?: (date: string) => void;
  selectionStart?: string | null; // Currently selected start date for range selection
}

const MonthView: React.FC<MonthViewProps> = ({ 
  year, 
  month, 
  events, 
  compact = false, 
  onDateClick,
  selectionStart
}) => {
  const gridRaw = getMonthGrid(year, month);
  const today = formatDateISO(new Date());

  const grid: DayCell[] = gridRaw.map(cell => {
    const dateStr = formatDateISO(cell.date);
    const dayEvents = events.filter(e => isDateInRange(dateStr, e.start, e.end));
    
    return {
      date: dateStr,
      isCurrentMonth: cell.isCurrentMonth,
      isToday: dateStr === today,
      events: dayEvents
    };
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Visualization constants
  const COLOR_FREE = '#dcfce7'; // green-100
  const COLOR_RESERVED = '#fca5a5'; // rose-300
  
  const getStatus = (date: string, dayEvents: CalendarEvent[]) => {
    if (dayEvents.length === 0) return 'free';
    if (dayEvents.length > 1) return 'full'; // Overlap = Full

    const event = dayEvents[0];
    const isStart = event.start === date;
    const isEnd = event.end === date;

    if (isStart && isEnd) return 'full';
    if (isStart) return 'start'; // Morning Free, Eve Reserved
    if (isEnd) return 'end'; // Morning Reserved, Eve Free
    return 'full';
  };

  const getBackgroundStyle = (status: string) => {
    switch (status) {
      case 'start':
        return { background: `linear-gradient(135deg, ${COLOR_FREE} 50%, ${COLOR_RESERVED} 50%)` };
      case 'end':
        return { background: `linear-gradient(135deg, ${COLOR_RESERVED} 50%, ${COLOR_FREE} 50%)` };
      case 'full':
        return { backgroundColor: COLOR_RESERVED };
      case 'free':
      default:
        return { backgroundColor: COLOR_FREE };
    }
  };

  return (
    <div className={`flex flex-col bg-white ${!compact ? 'rounded-2xl shadow-sm border border-slate-200 overflow-hidden' : ''}`}>
      {/* Header */}
      <div className={`${compact ? 'py-2 px-2' : 'py-4 px-6'} bg-white border-b border-slate-100 flex items-center justify-between`}>
        <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-slate-800`}>
          {monthNames[month]} <span className="font-normal text-slate-500">{year}</span>
        </h3>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {weekDays.map(day => (
          <div key={day} className={`text-center ${compact ? 'py-1 text-[10px]' : 'py-3 text-xs'} font-medium text-slate-400 uppercase tracking-wider`}>
            {day.slice(0, compact ? 1 : 3)}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-7 ${compact ? 'auto-rows-fr' : ''}`}>
        {grid.map((cell, idx) => {
          const status = getStatus(cell.date, cell.events);
          const bgStyle = getBackgroundStyle(status);
          const isSelectedStart = selectionStart === cell.date;
          
          return (
            <div 
              key={`${cell.date}-${idx}`}
              onClick={() => onDateClick?.(cell.date)}
              style={bgStyle}
              className={`
                relative border border-white transition-all duration-200
                ${compact ? 'h-8 sm:h-10' : 'h-24 sm:h-32'}
                ${!cell.isCurrentMonth ? 'opacity-40' : ''}
                ${!compact && 'hover:brightness-95 cursor-pointer'}
                ${isSelectedStart ? 'ring-2 ring-indigo-500 ring-inset z-10' : ''}
              `}
            >
              <div className={`
                absolute top-1 left-1 sm:top-2 sm:left-2 flex items-center justify-center
                ${compact ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-sm'}
                rounded-full
                ${cell.isToday ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-700 font-medium'}
              `}>
                {parseInt(cell.date.split('-')[2])}
              </div>

              {/* No more text labels here, just color */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
