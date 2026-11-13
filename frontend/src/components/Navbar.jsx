import React, { useState, useEffect } from 'react';
import { Shield, Activity, RefreshCw, Terminal, Cpu, ArrowUpRight } from 'lucide-react';

export default function Navbar({
  backendStatus,
  checkingStatus,
  onCheckStatus,
  activeSection,
  onNavigate
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isOnline = backendStatus?.status === 'ok';

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'forensic-lab', label: 'Forensic Lab' },
    { id: 'architecture', label: 'Architecture & XAI' },
    { id: 'benchmarks', label: 'Research Benchmarks' },
    { id: 'history', label: 'Scan Logs' }
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(6, 9, 17, 0.88)'
          : 'rgba(6, 9, 17, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
        boxShadow: scrolled ? '0 10px 30px -10px rgba(0,0,0,0.8)' : 'none'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.5rem',
          gap: '1rem'
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)'
            }}
          >
            <Shield size={24} color="#ffffff" />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                DeepGuard
              </span>
              <span
                className="badge badge-indigo"
                style={{ fontSize: '0.66rem', padding: '0.15rem 0.5rem', fontWeight: 700 }}
              >
                AI FORENSICS
              </span>
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)'
              }}
            >
              EfficientNet • Grad-CAM XAI
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.35rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  background: isActive ? 'rgba(99, 102, 241, 0.22)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  borderRadius: '10px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Live Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.78rem'
            }}
          >
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            <span style={{ color: isOnline ? 'var(--color-real)' : 'var(--color-fake)', fontWeight: 600 }}>
              {isOnline ? 'Online • MPS/GPU Ready' : 'Backend Offline'}
            </span>
            <button
              onClick={onCheckStatus}
              disabled={checkingStatus}
              title="Ping backend health"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
            >
              <RefreshCw size={12} className={checkingStatus ? 'spin' : ''} />
            </button>
          </div>

          {/* Quick CTA */}
          <button
            onClick={() => handleNavClick('forensic-lab')}
            className="btn-primary"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.84rem' }}
          >
            Launch Scanner
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
