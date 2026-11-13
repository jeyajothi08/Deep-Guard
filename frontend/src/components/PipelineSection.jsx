import React from 'react';
import { UploadCloud, Crop, Cpu, Eye, ArrowRight, Layers, FileCode, CheckCircle2 } from 'lucide-react';

export default function PipelineSection() {
  const steps = [
    {
      step: '01',
      title: 'Media Ingestion & Sampling',
      subtitle: 'Multi-Codec Stream Handling',
      icon: UploadCloud,
      color: '#38bdf8',
      description:
        'Upload raw images or compressed video streams. If video, the pipeline performs uniform 15-frame temporal sampling across the full clip duration to capture transient blending artifacts.',
      spec: 'JPG, PNG, WEBP, MP4, MOV, AVI'
    },
    {
      step: '02',
      title: 'Haar Cascade Face Extraction',
      subtitle: '20% Expanded Boundary Margin',
      icon: Crop,
      color: '#818cf8',
      description:
        'Detects dominant facial bounding boxes with OpenCV. Automatically applies a 20% margin expansion to capture subtle blending seams around the jaw, hairline, and neck, followed by 224x224 normalization.',
      spec: '224x224 RGB Float32 [0, 1]'
    },
    {
      step: '03',
      title: 'EfficientNet-B0 Inference',
      subtitle: 'Hardware Accelerated Backbone',
      icon: Cpu,
      color: '#c084fc',
      description:
        'ImageNet normalized tensors pass through compound-scaled EfficientNet-B0 convolutional feature extractors, routing to Apple Silicon MPS, CUDA, or CPU for sub-100ms binary Softmax evaluation.',
      spec: '0: Real | 1: Fake'
    },
    {
      step: '04',
      title: 'Grad-CAM XAI & Verdict',
      subtitle: 'Layer: model.conv_head',
      icon: Eye,
      color: '#10b981',
      description:
        'Calculates gradients of the Fake class score with respect to the 1280 feature channels of the final conv layer. Renders a thermal overlay and maps probabilities to categorical verdicts.',
      spec: '<35% Real | 35-65% Inconclusive | >65% Fake'
    }
  ];

  return (
    <section id="architecture" style={{ padding: '4rem 0 3.5rem 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              fontSize: '0.76rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.85rem'
            }}
          >
            <Layers size={14} />
            Forensic Inspection Architecture
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 4vw, 2.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginBottom: '0.85rem'
            }}
          >
            How DeepGuard Unmasks Synthetic Faces
          </h2>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            A rigorous 4-stage pipeline integrating spatial computer vision, deep transfer learning, and gradient-weighted activation mapping.
          </p>
        </div>

        {/* 4 Stepper Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            position: 'relative'
          }}
        >
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="glass-panel cyber-card"
                style={{
                  padding: '1.85rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  borderTop: `2px solid ${item.color}`
                }}
              >
                <div>
                  {/* Step pill & Icon */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: item.color,
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      STEP {item.step}
                    </span>

                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border-glass)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color
                      }}
                    >
                      <Icon size={20} />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {item.title}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: item.color,
                      fontWeight: 600,
                      marginBottom: '0.85rem'
                    }}
                  >
                    {item.subtitle}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      marginBottom: '1.25rem'
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Technical Spec Tag */}
                <div
                  style={{
                    background: 'rgba(6, 9, 17, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <FileCode size={13} color="var(--text-muted)" />
                  <span
                    className="mono"
                    style={{ fontSize: '0.72rem', color: '#cbd5e1', letterSpacing: '0.02em' }}
                  >
                    {item.spec}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
