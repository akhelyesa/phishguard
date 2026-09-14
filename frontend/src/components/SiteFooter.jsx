/**
 * SiteFooter — shared footer with real routes for each link.
 */
import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { label: "How it works", to: "/how-it-works" },
  { label: "Features", to: "/features" },
  { label: "FAQ", to: "/faq" },
  { label: "API docs", to: "/api-docs" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border pt-10 text-center">
      <p className="font-display text-base font-semibold text-foreground">PhishGuard</p>

      <nav
        aria-label="Footer"
        className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
      >
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-muted-foreground">
        PhishGuard gives guidance, not certainty. When in doubt, contact the sender through a
        channel you already trust.
      </p>
    </footer>
  );
}
