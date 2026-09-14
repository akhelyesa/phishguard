/**
 * UrlCard — one URL result from the FastAPI URL checker.
 */
import { hostOf } from "../api/client";

const LABELS = {
  safe: "Safe",
  suspicious: "Suspicious",
  phishing: "Phishing",
};

/**
 * @param {{
 *   result: {
 *     url: string,
 *     risk_score: number,
 *     classification: string,
 *     explanation: string,
 *     signals?: { code?: string, message: string, weight: number }[],
 *   },
 *   source?: "email" | "manual",
 * }} props
 */
export default function UrlCard({ result, source = "manual" }) {
  const key = LABELS[result.classification] ? result.classification : "suspicious";
  const color = `var(--risk-${key})`;
  const host = hostOf(result.url);

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{host}</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">{result.url}</p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className="font-display text-2xl font-bold leading-none"
            style={{ color }}
          >
            {Math.round(Number(result.risk_score) || 0)}
          </p>
          <p className="mt-1 text-xs font-medium capitalize" style={{ color }}>
            {LABELS[key]}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {result.explanation}
      </p>

      {result.signals?.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {result.signals.map((signal) => (
            <li
              key={`${result.url}-${signal.code || signal.message}`}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <span className="text-foreground/80">{signal.message}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {signal.weight > 0 ? `+${signal.weight}` : "0"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {source === "email" ? "Found in the email body" : "Checked manually"}
      </p>
    </li>
  );
}
