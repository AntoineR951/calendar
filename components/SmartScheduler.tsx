import React, { useState } from 'react';
import { Button } from './Button';
import { parseNaturalLanguageToEvents } from '../services/geminiService';
import { CalendarEvent } from '../types';

interface SmartSchedulerProps {
  onAddEvents: (events: CalendarEvent[]) => void;
}

const SmartScheduler: React.FC<SmartSchedulerProps> = ({ onAddEvents }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const newEvents = await parseNaturalLanguageToEvents(prompt);
      if (newEvents && newEvents.length > 0) {
        onAddEvents(newEvents);
        setPrompt('');
      } else {
        alert("Couldn't find any dates in that request. Try format like: 'Book next Monday'");
      }
    } catch (err) {
      console.error(err);
      alert("AI Service unavailable. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-3">
        <div>
           <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
            Smart Scheduler (AI)
          </h3>
           <p className="text-xs text-indigo-700 mt-1">Type naturally to block dates (e.g., "Block first week of August for Vacation")</p>
        </div>
      </div>
     
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Reserve next weekend for maintenance..."
          className="flex-grow rounded-lg border-slate-300 border px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
        />
        <Button type="submit" isLoading={loading} variant="primary">
          Block Dates
        </Button>
      </form>
    </div>
  );
};

export default SmartScheduler;
