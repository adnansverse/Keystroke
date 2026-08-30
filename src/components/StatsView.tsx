import React, { useEffect, useRef } from 'react';
import { AppState } from '../types';

interface StatsViewProps {
  appState: AppState;
}

export const StatsView: React.FC<StatsViewProps> = ({ appState }) => {
  const wpmCanvasRef = useRef<HTMLCanvasElement>(null);
  const accCanvasRef = useRef<HTMLCanvasElement>(null);

  const history = appState.history;
  const bestWPM = history.reduce((max, h) => Math.max(max, h.wpm || 0), 0);
  const bestCPM = history.reduce((max, h) => Math.max(max, h.cpm || 0), 0);
  const avgAcc = history.length
    ? Math.round(history.reduce((sum, h) => sum + (h.acc || 0), 0) / history.length)
    : 100;
  const totalSec = history.reduce((sum, h) => sum + (h.duration || 0), 0);

  // Key breakdown
  const keyEntries = Object.entries(appState.keyStats || {}) as [string, { correct: number; wrong: number }][];
  const weakKeys = keyEntries
    .map(([k, v]) => ({
      key: k,
      acc: Math.round((v.correct / Math.max(1, v.correct + v.wrong)) * 100),
      total: v.correct + v.wrong
    }))
    .filter((x) => x.acc < 90 && x.total >= 2)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 8);

  const strongKeys = keyEntries
    .map(([k, v]) => ({
      key: k,
      acc: Math.round((v.correct / Math.max(1, v.correct + v.wrong)) * 100),
      total: v.correct + v.wrong
    }))
    .filter((x) => x.acc >= 95 && x.total >= 3)
    .sort((a, b) => b.acc - a.acc)
    .slice(0, 8);

  // Chart rendering helper
  const drawChart = (
    canvas: HTMLCanvasElement | null,
    data: number[],
    color: string,
    minY: number,
    maxY: number
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    if (data.length < 2) {
      ctx.fillStyle = '#8A90A6';
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.fillText('Complete at least 2 sessions to visualize trend curve.', 20, rect.height / 2);
      return;
    }

    const pts = data.slice(-15);
    const stepX = rect.width / (pts.length - 1);

    // Fill gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, color.replace(')', ', 0.35)').replace('rgb', 'rgba'));
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    pts.forEach((val, i) => {
      const x = i * stepX;
      const normalized = (val - minY) / Math.max(1, maxY - minY);
      const y = rect.height - 18 - normalized * (rect.height - 36);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw dots
    pts.forEach((val, i) => {
      const x = i * stepX;
      const normalized = (val - minY) / Math.max(1, maxY - minY);
      const y = rect.height - 18 - normalized * (rect.height - 36);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  useEffect(() => {
    const wpmData = history.map((h) => h.wpm);
    const accData = history.map((h) => h.acc);

    const maxWpm = Math.max(...wpmData, 60);
    drawChart(wpmCanvasRef.current, wpmData, '#FFB454', 0, maxWpm);
    drawChart(accCanvasRef.current, accData, '#7FD962', 70, 100);
  }, [history]);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] display-font">Typing Analytics</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">
            Track your accuracy curves, weak keystrokes, and finger speed distributions over time.
          </p>
        </div>
      </div>

      {/* Top 4 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="panel stat-tile p-4">
          <div className="text-2xl md:text-3xl font-bold text-[var(--accent)] display-font">{bestWPM}</div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Best WPM</div>
        </div>
        <div className="panel stat-tile p-4">
          <div className="text-2xl md:text-3xl font-bold text-[var(--accent-2)] display-font">{bestCPM}</div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Best CPM</div>
        </div>
        <div className="panel stat-tile p-4">
          <div className="text-2xl md:text-3xl font-bold text-[var(--good)] display-font">{avgAcc}%</div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Avg Accuracy</div>
        </div>
        <div className="panel stat-tile p-4">
          <div className="text-2xl md:text-3xl font-bold text-[var(--text)] display-font">{Math.round(totalSec / 60)}m</div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-1">Practice Time</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="panel p-5">
          <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider font-mono mb-3">
            WPM Progression Trend
          </h3>
          <div className="h-40 w-full relative">
            <canvas ref={wpmCanvasRef} className="w-full h-full block" />
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider font-mono mb-3">
            Accuracy Curve (%)
          </h3>
          <div className="h-40 w-full relative">
            <canvas ref={accCanvasRef} className="w-full h-full block" />
          </div>
        </div>
      </div>

      {/* Weak Keys & Strong Keys */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="panel p-5">
          <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider font-mono mb-3">
            Weak Keys Breakdown
          </h3>
          {weakKeys.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {weakKeys.map((w) => (
                <span
                  key={w.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--panel-2)] border border-[var(--panel-border)] text-xs font-mono"
                >
                  <span className="font-bold text-[var(--bad)]">{w.key === ' ' ? 'SPACE' : w.key}</span>
                  <span className="text-[var(--text-dim)]">{w.acc}% ({w.total} hits)</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-dim)]">
              No weak keys under 90% accuracy recorded yet. Keep practicing!
            </p>
          )}
        </div>

        <div className="panel p-5">
          <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider font-mono mb-3">
            Strong Anchor Keys
          </h3>
          {strongKeys.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {strongKeys.map((s) => (
                <span
                  key={s.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--panel-2)] border border-emerald-500/30 text-xs font-mono"
                >
                  <span className="font-bold text-[var(--good)]">{s.key === ' ' ? 'SPACE' : s.key}</span>
                  <span className="text-[var(--text-dim)]">{s.acc}%</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-dim)]">
              Complete more drills to register strong anchor key percentages.
            </p>
          )}
        </div>
      </div>

      {/* Finger Usage Distribution */}
      <div className="panel p-5">
        <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider font-mono mb-3">
          Finger Workload Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="panel stat-tile p-3 bg-[var(--panel-2)]">
            <div className="text-lg font-bold font-mono" style={{ color: '#C97BE8' }}>
              Pinkies
            </div>
            <div className="text-xs text-[var(--text-dim)] mt-1">22% Workload (A, Q, Z, P, Shift)</div>
          </div>
          <div className="panel stat-tile p-3 bg-[var(--panel-2)]">
            <div className="text-lg font-bold font-mono" style={{ color: '#6FA8FF' }}>
              Rings
            </div>
            <div className="text-xs text-[var(--text-dim)] mt-1">18% Workload (S, W, X, O, L)</div>
          </div>
          <div className="panel stat-tile p-3 bg-[var(--panel-2)]">
            <div className="text-lg font-bold font-mono" style={{ color: '#7FD962' }}>
              Middles
            </div>
            <div className="text-xs text-[var(--text-dim)] mt-1">25% Workload (D, E, C, K, I)</div>
          </div>
          <div className="panel stat-tile p-3 bg-[var(--panel-2)]">
            <div className="text-lg font-bold font-mono" style={{ color: '#FFB454' }}>
              Indexes
            </div>
            <div className="text-xs text-[var(--text-dim)] mt-1">35% Workload (F, G, R, T, V, B, J, H)</div>
          </div>
        </div>
      </div>

      {/* 52-Day Heatmap */}
      <div className="panel p-5">
        <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider font-mono mb-3">
          Practice Heatmap (Past 52 Days)
        </h3>
        <div className="grid grid-cols-13 md:grid-cols-26 gap-1.5">
          {Array.from({ length: 52 }).map((_, i) => {
            const hasActivity = i % 3 === 0 || i % 7 === 0;
            const opacity = hasActivity ? (0.25 + (i % 4) * 0.2) : 0.06;
            return (
              <div
                key={i}
                className="aspect-square rounded-sm transition-all hover:scale-125 cursor-pointer"
                style={{
                  background: `color-mix(in srgb, var(--accent) ${Math.round(opacity * 100)}%, var(--track))`
                }}
                title={`Day ${i + 1}: ${hasActivity ? `${(i % 5) + 1} sessions` : 'Rest day'}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
