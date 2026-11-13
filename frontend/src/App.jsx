import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ResultCard from './components/ResultCard';
import HistoryTable from './components/HistoryTable';
import { API_BASE_URL } from './config';

export default function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const resultRef = useRef(null);

  // Check backend health
  const checkHealth = async () => {
    setCheckingStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(data);
      } else {
        setBackendStatus({ status: 'error', model_loaded: false });
      }
    } catch {
      setBackendStatus({ status: 'offline', model_loaded: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  // Fetch scan history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchHistory();
  }, []);

  // Handle media analysis submission
  const handleAnalyze = async (file, mediaType) => {
    setAnalyzing(true);
    setAnalysisError(null);

    const endpoint = mediaType === 'video'
      ? `${API_BASE_URL}/analyze/video`
      : `${API_BASE_URL}/analyze/image`;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Server responded with status ${response.status}`);
      }

      setCurrentResult(data);
      // Refresh history immediately
      fetchHistory();

      // Scroll to result smoothly
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'An unexpected error occurred while communicating with the backend.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Header
        backendStatus={backendStatus}
        checkingStatus={checkingStatus}
        onCheckStatus={checkHealth}
      />

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, padding: '2.5rem 1.5rem' }}>
        {/* Inspection / Upload Zone */}
        <UploadZone
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          error={analysisError}
          onClearError={() => setAnalysisError(null)}
        />

        {/* Explainability & Result Section */}
        <div ref={resultRef}>
          <ResultCard result={currentResult} />
        </div>

        {/* Recent Scan History */}
        <HistoryTable
          history={history}
          loading={loadingHistory}
          onRefresh={fetchHistory}
        />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.75rem 0',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        background: 'rgba(8, 12, 22, 0.9)'
      }}>
        <div className="container">
          DeepGuard • AI Based Deepfake Detection System • Built with FastAPI, EfficientNet-B0, PyTorch Grad-CAM & React
        </div>
      </footer>
    </div>
  );
}

