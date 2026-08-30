import { AppState, DailyMission, SessionHistoryItem } from '../types';

const STORAGE_KEY = 'keystroke_academy_state_v2';

const defaultMissions: DailyMission[] = [
  { id: 'm1', text: 'Complete 2 Typing Lessons', target: 2, current: 0, completed: false, xp: 40 },
  { id: 'm2', text: 'Reach 40 WPM in any session', target: 40, current: 0, completed: false, xp: 50 },
  { id: 'm3', text: 'Achieve 95%+ Accuracy', target: 1, current: 0, completed: false, xp: 40 }
];

export const defaultState: AppState = {
  theme: 'dark',
  sound: true,
  switchSound: 'thock',
  volume: 50,
  kbStyle: 'full',
  difficulty: 'easy',
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  xp: 0,
  level: 1,
  unlockedStage: 1,
  history: [],
  keyStats: {},
  achievements: [],
  dailyMissions: defaultMissions,
  dailyMissionsDate: new Date().toISOString().split('T')[0]
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return checkStreakAndMissions({ ...defaultState });
    const parsed = JSON.parse(raw);
    const merged: AppState = { ...defaultState, ...parsed };
    return checkStreakAndMissions(merged);
  } catch {
    return checkStreakAndMissions({ ...defaultState });
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetAppState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return checkStreakAndMissions({ ...defaultState });
}

export function checkStreakAndMissions(state: AppState): AppState {
  const today = new Date().toISOString().split('T')[0];
  let updated = { ...state };

  // Streak logic
  if (!updated.lastActiveDate) {
    updated.lastActiveDate = today;
    updated.streak = 1;
  } else {
    const last = new Date(updated.lastActiveDate);
    const curr = new Date(today);
    const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      updated.streak += 1;
      updated.lastActiveDate = today;
    } else if (diffDays > 1) {
      updated.streak = 1;
      updated.lastActiveDate = today;
    }
  }

  // Daily missions reset if date changed
  if (updated.dailyMissionsDate !== today || !updated.dailyMissions || updated.dailyMissions.length === 0) {
    updated.dailyMissionsDate = today;
    updated.dailyMissions = [
      { id: 'm1', text: 'Complete 2 Typing Lessons', target: 2, current: 0, completed: false, xp: 40 },
      { id: 'm2', text: 'Reach 40 WPM in any session', target: 40, current: 0, completed: false, xp: 50 },
      { id: 'm3', text: 'Achieve 95%+ Accuracy', target: 1, current: 0, completed: false, xp: 40 }
    ];
  }

  return updated;
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function recordSession(
  currentState: AppState,
  session: Omit<SessionHistoryItem, 'id' | 'timestamp' | 'date'> & { date?: string }
): { updatedState: AppState; xpEarned: number; newAchievements: string[] } {
  const xpEarned = Math.max(10, Math.round(session.wpm * (session.acc / 100) * 1.5) + 10);
  const newXP = currentState.xp + xpEarned;
  const newLevel = calculateLevel(newXP);

  const newHistoryItem: SessionHistoryItem = {
    ...session,
    date: session.date || new Date().toISOString().split('T')[0],
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now()
  };

  const updatedHistory = [...currentState.history, newHistoryItem];

  // Update Daily Missions
  const updatedMissions = currentState.dailyMissions.map(m => {
    if (m.completed) return m;
    if (m.id === 'm1' && session.mode === 'lesson') {
      const cur = m.current + 1;
      return { ...m, current: cur, completed: cur >= m.target };
    }
    if (m.id === 'm2' && session.wpm >= m.target) {
      return { ...m, current: session.wpm, completed: true };
    }
    if (m.id === 'm3' && session.acc >= 95) {
      return { ...m, current: 1, completed: true };
    }
    return m;
  });

  // Stage unlocks
  let unlockedStage = currentState.unlockedStage;
  if (session.mode === 'lesson' && session.lessonId && session.acc >= 90) {
    if (session.lessonId >= unlockedStage && unlockedStage < 8) {
      unlockedStage = session.lessonId + 1;
    }
  }

  // Check achievements
  const allAchievements = [...currentState.achievements];
  const maxWPM = updatedHistory.reduce((max, h) => Math.max(max, h.wpm || 0), 0);
  const has100Acc = updatedHistory.some(h => h.acc === 100);

  const checkUnlock = (id: string) => {
    if (!allAchievements.includes(id)) {
      allAchievements.push(id);
    }
  };

  if (updatedHistory.length >= 1) checkUnlock('first_keystroke');
  if (maxWPM >= 30) checkUnlock('speed_30');
  if (maxWPM >= 60) checkUnlock('speed_60');
  if (maxWPM >= 100) checkUnlock('speed_100');
  if (has100Acc) checkUnlock('accuracy_100');
  if (currentState.streak >= 7) checkUnlock('streak_7');
  if (unlockedStage >= 8) checkUnlock('stage_master');

  const updatedState: AppState = {
    ...currentState,
    xp: newXP,
    level: newLevel,
    unlockedStage,
    history: updatedHistory,
    dailyMissions: updatedMissions,
    achievements: allAchievements
  };

  saveAppState(updatedState);
  return { updatedState, xpEarned, newAchievements: allAchievements };
}
