/**
 * HighlightedEmail — subject/body with API highlight_words marked.
 */

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitWithPhrases(text, phrases) {
  if (!text) return [];
  const unique = [...new Set((phrases || []).filter(Boolean))];
  if (unique.length === 0) return [{ text, flagged: false }];

  const sorted = [...unique].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "gi");
  return text
    .split(regex)
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      flagged: sorted.some((p) => p.toLowerCase() === part.toLowerCase()),
    }));
}

/**
 * @param {{ subject: string, body: string, phrases: string[] }} props
 */
export default function HighlightedEmail({ subject, body, phrases }) {
  const subjectParts = splitWithPhrases(subject, phrases);
  const bodyParts = splitWithPhrases(body, phrases);

  return (
    <div className="rounded-xl border border-border bg-surface-sunken p-4 sm:p-5">
      {subject.trim().length > 0 && (
        <p className="mb-3 border-b border-border pb-3 text-sm font-semibold leading-relaxed text-foreground">
          <span className="mr-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Subject
          </span>
          {subjectParts.map((part, i) =>
            part.flagged ? (
              <mark
                key={`s-${i}`}
                className="rounded bg-flag/25 px-0.5 text-flag-foreground"
              >
                {part.text}
              </mark>
            ) : (
              <span key={`s-${i}`}>{part.text}</span>
            ),
          )}
        </p>
      )}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {bodyParts.map((part, i) =>
          part.flagged ? (
            <mark
              key={`b-${i}`}
              className="rounded bg-flag/25 px-0.5 text-flag-foreground"
            >
              {part.text}
            </mark>
          ) : (
            <span key={`b-${i}`}>{part.text}</span>
          ),
        )}
      </p>
    </div>
  );
}
