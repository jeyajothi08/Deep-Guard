import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle,
  Eye,
  Crosshair,
  Lock,
  Zap
} from 'lucide-react';

export default function HeroSection({ onStartInspection, onExploreArchitecture }) {
  const [telemetryScore, setTelemetryScore] = useState(98.4);
  const [activeFrame, setActiveFrame] = useState(12);

  // Subtle live telemetry fluctuation simulation for cyber feel
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryScore(prev => +(97.8 + Math.random() * 1.8).toFixed(1));
      setActiveFrame(prev => (prev >= 15 ? 1 : prev + 1));
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="overview" style={{ padding: '4.5rem 0 3.5rem 0', position: 'relative' }}>
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}
      >
        {/* Left Column: Mission & CTAs */}
        <div>
          {/* Eyebrow badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              fontSize: '0.78rem',
              color: '#a5b4fc',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem'
            }}
          >
            <Sparkles size={14} color="#818cf8" />
            Next-Gen Media Authenticity Verification
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.035em',
              marginBottom: '1.25rem'
            }}
          >
            Detect Synthetic Media with{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              Explainable AI
            </span>{' '}
            Precision
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '2rem',
              maxWidth: '560px'
            }}
          >
            Unmask deepfakes in images and video streams. DeepGuard pairs transfer-learned{' '}
            <strong style={{ color: '#ffffff' }}>EfficientNet-B0</strong> feature representation with{' '}
            <strong style={{ color: 'var(--accent-cyan-light)' }}>Grad-CAM convolutional attention maps</strong>{' '}
            to reveal exactly which facial boundaries, artifacts, and textures drove the verdict.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2.5rem'
            }}
          >
            <button
              onClick={onStartInspection}
              className="btn-primary glow-indigo"
              style={{ padding: '0.85rem 1.85rem', fontSize: '0.96rem' }}
            >
              Start Media Inspection
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onExploreArchitecture}
              className="btn-secondary"
              style={{ padding: '0.85rem 1.6rem', fontSize: '0.96rem' }}
            >
              Explore Architecture
            </button>
          </div>

          {/* Trust Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
              <Cpu size={16} color="var(--accent-indigo-light)" />
              <span style={{ color: 'var(--text-secondary)' }}>EfficientNet-B0 Backbone</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
              <Eye size={16} color="var(--accent-cyan)" />
              <span style={{ color: 'var(--text-secondary)' }}>Grad-CAM XAI Heatmaps</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
              <Layers size={16} color="var(--color-real)" />
              <span style={{ color: 'var(--text-secondary)' }}>Image & Video Forensics</span>
            </div>
          </div>
        </div>

        {/* Right Column: Cyber-Forensic Scanner Preview Card */}
        <div style={{ position: 'relative' }}>
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              right: '10%',
              bottom: '10%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
              filter: 'blur(45px)',
              zIndex: 0
            }}
          />

          <div
            className="glass-panel cyber-card"
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '1.75rem',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              boxShadow: '0 20px 50px -15px rgba(0,0,0,0.8)'
            }}
          >
            {/* Top Card Telemetry Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Crosshair size={18} color="var(--accent-cyan)" />
                <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  STREAM://LIVE_TELEMETRY.01
                </span>
              </div>
              <span className="badge badge-real" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                ACTIVE MONITOR
              </span>
            </div>

            {/* Simulated Biometric Face Mesh / Target Viewport */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '270px',
                borderRadius: '14px',
                background: 'linear-gradient(180deg, #090e1c 0%, #060911 100%)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Scan Beam Animation */}
              <div className="scan-beam" />

              {/* Grid Lines */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Central Biometric Silhouette & Bounding Box */}
              <div
                style={{
                  position: 'relative',
                  width: '160px',
                  height: '190px',
                  border: '2px dashed rgba(56, 189, 248, 0.65)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 75%)'
                }}
              >
                {/* Corner Accents */}
                <span style={{ position: 'absolute', top: -2, left: -2, width: 12, height: 12, borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8' }} />
                <span style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8' }} />
                <span style={{ position: 'absolute', bottom: -2, left: -2, width: 12, height: 12, borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8' }} />
                <span style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8' }} />

                {/* Facial Landmark Target Dots */}
                <div style={{ display: 'flex', gap: '38px', marginBottom: '14px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                </div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', marginBottom: '16px' }} />
                <div style={{ width: 28, height: 4, borderRadius: 2, background: '#38bdf8', opacity: 0.8 }} />

                {/* Bounding Box Label */}
                <div
                  className="mono"
                  style={{
                    position: 'absolute',
                    bottom: -24,
                    fontSize: '0.68rem',
                    color: '#38bdf8',
                    letterSpacing: '0.04em'
                  }}
                >
                  ROI: 224x224 (+20% PAD)
                </div>
              </div>

              {/* Floating Telemetry Badge 1 */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '14px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.72rem'
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>CONFIDENCE: </span>
                <span className="mono" style={{ color: 'var(--color-real)', fontWeight: 700 }}>
                  {telemetryScore}%
                </span>
              </div>

              {/* Floating Telemetry Badge 2 */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '14px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.72rem'
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>FRAME SAMPLER: </span>
                <span className="mono" style={{ color: '#818cf8', fontWeight: 600 }}>
                  {activeFrame} / 15 FPS
                </span>
              </div>
            </div>

            {/* Bottom Telemetry Metrics Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginTop: '1.25rem'
              }}
            >
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.75rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Conv Head Target
                </div>
                <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                  1280 Channels
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.75rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Face Detector
                </div>
                <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan-light)', marginTop: '2px' }}>
                  Haar Cascade
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.75rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Verdict Logic
                </div>
                <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-real)', marginTop: '2px' }}>
                  35% / 65% Split
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
