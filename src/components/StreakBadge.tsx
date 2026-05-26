import { useState, useEffect } from 'preact/hooks';
import { getOrCreateIdentity } from '../lib/identity';
import { getStreak } from '../lib/storage';

export default function StreakBadge() {
  const [identity, setIdentity] = useState({ code: '', uuid: '' });
  const [streak, setStreak] = useState({ count: 0, consecutiveSlips: 0 });

  useEffect(() => {
    setIdentity(getOrCreateIdentity());
    setStreak(getStreak());
  }, []);

  return (
    <span style={{ fontSize: '0.85rem', color: 'var(--muted-color)', display: 'inline-flex', gap: '0.75rem', alignItems: 'center' }}>
      <span>🔥 {streak.count} {streak.count === 1 ? 'day' : 'days'}</span>
      <span style={{ opacity: 0.5 }}>|</span>
      <span>Code: <code style={{ padding: '2px 4px', fontSize: '0.8rem' }}>{identity.code || '...'}</code></span>
    </span>
  );
}
