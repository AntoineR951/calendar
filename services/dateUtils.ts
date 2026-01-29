export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const formatDateISO = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const isDateInRange = (checkDate: string, start: string, end: string): boolean => {
  return checkDate >= start && checkDate <= end;
};

export const getMonthGrid = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  // Adjust for Monday start if desired, currently Sunday start
  const daysFromPrevMonth = startingDayOfWeek;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalSlots = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;
  
  const grid: { date: Date; isCurrentMonth: boolean }[] = [];
  
  // Previous month fill
  for (let i = 0; i < daysFromPrevMonth; i++) {
    grid.push({
      date: new Date(year, month, -daysFromPrevMonth + 1 + i),
      isCurrentMonth: false
    });
  }
  
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  
  // Next month fill
  const remainingSlots = totalSlots - grid.length;
  for (let i = 1; i <= remainingSlots; i++) {
    grid.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }
  
  return grid;
};

export const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];
