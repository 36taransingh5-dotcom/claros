import { useState, useRef, useCallback } from 'react';
import type { IdentifyResponse } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Props { onResult: (r: IdentifyResponse) => void; }

const STEPS = [
  'Uploading image...',
  'Running vision analysis...',
  'Searching parts database...',
  'Matching compatibility...',
  'Preparing results...',
];

export default function UploadPage({ onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setText('');
    setError(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  }, []);

  const submit = async () => {
    if (!file && !text.trim()) return;
    setLoading(true);
    setStep(0);
    setError(null);

    // animate steps
    const stepInterval = setInterval(() => {
      setStep(s => (s < STEPS.length - 1 ? s + 1 : s));
    }, 900);

    try {
      const form = new FormData();
      if (file) form.append('image', file);
      else form.append('text', text.trim());

      const res = await fetch(`${API}/api/identify`, { method: 'POST', body: form });
      clearInterval(stepInterval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const data: IdentifyResponse = await res.json();
      setStep(STEPS.length - 1);
      setTimeout(() => onResult(data), 400);
    } catch (e: any) {
      clearInterval(stepInterval);
      setLoading(false);
      setError(e.message || 'Something went wrong. Is the API running?');
    }
  };

  if (loading) {
    return (
      <div className="upload-page">
        <div className="ambient"><div className="ambient-glow-1"/><div className="ambient-grid"/></div>
        <div className="loading-overlay">
          <div className="spinner" />
          <div className="loading-title">Identifying part...</div>
          <div className="loading-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`loading-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                <span className="step-dot" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="ambient"><div className="ambient-glow-1"/><div className="ambient-grid"/></div>

      <div className="upload-hero">
        <h1>Identify Any Part</h1>
        <p>Upload a photo or describe a truck or trailer component. Claros identifies it and finds compatible vehicles in seconds.</p>
      </div>

      <div className="upload-card">
        {/* Drop Zone */}
        <div
          className={`dropzone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => !file && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="preview-img" />
              <button className="btn-ghost" onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}>
                Remove image
              </button>
            </>
          ) : (
            <>
              <div className="dropzone-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="dropzone-title">Drop part photo here</div>
              <div className="dropzone-sub">
                or <span className="dropzone-browse" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>browse files</span> · JPG, PNG, WEBP up to 10MB
              </div>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {/* Text alternative */}
        {!file && (
          <>
            <div className="divider-row">OR DESCRIBE IN TEXT</div>
            <textarea
              className="text-input"
              placeholder="e.g. S-cam brake shoe for MAN TGX, 410mm width, looks worn..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
            />
          </>
        )}

        {error && (
          <div className="no-key-banner">⚠ {error}</div>
        )}

        <button
          className="btn-primary"
          disabled={!file && !text.trim()}
          onClick={submit}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Identify Part
        </button>
      </div>
    </div>
  );
}
