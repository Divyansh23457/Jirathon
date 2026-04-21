import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { EstimationRecord } from "../types";

interface Props {
  record: EstimationRecord;
}

export default function ResultPanel({ record }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(record.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="card">
      <div className="result-header">
        <div className="result-title">
          <span className="key">{record.storyKey}</span>
          <span className="summary">{record.summary}</span>
        </div>
        <button
          className={`copy-btn ${copied ? "copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{record.result}</ReactMarkdown>
      </div>
    </div>
  );
}
