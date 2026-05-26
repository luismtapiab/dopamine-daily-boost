import { useState } from 'preact/hooks';
import { getHistory, saveHistory, getLocalDateString } from '../lib/storage';

interface ReflectionFormProps {
  activityText: string;
  category: string;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ReflectionForm({ activityText, category, onSaved, onCancel }: ReflectionFormProps) {
  const [insteadOf, setInsteadOf] = useState('');
  const [tryTomorrow, setTryTomorrow] = useState('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const todayStr = getLocalDateString(new Date());
    const currentHistory = getHistory();

    // Check if we already logged today
    const filteredHistory = currentHistory.filter(h => h.date !== todayStr);

    const newEntry = {
      date: todayStr,
      activityText,
      category,
      status: 'slipped' as const,
      reflection: {
        insteadOf: insteadOf.trim() || 'A distraction',
        tryTomorrow: tryTomorrow.trim() || 'Try again tomorrow'
      }
    };

    saveHistory([...filteredHistory, newEntry]);
    onSaved();
  };

  return (
    <article style={{ border: '1px solid var(--del-color)', padding: '1.5rem', borderRadius: '8px' }}>
      <header style={{ marginBottom: '1rem', borderBottom: 'none', padding: 0 }}>
        <h4 style={{ color: 'var(--del-color)', margin: 0 }}>Compassionate Check-in</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted-color)', margin: '0.25rem 0 0 0' }}>
          It's completely okay. Slipping is a natural part of managing digital dependency.
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{ margin: 0 }}>
        <label style={{ marginBottom: '1rem' }}>
          What caught your attention today?
          <input 
            type="text" 
            placeholder="e.g., scrolled Instagram for 45 minutes, watched random TikToks"
            value={insteadOf} 
            onInput={(e) => setInsteadOf((e.target as HTMLInputElement).value)}
            required
            style={{ marginTop: '0.35rem' }}
          />
        </label>

        <label style={{ marginBottom: '1.25rem' }}>
          What is one tiny adjustment you could try tomorrow?
          <input 
            type="text" 
            placeholder="e.g., charge phone outside bedroom, use kettle trick, set a 10m timer"
            value={tryTomorrow} 
            onInput={(e) => setTryTomorrow((e.target as HTMLInputElement).value)}
            required
            style={{ marginTop: '0.35rem' }}
          />
        </label>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" class="outline secondary" onClick={onCancel} style={{ width: 'auto', marginBottom: 0 }}>
            Back
          </button>
          <button type="submit" class="contrast" style={{ width: 'auto', marginBottom: 0 }}>
            Log and move forward
          </button>
        </div>
      </form>
    </article>
  );
}
