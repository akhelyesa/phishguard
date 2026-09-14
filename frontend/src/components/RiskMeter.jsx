/**
 * RiskMeter — semicircle gauge for 0–100 risk (presentational).
 */

const LABELS = {
  safe: "Safe",
  suspicious: "Suspicious",
  phishing: "Phishing",
};

/**
 * @param {{ score: number, classification: string }} props
 */
export default function RiskMeter({ score, classification }) {
  const radius = 82;
  const stroke = 14;
  const circumference = Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, Number(score) || 0));
  const dash = (clamped / 100) * circumference;
  const key = LABELS[classification] ? classification : "suspicious";
  const color = `var(--risk-${key})`;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 116"
        className="w-full max-w-[260px]"
        role="img"
        aria-label={`Risk score ${Math.round(clamped)} of 100`}
      >
        <path
          d={`M ${100 - radius} 100 A ${radius} ${radius} 0 0 1 ${100 + radius} 100`}
          fill="none"
          stroke="var(--meter-track)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${100 - radius} 100 A ${radius} ${radius} 0 0 1 ${100 + radius} 100`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{
            transition:
              "stroke-dasharray 700ms cubic-bezier(0.22,1,0.36,1), stroke 400ms ease",
          }}
        />
        <text
          x="100"
          y="88"
          textAnchor="middle"
          className="font-display"
          style={{
            fill: color,
            fontSize: "54px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          {Math.round(clamped)}
        </text>
      </svg>
      <div className="-mt-2 flex flex-col items-center gap-1">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Risk score / 100
        </span>
        <span
          className="font-display text-2xl font-semibold tracking-tight capitalize"
          style={{ color }}
        >
          {LABELS[key]}
        </span>
      </div>
    </div>
  );
}
