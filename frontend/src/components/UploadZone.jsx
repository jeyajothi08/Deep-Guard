import React, { useState, useRef } from 'react';
import { Upload, FileImage, FileVideo, AlertCircle, X, Sparkles, Loader2 } from 'lucide-react';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

export default function UploadZone({ onAnalyze, analyzing, error, onClearError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    if (onClearError) onClearError();

    // Check media type
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|avi)$/i.test(file.name);

    if (!isImage && !isVideo) {
      alert('Unsupported file format. Please upload an image (.jpg, .png, .webp) or a video (.mp4, .mov, .avi).');
      return;
    }

    setSelectedFile(file);

    // Create preview for image
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onClearError) onClearError();
  };

  const isVideo = selectedFile && (selectedFile.type.startsWith('video/') || /\.(mp4|mov|avi)$/i.test(selectedFile.name));

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile || analyzing) return;
    onAnalyze(selectedFile, isVideo ? 'video' : 'image');
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={20} color="var(--accent-indigo-light)" />
          Media Forensic Inspection
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Upload high-resolution facial images or video clips for automated face extraction, EfficientNet-B0 analysis, and Grad-CAM attention mapping.
        </p>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#fca5a5'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
          <div style={{ flex: 1, fontSize: '0.88rem' }}>
            <strong style={{ display: 'block', color: '#ffffff', marginBottom: '0.2rem' }}>Analysis Notice:</strong>
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

      {/* Dropzone */}
      <div
        className={`dropzone ${isDragOver ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !analyzing && fileInputRef.current?.click()}
        style={{ opacity: analyzing ? 0.7 : 1 }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.avi,image/*,video/*"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          disabled={analyzing}
        />

        {analyzing && <div className="scanner-beam" />}

        {selectedFile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {filePreview ? (
              <div style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid var(--accent-indigo)'
              }}>
                <img
                  src={filePreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-indigo-light)'
              }}>
                {isVideo ? <FileVideo size={42} /> : <FileImage size={42} />}
              </div>
            )}

            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: '#ffffff', wordBreak: 'break-all' }}>
                {selectedFile.name}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginTop: '0.25rem'
              }}>
                <span className="badge badge-neutral">
                  {isVideo ? 'Video Clip' : 'Still Image'}
                </span>
                <span className="mono">{formatFileSize(selectedFile.size)}</span>
              </div>
            </div>

            {!analyzing && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', marginTop: '0.25rem' }}
              >
                <X size={14} /> Remove File
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-indigo-light)'
            }}>
              <Upload size={30} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff' }}>
                Drag & Drop media here, or <span style={{ color: 'var(--accent-indigo-light)' }}>Browse</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Supports JPG, PNG, WEBP, MP4, MOV, AVI (Face must be visible)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button & Loading Status */}
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
        {analyzing && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: 'var(--accent-indigo-light)',
            fontSize: '0.88rem',
            marginRight: 'auto'
          }}>
            <Loader2 size={18} className="spin" />
            <span>
              {isVideo
                ? 'Sampling 15 video frames & computing Grad-CAM overlays...'
                : 'Extracting face & generating explainability heatmap...'}
            </span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedFile || analyzing}
          className="btn-primary glow-indigo"
        >
          {analyzing ? (
            <>
              <Loader2 size={18} className="spin" />
              Processing Analysis...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze Media
            </>
          )}
        </button>
      </div>
    </div>
  );
}

