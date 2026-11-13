import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileImage,
  FileVideo,
  AlertCircle,
  X,
  Sparkles,
  Loader2,
  Download,
  Info,
  Layers,
  Sliders,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Cpu,
  Clock,
  Eye
} from 'lucide-react';

export default function ForensicLab({
  onAnalyze,
  analyzing,
  error,
  onClearError,
  result
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('overlay'); // 'side-by-side' or 'overlay'
  const [overlayOpacity, setOverlayOpacity] = useState(65); // 0 to 100%
  const [analysisStage, setAnalysisStage] = useState(0);

  const fileInputRef = useRef(null);

  // Cycle through progress stages while analyzing
  useEffect(() => {
    let interval;
    if (analyzing) {
      setAnalysisStage(1);
      interval = setInterval(() => {
        setAnalysisStage((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1200);
    } else {
      setAnalysisStage(0);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleFile = (file) => {
    if (!file) return;
    if (onClearError) onClearError();

    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|avi)$/i.test(file.name);

    if (!isImage && !isVideo) {
      alert('Unsupported file format. Please upload an image (.jpg, .png, .webp) or video (.mp4, .mov, .avi).');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleClear = (e) => {
    if (e) e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onClearError) onClearError();
  };

  const isVideo = selectedFile && (selectedFile.type.startsWith('video/') || /\.(mp4|mov|avi)$/i.test(selectedFile.name));

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleRunAnalysis = () => {
    if (!selectedFile || analyzing) return;
    onAnalyze(selectedFile, isVideo ? 'video' : 'image');
  };

  // Verdict style helpers
  const isReal = result?.verdict === 'Likely Real';
  const isInconclusive = result?.verdict === 'Inconclusive';
  const isFake = result?.verdict === 'Likely Fake';

  const badgeClass = isReal
    ? 'badge-real'
    : isInconclusive
    ? 'badge-inconclusive'
    : 'badge-fake';

  const progressGradient = isReal
    ? 'linear-gradient(90deg, #059669, #10b981)'
    : isInconclusive
    ? 'linear-gradient(90deg, #d97706, #f59e0b)'
    : 'linear-gradient(90deg, #dc2626, #ef4444)';

  const VerdictIcon = isReal ? CheckCircle2 : isInconclusive ? AlertTriangle : XCircle;

  // Generate & download forensic report
  const handleExportReport = () => {
    if (!result) return;
    const { id, filename, media_type, fake_probability, verdict, frames_analyzed = 1, original_face_base64, heatmap_base64, created_at } = result;

    const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DeepGuard Forensic Analysis Certificate - #${id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070a12; color: #f8fafc; padding: 40px; margin: 0; }
    .card { background: #111a2f; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 36px; max-width: 820px; margin: 0 auto; box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
    .header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 26px; font-weight: 800; color: #818cf8; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 700; text-transform: uppercase; font-size: 13px; }
    .badge-real { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
    .badge-inconclusive { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
    .badge-fake { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin: 24px 0; }
    .box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 14px; border-radius: 10px; }
    .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; }
    .val { font-size: 16px; font-weight: 700; margin-top: 4px; }
    .images { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
    .img-box { text-align: center; }
    .img-box img { width: 100%; max-width: 270px; border-radius: 10px; border: 2px solid rgba(255,255,255,0.15); }
    .caption { font-size: 12px; color: #94a3b8; margin-top: 6px; }
    .footer { margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 18px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="brand">DeepGuard Forensic Analysis Certificate</div>
        <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Forensic Audit ID: #${id}</div>
      </div>
      <div>
        <span class="badge ${badgeClass}">${verdict}</span>
      </div>
    </div>
    <div class="grid">
      <div class="box"><div class="label">Evaluated Media File</div><div class="val">${filename}</div></div>
      <div class="box"><div class="label">Media Type</div><div class="val" style="text-transform: capitalize;">${media_type} (${frames_analyzed} frames)</div></div>
      <div class="box"><div class="label">Synthetic Probability</div><div class="val">${fake_probability.toFixed(2)}%</div></div>
      <div class="box"><div class="label">Timestamp (UTC)</div><div class="val">${created_at ? new Date(created_at).toUTCString() : 'N/A'}</div></div>
    </div>
    <div class="images">
      <div class="img-box">
        <img src="${original_face_base64}" alt="Face Crop" />
        <div class="caption">Haar Cascade Extracted ROI (224x224)</div>
      </div>
      <div class="img-box">
        <img src="${heatmap_base64}" alt="Grad-CAM" />
        <div class="caption">Grad-CAM Convolutional Heatmap (model.conv_head)</div>
      </div>
    </div>
    <div style="background: rgba(99, 102, 241, 0.08); border-left: 4px solid #6366f1; padding: 14px; border-radius: 6px; font-size: 12.5px; color: #c7d2fe;">
      <strong>Explainability Note:</strong> Warm colors (red/amber) denote regions where the EfficientNet-B0 network concentrated its attention to locate artifacts, blurring inconsistencies, or blending boundaries.
    </div>
    <div class="footer">
      DeepGuard AI Cyber-Forensics • EfficientNet-B0 & PyTorch Grad-CAM Architecture
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DeepGuard_Report_${id}_${filename.replace(/\.[^/.]+$/, '')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="forensic-lab" style={{ padding: '4rem 0 4.5rem 0', position: 'relative' }}>
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
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              fontSize: '0.76rem',
              color: '#a5b4fc',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.85rem'
            }}
          >
            <Sparkles size={14} color="#818cf8" />
            Interactive Inspection Workspace
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 4vw, 2.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginBottom: '0.85rem'
            }}
          >
            Forensic Detection Lab
          </h2>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Upload suspect media on the left; explore biometric face crops, Grad-CAM attention maps, and interactive opacity overlays on the right.
          </p>
        </div>

        {/* 2-Column Desktop Studio Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
            alignItems: 'start'
          }}
        >
          {/* ============================================================= */}
          {/* Left Panel: Media Uploader & Processing Pipeline             */}
          {/* ============================================================= */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={18} color="var(--accent-indigo-light)" />
                  Media Ingestion Zone
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Upload image or video for deep neural evaluation
                </p>
              </div>

              {/* Supported format badges */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                  IMG
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                  VID
                </span>
              </div>
            </div>

            {/* Error Alert Box */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5'
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
                <div style={{ flex: 1, fontSize: '0.86rem' }}>
                  <strong style={{ display: 'block', color: '#ffffff', marginBottom: '0.15rem' }}>
                    Forensic Notice:
                  </strong>
                  {error}
                </div>
                <button
                  onClick={onClearError}
                  style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              className={`dropzone ${isDragOver ? 'active' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => !analyzing && fileInputRef.current?.click()}
              style={{
                minHeight: '230px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                position: 'relative',
                padding: '1.5rem',
                border: '2px dashed rgba(99, 102, 241, 0.35)',
                borderRadius: '14px',
                background: 'rgba(9, 14, 28, 0.65)'
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.avi,image/*,video/*"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                disabled={analyzing}
              />

              {analyzing && <div className="scan-beam" />}

              {selectedFile ? (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  {previewUrl && !isVideo && (
                    <div
                      style={{
                        position: 'relative',
                        width: '130px',
                        height: '130px',
                        margin: '0 auto 1rem auto',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid var(--accent-indigo)',
                        boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
                      }}
                    >
                      <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {previewUrl && isVideo && (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        maxHeight: '140px',
                        margin: '0 auto 1rem auto',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-glass)',
                        background: '#000000'
                      }}
                    >
                      <video src={previewUrl} controls style={{ width: '100%', maxHeight: '140px' }} />
                    </div>
                  )}

                  <div style={{ fontWeight: 600, fontSize: '0.94rem', color: '#ffffff', wordBreak: 'break-all' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', marginTop: '0.35rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                      {isVideo ? 'Video Stream' : 'Still Image'}
                    </span>
                    <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>

                  {!analyzing && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="btn-secondary"
                      style={{ marginTop: '0.85rem', padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                    >
                      <X size={13} /> Change File
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem auto',
                      color: 'var(--accent-indigo-light)'
                    }}
                  >
                    <Upload size={28} />
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                    Drag & Drop suspect media here
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    or click to browse local files
                  </div>
                </div>
              )}
            </div>

            {/* Best Practice Tips */}
            <div
              style={{
                marginTop: '1.25rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}
            >
              <strong style={{ color: '#ffffff' }}>💡 Forensic Tip: </strong>
              Ensure faces are well-lit and unobstructed. For video clips, DeepGuard automatically samples 15 frames uniformly across the duration.
            </div>

            {/* Step-by-Step Progress & Submit Button */}
            <div style={{ marginTop: '1.5rem' }}>
              {analyzing && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.45rem' }}>
                    <span style={{ color: 'var(--accent-cyan-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Loader2 size={14} className="spin" />
                      {analysisStage === 1 && 'Step 1/3: Extracting facial ROI with 20% margin...'}
                      {analysisStage === 2 && 'Step 2/3: EfficientNet-B0 inference & feature extraction...'}
                      {analysisStage === 3 && 'Step 3/3: Calculating Grad-CAM gradient attention...'}
                    </span>
                    <span className="mono" style={{ color: 'var(--text-muted)' }}>
                      {analysisStage * 33}%
                    </span>
                  </div>

                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${analysisStage * 33}%`,
                        background: 'linear-gradient(90deg, #06b6d4, #6366f1)',
                        transition: 'width 0.6s ease'
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleRunAnalysis}
                disabled={!selectedFile || analyzing}
                className="btn-primary glow-indigo"
                style={{ width: '100%', padding: '0.85rem 1rem' }}
              >
                {analyzing ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Running Neural Inspection...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Run DeepGuard Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ============================================================= */}
          {/* Right Panel: Forensic Verdict & XAI Studio                    */}
          {/* ============================================================= */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {!result ? (
              // Empty / Standby State Placeholder
              <div
                style={{
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '2rem 1.5rem',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: '14px',
                  background: 'rgba(9, 14, 28, 0.4)'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-indigo-light)',
                    marginBottom: '1.25rem'
                  }}
                >
                  <ShieldCheck size={32} />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Forensic Inspector Standby
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.6 }}>
                  Select or drop a suspect image or video stream on the left, then click <strong>Run DeepGuard Analysis</strong> to review Grad-CAM heatmaps, probability scores, and XAI overlays.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    marginTop: '2rem',
                    width: '100%',
                    maxWidth: '360px'
                  }}
                >
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.74rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Target Layer</div>
                    <div className="mono" style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>model.conv_head</div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.74rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Face Resolution</div>
                    <div className="mono" style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>224x224 RGB</div>
                  </div>
                </div>
              </div>
            ) : (
              // Active Result & Explainability Studio
              <div>
                {/* Header Strip with Verdict & Export */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        padding: '0.5rem',
                        borderRadius: '10px',
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
                      }}
                    >
                      <VerdictIcon size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Classification Verdict
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.92rem', padding: '0.25rem 0.85rem' }}>
                          {result.verdict}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleExportReport}
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
                  >
                    <Download size={14} />
                    Export Report
                  </button>
                </div>

                {/* Probability Metric Gauge */}
                <div
                  style={{
                    background: 'rgba(9, 14, 28, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1.15rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.45rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      SYNTHETIC MANIPULATION PROBABILITY
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: '1.65rem',
                        fontWeight: 800,
                        color: isReal ? 'var(--color-real)' : isInconclusive ? 'var(--color-inconclusive)' : 'var(--color-fake)'
                      }}
                    >
                      {result.fake_probability.toFixed(2)}%
                    </span>
                  </div>

                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(Math.max(result.fake_probability, 3), 100)}%`,
                        background: progressGradient,
                        borderRadius: '9999px',
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    <span>0% (Authentic)</span>
                    <span>35%</span>
                    <span>65%</span>
                    <span>100% (Synthetic)</span>
                  </div>
                </div>

                {/* XAI Studio Controls (Tab switcher: Side-by-Side vs Opacity Overlay) */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', fontWeight: 700 }}>
                      <Eye size={16} color="var(--accent-cyan)" />
                      Visual Explainability Studio
                    </div>

                    {/* Mode Toggle Pills */}
                    <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.7)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => setComparisonMode('overlay')}
                        style={{
                          background: comparisonMode === 'overlay' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                          color: comparisonMode === 'overlay' ? '#ffffff' : 'var(--text-muted)',
                          border: comparisonMode === 'overlay' ? '1px solid rgba(6, 182, 212, 0.35)' : 'none',
                          borderRadius: '6px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Interactive Overlay
                      </button>
                      <button
                        onClick={() => setComparisonMode('side-by-side')}
                        style={{
                          background: comparisonMode === 'side-by-side' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                          color: comparisonMode === 'side-by-side' ? '#ffffff' : 'var(--text-muted)',
                          border: comparisonMode === 'side-by-side' ? '1px solid rgba(99, 102, 241, 0.35)' : 'none',
                          borderRadius: '6px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Side-by-Side
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Interactive Opacity Slider Overlay */}
                  {comparisonMode === 'overlay' && (
                    <div
                      style={{
                        background: 'rgba(9, 14, 28, 0.6)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '14px',
                        padding: '1.25rem',
                        textAlign: 'center'
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '240px',
                          height: '240px',
                          margin: '0 auto 1.25rem auto',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '2px solid rgba(6, 182, 212, 0.4)',
                          background: '#000000',
                          boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)'
                        }}
                      >
                        {/* Base Layer: Original Face */}
                        <img
                          src={result.original_face_base64}
                          alt="Analyzed Face Base"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />

                        {/* Top Layer: Grad-CAM Overlay with Dynamic Opacity */}
                        <img
                          src={result.heatmap_base64}
                          alt="Grad-CAM Overlay"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: overlayOpacity / 100,
                            transition: 'opacity 0.05s linear',
                            mixBlendMode: 'screen'
                          }}
                        />
                      </div>

                      {/* Opacity Slider Control */}
                      <div style={{ maxWidth: '320px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Sliders size={12} color="var(--accent-cyan)" />
                            Grad-CAM Blend Intensity
                          </span>
                          <span className="mono" style={{ color: 'var(--accent-cyan-light)', fontWeight: 700 }}>
                            {overlayOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={overlayOpacity}
                          onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                          className="opacity-slider"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          <span>0% (Raw Face)</span>
                          <span>50% (Blend)</span>
                          <span>100% (Full Heatmap)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Side-by-Side Dual View */}
                  {comparisonMode === 'side-by-side' && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        background: 'rgba(9, 14, 28, 0.6)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '14px',
                        padding: '1.25rem'
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Cropped Face (224x224)
                        </div>
                        <div style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                          <img src={result.original_face_base64} alt="Crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Grad-CAM Heatmap
                        </div>
                        <div style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
                          <img src={result.heatmap_base64} alt="Heatmap" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Heatmap Guidance Note */}
                <div
                  style={{
                    padding: '0.75rem 0.95rem',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    borderLeft: '3px solid var(--accent-indigo)',
                    fontSize: '0.78rem',
                    color: '#c7d2fe',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem'
                  }}
                >
                  <strong style={{ color: '#ffffff' }}>Thermal Interpretation: </strong>
                  Warm zones (<span style={{ color: '#ef4444', fontWeight: 700 }}>Red/Amber</span>) highlight where the neural network concentrated attention on boundary seams, facial smoothing, or warped contours. Cool zones (<span style={{ color: '#38bdf8', fontWeight: 700 }}>Deep Blue</span>) represent authentic skin textures.
                </div>

                {/* Technical Inspection Metadata */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.65rem',
                    fontSize: '0.75rem'
                  }}
                >
                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Frames Analyzed</div>
                    <div className="mono" style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                      {result.frames_analyzed || 1} frame(s)
                    </div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Backbone</div>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--accent-indigo-light)', marginTop: '2px' }}>
                      EfficientNet-B0
                    </div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Input Dimensions</div>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '2px' }}>
                      224x224 RGB
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
