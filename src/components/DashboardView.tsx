import React from 'react';
import { AppState, Lesson } from '../types';
import { LESSONS } from '../data/lessons';
import { ACHIEVEMENTS } from '../data/achievements';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';

interface DashboardViewProps {
  appState: AppState;
  onStartLesson: (lesson: Lesson) => void;
  onNavigate: (view: 'lessons' | 'practice' | 'games' | 'stats' | 'achievements') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appState,
  onStartLesson,
  onNavigate
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const history = appState.history;
  const todaySessions = history.filter(h => h.date === todayStr);

  const todayWPM = todaySessions.length
    ? Math.round(todaySessions.reduce((s, h) => s + h.wpm, 0) / todaySessions.length)
    : 0;

  const bestWPM = history.reduce((m, h) => Math.max(m, h.wpm || 0), 0);

  const avgAcc = history.length
    ? Math.round(history.reduce((s, h) => s + h.acc, 0) / history.length)
    : 100;

  const totalWords = history.reduce((s, h) => s + Math.round((h.wpm * (h.duration || 1)) / 60), 0);

  const nextStage = LESSONS.find(l => l.id === appState.unlockedStage) || LESSONS[0];

  // Weak keys calculation
  const keyEntries = Object.entries(appState.keyStats || {}) as [string, { correct: number; wrong: number }][];
  const weakKeys = keyEntries
    .map(([k, v]) => ({
      key: k,
      acc: Math.round((v.correct / Math.max(1, v.correct + v.wrong)) * 100),
      total: v.correct + v.wrong
    }))
    .filter(x => x.acc < 90 && x.total >= 3)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 6);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => appState.achievements.includes(a.id));

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] display-font">Welcome back</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">{currentDateFormatted}</p>
        </div>
      </div>

      {/* Continue CTA */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[color-mix(in_srgb,var(--accent-2)_15%,var(--panel))] to-[color-mix(in_srgb,var(--accent)_12%,var(--panel))] border border-[var(--panel-border)] flex items-center justify-between gap-4 flex-wrap">
        <div className="max-w-xl">
          <div className="text-xs font-bold text-[var(--accent-2)] uppercase tracking-wider mb-1">
            {nextStage.num} · Up Next
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text)] display-font mb-1">
            {nextStage.title}
          </h2>
          <p className="text-[var(--text-dim)] text-sm">{nextStage.desc}</p>
        </div>
        <button
          id="dash-continue-btn"
          onClick={() => onStartLesson(nextStage)}
          className="keycap primary px-5 py-3 text-sm font-semibold rounded-xl"
        >
          <span>Continue Lesson</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="panel stat-tile p-4">
          <div className="text-2xl md:text-3xl font-bold text-[var(--accent)] display-font">{todayWPM}</div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Today's WPM</div>
        </div>
        <div className="panel stat-tile p-4">
          <div className="text-2xl md:text-3xl font-bold text-[var(--good)] display-font">{bestWPM}</div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Best WPM</div>
        </div>
        <div className="panel stat-tile p-4">
          <div className="text-2xl md:text-3xl font-bold text-[var(--accent-2)] display-font">{avgAcc}%</div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Avg Accuracy</div>
        </div>
        <div className="panel stat-tile p-4">
          <div className="text-2xl md:text-3xl font-bold text-[var(--text)] display-font">{totalWords}</div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Words Typed</div>
        </div>
      </div>

      {/* Two Column Layout: Missions & Weak Keys */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Missions */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider font-mono">
              Daily Missions
            </h3>
            <span className="text-xs text-[var(--accent)] font-mono font-semibold">Resets Daily</span>
          </div>

          <div className="space-y-3">
            {appState.dailyMissions.map((m) => (
              <div
                key={m.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  m.completed
                    ? 'bg-[var(--panel-2)] border-[var(--panel-border)] opacity-80'
                    : 'bg-transparent border-[var(--panel-border)]'
                }`}
              >
                <div className="flex-shrink-0">
                  {m.completed ? (
                    <CheckCircle2 size={18} className="text-[var(--good)]" />
                  ) : (
                    <Circle size={18} className="text-[var(--text-dim2)]" />
                  )}
                </div>
                <div className={`flex-1 text-sm ${m.completed ? 'line-through text-[var(--text-dim)]' : 'text-[var(--text)]'}`}>
                  {m.text}
                </div>
                <div className="text-xs font-bold text-[var(--accent)] font-mono">
                  +{m.xp} XP
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Keys & Quick Insights */}
        <div className="panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider font-mono">
                Weak Keys
              </h3>
              <button 
                onClick={() => onNavigate('stats')}
                className="text-xs text-[var(--accent-2)] hover:underline cursor-pointer"
              >
                View Details
              </button>
            </div>

            {weakKeys.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-5">
                {weakKeys.map(w => (
                  <span
                    key={w.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--panel-2)] border border-[var(--panel-border)] text-xs font-mono"
                  >
                    <span className="font-bold text-[var(--bad)]">{w.key === ' ' ? 'SPACE' : w.key}</span>
                    <span className="text-[var(--text-dim)]">{w.acc}%</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-dim)] mb-5">
                No weak keys detected yet! Complete practice sessions to map your keystroke accuracy.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider font-mono">
                Recent Achievements
              </h3>
              <button 
                onClick={() => onNavigate('achievements')}
                className="text-xs text-[var(--accent-2)] hover:underline cursor-pointer"
              >
                All ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {unlockedAchievements.slice(0, 4).map(a => (
                <div
                  key={a.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--panel-2)] border border-[var(--panel-border)] text-xs"
                  title={a.desc}
                >
                  <span className="text-base">{a.emoji}</span>
                  <span className="font-semibold text-[var(--text)]">{a.title}</span>
                </div>
              ))}
              {unlockedAchievements.length === 0 && (
                <span className="text-xs text-[var(--text-dim)]">Complete your first session to unlock badges.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
