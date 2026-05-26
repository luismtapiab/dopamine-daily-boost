import { useState, useEffect } from 'preact/hooks';
import { type Activity, getCustomActivities, saveCustomActivities, DEFAULT_ACTIVITIES } from '../lib/storage';
import { getCategoryIcon, getCategoryLabel, Trash } from './Icons';

export default function CustomListManager() {
  const [customList, setCustomList] = useState<Activity[]>([]);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'doing' | 'watching' | 'treat' | 'wildcard'>('doing');
  const [isHealthy, setIsHealthy] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCustomList(getCustomActivities());
    setReady(true);
  }, []);

  const handleAdd = (e: Event) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newActivity: Activity = {
      id: 'custom_' + Date.now(),
      text: newText.trim(),
      category: newCategory,
      isHealthy: isHealthy,
      isCustom: true
    };

    const updated = [...customList, newActivity];
    setCustomList(updated);
    saveCustomActivities(updated);

    // Clear form
    setNewText('');
    setNewCategory('doing');
    setIsHealthy(true);
  };

  const handleDelete = (id: string) => {
    const updated = customList.filter(item => item.id !== id);
    setCustomList(updated);
    saveCustomActivities(updated);
  };

  return (
    <div>
      {!ready ? (
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
      ) : (
      <>
      <article style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <header style={{ marginBottom: '1rem', borderBottom: 'none', padding: 0 }}>
          <h4 style={{ margin: 0 }}>Add Custom Activity</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted-color)', margin: '0.25rem 0 0 0' }}>
            Add your own tasks, treats, or hobbies.
          </p>
        </header>

        <form onSubmit={handleAdd} style={{ margin: 0 }}>
          <div class="grid" style={{ gap: '1rem', gridTemplateColumns: '2fr 1fr 1fr' }}>
            <label style={{ marginBottom: '0.75rem' }}>
              What do you want to add?
              <input 
                type="text" 
                placeholder="e.g. Read 5 pages, Eat a cookie, Do 15 pushups" 
                value={newText} 
                onInput={(e) => setNewText((e.target as HTMLInputElement).value)}
                required
                style={{ marginTop: '0.35rem' }}
              />
            </label>

            <label style={{ marginBottom: '0.75rem' }}>
              Category
              <select 
                value={newCategory} 
                onChange={(e) => setNewCategory((e.target as HTMLSelectElement).value as any)}
                style={{ marginTop: '0.35rem' }}
              >
                <option value="doing">🎨 Doing</option>
                <option value="watching">📺 Watching</option>
                <option value="treat">🍪 Treat</option>
                <option value="wildcard">✨ Wildcard</option>
              </select>
            </label>

            <label style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column' }}>
              Healthy Option?
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', height: '100%', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  role="switch" 
                  id="isHealthySwitch"
                  checked={isHealthy} 
                  onChange={(e) => setIsHealthy((e.target as HTMLInputElement).checked)} 
                />
                <span style={{ fontSize: '0.85rem', color: isHealthy ? 'var(--ins-color)' : 'var(--muted-color)' }}>
                  {isHealthy ? 'Healthy boost' : 'Treat/Indulgence'}
                </span>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" style={{ width: 'auto', marginBottom: 0 }}>
              Add to Wheel
            </button>
          </div>
        </form>
      </article>

      <div class="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Custom Items list */}
        <div>
          <h3>Your Custom Options ({customList.length})</h3>
          {customList.length === 0 ? (
            <p style={{ color: 'var(--muted-color)', fontStyle: 'italic' }}>
              No custom activities added yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {customList.map(item => (
                <div key={item.id} class="activity-card" style={{ padding: '0.5rem 0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span title={getCategoryLabel(item.category)} style={{ color: 'var(--primary)', cursor: 'help', display: 'inline-flex' }}>
                      {getCategoryIcon(item.category, 20)}
                    </span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.text}</div>
                      <small style={{ color: 'var(--muted-color)' }}>
                        {item.isHealthy ? '🟢 Healthy' : '🟡 Treat'}
                      </small>
                    </div>
                  </div>
                  <button 
                    class="outline secondary" 
                    onClick={() => handleDelete(item.id)}
                    style={{ 
                      padding: '4px', 
                      width: 'auto', 
                      height: 'auto',
                      marginBottom: 0, 
                      color: 'var(--del-color)', 
                      borderColor: 'transparent',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete item"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Default items list (Read only) */}
        <div>
          <h3>Default Suggestions ({DEFAULT_ACTIVITIES.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {DEFAULT_ACTIVITIES.map(item => (
              <div key={item.id} class="activity-card" style={{ opacity: 0.7, padding: '0.5rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span title={getCategoryLabel(item.category)} style={{ color: 'var(--muted-color)', cursor: 'help', display: 'inline-flex' }}>
                    {getCategoryIcon(item.category, 18)}
                  </span>
                  <div style={{ fontSize: '0.9rem' }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
