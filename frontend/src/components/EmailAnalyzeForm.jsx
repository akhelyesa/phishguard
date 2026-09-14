/**
 * EmailAnalyzeForm — subject/body inputs, samples, paste & analyze actions.
 */
export default function EmailAnalyzeForm({
  subject,
  body,
  bodyError,
  pasteError,
  analyzing,
  samples,
  bodyRef,
  onSubjectChange,
  onBodyChange,
  onSubmit,
  onPaste,
  onLoadSample,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 rounded-2xl border border-border bg-surface/80 p-5 shadow-lg shadow-background/40 sm:p-6"
    >
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm text-muted-foreground">
          Subject <span className="text-xs">(optional)</span>
        </label>
        <input
          id="subject"
          value={subject}
          maxLength={300}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Your account will be suspended"
          className="h-12 w-full rounded-md border border-input bg-surface-sunken px-3 text-base text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="mt-4 space-y-2">
        <label htmlFor="body" className="text-sm text-muted-foreground">
          Email body
        </label>
        <textarea
          id="body"
          ref={bodyRef}
          value={body}
          maxLength={20000}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Paste the full email text here, including any links."
          className="min-h-44 w-full resize-y rounded-md border border-input bg-surface-sunken px-3 py-2 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          aria-invalid={bodyError ? true : undefined}
          aria-describedby={bodyError ? "body-error" : undefined}
        />
        {bodyError && (
          <p id="body-error" className="text-sm text-risk-phishing">
            {bodyError}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={analyzing}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-md bg-primary px-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analyzing ? "Analyzing…" : "Analyze email"}
        </button>
        <button
          type="button"
          onClick={onPaste}
          disabled={analyzing}
          className="inline-flex h-12 items-center justify-center rounded-md bg-secondary px-5 text-base font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
        >
          Paste from clipboard
        </button>
      </div>
      {pasteError && (
        <p className="mt-2 text-sm text-muted-foreground">{pasteError}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Try a sample
        </span>
        {samples.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => onLoadSample(sample.id)}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-primary hover:text-primary"
          >
            {sample.name}
          </button>
        ))}
      </div>
    </form>
  );
}
