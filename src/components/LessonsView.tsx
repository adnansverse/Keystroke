import React from 'react';
import { Lesson, AppState } from '../types';
import { LESSONS } from '../data/lessons';
import { Lock, ArrowRight, Check } from 'lucide-react';

interface LessonsViewProps {
  appState: AppState;
  onStartLesson: (lesson: Lesson) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({
  appState,
  onStartLesson
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] display-font">Lessons Curriculum</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">
            Eight progressive stages gated by accuracy — muscle memory first, speed second.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {LESSONS.map((stage) => {
          const isLocked = stage.id > appState.unlockedStage;
          const isCompleted = stage.id < appState.unlockedStage;

          return (
            <div
              key={stage.id}
              id={`stage-card-${stage.id}`}
              className={`panel flex flex-col justify-between gap-4 p-5 relative transition-all duration-200 ${
                isLocked ? 'opacity-50 grayscale' : 'hover:border-[var(--accent)] hover:-translate-y-1'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[var(--text-dim2)]">{stage.num}</span>
                  {isLocked && (
                    <div className="p-1 rounded bg-[var(--panel-2)] text-[var(--text-dim2)]">
                      <Lock size={14} />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--good)] font-mono">
                      <Check size={14} /> Passed
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[var(--text)] display-font mb-1">
                  {stage.title}
                </h3>
                <div className="text-xs font-semibold text-[var(--accent-2)] tracking-wide font-mono mb-2">
                  {stage.keys}
                </div>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">{stage.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--panel-border)] mt-2">
                <span className="text-[11px] text-[var(--text-dim2)] font-mono">
                  Req: <b className="text-[var(--text-dim)]">{stage.accReq}% Acc</b>
                </span>
                <button
                  disabled={isLocked}
                  onClick={() => onStartLesson(stage)}
                  className={`keycap text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 ${
                    isLocked ? 'ghost cursor-not-allowed' : 'primary'
                  }`}
                >
                  <span>{isCompleted ? 'Replay' : 'Start'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
