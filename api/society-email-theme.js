// Celestial Garden email palette — one theme for every society, matching the
// app's landing / login / admin "Celestial Garden" look. Kept email-client safe:
// the card body stays light so the template's dark body text stays readable;
// the header, ticket panel and CTA carry the color.
const CELESTIAL_EMAIL = {
  // Page background behind the card (warm cream)
  bodyBg: '#faf5e9',
  // Hero header — navy fading through teal, more depth than a flat navy block
  headerBg: 'linear-gradient(135deg, #0A1A33 0%, #123a52 42%, #1c5566 70%, #0f2f4a 100%)',
  // Hairline borders around cards / inputs on the light card
  cardBorder: '#e3d3a6',
  // Ring around the circular NSBO logo
  logoBorder: '#E7C15A',
  // "OFFICIAL EVENT PASS" pill on the dark header
  badgeBg: 'rgba(245,222,155,0.16)',
  badgeBorder: 'rgba(245,222,155,0.55)',
  badgeText: '#F5DE9B',
  // Muted gold line under the H1 on the dark header
  subtext: '#e6d4a6',
  // Fill for the CTA button + step-number circles — solid warm gold (navy text).
  // Kept solid (not a gradient) so Outlook and other clients that drop CSS
  // gradients still render a visible button.
  accentColor: '#E7C15A',
  // Deep gold for small labels + the portal link + the access code on the light card
  accentDark: '#8a6d1f',
  // Near-navy for headings on the cream / white card
  highlightText: '#12324a',
  // Warm gold "ticket stub" area holding the access code
  ticketCardBg: 'linear-gradient(135deg, #fdf8ea 0%, #f5e8c9 100%)',
  ticketBorder: '#E7C15A',
  // Warm gold glow under the CTA / circles
  accentShadow: 'rgba(231,193,90,0.38)',
};

const SOCIETY_CODE_MAP = {
  'traditional hilot society': 'TH',
  'public health nursing society': 'PH',
  'nursing informatics society': 'I',
  'nurses against hypertension society': 'H',
  'oncology nursing society': 'O',
  'renal nursing society': 'R',
  'mental health society': 'MH',
  'maternal and child society': 'MC',
  'healthy lung society': 'HL',
  'gerontology society': 'G',
  'disaster nursing society': 'DN',
  'diabetology society': 'D',
};

function normalizeSocietyName(soc) {
  if (!soc) return 'Nursing Informatics Society';
  const trimmed = String(soc).trim();
  const lower = trimmed.toLowerCase();
  for (const name of Object.keys(SOCIETY_CODE_MAP)) {
    if (lower === name || lower === SOCIETY_CODE_MAP[name].toLowerCase()) {
      return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return trimmed;
}

export function getSocietyEmailTheme(soc) {
  const name = normalizeSocietyName(soc);
  const code = SOCIETY_CODE_MAP[name.toLowerCase()] || 'I';
  return { ...CELESTIAL_EMAIL, name, row: code, code };
}
