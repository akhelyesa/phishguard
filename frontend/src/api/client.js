const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

/**
 * Analyze an email via the PhishGuard backend.
 * @param {{ subject: string, body: string, urls?: string[] | null }} payload
 */
export async function analyzeEmail(payload) {
  const response = await fetch(`${API_BASE}/analyze/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Analyze failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/**
 * Analyze one URL via the PhishGuard backend.
 * @param {string} url
 */
export async function analyzeUrl(url) {
  const response = await fetch(`${API_BASE}/analyze/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`URL analyze failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/**
 * Pull http(s) / www URLs out of free text.
 * @param {string} text
 * @returns {string[]}
 */
export function extractUrls(text) {
  if (!text) return [];
  const matches = text.match(/\b(?:https?:\/\/|www\.)[^\s<>"')]+/gi) ?? [];
  const seen = new Set();
  const out = [];

  for (const raw of matches) {
    const cleaned = raw.replace(/[.,;:!?)\]]+$/, "");
    const normalized = cleaned.startsWith("http") ? cleaned : `http://${cleaned}`;
    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(normalized);
    }
  }

  return out;
}

/**
 * Hostname helper for URL cards.
 * @param {string} url
 */
export function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
