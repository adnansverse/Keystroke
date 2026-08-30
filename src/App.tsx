import { useState, useEffect } from 'react';
import { AppState, ViewType, GameType, Lesson, KeyStat } from './types';
import { loadAppState, saveAppState, resetAppState, recordSession } from './services/storage';
import { audioEngine } from './services/audioEngine';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { LessonsView } from './components/LessonsView';
import { PracticePickerView } from './components/PracticePickerView';
import { SessionView } from './components/SessionView';
import { GamesView } from './components/GamesView';
import { GamePlayView } from './components/GamePlayView';
import { StatsView } from './components/StatsView';
import { AchievementsView } from './components/AchievementsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  // Active typing session config
  const [sessionConfig, setSessionConfig] = useState<{
    text: string;
    title: string;
    subTitle?: string;
    isBlind?: boolean;
    lesson?: Lesson | null;
    mode: 'lesson' | 'practice' | 'custom';
  }>({
    text: '',
    title: '',
    subTitle: '',
    isBlind: false,
    lesson: null,
    mode: 'practice'
  });

  // Active game config
  const [activeGame, setActiveGame] = useState<GameType>('meteors');

  // Synchronize audio engine & theme
  useEffect(() => {
    audioEngine.setConfig(appState.sound, appState.volume, appState.switchSound);
    document.documentElement.setAttribute('data-theme', appState.theme);
    document.body.className = `kb-${appState.kbStyle}`;
  }, [appState.theme, appState.sound, appState.volume, appState.switchSound, appState.kbStyle]);

  // Update Partial AppState
  const handleUpdateState = (partial: Partial<AppState>) => {
    setAppState((prev) => {
      const next = { ...prev, ...partial };
      saveAppState(next);
      return next;
    });
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
    handleUpdateState({ theme: nextTheme });
  };

  // Toggle Sound
  const handleToggleSound = () => {
    handleUpdateState({ sound: !appState.sound });
  };

  // Reset Progress
  const handleResetData = () => {
    const initial = resetAppState();
    setAppState(initial);
    setCurrentView('dashboard');
  };

  // Start Lesson
  const handleStartLesson = (lesson: Lesson) => {
    setSessionConfig({
      text: lesson.text,
      title: lesson.title,
      subTitle: `${lesson.num} · Keys: ${lesson.keys}`,
      isBlind: false,
      lesson,
      mode: 'lesson'
    });
    setCurrentView('session');
  };

  // Start Practice or Custom Session
  const handleStartPractice = (
    text: string,
    title: string,
    subTitle: string = '',
    isBlind: boolean = false,
    mode: 'practice' | 'custom' = 'practice'
  ) => {
    setSessionConfig({
      text,
      title,
      subTitle,
      isBlind,
      lesson: null,
      mode
    });
    setCurrentView('session');
  };

  // Start Game
  const handleStartGame = (game: GameType) => {
    setActiveGame(game);
    setCurrentView('game-play');
  };

  // Session completion handler
  const handleSessionComplete = (stats: {
    wpm: number;
    cpm: number;
    acc: number;
    errors: number;
    duration: number;
    mode: 'lesson' | 'practice' | 'game' | 'custom';
    title: string;
    lessonId?: number;
    keyStatsDelta: Record<string, KeyStat>;
  }) => {
    // Merge key stats delta
    const mergedKeyStats = { ...appState.keyStats };
    Object.entries(stats.keyStatsDelta).forEach(([k, v]) => {
      if (!mergedKeyStats[k]) {
        mergedKeyStats[k] = { correct: 0, wrong: 0 };
      }
      mergedKeyStats[k].correct += v.correct;
      mergedKeyStats[k].wrong += v.wrong;
    });

    const stateWithKeyStats = { ...appState, keyStats: mergedKeyStats };
    const { updatedState, xpEarned } = recordSession(stateWithKeyStats, stats);
    setAppState(updatedState);
    return { xpEarned };
  };

  // Game completion handler
  const handleGameComplete = (stats: {
    wpm: number;
    score: number;
    isWin: boolean;
    gameTitle: string;
  }) => {
    if (stats.isWin) {
      const { updatedState } = recordSession(appState, {
        wpm: stats.wpm,
        cpm: stats.wpm * 5,
        acc: 98,
        errors: 0,
        duration: 45,
        mode: 'game',
        title: stats.gameTitle
      });
      setAppState(updatedState);
    }
  };

  return (
    <div id="app" className="flex flex-col md:flex-row min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        appState={appState}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        {currentView === 'dashboard' && (
          <DashboardView
            appState={appState}
            onStartLesson={handleStartLesson}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'lessons' && (
          <LessonsView
            appState={appState}
            onStartLesson={handleStartLesson}
          />
        )}

        {currentView === 'practice' && (
          <PracticePickerView
            appState={appState}
            onStartSession={handleStartPractice}
          />
        )}

        {currentView === 'session' && (
          <SessionView
            initialText={sessionConfig.text}
            title={sessionConfig.title}
            subTitle={sessionConfig.subTitle}
            isBlind={sessionConfig.isBlind}
            lesson={sessionConfig.lesson}
            mode={sessionConfig.mode}
            onExit={() => setCurrentView(sessionConfig.mode === 'lesson' ? 'lessons' : 'practice')}
            onComplete={handleSessionComplete}
          />
        )}

        {currentView === 'games' && (
          <GamesView onStartGame={handleStartGame} />
        )}

        {currentView === 'game-play' && (
          <GamePlayView
            gameType={activeGame}
            difficulty={appState.difficulty}
            onExit={() => setCurrentView('games')}
            onGameComplete={handleGameComplete}
          />
        )}

        {currentView === 'stats' && (
          <StatsView appState={appState} />
        )}

        {currentView === 'achievements' && (
          <AchievementsView appState={appState} />
        )}

        {currentView === 'settings' && (
          <SettingsView
            appState={appState}
            onUpdateState={handleUpdateState}
            onResetData={handleResetData}
          />
        )}
      </main>
    </div>
  );
}
