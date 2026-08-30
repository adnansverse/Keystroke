import React from 'react';
import { KEYBOARD_LAYOUT } from '../data/keyboardLayout';

interface VirtualKeyboardProps {
  nextChar?: string;
  activeKeyFlash?: { key: string; isCorrect: boolean } | null;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  nextChar = '',
  activeKeyFlash = null
}) => {
  // Normalize key match
  const isKeyActive = (keyDef: { k: string; shift?: string }) => {
    if (!nextChar) return false;
    if (nextChar === ' ' && keyDef.k === ' ') return true;
    if (keyDef.k.toLowerCase() === nextChar.toLowerCase()) return true;
    if (keyDef.shift && keyDef.shift === nextChar) return true;
    return false;
  };

  const isKeyFlashed = (keyDef: { k: string; shift?: string }) => {
    if (!activeKeyFlash) return null;
    const search = activeKeyFlash.key.toLowerCase();
    if (activeKeyFlash.key === ' ' && keyDef.k === ' ') return activeKeyFlash.isCorrect ? 'hit-correct' : 'hit-wrong';
    if (keyDef.k.toLowerCase() === search || (keyDef.shift && keyDef.shift === activeKeyFlash.key)) {
      return activeKeyFlash.isCorrect ? 'hit-correct' : 'hit-wrong';
    }
    return null;
  };

  return (
    <div id="virtual-keyboard-wrap" className="panel p-4 overflow-hidden">
      <div className="vkeyboard">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="vk-row">
            {row.map((keyDef, keyIndex) => {
              const active = isKeyActive(keyDef);
              const flashClass = isKeyFlashed(keyDef);

              return (
                <div
                  key={`k-${rowIndex}-${keyIndex}-${keyDef.k}`}
                  id={`vk-${keyDef.k.replace(/\s+/g, 'space').toLowerCase()}`}
                  className={`vk-key ${keyDef.width || ''} ${keyDef.f || ''} ${active ? 'active-next' : ''} ${flashClass || ''}`}
                  data-key={keyDef.k}
                >
                  {keyDef.label || (keyDef.shift ? (
                    <div className="flex flex-col items-center leading-none justify-center py-0.5">
                      <span className="text-[10px] opacity-80">{keyDef.shift}</span>
                      <span>{keyDef.k}</span>
                    </div>
                  ) : (
                    keyDef.k.toUpperCase()
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div id="session-keyboard-legend" className="flex items-center justify-center gap-4 flex-wrap text-[11px] text-[var(--text-dim)] mt-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#C97BE8' }} />
          Pinky
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#6FA8FF' }} />
          Ring
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#7FD962' }} />
          Middle
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#FFB454' }} />
          Index
        </span>
      </div>
    </div>
  );
};
