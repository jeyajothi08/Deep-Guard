import React from 'react';
import { History, RefreshCw, FileImage, FileVideo, Clock } from 'lucide-react';

export default function HistoryTable({ history, loading, onRefresh }) {
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

  return (
    <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--accent-indigo-light)" />
            Recent Scan History
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Latest forensic evaluations stored in SQLite database.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-secondary"
          title="Refresh scan history"
          style={{ fontSize: '0.85rem', padding: '0.45rem 0.95rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="table-container">
        {history && history.length > 0 ? (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Filename</th>
                <th>Media</th>
                <th>Fake Score</th>
                <th>Verdict</th>
                <th>Frames</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="mono" style={{ color: 'var(--text-muted)' }}>
                    #{item.id}
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.filename}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {item.media_type === 'video' ? <FileVideo size={14} /> : <FileImage size={14} />}
                      <span style={{ textTransform: 'capitalize' }}>{item.media_type}</span>
                    </span>
                  </td>
                  <td>
                    <span className="mono" style={{
                      fontWeight: 700,
                      color: item.fake_probability < 35
                        ? 'var(--color-real)'
                        : item.fake_probability <= 65
                        ? 'var(--color-inconclusive)'
                        : 'var(--color-fake)'
                    }}>
                      {item.fake_probability.toFixed(1)}%
                    </span>
                  </td>
                  <td>{getVerdictBadge(item.verdict)}</td>
                  <td className="mono" style={{ color: 'var(--text-secondary)' }}>
                    {item.frames_analyzed || 1}
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
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            {loading ? 'Loading scan history...' : 'No forensic scans recorded yet. Upload an image or video above to begin.'}
          </div>
        )}
      </div>
    </div>
  );
}

