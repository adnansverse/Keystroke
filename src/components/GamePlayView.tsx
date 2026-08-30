import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameType } from '../types';
import { audioEngine } from '../services/audioEngine';
import { X, RotateCcw, Trophy, Heart, ShieldAlert } from 'lucide-react';

interface GamePlayViewProps {
  gameType: GameType;
  difficulty: string;
  onExit: () => void;
  onGameComplete: (stats: {
    wpm: number;
    score: number;
    isWin: boolean;
    gameTitle: string;
  }) => void;
}

interface MeteorItem {
  id: string;
  text: string;
  typed: string;
  x: number;
  y: number;
  speed: number;
}

export const GamePlayView: React.FC<GamePlayViewProps> = ({
  gameType,
  difficulty,
  onExit,
  onGameComplete
}) => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<{ isWin: boolean; message: string } | null>(null);

  // Meteor Game State
  const [meteors, setMeteors] = useState<MeteorItem[]>([]);
  const wordsTypedCount = useRef(0);

  // Race / Boss text state
  const [raceText, setRaceText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerPos, setPlayerPos] = useState(0);
  const [ghostPos, setGhostPos] = useState(0);
  const [bossHP, setBossHP] = useState(100);

  const startTimeRef = useRef<number | null>(null);
  const mainLoopRef = useRef<NodeJS.Timeout | null>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  // Initialize Game
  const initGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setElapsedSec(0);
    setIsGameOver(false);
    setGameResult(null);
    setCurrentIndex(0);
    setPlayerPos(0);
    setGhostPos(0);
    setBossHP(100);
    setMeteors([]);
    wordsTypedCount.current = 0;
    startTimeRef.current = Date.now();

    if (mainLoopRef.current) clearInterval(mainLoopRef.current);

    if (gameType === 'race') {
      const texts = [
        "The swift typist accelerates down the track with rhythmic precision and zero hesitation across every single keystroke.",
        "Smooth finger transitions over home row keys grant superior acceleration against the relentless ghost racer."
      ];
      setRaceText(texts[Math.floor(Math.random() * texts.length)]);
    } else if (gameType === 'boss') {
      const bossPhrases = [
        "CYBER BOSS PROTOCOL: OVERRIDE CORE FIREWALL WITH RAPID ACCURACY AND MAXIMUM KEYSTROKE CADENCE",
        "UNLEASH CRITICAL KEYSTROKE COMBO: BREAK THE ENCRYPTION MATRIX BEFORE SYSTEM SHUTDOWN OCCURS"
      ];
      setRaceText(bossPhrases[Math.floor(Math.random() * bossPhrases.length)]);
    }
  }, [gameType]);

  useEffect(() => {
    initGame();
    return () => {
      if (mainLoopRef.current) clearInterval(mainLoopRef.current);
    };
  }, [initGame]);

  // Main Game Loop
  useEffect(() => {
    if (isGameOver) return;

    if (gameType === 'meteors') {
      const wordBank = ['code', 'key', 'type', 'swift', 'pulse', 'react', 'focus', 'pixel', 'logic', 'vector', 'matrix', 'stream', 'syntax', 'cypher', 'zenith', 'nexus', 'anchor'];
      
      mainLoopRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const now = Date.now();
        setElapsedSec(Math.floor((now - startTimeRef.current) / 1000));

        setMeteors((prev) => {
          const arenaHeight = arenaRef.current?.clientHeight || 360;
          const arenaWidth = arenaRef.current?.clientWidth || 600;

          // Spawn new meteor occasionally
          let updated = [...prev];
          if (Math.random() < 0.28 && updated.length < 5) {
            const word = wordBank[Math.floor(Math.random() * wordBank.length)];
            const x = Math.max(10, Math.min(arenaWidth - 140, Math.floor(Math.random() * (arenaWidth - 120))));
            const speedMultiplier = difficulty === 'hard' ? 2.5 : difficulty === 'expert' ? 3.2 : 1.8;
            updated.push({
              id: `m_${Date.now()}_${Math.random()}`,
              text: word,
              typed: '',
              x,
              y: 0,
              speed: speedMultiplier + Math.random() * 1.2
            });
          }

          // Move down
          let lostLives = 0;
          const remaining: MeteorItem[] = [];

          for (const m of updated) {
            const nextY = m.y + m.speed;
            if (nextY >= arenaHeight - 45) {
              lostLives++;
              audioEngine.playError();
            } else {
              remaining.push({ ...m, y: nextY });
            }
          }

          if (lostLives > 0) {
            setLives((l) => {
              const nextL = l - lostLives;
              if (nextL <= 0) {
                setIsGameOver(true);
                setGameResult({ isWin: false, message: 'The meteors breached your base shields!' });
                onGameComplete({ wpm: Math.round((wordsTypedCount.current / Math.max(1, (Date.now() - (startTimeRef.current || 0)) / 60000)) * 5), score, isWin: false, gameTitle: 'Word Meteor Blast' });
              }
              return Math.max(0, nextL);
            });
          }

          return remaining;
        });
      }, 50);
    } else if (gameType === 'race') {
      const ghostSpeedPerTick = difficulty === 'hard' ? 0.35 : difficulty === 'expert' ? 0.45 : 0.24;

      mainLoopRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const now = Date.now();
        setElapsedSec(Math.floor((now - startTimeRef.current) / 1000));

        setGhostPos((g) => {
          const nextGhost = Math.min(100, g + ghostSpeedPerTick);
          if (nextGhost >= 100 && !isGameOver) {
            setIsGameOver(true);
            setGameResult({ isWin: false, message: 'The AI ghost runner crossed the finish line first!' });
            onGameComplete({ wpm: 40, score: 300, isWin: false, gameTitle: 'Ghost Type Racer' });
          }
          return nextGhost;
        });
      }, 100);
    } else if (gameType === 'boss') {
      mainLoopRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const now = Date.now();
        setElapsedSec(Math.floor((now - startTimeRef.current) / 1000));
      }, 500);
    }

    return () => {
      if (mainLoopRef.current) clearInterval(mainLoopRef.current);
    };
  }, [gameType, difficulty, isGameOver, onGameComplete, score]);

  // Keyboard handler for Meteors
  const handleMeteorTyping = useCallback((char: string) => {
    setMeteors((prev) => {
      let matched = false;
      const updated = prev.map((m) => {
        if (matched) return m;
        const nextChar = m.text[m.typed.length];
        if (nextChar && nextChar.toLowerCase() === char.toLowerCase()) {
          matched = true;
          const newTyped = m.typed + nextChar;
          return { ...m, typed: newTyped };
        }
        return m;
      });

      if (matched) {
        audioEngine.playClick();
        // Check for completed meteor
        const completedIdx = updated.findIndex((m) => m.typed === m.text);
        if (completedIdx !== -1) {
          updated.splice(completedIdx, 1);
          wordsTypedCount.current += 1;
          setScore((s) => s + 120);

          // Check win condition (e.g. 15 words)
          if (wordsTypedCount.current >= 15) {
            setIsGameOver(true);
            setGameResult({ isWin: true, message: 'Defenses Secured! You blasted all incoming asteroids!' });
            onGameComplete({ wpm: Math.round((wordsTypedCount.current / Math.max(1, (Date.now() - (startTimeRef.current || 0)) / 60000)) * 5), score: score + 500, isWin: true, gameTitle: 'Word Meteor Blast' });
          }
        }
        return updated;
      } else {
        audioEngine.playError();
        return prev;
      }
    });
  }, [onGameComplete, score]);

  // Keyboard handler for Race & Boss
  const handleLinearTyping = useCallback((char: string) => {
    if (!raceText || currentIndex >= raceText.length) return;

    const expected = raceText[currentIndex];
    if (char === expected) {
      audioEngine.playClick(char === ' ' || char === 'Enter');
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      const progress = Math.round((nextIdx / raceText.length) * 100);
      setPlayerPos(progress);

      if (gameType === 'boss') {
        const hpLeft = Math.max(0, 100 - progress);
        setBossHP(hpLeft);
        setScore((100 - hpLeft) * 60);
      }

      if (nextIdx >= raceText.length) {
        setIsGameOver(true);
        if (gameType === 'race') {
          const won = playerPos >= ghostPos;
          setGameResult({
            isWin: won,
            message: won ? 'Victory! You defeated the ghost runner!' : 'The AI ghost finished just ahead!'
          });
          onGameComplete({ wpm: 55, score: won ? 1000 : 400, isWin: won, gameTitle: 'Ghost Type Racer' });
        } else if (gameType === 'boss') {
          setBossHP(0);
          setGameResult({ isWin: true, message: 'Boss Defeated! You crushed the encryption core!' });
          onGameComplete({ wpm: 60, score: 2000, isWin: true, gameTitle: 'Keyboard Boss Battle' });
        }
      }
    } else {
      audioEngine.playError();
    }
  }, [raceText, currentIndex, gameType, playerPos, ghostPos, onGameComplete]);

  // Window key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Tab' || e.key === 'CapsLock') return;
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      if (isGameOver) return;

      if (e.key.length === 1) {
        e.preventDefault();
        if (gameType === 'meteors') {
          handleMeteorTyping(e.key);
        } else {
          handleLinearTyping(e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMeteorTyping, handleLinearTyping, isGameOver, gameType, onExit]);

  return (
    <div className="space-y-5">
      {/* Game Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] display-font">
            {gameType === 'meteors' && '☄️ Word Meteor Blast'}
            {gameType === 'race' && '🏎️ Ghost Type Racer'}
            {gameType === 'boss' && '👾 Keyboard Boss Battle'}
          </h1>
          <p className="text-xs text-[var(--text-dim)] mt-0.5">
            {gameType === 'meteors' && 'Type word prefixes to detonate asteroids before they crash.'}
            {gameType === 'race' && 'Outpace the AI ghost runner to the finish line.'}
            {gameType === 'boss' && 'Deplete the boss HP bar with high-speed keystrokes.'}
          </p>
        </div>

        <button
          onClick={onExit}
          className="keycap ghost px-3 py-2 text-xs flex items-center gap-1.5 text-[var(--bad)]"
        >
          <X size={14} />
          <span>Exit Game</span>
        </button>
      </div>

      {/* Game HUD */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="px-3.5 py-2 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-xs flex items-center gap-2">
          <span className="text-[var(--text-dim)] uppercase tracking-wider font-semibold font-mono">Score</span>
          <b className="text-base font-bold text-[var(--accent)] display-font">{score}</b>
        </div>

        {gameType === 'meteors' && (
          <div className="px-3.5 py-2 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-xs flex items-center gap-2">
            <span className="text-[var(--text-dim)] uppercase tracking-wider font-semibold font-mono">Shields</span>
            <div className="flex items-center gap-1 text-[var(--bad)]">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  size={15}
                  className={i < lives ? 'fill-[var(--bad)] text-[var(--bad)]' : 'text-[var(--text-dim2)] opacity-30'}
                />
              ))}
            </div>
          </div>
        )}

        <div className="px-3.5 py-2 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-xs flex items-center gap-2">
          <span className="text-[var(--text-dim)] uppercase tracking-wider font-semibold font-mono">Time</span>
          <b className="text-base font-bold text-[var(--text)] display-font">{elapsedSec}s</b>
        </div>
      </div>

      {/* Boss HP Bar */}
      {gameType === 'boss' && (
        <div className="p-4 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-rose-400 flex items-center gap-1.5">
              <ShieldAlert size={16} /> MECHA CORE HP
            </span>
            <span className="text-[var(--text)]">{bossHP}%</span>
          </div>
          <div className="progress-track h-3.5">
            <div
              className="h-full rounded-md transition-all duration-150"
              style={{
                width: `${bossHP}%`,
                background: 'linear-gradient(90deg, #F26D78, #FFB454)'
              }}
            />
          </div>
        </div>
      )}

      {/* Race Track */}
      {gameType === 'race' && (
        <div className="p-4 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] relative h-28 overflow-hidden">
          {/* Player Lane */}
          <div className="absolute left-4 right-4 top-7 h-0.5 bg-[var(--panel-border)]" />
          <div
            className="absolute top-2 text-2xl transition-all duration-100 flex items-center gap-1"
            style={{ left: `calc(${playerPos}% - 15px)` }}
          >
            <span>🏎️</span>
            <span className="text-[10px] font-bold bg-[var(--accent)] text-black px-1 rounded">YOU</span>
          </div>

          {/* Ghost Lane */}
          <div className="absolute left-4 right-4 top-18 h-0.5 bg-[var(--panel-border)]" />
          <div
            className="absolute top-13 text-2xl transition-all duration-100 flex items-center gap-1"
            style={{ left: `calc(${ghostPos}% - 15px)` }}
          >
            <span>👻</span>
            <span className="text-[10px] font-bold bg-purple-500 text-white px-1 rounded">GHOST</span>
          </div>
        </div>
      )}

      {/* Arena Stage */}
      <div
        ref={arenaRef}
        className="panel relative h-80 overflow-hidden flex items-center justify-center p-4 select-none"
      >
        {gameType === 'meteors' && (
          <>
            {meteors.map((m) => (
              <div
                key={m.id}
                className="falling-word font-mono font-bold"
                style={{
                  left: `${m.x}px`,
                  top: `${m.y}px`
                }}
              >
                <span className="text-[var(--accent)] font-extrabold">{m.typed}</span>
                <span className="text-[var(--text)]">{m.text.slice(m.typed.length)}</span>
              </div>
            ))}
            {meteors.length === 0 && !isGameOver && (
              <div className="text-xs text-[var(--text-dim)] font-mono animate-pulse">
                Scanning for incoming asteroid words...
              </div>
            )}
          </>
        )}

        {(gameType === 'race' || gameType === 'boss') && (
          <div className="text-stage border-none bg-transparent w-full text-center text-xl md:text-2xl leading-relaxed font-mono">
            {raceText.split('').map((c, i) => {
              let cls = 'ch-pending';
              if (i < currentIndex) cls = 'ch-correct';
              else if (i === currentIndex) cls = 'ch-current';
              return (
                <span key={i} className={cls}>
                  {c}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Game Over / Win Result Dialog */}
      {isGameOver && gameResult && (
        <div className="panel bg-[var(--bg-elev)] border-2 border-[var(--accent)] p-6 rounded-2xl shadow-2xl animate-fadeIn space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{gameResult.isWin ? '🏆' : '💔'}</span>
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] display-font">
                {gameResult.isWin ? 'Round Victory!' : 'Game Over'}
              </h2>
              <p className="text-xs text-[var(--text-dim)]">{gameResult.message}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--panel-2)] border border-[var(--panel-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-dim)] font-mono">FINAL SCORE</span>
            <span className="text-xl font-bold text-[var(--accent)] font-mono">{score}</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={initGame}
              className="keycap primary flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Play Again</span>
            </button>
            <button
              onClick={onExit}
              className="keycap ghost flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <Trophy size={16} />
              <span>Back to Games</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
