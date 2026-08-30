import React, { useState } from 'react';
import { PRACTICE_MODES, SAMPLE_QUOTES, JS_SNIPPETS, PYTHON_SNIPPETS, HTML_SNIPPETS, generateWeakKeyText } from '../data/practiceModes';
import { AppState, PracticeMode } from '../types';
import { CustomTextModal } from './CustomTextModal';
import { ArrowRight, Zap, Code, BookOpen, EyeOff, Target, PlusCircle } from 'lucide-react';

interface PracticePickerViewProps {
  appState: AppState;
  onStartSession: (text: string, title: string, sub: string, isBlind?: boolean, mode?: 'practice' | 'custom') => void;
}

export const PracticePickerView: React.FC<PracticePickerViewProps> = ({
  appState,
  onStartSession
}) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const getModeIcon = (id: string) => {
    switch (id) {
      case 'quick30':
      case 'quick60':
        return <Zap size={18} className="text-amber-400" />;
      case 'weakDrill':
        return <Target size={18} className="text-rose-400" />;
      case 'codeJS':
      case 'codePy':
      case 'codeHTML':
        return <Code size={18} className="text-cyan-400" />;
      case 'quotes':
        return <BookOpen size={18} className="text-emerald-400" />;
      case 'blind':
        return <EyeOff size={18} className="text-purple-400" />;
      case 'custom':
        return <PlusCircle size={18} className="text-orange-400" />;
      default:
        return <Zap size={18} className="text-[var(--accent)]" />;
    }
  };

  const handleLaunch = (mode: PracticeMode) => {
    if (mode.id === 'custom') {
      setIsCustomModalOpen(true);
      return;
    }

    let text = "Speed and accuracy are twin pillars of touch typing. Keep fingers relaxed over home row anchor keys.";
    let isBlind = false;

    if (mode.id === 'quick30') {
      text = "Sprint bursts build neural pathway acceleration. Focus on light finger taps and smooth transitions between syllables.";
    } else if (mode.id === 'quick60') {
      text = "The benchmark standard one minute typing test requires steady cadence, calm breathing, and zero hesitation on difficult letter blends.";
    } else if (mode.id === 'weakDrill') {
      const entries = Object.entries(appState.keyStats || {}) as [string, { correct: number; wrong: number }][];
      const weakKeys = entries
        .filter(([, v]) => {
          const total = v.correct + v.wrong;
          return total >= 2 && (v.correct / total) < 0.9;
        })
        .map(([k]) => k);
      text = generateWeakKeyText(weakKeys);
    } else if (mode.id === 'codeJS') {
      text = JS_SNIPPETS[Math.floor(Math.random() * JS_SNIPPETS.length)];
    } else if (mode.id === 'codePy') {
      text = PYTHON_SNIPPETS[Math.floor(Math.random() * PYTHON_SNIPPETS.length)];
    } else if (mode.id === 'codeHTML') {
      text = HTML_SNIPPETS[Math.floor(Math.random() * HTML_SNIPPETS.length)];
    } else if (mode.id === 'quotes') {
      text = SAMPLE_QUOTES[Math.floor(Math.random() * SAMPLE_QUOTES.length)];
    } else if (mode.id === 'blind') {
      text = "Blind muscle memory drill. Trust your spatial finger positioning completely without glancing down or checking visual accuracy markers.";
      isBlind = true;
    }

    onStartSession(text, mode.title, mode.desc, isBlind, 'practice');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] display-font">Practice Modes</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">
            Choose a focused drill or custom test. Every keystroke sharpens your muscle memory profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRACTICE_MODES.map((m) => (
          <div
            key={m.id}
            onClick={() => handleLaunch(m)}
            className="panel p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-[var(--accent)] hover:-translate-y-1 transition-all duration-200 group"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-[var(--panel-2)] group-hover:scale-110 transition-transform">
                  {getModeIcon(m.id)}
                </div>
                <h3 className="text-base font-bold text-[var(--text)] display-font">
                  {m.title}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed">{m.desc}</p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--accent)] group-hover:underline">
                Launch Mode
              </span>
              <div className="w-7 h-7 rounded-lg bg-[var(--panel-2)] flex items-center justify-center text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <CustomTextModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onStartCustom={(text, title) => onStartSession(text, title, 'Custom User Provided Snippet', false, 'custom')}
      />
    </div>
  );
};
