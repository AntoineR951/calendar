import React, { useState, useEffect } from 'react';
import { ViewMode, CalendarEvent } from './types';
import MonthView from './components/MonthView';
import YearView from './components/YearView';
import { Button } from './components/Button';
import { monthNames } from './services/dateUtils';
import { parseICS, generateICS, downloadICS } from './services/icalService';

interface AppConfig {
  icalUrl: string;
  icalUrlFallback: string;
  proxyUrl: string;
}

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.YEAR);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Load events from external iCal URL via Proxy (with fallback URL)
  useEffect(() => {
    const fetchCalendar = async (icalUrl: string, proxyUrl: string): Promise<CalendarEvent[]> => {
      const url = `${proxyUrl}?url=${encodeURIComponent(icalUrl)}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Erreur réseau lors du chargement");
      
      const icsText = await response.text();
      return parseICS(icsText);
    };

    const loadExternalEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Charger la config depuis le fichier public
        const configResponse = await fetch('/config.json');
        if (!configResponse.ok) throw new Error("Impossible de charger la configuration");
        const config: AppConfig = await configResponse.json();
        
        try {
          // Essayer l'URL principale
          const parsedEvents = await fetchCalendar(config.icalUrl, config.proxyUrl);
          setEvents(parsedEvents);
        } catch (err) {
          console.error("Failed to load from primary URL", err);
          
          // Essayer l'URL de secours
          const parsedEvents = await fetchCalendar(config.icalUrlFallback, config.proxyUrl);
          setEvents(parsedEvents);
        }
      } catch (err) {
        console.error("Failed to load calendar", err);
        setError("Impossible de charger le calendrier.");
      } finally {
        setLoading(false);
      }
    };

    loadExternalEvents();
  }, []);

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentDate(newDate);
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
        
        <div></div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handlePrev} className="!px-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </Button>
          
          <h2 className="text-xl font-semibold text-slate-800 w-48 text-center tabular-nums">
            {currentYear}
          </h2>

          <Button variant="ghost" onClick={handleNext} className="!px-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Button>
        </div>

        <div></div>
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
          <div className="w-6 h-6 border border-slate-300 rounded bg-transparent"></div>
          <span>Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-slate-300 rounded bg-[#C7B0A1]"></div>
          <span>Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-slate-300 rounded" style={{ background: 'linear-gradient(135deg, transparent 50%, #C7B0A1 50%)' }}></div>
          <span>Arrivée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-slate-300 rounded" style={{ background: 'linear-gradient(135deg, #C7B0A1 50%, transparent 50%)' }}></div>
          <span>Départ</span>
        </div>

      </footer>

    </div>
  );
};

export default App;
