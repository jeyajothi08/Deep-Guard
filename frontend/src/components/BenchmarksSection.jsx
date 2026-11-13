import React, { useState } from 'react';
import { BarChart3, ShieldCheck, Film, Layers, Award, CheckCircle2, TrendingUp } from 'lucide-react';

export default function BenchmarksSection() {
  const [activeTab, setActiveTab] = useState('cross-dataset');

  const datasets = [
    { name: 'FaceForensics++ (c23)', auc: 94.2, acc: 91.8, note: 'High benchmark on standard neural face swaps' },
    { name: 'Celeb-DF (v2)', auc: 89.6, acc: 87.4, note: 'Tested against advanced multi-resolution synthesis' },
    { name: 'In-The-Wild Deepfakes', auc: 85.3, acc: 83.1, note: 'Unconstrained internet downloads with social noise' }
  ];

  const compressions = [
    { tier: 'Raw / Lossless Stream', crf: 'CRF 0', rate: 95.1, note: 'Uncompressed raw digital camera sensor frames' },
    { tier: 'H.264 YouTube / Web Std', crf: 'CRF 23', rate: 92.4, note: 'Standard video sharing platform transcoding' },
    { tier: 'H.264 Heavy Social Media', crf: 'CRF 40', rate: 84.7, note: 'Aggressive WhatsApp / Telegram bit-rate compression' }
  ];

  return (
    <section id="benchmarks" style={{ padding: '4rem 0 3.5rem 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              fontSize: '0.76rem',
              color: 'var(--accent-purple)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.85rem'
            }}
          >
            <BarChart3 size={14} />
            Academic Research & Evaluation
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 4vw, 2.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginBottom: '0.85rem'
            }}
          >
            Empirical Robustness Benchmarks
          </h2>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Demonstrating generalizability across diverse generative models, high bit-rate compression, and explainability accuracy.
          </p>

          {/* Tab Selector */}
          <div
            style={{
              display: 'inline-flex',
              gap: '0.5rem',
              marginTop: '1.75rem',
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '0.35rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              onClick={() => setActiveTab('cross-dataset')}
              style={{
                background: activeTab === 'cross-dataset' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'cross-dataset' ? '#ffffff' : 'var(--text-muted)',
                border: activeTab === 'cross-dataset' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cross-Dataset Generalization
            </button>
            <button
              onClick={() => setActiveTab('compression')}
              style={{
                background: activeTab === 'compression' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                color: activeTab === 'compression' ? '#ffffff' : 'var(--text-muted)',
                border: activeTab === 'compression' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Video Compression Robustness
            </button>
          </div>
        </div>

        {/* Tab 1: Cross-Dataset Generalization */}
        {activeTab === 'cross-dataset' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {datasets.map((item) => (
              <div
                key={item.name}
                className="glass-panel"
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{item.name}</span>
                    <span className="badge badge-indigo">TEST SPLIT</span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    {item.note}
                  </p>

                  {/* AUC Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ROC-AUC Metric</span>
                      <span className="mono" style={{ color: 'var(--accent-cyan-light)', fontWeight: 700 }}>
                        {item.auc}%
                      </span>
                    </div>
                    <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.auc}%`,
                          background: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
                          borderRadius: '9999px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Classification Accuracy</span>
                      <span className="mono" style={{ color: 'var(--color-real)', fontWeight: 700 }}>
                        {item.acc}%
                      </span>
                    </div>
                    <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.acc}%`,
                          background: 'linear-gradient(90deg, #059669, #10b981)',
                          borderRadius: '9999px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                    marginTop: '1.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem'
                  }}
                >
                  <CheckCircle2 size={13} color="var(--color-real)" />
                  Zero-shot generalization across distinct synthesis pipelines
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Video Compression Robustness */}
        {activeTab === 'compression' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {compressions.map((item) => (
              <div
                key={item.tier}
                className="glass-panel"
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{item.tier}</span>
                    <span className="badge badge-cyan">{item.crf}</span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    {item.note}
                  </p>

                  {/* Detection Rate Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Detection Resilience</span>
                      <span className="mono" style={{ color: item.rate > 90 ? 'var(--color-real)' : 'var(--accent-cyan-light)', fontWeight: 700 }}>
                        {item.rate}%
                      </span>
                    </div>
                    <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.rate}%`,
                          background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                          borderRadius: '9999px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                    marginTop: '1.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem'
                  }}
                >
                  <Film size={13} color="var(--accent-cyan)" />
                  15-frame uniform temporal sampling preserves temporal coherence
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
