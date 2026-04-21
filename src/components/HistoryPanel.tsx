import type { EstimationRecord } from "../types";

interface Props {
  history: EstimationRecord[];
  activeId?: string;
  onSelect: (record: EstimationRecord) => void;
  onClear: () => void;
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function HistoryPanel({
  history,
  activeId,
  onSelect,
  onClear,
}: Props) {
  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <h2>History</h2>
          <p className="subtitle" style={{ margin: 0 }}>
            Stored on this device.
          </p>
        </div>
        {history.length > 0 && (
          <button className="clear-link" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="history-empty">No estimations yet.</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <button
              key={item.id}
              className={`history-item ${item.id === activeId ? "active" : ""}`}
              onClick={() => onSelect(item)}
            >
              <span className="history-key">{item.storyKey}</span>
              <span className="history-summary">{item.summary}</span>
              <span className="history-time">{formatTime(item.createdAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
