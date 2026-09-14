/**
 * EmailRiskSection — empty / loading / error / result views for email analysis.
 */
import HighlightedEmail from "./HighlightedEmail";
import RiskMeter from "./RiskMeter";

export default function EmailRiskSection({
  resultRef,
  linksRef,
  failed,
  analyzing,
  result,
  analyzed,
  tip,
  advice,
  emailLinkCount,
  onNewAnalysis,
}) {
  const classification = result?.classification || "safe";

  return (
    <section ref={resultRef} className="mt-10 scroll-mt-6" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Email risk
        </h2>
        {result && (
          <button
            type="button"
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-primary hover:text-primary"
          >
            New analysis
          </button>
        )}
      </div>

      {failed && (
        <div className="mt-4 rounded-2xl border border-risk-phishing/40 bg-surface p-5">
          <p className="font-medium text-foreground">We couldn&apos;t finish the check</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong talking to the PhishGuard API. Try again, and until
            then treat the email as unsafe.
          </p>
        </div>
      )}

      {!failed && analyzing && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">Analyzing…</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foreground/70">
            <span className="text-primary">Safety tip: </span>
            {tip}
          </p>
        </div>
      )}

      {!failed && !analyzing && !result && (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your email risk score and explanation will appear here once you analyze an email.
          </p>
        </div>
      )}

      {!failed && !analyzing && result && analyzed && (
        <div className="mt-4 space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
            <RiskMeter
              score={result.risk_score}
              classification={result.classification}
            />

            <div className="mt-6 space-y-3">
              <p className="text-base leading-relaxed text-foreground/90">
                {result.explanation}
              </p>
              {result.top_contributors?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-muted-foreground">
                    What the model weighed most (toward phishing)
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {result.top_contributors.map((item) => (
                      <li
                        key={item.feature}
                        className="rounded-md border border-border bg-surface-sunken px-2 py-1 text-xs"
                      >
                        {item.feature}
                        <span className="ml-1 text-muted-foreground">
                          ({item.impact})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--risk-${classification}) 12%, transparent)`,
                }}
              >
                <p className="text-sm leading-relaxed text-foreground/90">
                  <span className="font-semibold">What to do: </span>
                  {advice}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Flagged phrases
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {(result.highlight_words?.length ?? 0) > 0
                ? "Highlighted wording below is what the model flagged as cue phrases."
                : "Nothing in the wording matched our warning list."}
            </p>
            <div className="mt-4">
              <HighlightedEmail
                subject={analyzed.subject}
                body={analyzed.body}
                phrases={result.highlight_words || []}
              />
            </div>
          </div>

          {emailLinkCount > 0 && (
            <div className="rounded-2xl border border-border bg-surface/70 px-5 py-4">
              <p className="text-sm leading-relaxed text-foreground/90">
                Found {emailLinkCount} {emailLinkCount === 1 ? "link" : "links"} in this
                email. Details are under Link safety below.
              </p>
              <button
                type="button"
                onClick={() =>
                  linksRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="mt-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Jump to link results
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
