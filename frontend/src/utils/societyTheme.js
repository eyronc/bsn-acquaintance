// Unified Light Pastel Color System for Societies
export const SOCIETY_THEMES = {
  'Society A': {
    name: 'Society A',
    row: 'A',
    bgLight: 'bg-emerald-50/90',
    border: 'border-emerald-300',
    borderLight: 'border-emerald-200',
    text: 'text-emerald-900',
    textDark: 'text-emerald-950',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    tabActive: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
    tabInactive: 'bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100/90 border border-emerald-200',
    tableRing: 'ring-emerald-300/80',
    tableBorder: 'border-emerald-300',
    accentColor: '#10b981',
  },
  'Society B': {
    name: 'Society B',
    row: 'B',
    bgLight: 'bg-sky-50/90',
    border: 'border-sky-300',
    borderLight: 'border-sky-200',
    text: 'text-sky-900',
    textDark: 'text-sky-950',
    badge: 'bg-sky-100 text-sky-900 border-sky-300',
    tabActive: 'bg-sky-600 text-white shadow-md shadow-sky-600/30',
    tabInactive: 'bg-sky-50/80 text-sky-800 hover:bg-sky-100/90 border border-sky-200',
    tableRing: 'ring-sky-300/80',
    tableBorder: 'border-sky-300',
    accentColor: '#0ea5e9',
  },
  'Society C': {
    name: 'Society C',
    row: 'C',
    bgLight: 'bg-purple-50/90',
    border: 'border-purple-300',
    borderLight: 'border-purple-200',
    text: 'text-purple-900',
    textDark: 'text-purple-950',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
    tabActive: 'bg-purple-600 text-white shadow-md shadow-purple-600/30',
    tabInactive: 'bg-purple-50/80 text-purple-800 hover:bg-purple-100/90 border border-purple-200',
    tableRing: 'ring-purple-300/80',
    tableBorder: 'border-purple-300',
    accentColor: '#8b5cf6',
  },
  'Society D': {
    name: 'Society D',
    row: 'D',
    bgLight: 'bg-amber-50/90',
    border: 'border-amber-300',
    borderLight: 'border-amber-200',
    text: 'text-amber-900',
    textDark: 'text-amber-950',
    badge: 'bg-amber-100 text-amber-950 border-amber-300',
    tabActive: 'bg-amber-600 text-white shadow-md shadow-amber-600/30',
    tabInactive: 'bg-amber-50/80 text-amber-900 hover:bg-amber-100/90 border border-amber-200',
    tableRing: 'ring-amber-300/80',
    tableBorder: 'border-amber-300',
    accentColor: '#d97706',
  },
  'Society E': {
    name: 'Society E',
    row: 'E',
    bgLight: 'bg-rose-50/90',
    border: 'border-rose-300',
    borderLight: 'border-rose-200',
    text: 'text-rose-900',
    textDark: 'text-rose-950',
    badge: 'bg-rose-100 text-rose-900 border-rose-300',
    tabActive: 'bg-rose-600 text-white shadow-md shadow-rose-600/30',
    tabInactive: 'bg-rose-50/80 text-rose-800 hover:bg-rose-100/90 border border-rose-200',
    tableRing: 'ring-rose-300/80',
    tableBorder: 'border-rose-300',
    accentColor: '#e11d48',
  },
  'Society F': {
    name: 'Society F',
    row: 'F',
    bgLight: 'bg-teal-50/90',
    border: 'border-teal-300',
    borderLight: 'border-teal-200',
    text: 'text-teal-900',
    textDark: 'text-teal-950',
    badge: 'bg-teal-100 text-teal-950 border-teal-300',
    tabActive: 'bg-teal-600 text-white shadow-md shadow-teal-600/30',
    tabInactive: 'bg-teal-50/80 text-teal-800 hover:bg-teal-100/90 border border-teal-200',
    tableRing: 'ring-teal-300/80',
    tableBorder: 'border-teal-300',
    accentColor: '#0d9488',
  },
  'Society G': {
    name: 'Society G',
    row: 'G',
    bgLight: 'bg-yellow-50/90',
    border: 'border-yellow-300',
    borderLight: 'border-yellow-200',
    text: 'text-yellow-950',
    textDark: 'text-yellow-950',
    badge: 'bg-yellow-100 text-yellow-950 border-yellow-300',
    tabActive: 'bg-yellow-600 text-white shadow-md shadow-yellow-600/30',
    tabInactive: 'bg-yellow-50/80 text-yellow-900 hover:bg-yellow-100/90 border border-yellow-200',
    tableRing: 'ring-yellow-300/80',
    tableBorder: 'border-yellow-300',
    accentColor: '#ca8a04',
  },
};

export function getSocietyTheme(societyName) {
  if (!societyName) return SOCIETY_THEMES['Society A'];
  const trimmed = String(societyName).trim();
  if (SOCIETY_THEMES[trimmed]) return SOCIETY_THEMES[trimmed];
  
  // Match single letter e.g. "A" -> "Society A"
  const letterMatch = trimmed.match(/^[A-G]$/i) || trimmed.match(/Society\s*([A-G])/i);
  if (letterMatch) {
    const letter = (letterMatch[1] || letterMatch[0]).toUpperCase();
    if (SOCIETY_THEMES[`Society ${letter}`]) {
      return SOCIETY_THEMES[`Society ${letter}`];
    }
  }
  
  // Default fallback for custom societies
  return {
    name: trimmed,
    row: 'Custom',
    bgLight: 'bg-indigo-50/90',
    border: 'border-indigo-300',
    borderLight: 'border-indigo-200',
    text: 'text-indigo-900',
    textDark: 'text-indigo-950',
    badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    tabActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30',
    tabInactive: 'bg-indigo-50/80 text-indigo-800 hover:bg-indigo-100/90 border border-indigo-200',
    tableRing: 'ring-indigo-300/80',
    tableBorder: 'border-indigo-300',
    accentColor: '#4f46e5',
  };
}
