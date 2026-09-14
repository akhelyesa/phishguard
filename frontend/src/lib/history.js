const STORAGE_KEY = "phishguard_recent_checks";
const MAX_ITEMS = 8;

/**
 * Load recent analysis summaries from localStorage (browser only).
 * @returns {Array<{ id: string, subject: string, classification: string, risk_score: number, checked_at: string }>}
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

/**
 * Prepend one check summary and persist.
 * @param {{ subject: string, classification: string, risk_score: number }} entry
 */
export function pushHistory(entry) {
  const next = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      subject: (entry.subject || "No subject").slice(0, 80),
      classification: entry.classification,
      risk_score: entry.risk_score,
      checked_at: new Date().toISOString(),
    },
    ...loadHistory().filter(
      (item) =>
        item.subject !== (entry.subject || "No subject").slice(0, 80) ||
        item.classification !== entry.classification,
    ),
  ].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private mode failures
  }
  return next;
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}
