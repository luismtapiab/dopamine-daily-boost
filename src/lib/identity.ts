const ADJECTIVES = [
  'calm', 'cozy', 'soft', 'quiet', 'gentle', 'warm', 'peaceful',
  'bright', 'slow', 'simple', 'fresh', 'kind', 'brave', 'steady',
  'light', 'silent', 'golden', 'clean', 'happy', 'cool'
];

const NOUNS = [
  'river', 'forest', 'peak', 'valley', 'cloud', 'leaf', 'stone',
  'wind', 'sun', 'lake', 'tree', 'path', 'star', 'rain',
  'wave', 'flower', 'field', 'meadow', 'brook', 'seed'
];

function generateMemorableCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10 to 99
  return `${adj}-${noun}-${num}`;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface UserIdentity {
  code: string;
  uuid: string;
}

export function getOrCreateIdentity(): UserIdentity {
  if (typeof window === 'undefined') {
    return { code: '', uuid: '' };
  }

  let code = localStorage.getItem('ddb:code');
  let uuid = localStorage.getItem('ddb:uuid');

  if (!code) {
    code = generateMemorableCode();
    localStorage.setItem('ddb:code', code);
  }
  if (!uuid) {
    uuid = generateUUID();
    localStorage.setItem('ddb:uuid', uuid);
  }

  return { code, uuid };
}

export function restoreIdentity(code: string): boolean {
  if (typeof window === 'undefined' || !code) return false;
  // Basic validation of code format
  const parts = code.trim().toLowerCase().split('-');
  if (parts.length !== 3 || isNaN(Number(parts[2]))) {
    return false;
  }
  localStorage.setItem('ddb:code', code.trim().toLowerCase());
  // Also regenerate a UUID if it doesn't exist, to ensure we keep a valid local identity
  if (!localStorage.getItem('ddb:uuid')) {
    localStorage.setItem('ddb:uuid', generateUUID());
  }
  return true;
}
