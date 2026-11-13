import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Info,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

export default function ResultCard({ result }) {
  if (!result) return null;

  const {
    id,
    filename,
    media_type,
    fake_probability,
    verdict,
    frames_analyzed = 1,
    original_face_base64,
    heatmap_base64,
    created_at
  } = result;

  // Determine styles & icons based on verdict
  const isReal = verdict === 'Likely Real';
  const isInconclusive = verdict === 'Inconclusive';
  const isFake = verdict === 'Likely Fake';

  const badgeClass = isReal
    ? 'badge-real'
    : isInconclusive
    ? 'badge-inconclusive'
    : 'badge-fake';

  const glowClass = isReal
    ? 'glow-emerald'
    : isInconclusive
    ? ''
    : 'glow-rose';

  const progressColor = isReal
    ? 'linear-gradient(90deg, #059669, #10b981)'
    : isInconclusive
    ? 'linear-gradient(90deg, #d97706, #f59e0b)'
    : 'linear-gradient(90deg, #dc2626, #ef4444)';

  const VerdictIcon = isReal ? CheckCircle2 : isInconclusive ? AlertTriangle : XCircle;

  // Download printable/archival HTML forensic report
  const handleDownloadReport = () => {
    const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DeepGuard Forensic Report - #${id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b0f19; color: #f8fafc; padding: 40px; margin: 0; line-height: 1.6; }
    .card { background: #141e33; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 24px; font-weight: 800; color: #818cf8; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: bold; text-transform: uppercase; font-size: 13px; }
    .badge-real { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
    .badge-inconclusive { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
    .badge-fake { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0; }
    .stat-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 15px; border-radius: 8px; }
    .stat-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
    .stat-val { font-size: 18px; font-weight: bold; }
    .images-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
    .img-card { text-align: center; }
    .img-card img { width: 100%; max-width: 280px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.1); }
    .caption { font-size: 13px; color: #94a3b8; margin-top: 8px; }
    .footer { margin-top: 35px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="brand">DeepGuard Forensic Scan Report</div>
        <div style="color: #94a3b8; font-size: 14px;">Scan Reference ID: #${id}</div>
      </div>
      <div>
        <span class="badge ${badgeClass}">${verdict}</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-label">Inspected File</div>
        <div class="stat-val">${filename}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Media Type</div>
        <div class="stat-val" style="text-transform: capitalize;">${media_type} (${frames_analyzed} frames analyzed)</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Deepfake Probability</div>
        <div class="stat-val">${fake_probability.toFixed(2)}%</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Timestamp (UTC)</div>
        <div class="stat-val">${created_at ? new Date(created_at).toUTCString() : 'N/A'}</div>
      </div>
    </div>

    <div class="images-grid">
      <div class="img-card">
        <img src="${original_face_base64}" alt="Analyzed Face" />
        <div class="caption">Extracted Facial Region (224x224)</div>
      </div>
      <div class="img-card">
        <img src="${heatmap_base64}" alt="Grad-CAM Heatmap" />
        <div class="caption">Grad-CAM Convolutional Heatmap</div>
      </div>
    </div>

    <div style="background: rgba(99, 102, 241, 0.08); border-left: 4px solid #6366f1; padding: 15px; border-radius: 4px; margin-top: 25px; font-size: 13px; color: #c7d2fe;">
      <strong>Explainability Note:</strong> High-temperature activations (red/yellow regions) pinpoint the critical facial landmarks (eye contour, mouth boundary, blending seam) that the neural network utilized to render its prediction.
    </div>

    <div class="footer">
      Generated by DeepGuard Forensic Engine • Powered by EfficientNet-B0 & PyTorch Grad-CAM
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DeepGuard_Report_${id}_${filename.replace(/\.[^/.]+$/, "")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`glass-card ${glowClass}`} style={{ padding: '2rem', marginTop: '2rem' }}>
      {/* Top Banner / Verdict Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.5rem',
            borderRadius: '12px',
            background: isReal
              ? 'var(--color-real-bg)'
              : isInconclusive
              ? 'var(--color-inconclusive-bg)'
              : 'var(--color-fake-bg)',
            color: isReal
              ? 'var(--color-real)'
              : isInconclusive
              ? 'var(--color-inconclusive)'
              : 'var(--color-fake)'
          }}>
            <VerdictIcon size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Forensic Verdict
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className={`badge ${badgeClass}`} style={{ fontSize: '1rem', padding: '0.35rem 0.95rem' }}>
                {verdict}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                (File: <span style={{ color: 'var(--text-primary)' }}>{filename}</span>)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadReport}
          className="btn-secondary"
          title="Download complete forensic report file"
        >
          <Download size={16} />
          Download Analysis Report
        </button>
      </div>

      {/* Probability Gauge & Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Fake Probability Gauge */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              DEEPFAKE PROBABILITY
            </span>
            <span className="mono" style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: isReal ? 'var(--color-real)' : isInconclusive ? 'var(--color-inconclusive)' : 'var(--color-fake)'
            }}>
              {fake_probability.toFixed(2)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '9999px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(Math.max(fake_probability, 3), 100)}%`,
              background: progressColor,
              borderRadius: '9999px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginTop: '0.45rem'
          }}>
            <span>0% (Real)</span>
            <span>50%</span>
            <span>100% (Fake)</span>
          </div>
        </div>

        {/* Frames & Metadata Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <Layers size={18} color="var(--accent-indigo-light)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              INSPECTION METADATA
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Media Type</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{media_type}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Frames Sampled</div>
              <div className="mono" style={{ fontWeight: 600 }}>{frames_analyzed} frame(s)</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Scan ID</div>
              <div className="mono" style={{ fontWeight: 600 }}>#{id}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Architecture</div>
              <div style={{ fontWeight: 600 }}>EfficientNet-B0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Explainability Section - Side by Side Comparison */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <Info size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Visual Explainability & Grad-CAM Attention Map
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          background: 'rgba(11, 19, 36, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          {/* Original Analyzed Face */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem'
            }}>
              Cropped Analyzed Face (224x224)
            </div>
            <div style={{
              width: '100%',
              maxWidth: '240px',
              aspectRatio: '1',
              margin: '0 auto',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              background: '#000000'
            }}>
              {original_face_base64 ? (
                <img
                  src={original_face_base64}
                  alt="Original Face"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No face image
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Haar Cascade facial detection with 20% expanded boundary margin.
            </p>
          </div>

          {/* Grad-CAM Attention Heatmap */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem'
            }}>
              Grad-CAM Attention Heatmap (model.conv_head)
            </div>
            <div style={{
              width: '100%',
              maxWidth: '240px',
              aspectRatio: '1',
              margin: '0 auto',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid var(--accent-indigo)',
              background: '#000000'
            }}>
              {heatmap_base64 ? (
                <img
                  src={heatmap_base64}
                  alt="Grad-CAM Overlay"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No heatmap generated
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Visual heatmap showing convolutional neuron gradients during classification.
            </p>
          </div>
        </div>

        {/* Explainability Guidance Caption */}
        <div style={{
          marginTop: '1.25rem',
          padding: '1rem',
          borderRadius: '10px',
          background: 'rgba(99, 102, 241, 0.08)',
          borderLeft: '4px solid var(--accent-indigo)',
          fontSize: '0.82rem',
          color: '#cbd5e1',
          lineHeight: 1.55
        }}>
          <strong style={{ color: '#ffffff' }}>How to read the heatmap: </strong>
          Warm regions (<span style={{ color: '#ef4444', fontWeight: 600 }}>Red</span> and <span style={{ color: '#f59e0b', fontWeight: 600 }}>Yellow</span>) highlight where the neural network concentrated its attention to detect deepfake synthesis traces, blending seams, warped textures, or iris/eyelid anomalies. Cool regions (<span style={{ color: '#38bdf8', fontWeight: 600 }}>Deep Blue</span>) represent background skin or authentic biological regions that didn't trigger manipulation activations.
        </div>
      </div>
    </div>
  );
}

