import React, { useState } from 'react';
import { History, RefreshCw, FileImage, FileVideo, Clock, Search, Filter } from 'lucide-react';

export default function HistorySection({ history, loading, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('All');

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getVerdictBadge = (verdict) => {
    if (verdict === 'Likely Real') {
      return <span className="badge badge-real">Likely Real</span>;
    }
    if (verdict === 'Inconclusive') {
      return <span className="badge badge-inconclusive">Inconclusive</span>;
    }
    return <span className="badge badge-fake">Likely Fake</span>;
  };

  // Filter history items by search and category
  const filteredHistory = (history || []).filter((item) => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerdict = verdictFilter === 'All' || item.verdict === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  return (
    <section id="history" style={{ padding: '4rem 0 5rem 0', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
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
                marginBottom: '0.65rem'
              }}
            >
              <History size={14} />
              Forensic Audit Trail
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>
              Recent Scan Evaluation Logs
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Indexed audit trail of past media inspections persisted in SQLite database.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-secondary"
            style={{ fontSize: '0.84rem', padding: '0.5rem 1rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh Records
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                borderRadius: '8px',
                background: 'rgba(6, 9, 17, 0.6)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Verdict Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Filter size={13} />
              Filter:
            </span>
            {['All', 'Likely Real', 'Inconclusive', 'Likely Fake'].map((cat) => {
              const active = verdictFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setVerdictFilter(cat)}
                  style={{
                    background: active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    border: active ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.76rem',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Table */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div className="custom-table-wrapper">
            {filteredHistory.length > 0 ? (
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Audit ID</th>
                    <th>Target Media Filename</th>
                    <th>Format</th>
                    <th>Synthetic Prob</th>
                    <th>Verdict</th>
                    <th>Frames Sampled</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="mono" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        #{item.id}
                      </td>
                      <td style={{ fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.filename}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {item.media_type === 'video' ? <FileVideo size={14} color="#38bdf8" /> : <FileImage size={14} color="#818cf8" />}
                          <span style={{ textTransform: 'capitalize' }}>{item.media_type}</span>
                        </span>
                      </td>
                      <td>
                        <span
                          className="mono"
                          style={{
                            fontWeight: 700,
                            color:
                              item.fake_probability < 35
                                ? 'var(--color-real)'
                                : item.fake_probability <= 65
                                ? 'var(--color-inconclusive)'
                                : 'var(--color-fake)'
                          }}
                        >
                          {item.fake_probability.toFixed(1)}%
                        </span>
                      </td>
                      <td>{getVerdictBadge(item.verdict)}</td>
                      <td className="mono" style={{ color: 'var(--text-secondary)' }}>
                        {item.frames_analyzed || 1} frame(s)
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={12} />
                          {formatTimestamp(item.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {loading
                  ? 'Querying SQLite audit database...'
                  : searchTerm || verdictFilter !== 'All'
                  ? 'No scan records match the selected filter criteria.'
                  : 'No evaluations recorded yet. Run a media scan in the Forensic Lab above to populate the log.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

