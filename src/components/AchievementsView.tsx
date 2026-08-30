import React from 'react';
import { AppState } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { Award, Star } from 'lucide-react';

interface AchievementsViewProps {
  appState: AppState;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ appState }) => {
  const unlockedCount = ACHIEVEMENTS.filter((a) => appState.achievements.includes(a.id)).length;
  const progressPct = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] display-font">Achievements</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">
            Unlock milestone badges and level up your typing academy tier.
          </p>
        </div>
      </div>

      {/* Level & Badge Progress Card */}
      <div className="panel p-6 bg-gradient-to-r from-[var(--panel)] to-[var(--panel-2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-400" size={20} />
            <span className="text-lg font-bold text-[var(--text)] display-font">
              Level {appState.level} Typist
            </span>
          </div>
          <p className="text-xs text-[var(--text-dim)] font-mono">
            {appState.xp} Total XP · {100 - (appState.xp % 100)} XP to Level {appState.level + 1}
          </p>
        </div>

        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-[var(--text-dim)]">
            <span>Badges Unlocked</span>
            <span className="font-bold text-[var(--accent)]">{unlockedCount} / {ACHIEVEMENTS.length}</span>
          </div>
          <div className="progress-track h-2.5">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = appState.achievements.includes(ach.id);

          return (
            <div
              key={ach.id}
              className={`panel p-5 text-center flex flex-col items-center justify-between gap-3 transition-all duration-200 ${
                isUnlocked
                  ? 'border-[var(--accent)] bg-[var(--panel-2)] shadow-lg'
                  : 'opacity-40 grayscale border-[var(--panel-border)]'
              }`}
            >
              <div className={`text-4xl transition-transform ${isUnlocked ? 'scale-110' : ''}`}>
                {ach.emoji}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--text)] display-font">
                  {ach.title}
                </h4>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                  {ach.desc}
                </p>
              </div>

              <div className="pt-2">
                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[var(--good)] uppercase">
                    <Award size={12} /> Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[var(--text-dim2)] uppercase">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
