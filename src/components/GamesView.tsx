import React from 'react';
import { GameType } from '../types';
import { Sparkles, Trophy } from 'lucide-react';

interface GamesViewProps {
  onStartGame: (game: GameType) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({ onStartGame }) => {
  const games: {
    id: GameType;
    emoji: string;
    title: string;
    desc: string;
    badge: string;
    xpMultiplier: string;
  }[] = [
    {
      id: 'meteors',
      emoji: '☄️',
      title: 'Word Meteor Blast',
      desc: 'Destroy falling word asteroids before they breach ground level defenses! Fast reactions required.',
      badge: 'Arcade Survival',
      xpMultiplier: '1.5x XP'
    },
    {
      id: 'race',
      emoji: '🏎️',
      title: 'Ghost Type Racer',
      desc: 'Compete in a real-time race against an AI ghost runner calibrated to your skill tier.',
      badge: 'Head to Head',
      xpMultiplier: '2.0x XP'
    },
    {
      id: 'boss',
      emoji: '👾',
      title: 'Keyboard Boss Battle',
      desc: 'Unleash flawless typing combos to deplete the giant cyber-boss HP bar and dodge rage attacks.',
      badge: 'Boss Raid',
      xpMultiplier: '2.5x XP'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] display-font">Arcade Game Modes</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">
            Same foundational typing skills, elevated stakes. Level up faster with bonus XP!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((g) => (
          <div
            key={g.id}
            onClick={() => onStartGame(g.id)}
            className="panel p-6 flex flex-col justify-between gap-5 cursor-pointer hover:border-[var(--accent)] hover:-translate-y-1.5 transition-all duration-200 group relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                  {g.emoji}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--panel-2)] border border-[var(--panel-border)] text-[10px] font-mono font-bold text-[var(--accent)] flex items-center gap-1">
                  <Sparkles size={11} /> {g.xpMultiplier}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-2)] font-semibold">
                  {g.badge}
                </span>
                <h3 className="text-xl font-bold text-[var(--text)] display-font mt-0.5">
                  {g.title}
                </h3>
              </div>

              <p className="text-xs text-[var(--text-dim)] leading-relaxed">{g.desc}</p>
            </div>

            <button className="keycap primary w-full py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
              <Trophy size={14} />
              <span>Launch Arena</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
