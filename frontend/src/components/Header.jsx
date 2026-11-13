import React from 'react';
import { Shield, Activity, RefreshCw } from 'lucide-react';

export default function Header({ backendStatus, checkingStatus, onCheckStatus }) {
  const isOnline = backendStatus?.status === 'ok';

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(8, 12, 22, 0.75)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '1.25rem 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            padding: '0.65rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Shield size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                DeepGuard 🔍
              </h1>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Explainable AI Deepfake Image & Video Detection System
            </p>
          </div>
        </div>

        {/* Backend Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '9999px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem'
          }}>
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Backend:</span>
            <span style={{
              fontWeight: 600,
              color: isOnline ? 'var(--color-real)' : 'var(--color-fake)'
            }}>
              {isOnline ? 'Online (Model Ready)' : 'Disconnected'}
            </span>
            <button
              onClick={onCheckStatus}
              disabled={checkingStatus}
              title="Refresh connection status"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                marginLeft: '4px'
              }}
            >
              <RefreshCw size={13} className={checkingStatus ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

