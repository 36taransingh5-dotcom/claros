import { useEffect, useState } from 'react';
import type { HistoryItem, IdentifyResponse } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Props { onSelectResult: (r: IdentifyResponse) => void; }

export default function HistoryPage({ onSelectResult }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/history`)
      .then(r => r.json())
      .then(d => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const open = (item: HistoryItem) => {
    const r: IdentifyResponse = {
      query_id: item.id,
      vision: item.vision!,
      matches: item.matches,
      top_compatibility: [],
    };
    onSelectResult(r);
  };

  return (
    <div className="history-page">
      <h1>Search History</h1>
      {loading && <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>}
      {!loading && items.length === 0 && (
        <div className="history-empty">
          <div style={{ fontSize: '2rem' }}>🔍</div>
          <p>No searches yet. Upload a part image to get started.</p>
        </div>
      )}
      <div className="history-list">
        {items.map(item => (
          <div key={item.id} className="history-card" onClick={() => item.vision && open(item)}>
            {item.image_path ? (
              <img src={`${API}${item.image_path}`} alt="Part" className="history-thumb" />
            ) : (
              <div className="history-thumb-placeholder">📝</div>
            )}
            <div className="history-info">
              <div className="history-name">
                {item.vision?.part_category || item.text_input || 'Unknown part'}
              </div>
              <div className="history-meta">
                {item.vision?.description?.slice(0, 80) || '—'}
              </div>
              <div className="history-meta" style={{ marginTop: '4px' }}>
                {new Date(item.created_at).toLocaleString()} · {item.matches.length} matches
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
