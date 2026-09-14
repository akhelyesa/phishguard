/**
 * LinkSafetySection — manual URL check form and result cards.
 */
import UrlCard from "./UrlCard";

export default function LinkSafetySection({
  linksRef,
  manualUrl,
  urlError,
  checkingUrl,
  urlResults,
  onManualUrlChange,
  onCheckUrl,
}) {
  return (
    <section ref={linksRef} className="mt-10 scroll-mt-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        Link safety
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Links in the email are checked automatically. You can also paste one yourself.
      </p>

      <form onSubmit={onCheckUrl} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <input
            value={manualUrl}
            maxLength={2000}
            onChange={(e) => onManualUrlChange(e.target.value)}
            placeholder="https://example-login.top/verify"
            aria-label="Web address to check"
            className="h-12 w-full rounded-md border border-input bg-surface-sunken px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={checkingUrl}
          className="inline-flex h-12 items-center justify-center rounded-md bg-secondary px-6 text-base font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
        >
          {checkingUrl ? "Checking…" : "Check URL"}
        </button>
      </form>
      {urlError && <p className="mt-2 text-sm text-risk-phishing">{urlError}</p>}

      {urlResults.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {urlResults.map((r) => (
            <UrlCard
              key={`${r._source}-${r.url}`}
              result={r}
              source={r._source === "email" ? "email" : "manual"}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface/50 p-6 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            No links yet. Analyze an email or paste an address above to check one.
          </p>
        </div>
      )}
    </section>
  );
}
