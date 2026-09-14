/**
 * PageShell — shared chrome for inner pages (back + footer).
 */
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import SiteFooter from "./SiteFooter";

export default function PageShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-10 sm:pt-14">
      <div className="mb-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          ← Back
        </button>
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          PhishGuard
        </Link>
      </div>

      <Outlet />
      <SiteFooter />
    </div>
  );
}
