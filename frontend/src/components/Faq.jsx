/**
 * Faq — Pipe-style layout (search + topic filter + accordion),
 * adapted to PhishGuard theme and existing page shell.
 */
import { useMemo, useState } from "react";

const TOPICS = [
  { id: "general", label: "General" },
  { id: "privacy", label: "Privacy" },
  { id: "limits", label: "Limits" },
];

const ITEMS = [
  {
    id: "what",
    topic: "general",
    q: "What is PhishGuard?",
    a: "PhishGuard is a local tool that checks a suspicious email or link before you click. You paste the message, get a risk score (safe, suspicious, or phishing), see flagged phrases, and review link warnings in plain language.",
  },
  {
    id: "why",
    topic: "general",
    q: "Why should I use it?",
    a: "Scam emails often look real. PhishGuard gives you a quick second look so you can protect passwords, bank details, and your devices before you interact with a message.",
  },
  {
    id: "who",
    topic: "general",
    q: "Who is it for?",
    a: "Anyone who gets email or links on a phone or computer. You do not need technical skills. Paste the text, then read the result.",
  },
  {
    id: "cost",
    topic: "general",
    q: "Does it cost anything?",
    a: "No. PhishGuard is free for personal use on your own machine. There are no paid plans.",
  },
  {
    id: "different",
    topic: "general",
    q: "How is PhishGuard different from other tools?",
    a: "Many security tools are built for technical users and large malware databases. PhishGuard is built for everyday decisions: paste a message, get a clear risk score, see flagged phrases, and check links as text, without needing specialist knowledge.",
  },
  {
    id: "private",
    topic: "privacy",
    q: "Is my email private?",
    a: "Yes for this setup. Checks run through your local PhishGuard API, not a public third-party inbox scanner. Links are read as text only. PhishGuard never opens or visits them.",
  },
  {
    id: "reliable",
    topic: "limits",
    q: "Is the analysis 100% reliable?",
    a: "No security tool can promise that. Scammers change tactics often. Treat PhishGuard as support, not a guarantee. If something still feels wrong, do not click. Contact the sender through a channel you already trust.",
  },
  {
    id: "languages",
    topic: "limits",
    q: "Does it work in other languages?",
    a: "Link checks work in any language. Email wording scores work best on English today.",
  },
];

export default function Faq() {
  const [topic, setTopic] = useState("general");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState("what");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ITEMS.filter((item) => {
      if (!needle && item.topic !== topic) return false;
      if (needle) {
        return (
          item.q.toLowerCase().includes(needle) ||
          item.a.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [topic, query]);

  const headingLabel = query.trim()
    ? "Search results"
    : (TOPICS.find((t) => t.id === topic)?.label ?? "General");

  function toggle(id) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <section>
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Quick answers
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        FAQ
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Your questions answered
      </p>

      <label className="relative mt-6 block">
        <span className="sr-only">Search FAQ</span>
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search privacy, reliability, languages..."
          className="h-12 w-full rounded-md border border-input bg-surface-sunken py-2 pl-10 pr-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        />
      </label>

      <div className="mt-10 grid gap-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10">
        <aside>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Filter by topic
          </p>
          <div className="mt-3 flex flex-row flex-wrap gap-2 md:flex-col">
            {TOPICS.map((item) => {
              const active = item.id === topic;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTopic(item.id);
                    const first = ITEMS.find((faq) => faq.topic === item.id);
                    setOpenId(first?.id ?? null);
                  }}
                  className={
                    active
                      ? "rounded-md bg-secondary px-3 py-2 text-left text-sm font-semibold text-foreground"
                      : "rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {headingLabel}
          </h2>

          {filtered.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No matches. Try another topic or clear the search.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border border-t border-border">
              {filtered.map((item) => {
                const open = openId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    >
                      <span className="font-display text-base font-semibold text-foreground">
                        {item.q}
                      </span>
                      <span
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-sm text-muted-foreground"
                        aria-hidden="true"
                      >
                        {open ? "−" : "+"}
                      </span>
                    </button>
                    {open && (
                      <p className="pb-5 pr-12 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
