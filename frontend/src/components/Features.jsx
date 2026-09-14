/**
 * Features — capability list for the Features page.
 */
const FEATURES = [
  {
    title: "Email risk score",
    body: "Paste subject and body to get a 0-100 score and a plain safe / suspicious / phishing label.",
  },
  {
    title: "Flagged phrases",
    body: "See which urgency or security cue words in the message raised attention.",
  },
  {
    title: "Link safety",
    body: "Links in the email are checked as text for common threat patterns. You can also paste a URL yourself.",
  },
  {
    title: "Recent checks",
    body: "Your last analyses stay on this device only, so you can glance back without an account.",
  },
];

export default function Features() {
  return (
    <section>
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Features
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        Everything here is built for one job: a second look before you click.
      </p>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <h2 className="font-display text-base font-semibold text-foreground">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
