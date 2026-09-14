/**
 * API docs — same checks as the home page, described for scripts.
 */

const STEPS = [
  {
    title: "Start the API",
    body: "Run the PhishGuard backend on your machine. The home page already talks to these same routes.",
  },
  {
    title: "Send the email or link",
    body: "POST JSON to /analyze/email or /analyze/url. Body is required for email. For a link, send one url string.",
  },
  {
    title: "Read the result",
    body: "You get a 0–100 risk_score and a classification of safe, suspicious, or phishing, plus a short explanation.",
  },
];

const ROUTES = [
  {
    method: "POST",
    path: "/analyze/email",
    title: "Analyze an email",
    body: "Score subject and body the same way the home page does. You can pass URLs you already found; they are included in the text the model sees.",
    send: [
      { name: "body", detail: "Required. The email text." },
      { name: "subject", detail: "Optional. The subject line." },
      { name: "urls", detail: "Optional. A list of links from the message." },
    ],
    receive:
      "risk_score (0–100), classification, explanation, highlight_words, and phishing_probability.",
    example: `{
  "subject": "Your account will be suspended",
  "body": "Verify immediately at http://example.top/login",
  "urls": ["http://example.top/login"]
}`,
  },
  {
    method: "POST",
    path: "/analyze/url",
    title: "Analyze a link",
    body: "Check one URL as text for threat patterns. The API never opens or visits the destination.",
    send: [{ name: "url", detail: "Required. The web address to check." }],
    receive:
      "url, risk_score, classification, explanation, and signals (code, message, and weight).",
    example: `{
  "url": "http://secure-paypal-verify.account-check.top/login"
}`,
  },
  {
    method: "GET",
    path: "/health",
    title: "Check the API is up",
    body: "A simple ping so you can confirm the server is running.",
    send: [],
    receive: '{ "status": "ok" }',
    example: null,
  },
];

export default function ApiDocsPage() {
  return (
    <section>
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        API docs
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        Use the same email and link checks as the app, from a script or your own UI. No account
        required.
      </p>

      <ol className="mt-10 space-y-5 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Step {index + 1}
            </p>
            <h2 className="mt-2 font-display text-base font-semibold text-foreground">
              {step.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-foreground">
        Routes
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Send JSON with Content-Type application/json. Classifications are safe, suspicious, or
        phishing.
      </p>

      <ul className="mt-8 space-y-5">
        {ROUTES.map((route) => (
          <li
            key={route.path}
            className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
          >
            <p className="text-sm font-semibold tracking-wide text-primary">
              {route.method}{" "}
              <span className="text-foreground">{route.path}</span>
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">
              {route.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {route.body}
            </p>

            {route.send.length > 0 && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Send
                </p>
                <ul className="mt-2 space-y-1.5">
                  {route.send.map((field) => (
                    <li key={field.name} className="text-sm leading-relaxed text-foreground/90">
                      <code className="text-foreground">{field.name}</code>
                      <span className="text-muted-foreground"> — {field.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                You get
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {route.receive}
              </p>
            </div>

            {route.example && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Example
                </p>
                <pre className="mt-2 overflow-x-auto rounded-xl border border-border bg-surface-sunken p-4 text-sm leading-relaxed text-foreground/90">
                  <code>{route.example}</code>
                </pre>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
