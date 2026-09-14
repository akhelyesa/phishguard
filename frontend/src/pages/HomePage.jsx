/**
 * HomePage — orchestrates email/URL analysis state and layout.
 */
import { useEffect, useRef, useState } from "react";

import { analyzeEmail, analyzeUrl, extractUrls } from "../api/client";
import EmailAnalyzeForm from "../components/EmailAnalyzeForm";
import EmailRiskSection from "../components/EmailRiskSection";
import LinkSafetySection from "../components/LinkSafetySection";
import RecentChecks from "../components/RecentChecks";
import SiteFooter from "../components/SiteFooter";
import { clearHistory, loadHistory, pushHistory } from "../lib/history";
import { parsePastedEmail } from "../lib/parsePastedEmail";
import { adviceFor, SAFETY_TIPS, SAMPLES } from "../lib/samples";

export default function HomePage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [analyzed, setAnalyzed] = useState(null);
  const [bodyError, setBodyError] = useState(null);
  const [failed, setFailed] = useState(false);
  const [pasteError, setPasteError] = useState(null);

  const [manualUrl, setManualUrl] = useState("");
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [emailUrlResults, setEmailUrlResults] = useState([]);
  const [manualResults, setManualResults] = useState([]);
  const [urlError, setUrlError] = useState(null);
  const [history, setHistory] = useState(() => loadHistory());

  const [tipIndex, setTipIndex] = useState(0);
  const resultRef = useRef(null);
  const linksRef = useRef(null);
  const bodyRef = useRef(null);

  const urlResults = [...manualResults, ...emailUrlResults];

  useEffect(() => {
    if (!analyzing) return undefined;
    const id = setInterval(
      () => setTipIndex((i) => (i + 1) % SAFETY_TIPS.length),
      2400,
    );
    return () => clearInterval(id);
  }, [analyzing]);

  async function checkUrlsFromEmail(urls) {
    if (!urls.length) {
      setEmailUrlResults([]);
      return;
    }

    const checked = await Promise.all(
      urls.map(async (url) => {
        try {
          const data = await analyzeUrl(url);
          return { ...data, _source: "email" };
        } catch (err) {
          return {
            url,
            risk_score: 0,
            classification: "suspicious",
            explanation: err.message || "Failed to analyze URL",
            signals: [],
            _source: "email",
          };
        }
      }),
    );
    setEmailUrlResults(checked);
  }

  async function handleAnalyze(event) {
    event.preventDefault();
    setFailed(false);
    setPasteError(null);

    if (body.trim().length < 10) {
      setBodyError("Paste the email text first. Include at least a sentence or two.");
      return;
    }
    if (body.length > 20000) {
      setBodyError("That email is too long. Paste the important part instead.");
      return;
    }

    setBodyError(null);
    setAnalyzing(true);
    setResult(null);
    setAnalyzed(null);
    setEmailUrlResults([]);
    setTipIndex(Math.floor(Math.random() * SAFETY_TIPS.length));

    const urls = extractUrls(`${subject}\n${body}`);

    try {
      const data = await analyzeEmail({
        subject: subject.slice(0, 300),
        body,
        urls: urls.length > 0 ? urls : null,
      });
      setResult(data);
      setAnalyzed({ subject: subject.slice(0, 300), body });
      setHistory(
        pushHistory({
          subject: subject.slice(0, 300),
          classification: data.classification,
          risk_score: data.risk_score,
        }),
      );
      await checkUrlsFromEmail(urls);
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch {
      setFailed(true);
      setResult(null);
      setAnalyzed(null);
      setEmailUrlResults([]);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handlePaste() {
    setPasteError(null);
    try {
      const text = await navigator.clipboard.readText();
      if (!text || text.trim().length === 0) {
        setPasteError("Nothing to paste. Copy an email first.");
        return;
      }
      const parsed = parsePastedEmail(text);
      if (parsed.subject) {
        setSubject(parsed.subject);
      }
      setBody(parsed.body || text);
      setBodyError(null);
      setResult(null);
      setAnalyzed(null);
      setFailed(false);
      setEmailUrlResults([]);
      bodyRef.current?.focus();
    } catch {
      setPasteError("Clipboard isn't available here. Paste with Ctrl/Cmd+V instead.");
    }
  }

  async function handleCheckUrl(event) {
    event.preventDefault();
    const value = manualUrl.trim();
    if (value.length === 0) {
      setUrlError("Paste a web address to check.");
      return;
    }
    if (value.length > 2000) {
      setUrlError("That address is too long to check.");
      return;
    }

    setUrlError(null);
    setCheckingUrl(true);
    try {
      const data = await analyzeUrl(value);
      setManualResults((prev) =>
        [{ ...data, _source: "manual" }, ...prev.filter((r) => r.url !== data.url)].slice(
          0,
          8,
        ),
      );
      setManualUrl("");
    } catch (err) {
      setUrlError(err.message || "URL check failed");
    } finally {
      setCheckingUrl(false);
    }
  }

  function loadSample(id) {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setSubject(sample.subject);
    setBody(sample.body);
    setResult(null);
    setAnalyzed(null);
    setBodyError(null);
    setFailed(false);
    setEmailUrlResults([]);
  }

  function handleNewAnalysis() {
    setResult(null);
    setAnalyzed(null);
    setSubject("");
    setBody("");
    setBodyError(null);
    setFailed(false);
    setEmailUrlResults([]);
    setManualResults([]);
    bodyRef.current?.focus();
  }

  function handleClearHistory() {
    setHistory(clearHistory());
  }

  function handleBodyChange(value) {
    setBody(value);
    if (bodyError) setBodyError(null);
  }

  function handleManualUrlChange(value) {
    setManualUrl(value);
    if (urlError) setUrlError(null);
  }

  const classification = result?.classification || "safe";
  const emailLinkCount = emailUrlResults.length;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-14 sm:pt-20">
      <header className="text-center">
        <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          PhishGuard
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          Paste a suspicious email. Get a risk score before you click.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Runs locally. Your email isn&apos;t sent to a third-party scanner.
        </p>
      </header>

      <EmailAnalyzeForm
        subject={subject}
        body={body}
        bodyError={bodyError}
        pasteError={pasteError}
        analyzing={analyzing}
        samples={SAMPLES}
        bodyRef={bodyRef}
        onSubjectChange={setSubject}
        onBodyChange={handleBodyChange}
        onSubmit={handleAnalyze}
        onPaste={handlePaste}
        onLoadSample={loadSample}
      />

      <EmailRiskSection
        resultRef={resultRef}
        linksRef={linksRef}
        failed={failed}
        analyzing={analyzing}
        result={result}
        analyzed={analyzed}
        tip={SAFETY_TIPS[tipIndex]}
        advice={adviceFor(classification)}
        emailLinkCount={emailLinkCount}
        onNewAnalysis={handleNewAnalysis}
      />

      <LinkSafetySection
        linksRef={linksRef}
        manualUrl={manualUrl}
        urlError={urlError}
        checkingUrl={checkingUrl}
        urlResults={urlResults}
        onManualUrlChange={handleManualUrlChange}
        onCheckUrl={handleCheckUrl}
      />

      <RecentChecks items={history} onClear={handleClearHistory} />

      <SiteFooter />
    </main>
  );
}
