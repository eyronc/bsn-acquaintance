// Color system strictly matching the Digital Ticket design in the app & STAGE.png
export const SOCIETY_EMAIL_PALETTES = {
  'Society A': {
    name: 'Society A',
    row: 'A',
    headerBg: '#10b981', // Emerald green
    accentColor: '#10b981',
    cardBg: '#e7f5ec',
    bodyBg: '#e8f5ed',
    border: '#a7f3d0',
    borderDark: '#10b981',
    textDark: '#064e3b',
    subtext: '#047857',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#ffffff',
  },
  'Society B': {
    name: 'Society B',
    row: 'B',
    headerBg: '#0ea5e9', // Sky blue
    accentColor: '#0ea5e9',
    cardBg: '#e4f1fb',
    bodyBg: '#f0f7fc',
    border: '#bae6fd',
    borderDark: '#0ea5e9',
    textDark: '#0c4a6e',
    subtext: '#0369a1',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#ffffff',
  },
  'Society C': {
    name: 'Society C',
    row: 'C',
    headerBg: '#8b5cf6', // Lavender / Purple
    accentColor: '#8b5cf6',
    cardBg: '#f1eafd',
    bodyBg: '#f8f5fd',
    border: '#ddd6fe',
    borderDark: '#8b5cf6',
    textDark: '#4c1d95',
    subtext: '#6d28d9',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#ffffff',
  },
  'Society D': {
    name: 'Society D',
    row: 'D',
    headerBg: '#d97706', // Warm Amber
    accentColor: '#d97706',
    cardBg: '#f8f4e6',
    bodyBg: '#fdfbf4',
    border: '#fde68a',
    borderDark: '#d97706',
    textDark: '#78350f',
    subtext: '#b45309',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#ffffff',
  },
  'Society E': {
    name: 'Society E',
    row: 'E',
    headerBg: '#e11d48', // Rose / Pink
    accentColor: '#e11d48',
    cardBg: '#fbe6ef',
    bodyBg: '#fdf2f6',
    border: '#fecdd3',
    borderDark: '#e11d48',
    textDark: '#881337',
    subtext: '#be123c',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#ffffff',
  },
  'Society F': {
    name: 'Society F',
    row: 'F',
    headerBg: '#0d9488', // Teal / Aqua
    accentColor: '#0d9488',
    cardBg: '#e1faf4',
    bodyBg: '#f0fdfa',
    border: '#99f6e4',
    borderDark: '#0d9488',
    textDark: '#134e4a',
    subtext: '#0f766e',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#ffffff',
  },
  'Society G': {
    name: 'Society G',
    row: 'G',
    headerBg: '#ea580c', // Tangerine / Orange
    accentColor: '#ea580c',
    cardBg: '#fdede0',
    bodyBg: '#fff8f2',
    border: '#fed7aa',
    borderDark: '#ea580c',
    textDark: '#7c2d12',
    subtext: '#c2410c',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#ffffff',
  },
};

export function getSocietyEmailTheme(soc) {
  if (!soc) return SOCIETY_EMAIL_PALETTES['Society A'];
  const trimmed = String(soc).trim();
  const match = trimmed.match(/^(?:society\s*)?([A-G])$/i);
  if (match) {
    const letter = match[1].toUpperCase();
    return SOCIETY_EMAIL_PALETTES[`Society ${letter}`] || SOCIETY_EMAIL_PALETTES['Society A'];
  }
  return SOCIETY_EMAIL_PALETTES[soc] || SOCIETY_EMAIL_PALETTES['Society A'];
}
