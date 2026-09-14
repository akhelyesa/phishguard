/**
 * RecentChecks — local-only history of past analyses (no server).
 */

const LABELS = {
  safe: "Safe",
  suspicious: "Suspicious",
  phishing: "Phishing",
};

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * @param {{
 *   items: Array<{ id: string, subject: string, classification: string, risk_score: number, checked_at: string }>,
 *   onClear: () => void,
 * }} props
 */
export default function RecentChecks({ items, onClear }) {
  if (!items.length) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Recent checks
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-primary hover:text-primary"
        >
          Clear
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Stored only in this browser. Nothing is uploaded as history.
      </p>

      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const key = LABELS[item.classification] ? item.classification : "suspicious";
          const color = `var(--risk-${key})`;
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.subject || "No subject"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatWhen(item.checked_at)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-lg font-semibold" style={{ color }}>
                  {Math.round(item.risk_score)}
                </p>
                <p className="text-xs capitalize" style={{ color }}>
                  {LABELS[key]}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
