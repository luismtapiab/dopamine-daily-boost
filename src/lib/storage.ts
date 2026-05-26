export interface Activity {
  id: string;
  text: string;
  category: 'doing' | 'watching' | 'treat' | 'wildcard';
  isHealthy: boolean; // Custom activities tag, default activities have pre-defined values
  isCustom?: boolean;
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  activityText: string;
  category: string;
  status: 'done' | 'slipped';
  reflection?: {
    insteadOf: string;
    tryTomorrow: string;
  };
}

export interface StreakInfo {
  count: number;
  lastDate?: string;
  consecutiveSlips: number;
}

// Default list of activities
export const DEFAULT_ACTIVITIES: Activity[] = [
  // Doing (Weight 5 default)
  { id: 'd1', text: 'Cook or bake something from scratch', category: 'doing', isHealthy: true },
  { id: 'd2', text: 'Sketch, doodle, or color a page', category: 'doing', isHealthy: true },
  { id: 'd3', text: 'Go for a 15-minute walk outside without your phone', category: 'doing', isHealthy: true },
  { id: 'd4', text: 'Call a friend or family member for a quick chat', category: 'doing', isHealthy: true },
  { id: 'd5', text: 'Play an instrument or sing a song (even badly)', category: 'doing', isHealthy: true },
  { id: 'd6', text: 'Clean/organize one small space (like a single drawer)', category: 'doing', isHealthy: true },
  { id: 'd7', text: 'Do 10 minutes of light stretching or yoga', category: 'doing', isHealthy: true },

  // Watching (Weight 2 default)
  { id: 'w1', text: 'Watch one episode of a show you genuinely love (no auto-play)', category: 'watching', isHealthy: true },
  { id: 'w2', text: 'Watch a short documentary or educational video', category: 'watching', isHealthy: true },
  { id: 'w3', text: 'Watch a live concert recording of your favorite band', category: 'watching', isHealthy: true },

  // Treats (Weight 3 default)
  { id: 't1', text: 'Enjoy your favorite snack slowly and mindfully', category: 'treat', isHealthy: false },
  { id: 't2', text: 'Take a guilt-free 20-minute power nap', category: 'treat', isHealthy: false },
  { id: 't3', text: 'Explore a silly YouTube rabbit hole (set a 10m timer first!)', category: 'treat', isHealthy: false },
  { id: 't4', text: 'Reread a favorite chapter from a book you love', category: 'treat', isHealthy: true },

  // Wildcards (Weight 2 default)
  { id: 'wc1', text: 'Do one small task you have been putting off all week', category: 'wildcard', isHealthy: true },
  { id: 'wc2', text: 'Learn one weird or interesting Wikipedia fact', category: 'wildcard', isHealthy: true },
  { id: 'wc3', text: 'Perform a small random act of kindness', category: 'wildcard', isHealthy: true }
];

export function getCustomActivities(): Activity[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('ddb:custom_activities');
  return stored ? JSON.parse(stored) : [];
}

export function saveCustomActivities(activities: Activity[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ddb:custom_activities', JSON.stringify(activities));
}

export function getAllActivities(): Activity[] {
  return [...DEFAULT_ACTIVITIES, ...getCustomActivities()];
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('ddb:history');
  return stored ? JSON.parse(stored) : [];
}

export function saveHistory(history: HistoryEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ddb:history', JSON.stringify(history));
  updateStreakFromHistory(history);
}

export function getStreak(): StreakInfo {
  if (typeof window === 'undefined') return { count: 0, consecutiveSlips: 0 };
  const stored = localStorage.getItem('ddb:streak');
  return stored ? JSON.parse(stored) : { count: 0, consecutiveSlips: 0 };
}

export function saveStreak(streak: StreakInfo) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ddb:streak', JSON.stringify(streak));
}

// Calculate streaks dynamically from history to prevent bugs
export function updateStreakFromHistory(history: HistoryEntry[]) {
  if (history.length === 0) {
    saveStreak({ count: 0, consecutiveSlips: 0 });
    return;
  }

  // Sort history by date descending
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
  
  // Calculate consecutive slips at the end
  let consecutiveSlips = 0;
  for (const entry of sorted) {
    if (entry.status === 'slipped') {
      consecutiveSlips++;
    } else {
      break;
    }
  }

  // Streak count logic: count consecutive active days (done or slipped - we do NOT penalize streak for slips)
  // Let's count how many days in a row the user has logged *something*.
  let count = 0;
  const today = getLocalDateString(new Date());
  const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
  
  let expectedDate = sorted[0].date;
  
  // If the last logged entry is older than yesterday, streak has broken
  if (expectedDate !== today && expectedDate !== yesterday) {
    saveStreak({ count: 0, consecutiveSlips });
    return;
  }

  // Count backwards
  let currentIdx = 0;
  while (currentIdx < sorted.length) {
    const entry = sorted[currentIdx];
    if (entry.date === expectedDate) {
      count++;
      // Set expected date to the day before
      const d = new Date(entry.date + 'T12:00:00'); // avoiding timezone offset shifts
      d.setDate(d.getDate() - 1);
      expectedDate = getLocalDateString(d);
      currentIdx++;
    } else {
      // Missing day in the sequence
      break;
    }
  }

  saveStreak({
    count,
    lastDate: sorted[0].date,
    consecutiveSlips
  });
}

export function getLocalDateString(date: Date): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}
