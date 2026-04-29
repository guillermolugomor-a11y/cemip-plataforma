/**
 * Clinical Date Utilities for CEMIP
 * Ensures consistency between local UI and DB storage
 */

export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowLocalDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateString(tomorrow);
};

export const getDayNameES = (date: Date): string => {
  const daysES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return daysES[date.getDay()];
};

export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const monthsES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return `${day} ${monthsES[parseInt(month) - 1]}`;
};

export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  let dateStr = birthDate;

  // Handle DD/MM/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(birthDate)) {
    const [d, m, y] = birthDate.split('/');
    dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  try {
    const today = new Date();
    const birth = new Date(dateStr + 'T12:00:00');
    
    if (isNaN(birth.getTime())) return 0;

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch (e) {
    console.error('Error calculating age:', e);
    return 0;
  }
};

export function formatTime(time: string): string {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}

export function isBirthdayToday(birthDate: string): boolean {
  if (!birthDate) return false;
  let dateStr = birthDate;

  // Handle DD/MM/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(birthDate)) {
    const [d, m, y] = birthDate.split('/');
    dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const today = new Date();
  const parts = dateStr.split('-');
  if (parts.length < 3) return false;
  
  const m = parseInt(parts[1]);
  const d = parseInt(parts[2]);
  
  return (today.getMonth() + 1 === m) && today.getDate() === d;
}

export function isBirthdayThisWeek(birthDate: string): boolean {
  if (!birthDate) return false;
  const today = new Date();
  const [y, m, d] = birthDate.split('-').map(Number);
  const birthThisYear = new Date(today.getFullYear(), m - 1, d);
  
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = (birthThisYear.getTime() - today.getTime()) / oneDay;
  
  return diffDays >= 0 && diffDays <= 7;
}
