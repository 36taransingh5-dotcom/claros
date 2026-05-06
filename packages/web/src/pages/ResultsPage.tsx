import { useState } from 'react';
import type { IdentifyResponse, PartMatch } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Props {
  result: IdentifyResponse;
  onNewSearch: () => void;
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const r = 58;
  const cx = 70, cy = 70;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  const startAngle = -180;
  const endAngle = startAngle + value * 180;
  
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  
  const largeArc = value > 0.5 ? 1 : 0;
  const color = value >= 0.75 ? '#10b981' : value >= 0.5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="confidence-wrap">
      <div className="confidence-arc">
        <svg width="140" height="85" viewBox="0 0 140 85">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          {/* Background track */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" strokeLinecap="round"/>
          
          {/* Progress arc */}
          {value > 0.01 && (
            <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none" stroke="url(#gaugeGradient)" strokeWidth="10" strokeLinecap="round"
              style={{ transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}/>
          )}
        </svg>
        <div className="confidence-value" style={{ color }}>{pct}%</div>
      </div>
      <div className="confidence-label">
        {value >= 0.75 ? '✓ High confidence' : value >= 0.5 ? '~ Moderate confidence' : '⚠ Low confidence'}
      </div>
    </div>
  );
}

export default function ResultsPage({ result, onNewSearch }: Props) {
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const { vision, matches, top_compatibility, query_id } = result;

  const sendFeedback = async (partId: string, isCorrect: boolean) => {
    setFeedback(f => ({ ...f, [partId]: isCorrect ? 'up' : 'down' }));
    await fetch(`${API}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query_id, part_id: partId, is_correct: isCorrect }),
    });
  };

  return (
    <div className="results-page">
      <div className="results-header">
        <h1 className="results-title">Identification Results</h1>
        <button className="btn-ghost" onClick={onNewSearch}>← New Search</button>
      </div>

      {/* Top row: confidence + vision summary + specs */}
      <div className="results-grid">
        {/* Confidence */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card-label">Confidence</div>
          <ConfidenceMeter value={vision.confidence} />
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <div className="tag accent">{vision.part_name}</div>
          </div>
        </div>

        {/* Vision summary */}
        <div className="glass-card">
          <div className="card-label">Part Identification</div>
          <div className="vision-summary">
            <h2>{vision.part_name}</h2>
            <p className="vision-description">{vision.description}</p>
            <div className="tag-row">
              <span className="tag">{vision.part_category}</span>
              <span className="tag">{vision.application_domain}</span>
              <span className="tag">{vision.condition}</span>
              {vision.suggested_search_terms.slice(0, 2).map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            {vision.visible_markings.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <div className="card-label" style={{ marginBottom: '0.4rem' }}>Visible Markings</div>
                <div className="oem-list">
                  {vision.visible_markings.map(m => <span key={m} className="oem-chip">{m}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Specs */}
        {Object.keys(vision.specifications).length > 0 && (
          <div className="glass-card full-w">
            <div className="card-label">Detected Specifications</div>
            <table className="specs-table">
              <tbody>
                {Object.entries(vision.specifications).map(([k, v]) => (
                  <tr key={k}>
                    <td>{k.replace(/_/g, ' ')}</td>
                    <td>{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Matches */}
      <div className="matches-section">
        <h3>🔎 Top Matches ({matches.length})</h3>
        <div className="match-list">
          {matches.length === 0 && (
            <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              No database matches found. Try adding more parts data or refining the search.
            </div>
          )}
          {matches.map((m, i) => (
            <MatchCard key={m.id} match={m} rank={i + 1}
              feedback={feedback[m.id]}
              onFeedback={(up) => sendFeedback(m.id, up)} />
          ))}
        </div>
      </div>

      {/* Compatibility */}
      {top_compatibility.length > 0 && (
        <div className="compat-section">
          <h3>🚛 Vehicle Compatibility — {matches[0]?.name}</h3>
          <div className="compat-table-wrap">
            <table className="compat-table">
              <thead>
                <tr>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Years</th>
                  <th>Engine</th>
                </tr>
              </thead>
              <tbody>
                {top_compatibility.map((c, i) => (
                  <tr key={i}>
                    <td>{c.make}</td>
                    <td>{c.model}</td>
                    <td>{c.year_from}–{c.year_to}</td>
                    <td>{c.engine_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, rank, feedback, onFeedback }: {
  match: PartMatch; rank: number; feedback?: 'up' | 'down'; onFeedback: (up: boolean) => void;
}) {
  return (
    <div className={`match-card ${rank === 1 ? 'top' : ''}`}>
      <div className="match-rank">#{rank}</div>
      <div className="match-info">
        <div className="match-name">{match.name}</div>
        <div className="match-meta">{match.manufacturer} · {match.category} · {match.application_domain}</div>
        <div className="match-pn">{match.part_number}</div>
        {match.oem_numbers.length > 0 && (
          <div className="oem-list" style={{ marginTop: '0.4rem' }}>
            {match.oem_numbers.map(n => <span key={n} className="oem-chip">{n}</span>)}
          </div>
        )}
      </div>
      <div className="match-score" style={{
        color: match.score >= 0.7 ? 'var(--success)' : match.score >= 0.4 ? 'var(--warning)' : 'var(--text-secondary)'
      }}>
        {Math.round(match.score * 100)}%
      </div>
      <div className="feedback-btns">
        <button className={`feedback-btn up ${feedback === 'up' ? 'active' : ''}`}
          title="Correct match" onClick={() => onFeedback(true)}>👍</button>
        <button className={`feedback-btn down ${feedback === 'down' ? 'active' : ''}`}
          title="Incorrect match" onClick={() => onFeedback(false)}>👎</button>
      </div>
    </div>
  );
}
