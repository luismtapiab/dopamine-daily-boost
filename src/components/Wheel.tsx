import { useState, useEffect, useRef } from 'preact/hooks';
import { type Activity, getHistory, saveHistory, getLocalDateString, getStreak } from '../lib/storage';
import { getWeightedActivities } from '../lib/activities';
import { getCategoryIcon } from './Icons';
import ReflectionForm from './ReflectionForm';

const CATEGORY_COLORS: Record<string, string> = {
  doing: '#2b5c37',    // Cozy forest green
  watching: '#1e3a5f', // Calm ocean blue
  treat: '#8f5c15',    // Warm amber
  wildcard: '#502a75'  // Gentle purple
};

const CATEGORY_LABELS: Record<string, string> = {
  doing: 'Doing',
  watching: 'Watching',
  treat: 'Treat',
  wildcard: 'Wildcard'
};

export default function Wheel() {
  const [history, setHistory] = useState<any[]>([]);
  const [todayLog, setTodayLog] = useState<any | null>(null);
  const [currentSpin, setCurrentSpin] = useState<Activity | null>(null);
  const [consecutiveSlips, setConsecutiveSlips] = useState(0);
  
  // Wheel setup
  const [wheelItems, setWheelItems] = useState<Activity[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    const todayStr = getLocalDateString(new Date());
    const hist = getHistory();
    setHistory(hist);

    const streakInfo = getStreak();
    setConsecutiveSlips(streakInfo.consecutiveSlips);

    const loggedToday = hist.find(h => h.date === todayStr);
    if (loggedToday) {
      setTodayLog(loggedToday);
    } else {
      // Check if user already spun today but didn't log yet
      const savedSpin = localStorage.getItem('ddb:current_spin');
      if (savedSpin) {
        const { date, activity } = JSON.parse(savedSpin);
        if (date === todayStr) {
          setCurrentSpin(activity);
        }
      }
    }

    // Prepare 8 items for the wheel based on weights
    const candidates = selectWheelCandidates();
    setWheelItems(candidates);
    setReady(true);
  }, []);

  // Redraw wheel when items load or change
  useEffect(() => {
    if (wheelItems.length > 0) {
      drawWheel(0);
    }
  }, [wheelItems]);

  const selectWheelCandidates = (): Activity[] => {
    const all = getWeightedActivities();
    // Select 8 unique items based on weights
    const chosen: Activity[] = [];
    const pool = [...all];
    
    for (let i = 0; i < 8; i++) {
      if (pool.length === 0) break;
      const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
      let rand = Math.random() * totalWeight;
      for (let j = 0; j < pool.length; j++) {
        rand -= pool[j].weight;
        if (rand <= 0) {
          chosen.push(pool[j]);
          pool.splice(j, 1);
          break;
        }
      }
    }
    return chosen;
  };

  const drawWheel = (currentAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;
    ctx.clearRect(0, 0, width, height);

    const numSlices = wheelItems.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    // Draw slices
    for (let i = 0; i < numSlices; i++) {
      const item = wheelItems[i];
      const startAngle = i * sliceAngle + currentAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius - 10, startAngle, endAngle);
      ctx.closePath();

      // Colors based on category
      ctx.fillStyle = CATEGORY_COLORS[item.category] || '#444';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#11191f';
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      
      // Select shorter text display if too long
      const text = item.text.length > 35 ? item.text.substring(0, 32) + '...' : item.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(text, radius - 25, 4);
      ctx.restore();
    }

    // Inner circle
    ctx.beginPath();
    ctx.arc(radius, radius, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#11191f';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'var(--primary)';
    ctx.stroke();

    // Center icon/logo
    ctx.fillStyle = 'var(--primary)';
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('⚡', radius, radius + 8);
  };

  const spinWheel = () => {
    if (isSpinning || todayLog || currentSpin) return;

    setIsSpinning(true);
    const spinDuration = 3500; // 3.5 seconds
    const startTime = Date.now();
    const startAngle = angleRef.current;
    
    // Choose index to land on
    const targetIdx = Math.floor(Math.random() * wheelItems.length);
    const numSlices = wheelItems.length;
    const sliceAngle = (Math.PI * 2) / numSlices;
    
    // We want the chosen index to align with the pointer at the top (angle -Math.PI / 2)
    // Target position center:
    const targetCenterAngle = targetIdx * sliceAngle + sliceAngle / 2;
    const targetSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full spins
    const targetAngle = -Math.PI / 2 - targetCenterAngle + (targetSpins * Math.PI * 2);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Easing out quadratic function
      const easeOut = (t: number) => t * (2 - t);
      const easeProgress = easeOut(progress);
      
      const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
      angleRef.current = currentAngle;
      
      drawWheel(currentAngle);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const landedActivity = wheelItems[targetIdx];
        setCurrentSpin(landedActivity);
        
        // Persist the spin so they can't re-roll today
        localStorage.setItem('ddb:current_spin', JSON.stringify({
          date: getLocalDateString(new Date()),
          activity: landedActivity
        }));
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleDone = () => {
    if (!currentSpin) return;

    const todayStr = getLocalDateString(new Date());
    const newEntry = {
      date: todayStr,
      activityText: currentSpin.text,
      category: currentSpin.category,
      status: 'done' as const
    };

    const updated = [...history.filter(h => h.date !== todayStr), newEntry];
    saveHistory(updated);
    setHistory(updated);
    setTodayLog(newEntry);
    setCurrentSpin(null);
    localStorage.removeItem('ddb:current_spin');
    window.location.reload(); // update streak banner and locks
  };

  const handleLoggedReflection = () => {
    setShowReflection(false);
    const todayStr = getLocalDateString(new Date());
    const hist = getHistory();
    const todayEntry = hist.find(h => h.date === todayStr);
    
    setHistory(hist);
    setTodayLog(todayEntry || null);
    setCurrentSpin(null);
    localStorage.removeItem('ddb:current_spin');
    window.location.reload(); // updates streak and state
  };

  // Get countdown to next day
  const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };

  const [timeLeft, setTimeLeft] = useState(getSecondsUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getSecondsUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      {!ready && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
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
      )}
      {ready && (
        <>
      {/* 3+ Slips Gentle Message */}
      {consecutiveSlips >= 3 && !todayLog && (
        <blockquote style={{ borderLeftColor: 'var(--del-color)', padding: '0.5rem 0.75rem', margin: '0 0 1rem 0', background: '#2c1e21' }}>
          <small style={{ color: '#ffb3ba', fontWeight: 'bold' }}>
            Hope you are managing better your distractions once you take your daily dosage. 🤍
          </small>
        </blockquote>
      )}

      {/* Main Wheel View */}
      {!todayLog && !currentSpin && !showReflection && (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <div style={{ position: 'relative', width: '440px', height: '440px', margin: '0 auto 1rem auto' }}>
            {/* Pointer at the top */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '18px solid transparent',
              borderRight: '18px solid transparent',
              borderTop: '28px solid var(--primary)',
              zIndex: 10
            }} />
            <canvas 
              ref={canvasRef} 
              width={440} 
              height={440} 
              style={{ borderRadius: '50%', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
            />
          </div>
          
          <button 
            onClick={spinWheel} 
            disabled={isSpinning} 
            style={{ maxWidth: '200px', margin: '0 auto' }}
          >
            {isSpinning ? 'Selecting...' : 'Spin the Wheel'}
          </button>
          
          <p style={{ color: 'var(--muted-color)', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: 0 }}>
            One spin per day. Let fate suggest your alternative habit.
          </p>
        </div>
      )}

      {/* Selected Action View */}
      {currentSpin && !showReflection && (
        <article style={{ border: '2px solid var(--primary)', padding: '1.5rem', textAlign: 'center', margin: 0 }}>
          <span style={{ 
            backgroundColor: CATEGORY_COLORS[currentSpin.category], 
            padding: '4px 10px', 
            borderRadius: '4px', 
            color: '#fff',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            {getCategoryIcon(currentSpin.category, 14, '#fff')}
            {CATEGORY_LABELS[currentSpin.category]}
          </span>
          
          <h2 style={{ marginTop: '0.75rem', color: 'var(--color)', marginBottom: '0.5rem' }}>
            "{currentSpin.text}"
          </h2>

          <p style={{ color: 'var(--muted-color)', marginBottom: '1rem' }}>
            Try spending some time on this instead of checking your social apps today.
          </p>

          <hr style={{ margin: '1rem 0' }} />

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button class="outline secondary" onClick={() => setShowReflection(true)} style={{ marginBottom: 0 }}>
              I slipped / got distracted
            </button>
            <button onClick={handleDone} style={{ marginBottom: 0 }}>
              I did this! ✓
            </button>
          </div>
        </article>
      )}

      {/* Reflection view */}
      {showReflection && currentSpin && (
        <ReflectionForm 
          activityText={currentSpin.text} 
          category={currentSpin.category}
          onSaved={handleLoggedReflection} 
          onCancel={() => setShowReflection(false)} 
        />
      )}

      {/* Completed/Slipped View for today */}
      {todayLog && (
        <article style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid var(--muted-color)', margin: 0 }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Today's Boost Completed</h3>
          <p style={{ marginBottom: '1rem' }}>
            {todayLog.status === 'done' ? (
              <span style={{ color: '#2e6f40', fontWeight: 'bold' }}>
                🎉 You completed: "{todayLog.activityText}"
              </span>
            ) : (
              <span style={{ color: 'var(--del-color)', fontWeight: 'bold' }}>
                🤍 Distraction noticed & logged. Tomorrow is a fresh start!
              </span>
            )}
          </p>
          
          <hr style={{ margin: '1rem 0' }} />
          
          <div>
            <span style={{ color: 'var(--muted-color)', fontSize: '0.9rem' }}>
              Your wheel is locked until tomorrow:
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'monospace', margin: '0.25rem 0 0 0' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </article>
      )}
      </>
      )}
    </div>
  );
}
