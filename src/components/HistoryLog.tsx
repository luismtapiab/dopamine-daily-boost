import { useState, useEffect } from 'preact/hooks';
import { getHistory, saveHistory } from '../lib/storage';
import { getCategoryIcon, getCategoryLabel, Trash } from './Icons';

export default function HistoryLog() {
  const [history, setHistory] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHistory(getHistory().sort((a, b) => b.date.localeCompare(a.date)));
    setReady(true);
  }, []);

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all history? This will reset your streak.')) {
      saveHistory([]);
      setHistory([]);
      window.location.reload();
    }
  };

  if (!ready) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--card-border-color)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <article style={{ textAlign: 'center', padding: '2rem 1rem', margin: 0 }}>
        <h3>No entries yet</h3>
        <p style={{ color: 'var(--muted-color)' }}>
          Spin the wheel and record your first day activity or reflection to start your log.
        </p>
        <a href="/" class="button">Go to Wheel</a>
      </article>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Your Journey</h3>
        <button class="outline secondary" onClick={handleReset} style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8rem', marginBottom: 0 }}>
          Clear History
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {history.map((entry) => (
          <article 
            key={entry.date} 
            style={{ 
              borderLeft: `4px solid ${entry.status === 'done' ? 'var(--ins-color)' : 'var(--del-color)'}`,
              padding: '0.75rem 1rem',
              marginBottom: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong style={{ fontSize: '1rem' }}>
                  {entry.status === 'done' ? `✓ Completed` : `🤍 Slip noticed`}
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted-color)' }}>
                  {entry.date}
                </div>
              </div>
              
              <span 
                title={getCategoryLabel(entry.category)} 
                style={{ 
                  color: entry.status === 'done' ? 'var(--ins-color)' : 'var(--del-color)',
                  cursor: 'help',
                  display: 'inline-flex'
                }}
              >
                {getCategoryIcon(entry.category, 20)}
              </span>
            </div>

            <p style={{ margin: '0.5rem 0 0 0', fontStyle: 'italic', color: 'var(--color)', fontSize: '0.95rem' }}>
              "{entry.activityText}"
            </p>

            {entry.reflection && (
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '0.5rem 0.75rem', 
                backgroundColor: 'rgba(0, 0, 0, 0.15)', 
                borderRadius: '6px',
                fontSize: '0.85rem',
                borderLeft: '2px solid rgba(243, 139, 168, 0.4)'
              }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong style={{ color: 'var(--del-color)' }}>Instead of this activity: </strong>
                  <span style={{ color: 'var(--muted-color)' }}>{entry.reflection.insteadOf}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--ins-color)' }}>Try tomorrow: </strong>
                  <span style={{ color: 'var(--muted-color)' }}>{entry.reflection.tryTomorrow}</span>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
