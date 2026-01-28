import React from 'react';
import { CalendarEvent } from '../types';

interface SmartSchedulerProps {
  onAddEvents: (events: CalendarEvent[]) => void;
}

const SmartScheduler: React.FC<SmartSchedulerProps> = ({ onAddEvents }) => {
  return null;
};

export default SmartScheduler;