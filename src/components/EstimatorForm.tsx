import { useEffect, useState, type FormEvent } from "react";

const STORAGE_KEY = "jirathon:credentials";

export interface FormValues {
  domain: string;
  email: string;
  apiToken: string;
  storyId: string;
}

interface Props {
  loading: boolean;
  onSubmit: (values: FormValues) => void;
}

export default function EstimatorForm({ loading, onSubmit }: Props) {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [storyId, setStoryId] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      if (saved.domain) setDomain(saved.domain);
      if (saved.email) setEmail(saved.email);
      if (saved.apiToken) setApiToken(saved.apiToken);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!domain || !email || !apiToken || !storyId) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ domain, email, apiToken }),
    );
    onSubmit({
      domain: domain.trim(),
      email: email.trim(),
      apiToken: apiToken.trim(),
      storyId: storyId.trim(),
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="domain">Jira domain</label>
        <input
          id="domain"
          type="text"
          placeholder="your-org.atlassian.net"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="email">Jira email</label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="token">API token</label>
          <input
            id="token"
            type="password"
            placeholder="Atlassian API token"
            autoComplete="current-password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="storyId">Story ID</label>
        <input
          id="storyId"
          type="text"
          placeholder="e.g. SCRUM-5"
          value={storyId}
          onChange={(e) => setStoryId(e.target.value)}
          required
        />
      </div>

      <div className="actions">
        <button className="btn" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> Estimating…
            </>
          ) : (
            "Estimate story"
          )}
        </button>
        <p className="hint">
          Credentials stay in your browser. Connects via the Vite dev proxy.
        </p>
      </div>
    </form>
  );
}
