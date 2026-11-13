import React from 'react';
import { Shield, Github, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(6, 9, 17, 0.95)',
        padding: '3rem 0 2rem 0',
        color: 'var(--text-muted)',
        fontSize: '0.84rem'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Brand & Mission */}
          <div style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Shield size={16} />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>DeepGuard</span>
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                FORENSICS
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Enterprise-grade deepfake image and video detection system with convolutional attention heatmaps powered by EfficientNet-B0 and PyTorch Grad-CAM.
            </p>
          </div>

          {/* Technology Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.2rem' }}>Architecture Stack</div>
            <div>• Backend: FastAPI • PyTorch • timm • OpenCV</div>
            <div>• Explainability: PyTorch Grad-CAM (model.conv_head)</div>
            <div>• Frontend: React 18 • Vite 6 • Lucide Icons</div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.5rem',
            fontSize: '0.78rem'
          }}
        >
          <div>
            © {new Date().getFullYear()} DeepGuard. Designed & Developed by{' '}
            <a
              href="https://github.com/jeyajothi08/Deep-Guard"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}
            >
              jeyajothi08
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <a
              href="https://github.com/jeyajothi08/Deep-Guard"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Github size={14} /> GitHub Repository
            </a>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <span style={{ color: 'var(--color-real)' }}>Academic & Defense Forensic Evaluation Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

