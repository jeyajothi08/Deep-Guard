import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PipelineSection from './components/PipelineSection';
import ForensicLab from './components/ForensicLab';
import BenchmarksSection from './components/BenchmarksSection';
import HistorySection from './components/HistorySection';
import Footer from './components/Footer';
import { API_BASE_URL, FALLBACK_API_URL } from './config';

export default function App() {
  const [activeBaseUrl, setActiveBaseUrl] = useState(API_BASE_URL);
  const [backendStatus, setBackendStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Health check with automatic fallback between 127.0.0.1 and localhost
  const checkHealth = async () => {
    setCheckingStatus(true);
    let resolvedUrl = activeBaseUrl;

    try {
      let res = await fetch(`${activeBaseUrl}/health`, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        setBackendStatus(data);
        return;
      }
    } catch {
      // Primary URL failed, try fallback
      try {
        const fallback = activeBaseUrl === API_BASE_URL ? FALLBACK_API_URL : API_BASE_URL;
        let resFallback = await fetch(`${fallback}/health`, { signal: AbortSignal.timeout(3500) });
        if (resFallback.ok) {
          const data = await resFallback.json();
          setBackendStatus(data);
          setActiveBaseUrl(fallback);
          return;
        }
      } catch {
        // Both failed
      }
    } finally {
      setCheckingStatus(false);
    }

    setBackendStatus({ status: 'offline', model_loaded: false });
  };

  // Fetch scan evaluation history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${activeBaseUrl}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchHistory();
  }, [activeBaseUrl]);

  // Handle navigation
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Run media analysis
  const handleAnalyze = async (file, mediaType) => {
    setAnalyzing(true);
    setAnalysisError(null);

    const endpoint =
      mediaType === 'video'
        ? `${activeBaseUrl}/analyze/video`
        : `${activeBaseUrl}/analyze/image`;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Server returned status ${response.status}`);
      }

      setCurrentResult(data);
      // Refresh history records immediately
      fetchHistory();

      // Ensure Forensic Lab is visible and active
      setActiveSection('forensic-lab');
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'An unexpected error occurred while communicating with the backend.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Sticky Glass Navbar */}
      <Navbar
        backendStatus={backendStatus}
        checkingStatus={checkingStatus}
        onCheckStatus={checkHealth}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      {/* Main Content Sections */}
      <main style={{ flex: 1 }}>
        {/* 1. Hero Landing Section */}
        <HeroSection
          onStartInspection={() => scrollToSection('forensic-lab')}
          onExploreArchitecture={() => scrollToSection('architecture')}
        />

        {/* 2. Interactive Pipeline Section */}
        <PipelineSection />

        {/* 3. Forensic Detection Lab Studio */}
        <ForensicLab
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          error={analysisError}
          onClearError={() => setAnalysisError(null)}
          result={currentResult}
        />

        {/* 4. Research & Robustness Benchmarks */}
        <BenchmarksSection />

        {/* 5. Audit & Scan Logs */}
        <HistorySection
          history={history}
          loading={loadingHistory}
          onRefresh={fetchHistory}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
