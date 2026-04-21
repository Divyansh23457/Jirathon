import { useEffect, useState } from "react";
import EstimatorForm, { type FormValues } from "./components/EstimatorForm";
import ResultPanel from "./components/ResultPanel";
import HistoryPanel from "./components/HistoryPanel";
import ThemeToggle from "./components/ThemeToggle";
import { fetchJiraStory } from "./api/jira";
import { estimateStory } from "./api/gemini";
import type { EstimationRecord } from "./types";

const HISTORY_KEY = "jirathon:history";
const MAX_HISTORY = 20;

function loadHistory(): EstimationRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<EstimationRecord | null>(null);
  const [history, setHistory] = useState<EstimationRecord[]>(loadHistory);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setActive(null);
    try {
      setStatus("Fetching story from Jira…");
      const story = await fetchJiraStory(
        values.domain,
        values.email,
        values.apiToken,
        values.storyId,
      );

      setStatus("Asking Gemini to analyse the story…");
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? "";
      const result = await estimateStory(apiKey, story);

      const record: EstimationRecord = {
        id: `${story.key}-${Date.now()}`,
        storyKey: story.key,
        summary: story.summary,
        result,
        createdAt: Date.now(),
      };
      setActive(record);
      setHistory((prev) => [record, ...prev].slice(0, MAX_HISTORY));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark">⚡</span>
          <span className="brand-name">Jirathon</span>
          <span className="brand-tag">· AI story estimator</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="grid">
        <div>
          <section className="card">
            <h2>Estimate a story</h2>
            <p className="subtitle">
              Enter your Jira credentials and a story ID. Gemini will rate it
              and propose a roadmap.
            </p>
            <EstimatorForm loading={loading} onSubmit={handleSubmit} />

            {status && (
              <div className="status-line" style={{ marginTop: 16 }}>
                <span className="status-dot" />
                {status}
              </div>
            )}
            {error && (
              <div className="error" style={{ marginTop: 16 }}>
                {error}
              </div>
            )}
          </section>

          {active && <ResultPanel record={active} />}
        </div>

        <aside>
          <HistoryPanel
            history={history}
            activeId={active?.id}
            onSelect={(r) => setActive(r)}
            onClear={() => {
              setHistory([]);
              setActive(null);
            }}
          />
        </aside>
      </div>
    </div>
  );
}
