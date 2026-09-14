/**
 * HowPhishGuardWorks
 * Explainer plus a screenshot walkthrough of a real check.
 */
import { Link } from "react-router-dom";

import pasteImg from "../assets/how-it-works/how-1-paste.png";
import scoreImg from "../assets/how-it-works/how-2-score.png";
import phrasesImg from "../assets/how-it-works/how-3-phrases.png";
import linksImg from "../assets/how-it-works/how-4-links.png";

const WALKTHROUGH = [
  {
    title: "Paste the email",
    body: "Paste the message, or tap a sample like Bank alert. Then choose Analyze email.",
    alt: "PhishGuard home form filled with a sample bank-alert email, with Analyze email and Paste from clipboard buttons.",
    src: pasteImg,
  },
  {
    title: "Read the score",
    body: "You get a 0–100 score, a plain safe / suspicious / phishing label, and a short next step.",
    alt: "Email risk result showing a score of 98 out of 100, the label Phishing, and advice not to click links or attachments.",
    src: scoreImg,
  },
  {
    title: "See why it flagged",
    body: "Highlighted wording is what raised attention. Use Jump to link results when the email contains a URL.",
    alt: "Flagged phrases view with urgency words highlighted in the sample email, and a link to jump to link results.",
    src: phrasesImg,
  },
  {
    title: "Inspect the links",
    body: "Each link is scored as text only, with the reasons listed. PhishGuard never opens or visits the destination.",
    alt: "Link safety card for a fake PayPal domain, scored 100 phishing, with listed threat signals and weights.",
    src: linksImg,
  },
];

export default function HowPhishGuardWorks() {
  return (
    <section>
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        How PhishGuard works
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        Built as a second opinion before you click, not as a guarantee.
      </p>

      <p className="mt-10 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Example
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        What a check looks like
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        This is the Bank alert sample. Follow the same path with any email you paste.
      </p>

      <ol className="mt-10 space-y-12">
        {WALKTHROUGH.map((step) => (
          <li key={step.title}>
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
            <figure className="mt-5 max-w-lg overflow-hidden rounded-2xl border border-border bg-surface">
              <img
                src={step.src}
                alt={step.alt}
                className="block w-full"
              />
            </figure>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <Link
          to="/"
          className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try it with a sample
        </Link>
      </div>
    </section>
  );
}
