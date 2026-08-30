import React from 'react';
import { AppState, Theme, SwitchSoundProfile, KeyboardStyle, Difficulty } from '../types';
import { audioEngine } from '../services/audioEngine';
import { RotateCcw, Volume2, Sparkles, Sliders } from 'lucide-react';

interface SettingsViewProps {
  appState: AppState;
  onUpdateState: (partial: Partial<AppState>) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appState,
  onUpdateState,
  onResetData
}) => {
  const switchProfiles: { id: SwitchSoundProfile; label: string; desc: string }[] = [
    { id: 'thock', label: 'Thocky (Cream)', desc: 'Deep, muted, buttery acoustic profile' },
    { id: 'clack', label: 'Clacky (Panda)', desc: 'Crisp, tactile mid-range bottom-out' },
    { id: 'clicky', label: 'Clicky (Blue)', desc: 'Sharp tactile snap + high resonance' }
  ];

  const kbStyles: { id: KeyboardStyle; label: string }[] = [
    { id: 'full', label: 'Full 100%' },
    { id: 'compact', label: 'Compact 60%' },
    { id: 'laptop', label: 'Laptop' },
    { id: 'mechanical', label: 'Mechanical' }
  ];

  const difficulties: { id: Difficulty; label: string }[] = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
    { id: 'expert', label: 'Expert' },
    { id: 'master', label: 'Master' },
    { id: 'nightmare', label: 'Nightmare' }
  ];

  const handleProfileChange = (profile: SwitchSoundProfile) => {
    onUpdateState({ switchSound: profile });
    audioEngine.setConfig(appState.sound, appState.volume, profile);
    audioEngine.playClick(false);
  };

  const handleResetConfirm = () => {
    if (window.confirm('Are you sure you want to reset all typing stats, streaks, and unlocked stages? This action cannot be undone.')) {
      onResetData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] display-font">Settings & Preferences</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">
            Tune acoustic switch profiles, virtual keyboard geometry, and difficulty scaling.
          </p>
        </div>
      </div>

      <div className="panel max-w-2xl divide-y divide-[var(--panel-border)] p-6 space-y-5">
        {/* Theme Setting */}
        <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[var(--text)]">Interface Theme</div>
            <div className="text-xs text-[var(--text-dim)]">Toggle between obsidian dark and clean paper light</div>
          </div>
          <div className="flex gap-1.5 p-1 rounded-xl bg-[var(--panel-2)] border border-[var(--panel-border)]">
            {(['dark', 'light'] as Theme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => onUpdateState({ theme })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  appState.theme === theme
                    ? 'bg-[var(--key-face)] border border-[var(--accent)] text-[var(--accent)] shadow-xs'
                    : 'text-[var(--text-dim)] hover:text-[var(--text)]'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Switch */}
        <div className="pt-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[var(--text)]">Mechanical Key Audio</div>
            <div className="text-xs text-[var(--text-dim)]">Simulate physical switch actuation clicks while typing</div>
          </div>
          <div
            onClick={() => {
              const next = !appState.sound;
              onUpdateState({ sound: next });
              audioEngine.setConfig(next, appState.volume, appState.switchSound);
            }}
            className={`switch ${appState.sound ? 'on' : ''}`}
          >
            <div className="knob" />
          </div>
        </div>

        {/* Switch Acoustic Profile */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[var(--text)]">Switch Sound Profile</div>
              <div className="text-xs text-[var(--text-dim)]">Procedural Web Audio mechanical switch emulation</div>
            </div>
            <Sparkles size={16} className="text-[var(--accent)]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {switchProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProfileChange(p.id)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  appState.switchSound === p.id
                    ? 'border-[var(--accent)] bg-[var(--panel-2)] text-[var(--accent)]'
                    : 'border-[var(--panel-border)] bg-[var(--panel)] text-[var(--text-dim)] hover:text-[var(--text)]'
                }`}
              >
                <div className="text-xs font-bold font-mono">{p.label}</div>
                <div className="text-[11px] text-[var(--text-dim2)] mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Volume Slider */}
        <div className="pt-5 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5">
              <Volume2 size={16} /> Volume
            </div>
            <div className="text-xs text-[var(--text-dim)]">Adjust keypress loudness</div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-48">
            <input
              type="range"
              min={0}
              max={100}
              value={appState.volume}
              onChange={(e) => {
                const vol = parseInt(e.target.value, 10);
                onUpdateState({ volume: vol });
                audioEngine.setConfig(appState.sound, vol, appState.switchSound);
              }}
              className="w-full accent-[var(--accent)]"
            />
            <span className="text-xs font-mono text-[var(--text-dim)] w-8 text-right">
              {appState.volume}%
            </span>
          </div>
        </div>

        {/* Keyboard Style */}
        <div className="pt-5 space-y-2.5">
          <div className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5">
            <Sliders size={16} /> Keyboard Geometry
          </div>
          <div className="flex flex-wrap gap-2">
            {kbStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => onUpdateState({ kbStyle: style.id })}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  appState.kbStyle === style.id
                    ? 'bg-[var(--key-face)] border border-[var(--accent)] text-[var(--accent)] font-bold shadow-xs'
                    : 'bg-[var(--panel-2)] border border-[var(--panel-border)] text-[var(--text-dim)] hover:text-[var(--text)]'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Tier */}
        <div className="pt-5 space-y-2.5">
          <div className="text-sm font-bold text-[var(--text)]">Difficulty Tier</div>
          <div className="flex flex-wrap gap-1.5">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => onUpdateState({ difficulty: diff.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                  appState.difficulty === diff.id
                    ? 'bg-[var(--key-face)] border border-[var(--accent)] text-[var(--accent)] font-bold'
                    : 'bg-[var(--panel-2)] border border-[var(--panel-border)] text-[var(--text-dim)] hover:text-[var(--text)]'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-bold text-[var(--bad)]">Reset Progress</div>
            <div className="text-xs text-[var(--text-dim)]">Wipe local metrics, history records, and unlocked stages</div>
          </div>
          <button
            onClick={handleResetConfirm}
            className="keycap ghost px-4 py-2 text-xs font-semibold text-[var(--bad)] hover:bg-rose-500/10 border-rose-500/30 flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>Reset All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
