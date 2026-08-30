import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VirtualKeyboard } from './VirtualKeyboard';
import { audioEngine } from '../services/audioEngine';
import { Lesson, KeyStat } from '../types';
import { X, RotateCcw, Check, Sparkles, AlertCircle, Zap, ShieldCheck } from 'lucide-react';

interface SessionViewProps {
  initialText: string;
  title: string;
  subTitle?: string;
  isBlind?: boolean;
  lesson?: Lesson | null;
  mode?: 'lesson' | 'practice' | 'custom';
  onExit: () => void;
  onComplete: (stats: {
    wpm: number;
    cpm: number;
    acc: number;
    errors: number;
    duration: number;
    mode: 'lesson' | 'practice' | 'game' | 'custom';
    title: string;
    lessonId?: number;
    keyStatsDelta: Record<string, KeyStat>;
  }) => { xpEarned: number };
}

export const SessionView: React.FC<SessionViewProps> = ({
  initialText,
  title,
  subTitle = '',
  isBlind = false,
  lesson = null,
  mode = 'practice',
  onExit,
  onComplete
}) => {
  const [text, setText] = useState(initialText);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [keyFlash, setKeyFlash] = useState<{ key: string; isCorrect: boolean } | null>(null);

  // Key tracking per session
  const sessionKeyStats = useRef<Record<string, KeyStat>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Restart session
  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setErrors(0);
    setStartTime(null);
    setEndTime(null);
    setElapsedSec(0);
    setIsFinished(false);
    setXpEarned(null);
    setKeyFlash(null);
    sessionKeyStats.current = {};
    if (timerRef.current) clearInterval(timerRef.current);
    if (containerRef.current) containerRef.current.focus();
  }, []);

  // Update text if prop changes
  useEffect(() => {
    setText(initialText);
    handleRestart();
  }, [initialText, handleRestart]);

  // Elapsed timer tick
  useEffect(() => {
    if (startTime && !endTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedSec(Math.max(1, Math.floor((now - startTime) / 1000)));
      }, 500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, endTime]);

  // Calculations
  const calcMetrics = useCallback(() => {
    const timeInSec = Math.max(1, elapsedSec);
    const wordsTyped = currentIndex / 5;
    const wpm = Math.round((wordsTyped / timeInSec) * 60);
    const cpm = Math.round((currentIndex / timeInSec) * 60);
    const totalAttempts = currentIndex + errors;
    const acc = totalAttempts > 0 ? Math.round((currentIndex / totalAttempts) * 100) : 100;
    return { wpm, cpm, acc, duration: timeInSec };
  }, [currentIndex, errors, elapsedSec]);

  // Key input handler
  const handleKeyInput = useCallback((char: string) => {
    if (isFinished || currentIndex >= text.length) return;

    // Start timer on first keystroke
    let activeStart = startTime;
    if (!activeStart) {
      activeStart = Date.now();
      setStartTime(activeStart);
    }

    const expectedChar = text[currentIndex];
    const isCorrect = char === expectedChar;

    // Record per-key stats
    const upper = expectedChar.toUpperCase();
    if (!sessionKeyStats.current[upper]) {
      sessionKeyStats.current[upper] = { correct: 0, wrong: 0 };
    }

    if (isCorrect) {
      sessionKeyStats.current[upper].correct += 1;
      audioEngine.playClick(char === ' ' || char === 'Enter');
      setKeyFlash({ key: expectedChar, isCorrect: true });
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      // Check if finished
      if (nextIdx >= text.length) {
        const finishTime = Date.now();
        setEndTime(finishTime);
        const finalDuration = Math.max(1, Math.floor((finishTime - activeStart) / 1000));
        const wordsTyped = nextIdx / 5;
        const finalWPM = Math.round((wordsTyped / finalDuration) * 60);
        const finalCPM = Math.round((nextIdx / finalDuration) * 60);
        const totalAttempts = nextIdx + errors;
        const finalAcc = totalAttempts > 0 ? Math.round((nextIdx / totalAttempts) * 100) : 100;

        setIsFinished(true);

        const result = onComplete({
          wpm: finalWPM,
          cpm: finalCPM,
          acc: finalAcc,
          errors,
          duration: finalDuration,
          mode,
          title,
          lessonId: lesson ? lesson.id : undefined,
          keyStatsDelta: sessionKeyStats.current
        });
        setXpEarned(result.xpEarned);
      }
    } else {
      sessionKeyStats.current[upper].wrong += 1;
      setErrors((prev) => prev + 1);
      audioEngine.playError();
      setKeyFlash({ key: expectedChar, isCorrect: false });
    }

    setTimeout(() => {
      setKeyFlash((cur) => (cur?.key === expectedChar ? null : cur));
    }, 150);
  }, [currentIndex, text, isFinished, startTime, errors, onComplete, mode, title, lesson]);

  // Global window listener for keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Tab' || e.key === 'CapsLock') return;
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      if (isFinished) return;

      if (e.key.length === 1) {
        e.preventDefault();
        handleKeyInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput, isFinished, onExit]);

  const metrics = calcMetrics();
  const progressPct = text.length > 0 ? Math.round((currentIndex / text.length) * 100) : 0;
  const nextChar = currentIndex < text.length ? text[currentIndex] : '';

  // AI Coach Feedback generator
  const getCoachAdvice = () => {
    if (metrics.acc < 90) {
      return {
        icon: <AlertCircle className="text-rose-400 flex-shrink-0" size={20} />,
        headline: "Prioritize Accuracy Over Speed",
        text: "Speed naturally follows once your spatial muscle memory locks in. Slow down your cadence by 10% to eliminate hesitation on anchor keys."
      };
    }
    if (metrics.wpm < 35) {
      return {
        icon: <Zap className="text-amber-400 flex-shrink-0" size={20} />,
        headline: "Focus on Cadence Continuity",
        text: "Great accuracy! Work on maintaining uninterrupted rhythmic tempo across words rather than bursting and pausing."
      };
    }
    if (metrics.wpm >= 65) {
      return {
        icon: <Sparkles className="text-emerald-400 flex-shrink-0" size={20} />,
        headline: "Elite Pace & Precision!",
        text: "Outstanding typing performance exceeding professional standards. Try the Code Snippets or Blind mode for an extra challenge."
      };
    }
    return {
      icon: <ShieldCheck className="text-cyan-400 flex-shrink-0" size={20} />,
      headline: "Solid Rhythm & High Precision",
      text: "Balanced precision and pace. Daily repetition of this stage will cement this speed into long-term subconscious reflex."
    };
  };

  const coachAdvice = getCoachAdvice();

  return (
    <div className="space-y-5" ref={containerRef} tabIndex={0}>
      {/* Session Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            {lesson && (
              <span className="px-2 py-0.5 rounded bg-[var(--panel-2)] border border-[var(--panel-border)] text-xs font-mono font-bold text-[var(--accent-2)]">
                {lesson.num}
              </span>
            )}
            <h1 className="text-2xl font-bold text-[var(--text)] display-font">{title}</h1>
          </div>
          {subTitle && <p className="text-xs text-[var(--text-dim)] mt-1">{subTitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="keycap ghost px-3 py-2 text-xs flex items-center gap-1.5"
            title="Restart session"
          >
            <RotateCcw size={14} />
            <span>Restart</span>
          </button>
          <button
            onClick={onExit}
            className="keycap ghost px-3 py-2 text-xs flex items-center gap-1.5 text-[var(--bad)] hover:text-[var(--bad)]"
            title="Exit to menu"
          >
            <X size={14} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Live HUD */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="px-3.5 py-2 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-xs flex items-center gap-2">
          <span className="text-[var(--text-dim)] uppercase tracking-wider font-semibold font-mono">WPM</span>
          <b className="text-base font-bold text-[var(--accent)] display-font">{metrics.wpm}</b>
        </div>
        <div className="px-3.5 py-2 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-xs flex items-center gap-2">
          <span className="text-[var(--text-dim)] uppercase tracking-wider font-semibold font-mono">Acc</span>
          <b className="text-base font-bold text-[var(--good)] display-font">{metrics.acc}%</b>
        </div>
        <div className="px-3.5 py-2 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-xs flex items-center gap-2">
          <span className="text-[var(--text-dim)] uppercase tracking-wider font-semibold font-mono">Errors</span>
          <b className="text-base font-bold text-[var(--bad)] display-font">{errors}</b>
        </div>
        <div className="px-3.5 py-2 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-xs flex items-center gap-2">
          <span className="text-[var(--text-dim)] uppercase tracking-wider font-semibold font-mono">Time</span>
          <b className="text-base font-bold text-[var(--text)] display-font">{elapsedSec}s</b>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Interactive Text Canvas */}
      <div
        className={`text-stage ${isBlind ? 'blind' : ''} shadow-inner cursor-text relative`}
        onClick={() => containerRef.current?.focus()}
      >
        {text.split('').map((char, index) => {
          let charClass = 'ch-pending';
          if (index < currentIndex) {
            charClass = 'ch-correct';
          } else if (index === currentIndex) {
            charClass = 'ch-current';
          }
          return (
            <span key={index} className={charClass}>
              {char}
            </span>
          );
        })}
      </div>

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        nextChar={nextChar}
        activeKeyFlash={keyFlash}
      />

      {/* Completion Modal / Panel */}
      {isFinished && (
        <div className="panel bg-[var(--bg-elev)] border-2 border-[var(--accent)] p-6 rounded-2xl shadow-2xl animate-fadeIn space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--panel-border)]">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <h2 className="text-xl font-bold text-[var(--text)] display-font">Session Complete!</h2>
            </div>
            {lesson && metrics.acc >= lesson.accReq && (
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-[var(--good)] text-xs font-bold font-mono border border-emerald-500/30">
                ✓ STAGE PASSED
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="panel stat-tile p-3.5">
              <div className="text-2xl font-bold text-[var(--accent)] display-font">{metrics.wpm}</div>
              <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Final WPM</div>
            </div>
            <div className="panel stat-tile p-3.5">
              <div className="text-2xl font-bold text-[var(--accent-2)] display-font">{metrics.cpm}</div>
              <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">CPM</div>
            </div>
            <div className="panel stat-tile p-3.5">
              <div className="text-2xl font-bold text-[var(--good)] display-font">{metrics.acc}%</div>
              <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Accuracy</div>
            </div>
            <div className="panel stat-tile p-3.5">
              <div className="text-2xl font-bold text-amber-400 display-font">+{xpEarned || 30}</div>
              <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">XP Earned</div>
            </div>
          </div>

          {/* AI Coach Recommendation */}
          <div className="p-4 rounded-xl bg-[var(--panel-2)] border border-[var(--panel-border)] flex items-start gap-3.5">
            {coachAdvice.icon}
            <div>
              <div className="text-sm font-bold text-[var(--text)] display-font mb-1">
                {coachAdvice.headline}
              </div>
              <div className="text-xs text-[var(--text-dim)] leading-relaxed">
                {coachAdvice.text}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="keycap primary flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Practice Again</span>
            </button>
            <button
              onClick={onExit}
              className="keycap ghost flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
