import React, { useState, useEffect } from 'react';
import { ViewMode, CalendarEvent } from './types';
import MonthView from './components/MonthView';
import YearView from './components/YearView';
import { Button } from './components/Button';
import { monthNames } from './services/dateUtils';
import { parseICS, generateICS, downloadICS } from './services/icalService';
import { APP_CONFIG } from './config';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MONTH);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Load events from external iCal URL via Proxy (with fallback URL)
  useEffect(() => {
    const fetchCalendar = async (icalUrl: string): Promise<CalendarEvent[]> => {
      const proxyUrl = `${APP_CONFIG.proxyUrl}?url=${encodeURIComponent(icalUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error("Erreur réseau lors du chargement");
      
      const icsText = await response.text();
      return parseICS(icsText);
    };

    const loadExternalEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Essayer l'URL principale
        const parsedEvents = await fetchCalendar(APP_CONFIG.icalUrl);
        setEvents(parsedEvents);
      } catch (err) {
        console.error("Failed to load from primary URL", err);
        
        // Essayer l'URL de secours
        try {
          const parsedEvents = await fetchCalendar(APP_CONFIG.icalUrlFallback);
          setEvents(parsedEvents);
        } catch (fallbackErr) {
          console.error("Failed to load from fallback URL", fallbackErr);
          setError("Impossible de charger le calendrier.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadExternalEvents();
  }, []);

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === ViewMode.MONTH) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === ViewMode.MONTH) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleExport = () => {
    const icsContent = generateICS(events);
    downloadICS('calendar_backup.ics', icsContent);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Disponibilités</h1>
            {loading && <span className="text-xs text-indigo-500 font-medium animate-pulse">Chargement...</span>}
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
            {!loading && !error && events.length > 0 && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Synchronisé</span>}
          </div>

        </div>

        <div className="flex flex-wrap gap-2 hidden">
          <Button variant="outline" onClick={handleExport} disabled={events.length === 0}>
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export .ics
          </Button>
        </div>
      </header>

      {/* Navigation & Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode(ViewMode.MONTH)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.MONTH ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mois
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.YEAR)}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.YEAR ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Année
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handlePrev} className="!px-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Button>
          
          <h2 className="text-xl font-semibold text-slate-800 w-48 text-center tabular-nums">
            {viewMode === ViewMode.MONTH ? `${monthNames[currentMonth]} ${currentYear}` : `${currentYear}`}
          </h2>

          <Button variant="ghost" onClick={handleNext} className="!px-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Button>
        </div>

        <Button variant="secondary" onClick={handleToday}>
          Aujourd'hui
        </Button>
      </div>

      {/* Main Calendar View */}
      <main className="flex-grow">
        {viewMode === ViewMode.MONTH ? (
          <div className="w-full">
            <MonthView 
              year={currentYear} 
              month={currentMonth} 
              events={events} 
              selectionStart={null}
            />
          </div>
        ) : (
          <YearView 
            year={currentYear} 
            events={events} 
          />
        )}
      </main>

      {/* Legend */}
      <footer className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-slate-300 rounded bg-[#dcfce7]"></div>
          <span>Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-slate-300 rounded bg-[#fca5a5]"></div>
          <span>Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-slate-300 rounded" style={{ background: 'linear-gradient(135deg, #dcfce7 50%, #fca5a5 50%)' }}></div>
          <span>Arrivée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-slate-300 rounded" style={{ background: 'linear-gradient(135deg, #fca5a5 50%, #dcfce7 50%)' }}></div>
          <span>Départ</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
            {new Date().getDate()}
           </div>
           <span>Aujourd'hui</span>
        </div>
      </footer>

    </div>
  );
};

export default App;
