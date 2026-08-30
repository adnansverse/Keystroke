import React from 'react';
import { ViewType, AppState } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  Edit3, 
  Gamepad2, 
  BarChart2, 
  Award, 
  Settings, 
  Flame, 
  Star, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  appState: AppState;
  onToggleTheme: () => void;
  onToggleSound: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  appState,
  onToggleTheme,
  onToggleSound
}) => {
  const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'lessons', label: 'Lessons', icon: <BookOpen size={18} /> },
    { id: 'practice', label: 'Practice', icon: <Edit3 size={18} /> },
    { id: 'games', label: 'Games', icon: <Gamepad2 size={18} /> },
    { id: 'stats', label: 'Stats', icon: <BarChart2 size={18} /> },
    { id: 'achievements', label: 'Achievements', icon: <Award size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside 
      id="app-sidebar"
      className="w-full md:w-[230px] md:flex-shrink-0 p-4 md:p-5 flex flex-row md:flex-col gap-4 md:gap-5 border-b md:border-b-0 md:border-r border-[var(--panel-border)] bg-[var(--bg-elev)] sticky top-0 md:h-screen z-20 overflow-x-auto md:overflow-x-visible justify-between"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-1.5 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[var(--key-face)] border border-[var(--key-border)] flex items-center justify-center shadow-[var(--shadow-key)] font-bold text-[var(--accent)] text-lg">
          ⌨
        </div>
        <div>
          <div className="font-bold text-[17px] leading-tight display-font text-[var(--text)]">Keystroke</div>
          <div className="text-[10px] text-[var(--text-dim)] tracking-[0.14em] uppercase font-semibold">Typing Academy</div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible py-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === 'practice' && currentView === 'session' && !item.id);
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all whitespace-nowrap text-left w-full cursor-pointer ${
                currentView === item.id
                  ? 'bg-[var(--key-face)] border border-[var(--key-border)] shadow-[var(--shadow-key)] text-[var(--accent)]'
                  : 'text-[var(--text-dim)] hover:bg-[var(--panel)] hover:text-[var(--text)] border border-transparent'
              }`}
            >
              <span className="w-5 text-center flex items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Side stats & quick toggles */}
      <div className="hidden md:flex flex-col gap-2.5 mt-auto">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-[12.5px] text-[var(--text-dim)]">
          <Flame size={16} className="text-amber-500 flex-shrink-0" />
          <span>Streak <b className="text-[var(--accent)] font-bold">{appState.streak}</b> days</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-[12.5px] text-[var(--text-dim)]">
          <Star size={16} className="text-yellow-500 flex-shrink-0" />
          <span>Level <b className="text-[var(--accent)] font-bold">{appState.level}</b> · {appState.xp} XP</span>
        </div>
        
        <div className="flex gap-2 pt-1">
          <button 
            id="sidebar-theme-toggle"
            onClick={onToggleTheme}
            className="keycap ghost flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
            title="Toggle theme"
          >
            {appState.theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{appState.theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
          <button 
            id="sidebar-sound-toggle"
            onClick={onToggleSound}
            className="keycap ghost flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
            title="Toggle typing audio"
          >
            {appState.sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{appState.sound ? 'Sound' : 'Muted'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
