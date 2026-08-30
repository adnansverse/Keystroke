export type Theme = 'dark' | 'light';
export type SwitchSoundProfile = 'thock' | 'clack' | 'clicky';
export type KeyboardStyle = 'full' | 'compact' | 'laptop' | 'mechanical';
export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master' | 'nightmare';

export type ViewType = 
  | 'dashboard'
  | 'lessons'
  | 'practice'
  | 'session'
  | 'games'
  | 'game-play'
  | 'stats'
  | 'achievements'
  | 'settings';

export type GameType = 'meteors' | 'race' | 'boss';

export interface KeyStat {
  correct: number;
  wrong: number;
}

export interface SessionHistoryItem {
  id: string;
  date: string;
  timestamp: number;
  wpm: number;
  cpm: number;
  acc: number;
  errors: number;
  duration: number; // in seconds
  mode: 'lesson' | 'practice' | 'game' | 'custom';
  title: string;
  lessonId?: number;
}

export interface DailyMission {
  id: string;
  text: string;
  target: number;
  current: number;
  completed: boolean;
  xp: number;
}

export interface AppState {
  theme: Theme;
  sound: boolean;
  switchSound: SwitchSoundProfile;
  volume: number; // 0 - 100
  kbStyle: KeyboardStyle;
  difficulty: Difficulty;
  streak: number;
  lastActiveDate: string;
  xp: number;
  level: number;
  unlockedStage: number;
  history: SessionHistoryItem[];
  keyStats: Record<string, KeyStat>;
  achievements: string[];
  dailyMissions: DailyMission[];
  dailyMissionsDate: string;
}

export interface Lesson {
  id: number;
  num: string;
  title: string;
  keys: string;
  accReq: number;
  desc: string;
  text: string;
}

export interface PracticeMode {
  id: string;
  title: string;
  desc: string;
  category?: 'speed' | 'code' | 'prose' | 'special';
}

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
}

export interface VirtualKeyDef {
  k: string;
  label?: string;
  shift?: string;
  width?: string;
  f?: string;
}
