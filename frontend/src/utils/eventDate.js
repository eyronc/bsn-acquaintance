// Single source of truth for the BSN Acquaintance Party 2026 start time.
// September 26, 2026, 5:00 PM Philippine Time (UTC+8).
export const EVENT_START = new Date('2026-09-26T17:00:00+08:00');

export function getCountdownParts(ms) {
  const total = Math.floor(Math.max(0, ms) / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
