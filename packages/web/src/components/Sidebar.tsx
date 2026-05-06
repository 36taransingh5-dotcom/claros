import { useEffect, useState } from 'react';
import type { HistoryItem, IdentifyResponse } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectQuery: (r: IdentifyResponse) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ open, onSelectQuery }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch(`${API}/api/history`)
      .then(r => r.json())
      .then(setItems)
      .catch(() => {});
  }, [open]);

  return (
    <aside className={`sidebar ${open ? '' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">Recent Searches</div>
      </div>
      <div className="sidebar-list">
        {items.length === 0 && (
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No history yet
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="sidebar-item" onClick={() => {
            if (!item.vision) return;
            onSelectQuery({ query_id: item.id, vision: item.vision, matches: item.matches, top_compatibility: [] });
          }}>
            <div className="sidebar-item-title">
              {item.vision?.part_category || item.text_input || 'Search'}
            </div>
            <div className="sidebar-item-meta">
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
