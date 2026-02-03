import React from 'react';
import { CalendarEvent } from '../types';
import MonthView from './MonthView';

interface YearViewProps {
  year: number;
  events: CalendarEvent[];
}

const YearView: React.FC<YearViewProps> = ({ year, events }) => {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {months.map(month => (
        <div key={month} className="border border-slate-200 overflow-hidden bg-white">
          <MonthView 
            year={year} 
            month={month} 
            events={events} 
            compact={true} 
          />
        </div>
      ))}
    </div>
  );
};

export default YearView;
