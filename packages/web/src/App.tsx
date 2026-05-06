import { useState } from 'react';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import Sidebar from './components/Sidebar';
import type { IdentifyResponse } from './types';
import './index.css';

type Page = 'upload' | 'results' | 'history';

function App() {
  const [page, setPage] = useState<Page>('upload');
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleResult = (r: IdentifyResponse) => {
    setResult(r);
    setPage('results');
  };

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectQuery={(r) => { setResult(r); setPage('results'); }}
        currentPage={page}
        onNavigate={(p) => setPage(p as Page)}
      />

      <div className="main-area">
        <header className="topbar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle history">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect y="2" width="18" height="2" rx="1" fill="currentColor"/>
              <rect y="8" width="14" height="2" rx="1" fill="currentColor"/>
              <rect y="14" width="10" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>

          <div className="logo-lockup" onClick={() => setPage('upload')} style={{ cursor: 'pointer' }}>
            <svg className="claros-icon-sm" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" rx="46" fill="#0d1526"/>
              <path d="M 158 42 A 82 82 0 1 0 158 158 L 137 137 A 52 52 0 1 1 137 63 Z" fill="white"/>
              <path d="M 158 42 A 82 82 0 0 1 182 93 L 152 95 A 52 52 0 0 0 137 63 Z" fill="#1d4ed8"/>
              <path d="M 182 107 A 82 82 0 0 1 158 158 L 137 137 A 52 52 0 0 0 152 105 Z" fill="#3b82f6"/>
              <rect x="148" y="97" width="40" height="6" fill="#0d1526"/>
              <circle cx="100" cy="100" r="28" fill="#0d1526"/>
            </svg>
            <span className="logo-wordmark">Claros</span>
          </div>

          <nav className="topnav">
            <button className={`topnav-btn ${page === 'upload' ? 'active' : ''}`} onClick={() => setPage('upload')}>Identify</button>
            <button className={`topnav-btn ${page === 'history' ? 'active' : ''}`} onClick={() => setPage('history')}>History</button>
          </nav>
        </header>

        <main className="page-content">
          {page === 'upload' && <UploadPage onResult={handleResult} />}
          {page === 'results' && result && <ResultsPage result={result} onNewSearch={() => setPage('upload')} />}
          {page === 'history' && <HistoryPage onSelectResult={(r) => { setResult(r); setPage('results'); }} />}
        </main>
      </div>
    </div>
  );
}

export default App;
