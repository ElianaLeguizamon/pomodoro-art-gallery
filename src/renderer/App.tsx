import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Check, Minus, Play, Plus, Square, TimerReset, X } from "lucide-react";
import galleryVenus from "../../assets/gallery-venus.png";
import galleryPrimavera from "../../assets/gallery-primavera.png";
import galleryLandscape from "../../assets/gallery-landscape.png";
import galleryCreation from "../../assets/gallery-creation.png";
import galleryMonaLisa from "../../assets/gallery-mona-lisa.png";
import galleryGirl from "../../assets/gallery-girl.png";
import figmaMusic from "../../assets/figma-music.svg";
import figmaTimer from "../../assets/figma-timer.svg";
import figmaTasks from "../../assets/figma-tasks.svg";
import figmaGallery from "../../assets/figma-gallery.svg";
import figmaSettings from "../../assets/figma-settings.svg";
import figmaMoon from "../../assets/figma-moon.svg";
import figmaClose from "../../assets/figma-close.svg";

type View = "timer" | "tasks" | "gallery" | "settings";
type TimerPhase = "focus" | "break";
type Task = { id: number; label: string; done: boolean };
type DragTarget = "timer" | "music";
type Position = { x: number; y: number };
const artworks = [
  { title: "La nascita di Venere", src: galleryVenus },
  { title: "Primavera", src: galleryPrimavera },
  { title: "Extensive Mountainous Landscape", src: galleryLandscape },
  { title: "La creazione di Adam", src: galleryCreation },
  { title: "Monna Lisa", src: galleryMonaLisa },
  { title: "Meisje met de parel", src: galleryGirl },
];

export function App() {
  const [view, setView] = useState<View>("timer");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [totalSessions, setTotalSessions] = useState(4);
  const [phase, setPhase] = useState<TimerPhase>("focus");
  const [currentSession, setCurrentSession] = useState(1);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.35);
  const loFiAudioRef = useRef<HTMLAudioElement | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(1);
  const [timerPosition, setTimerPosition] = useState<Position>({ x: 50, y: 50 });
  const [musicPosition, setMusicPosition] = useState<Position>({ x: 84, y: 9 });
  const [drag, setDrag] = useState<{ target: DragTarget; offsetX: number; offsetY: number } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, label: "Cover sketch", done: false },
    { id: 2, label: "Read twelve pages", done: true },
    { id: 3, label: "Organize references", done: false },
  ]);
  const [taskDraft, setTaskDraft] = useState("");
  const [tourStep, setTourStep] = useState<number | null>(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const taskAnchorRef = useRef<HTMLButtonElement | null>(null);
  const galleryAnchorRef = useRef<HTMLButtonElement | null>(null);
  const settingsAnchorRef = useRef<HTMLButtonElement | null>(null);
  const timerAnchorRef = useRef<HTMLDivElement | null>(null);

  const toggleMusic = async () => {
    const audio = loFiAudioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
      return;
    }
    try {
      await audio.play();
      setMusicPlaying(true);
    } catch (error) {
      console.error("Unable to start lo-fi audio.", error);
      setMusicPlaying(false);
    }
  };

  useEffect(() => {
    if (loFiAudioRef.current) loFiAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => () => {
    loFiAudioRef.current?.pause();
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    if (running && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds((current) => {
          if (current > 1) return current - 1;
          if (phase === "focus" && currentSession < totalSessions) {
            setPhase("break");
            return breakMinutes * 60;
          }
          if (phase === "break") {
            setCurrentSession((session) => session + 1);
            setPhase("focus");
            return focusMinutes * 60;
          }
          setRunning(false);
          return 0;
        });
      }, 1000);
    } else if (seconds === 0 && running) {
      setRunning(false);
    }
    return () => {
      if (interval !== null) window.clearInterval(interval);
    };
  }, [running, seconds, phase, currentSession, totalSessions, breakMinutes, focusMinutes]);

  const artwork = artworks[selectedArtwork];
  const phaseTotalSeconds = (phase === "focus" ? focusMinutes : breakMinutes) * 60;
  const progress = phase === "focus"
    ? Math.min(1, Math.max(0, 1 - seconds / phaseTotalSeconds))
    : 1;
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");

  const handleDragStart = (event: ReactPointerEvent<HTMLElement>, target: DragTarget) => {
    const element = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ target, offsetX: event.clientX - element.left, offsetY: event.clientY - element.top });
  };
  const handleDragMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!drag || !canvasRef.current) return;
    const canvas = canvasRef.current.getBoundingClientRect();
    const element = event.currentTarget.getBoundingClientRect();
    const desiredLeft = event.clientX - canvas.left - drag.offsetX;
    const desiredTop = event.clientY - canvas.top - drag.offsetY;
    const halfWidth = element.width / 2;
    const halfHeight = element.height / 2;
    const centerX = Math.min(canvas.width - halfWidth, Math.max(halfWidth, desiredLeft + halfWidth));
    const centerY = Math.min(canvas.height - halfHeight, Math.max(halfHeight, desiredTop + halfHeight));
    const position = { x: (centerX / canvas.width) * 100, y: (centerY / canvas.height) * 100 };
    if (drag.target === "timer") setTimerPosition(position);
    else setMusicPosition(position);
  };
  const stopDragging = () => setDrag(null);
  const resetTimer = () => {
    setRunning(false);
    setPhase("focus");
    setCurrentSession(1);
    setSeconds(focusMinutes * 60);
  };
  const startTimer = () => {
    if (running) {
      setRunning(false);
      return;
    }
    if (seconds <= 0) {
      setPhase("focus");
      setCurrentSession(1);
      setSeconds(focusMinutes * 60);
    }
    setRunning(true);
  };
  const selectArtwork = (index: number) => {
    setSelectedArtwork(index);
    resetTimer();
    setView("timer");
  };
  const addTask = () => {
    const label = taskDraft.trim();
    if (!label) return;
    setTasks((current) => [...current, { id: Date.now(), label, done: false }]);
    setTaskDraft("");
  };
  const advanceTour = () => {
    if (tourStep === null || tourStep === 3) {
      setTourStep(null);
      return;
    }
    const nextStep = tourStep + 1;
    setTourStep(nextStep);
    setView(nextStep === 0 ? "tasks" : nextStep === 1 ? "gallery" : nextStep === 2 ? "settings" : "timer");
  };
  const openTour = () => {
    setTourStep(0);
    setView("tasks");
  };

  return (
    <main className={`app-window ${darkMode ? "app-window--dark" : ""}`} aria-label="okasa-pomo desktop application">
      <audio ref={loFiAudioRef} src="/audio/lofi.mp3" loop preload="auto" />
      <header className="window-bar">
        <button className="brand brand-button" type="button" onClick={openTour} aria-label="Open guided tour">okasa-pomo</button>
        <button className="tour-launcher" type="button" onClick={openTour}>Tour</button>
        <div className="window-actions" aria-label="Window controls">
          <button className="window-action" type="button" aria-label="Minimize" onClick={() => window.desktop.minimize()}><Minus size={14} /></button>
          <button className="window-action" type="button" aria-label="Maximize" onClick={() => window.desktop.maximize()}><Square size={12} /></button>
          <button className="window-action window-action--close" type="button" aria-label="Close" onClick={() => window.desktop.close()}><X size={15} /></button>
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar" aria-label="Main navigation">
          <nav className="sidebar-nav">
            <NavButton active={view === "timer"} label="Timer" icon={figmaTimer} onClick={() => setView("timer")} />
            <NavButton active={view === "tasks"} label="Tasks" icon={figmaTasks} anchorRef={taskAnchorRef} onClick={() => setView("tasks")} />
            <NavButton active={view === "gallery"} label="Gallery" icon={figmaGallery} anchorRef={galleryAnchorRef} onClick={() => setView("gallery")} />
            <NavButton active={view === "settings"} label="Settings" icon={figmaSettings} anchorRef={settingsAnchorRef} onClick={() => setView("settings")} />
          </nav>
          <button className="theme-button" type="button" aria-label="Toggle theme" onClick={() => setDarkMode((current) => !current)}><img src={figmaMoon} alt="" /></button>
        </aside>
        <section className="gold-frame" aria-label="Textured art canvas">
          <div className="canvas" ref={canvasRef}>
            <WatercolorReveal imageSrc={artwork.src} imageAlt={artwork.title} progress={progress * 100} />
            <MusicWidget position={musicPosition} playing={musicPlaying} volume={musicVolume} onVolumeChange={setMusicVolume} onToggle={() => void toggleMusic()} onPointerDown={(event) => handleDragStart(event, "music")} onPointerMove={handleDragMove} onPointerUp={stopDragging} />
            {view === "timer" && <TimerView anchorRef={timerAnchorRef} position={timerPosition} minutes={minutes} seconds={remainder} running={running} phase={phase} currentSession={currentSession} totalSessions={totalSessions} progress={progress} artworkTitle={artwork.title} onToggle={startTimer} onReset={resetTimer} onPointerDown={(event) => handleDragStart(event, "timer")} onPointerMove={handleDragMove} onPointerUp={stopDragging} />}
            {view === "tasks" && <TasksView tasks={tasks} draft={taskDraft} onDraftChange={setTaskDraft} onToggle={(id) => setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task))} onDelete={(id) => setTasks((current) => current.filter((task) => task.id !== id))} onAdd={addTask} onClose={() => setView("timer")} />}
            {view === "gallery" && <GalleryView selectedArtwork={selectedArtwork} onSelect={selectArtwork} onClose={() => setView("timer")} />}
            {view === "settings" && <SettingsView focus={focusMinutes} breakTime={breakMinutes} sessions={totalSessions} onFocusChange={(value) => { setFocusMinutes(value); setRunning(false); setPhase("focus"); setSeconds(value * 60); }} onBreakChange={(value) => { setBreakMinutes(value); if (phase === "break") { setRunning(false); setSeconds(value * 60); } }} onSessionsChange={(value) => { setTotalSessions(value); setCurrentSession((session) => Math.min(session, value)); }} musicVolume={musicVolume} onMusicVolumeChange={setMusicVolume} darkMode={darkMode} onThemeChange={setDarkMode} onClose={() => setView("timer")} />}
          </div>
        </section>
      </div>
      {tourStep !== null && <GuidedTour step={tourStep} anchors={[taskAnchorRef, galleryAnchorRef, settingsAnchorRef, timerAnchorRef]} onNext={advanceTour} onSkip={() => setTourStep(null)} />}
    </main>
  );
}

function NavButton({ active, label, icon, anchorRef, onClick }: { active: boolean; label: string; icon: string; anchorRef?: React.RefObject<HTMLButtonElement | null>; onClick: () => void }) {
  return <button ref={anchorRef} className={`nav-button ${active ? "nav-button--active" : ""}`} type="button" aria-label={label} aria-current={active ? "page" : undefined} onClick={onClick}><img src={icon} alt="" /></button>;
}
function WatercolorReveal({ imageSrc, imageAlt, progress }: { imageSrc: string; imageAlt: string; progress: number }) {
  const normalizedProgress = Math.max(0, Math.min(100, progress)) / 100;
  const cells = useMemo(() => createPixelRevealCells(normalizedProgress), [normalizedProgress]);

  return <div className="watercolor-reveal">
    <svg className="watercolor-svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={imageAlt}>
      <defs>
        <mask id="pixel-reveal-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <g fill="#fff">{cells}</g>
        </mask>
      </defs>
      <image href={imageSrc} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" mask="url(#pixel-reveal-mask)" />
    </svg>
  </div>;
}

function createPixelRevealCells(progress: number) {
  const columns = 240;
  const rows = 180;
  const cellWidth = 100 / columns;
  const cellHeight = 100 / rows;
  const expansion = 0.008 + progress * 0.79;

  return Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = (column + 0.5) / columns;
    const y = (row + 0.5) / rows;
    const distance = Math.sqrt(
      Math.pow((x - 0.5) / 0.94, 2) + Math.pow((y - 0.5) / 0.88, 2),
    );
    const seed = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
    const random = seed - Math.floor(seed);
    const noise = (random - 0.5) * 0.018;
    const edgeDistance = expansion - distance + noise;
    if (edgeDistance <= 0) return null;

    const centerX = column * cellWidth + cellWidth / 2;
    const centerY = row * cellHeight + cellHeight / 2;
    const width = cellWidth * 1.04;
    const height = cellHeight * 1.04;

    return (
      <rect
        key={index}
        x={centerX - width / 2}
        y={centerY - height / 2}
        width={width}
        height={height}
      />
    );
  });
}
const tourSteps = [
  { title: "Your tasks", description: "Organize your workflow and keep track of daily goals effortlessly." },
  { title: "Your gallery", description: "Every finished focus session unlocks a painting from a world-class collection. They gather here." },
  { title: "Your time", description: "Focus history, streaks, and how your hours add up live here." },
  { title: "Begin", description: "Press play to focus. While you work, a painting slowly reveals itself, inch by inch. It is finished when you are." },
];
function GuidedTour({ step, anchors, onNext, onSkip }: { step: number; anchors: React.RefObject<HTMLElement | null>[]; onNext: () => void; onSkip: () => void }) {
  const content = tourSteps[step];
  const [position, setPosition] = useState<React.CSSProperties>({});
  useLayoutEffect(() => {
    const anchor = anchors[step].current;
    if (!anchor) return;
    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect();
      const parent = anchor.closest(".app-window")?.getBoundingClientRect();
      if (!parent) return;
      if (step === 3) {
        setPosition({ left: rect.left - parent.left + rect.width / 2 - 143, top: rect.bottom - parent.top + 16 });
      } else {
        setPosition({ left: rect.right - parent.left + 18, top: rect.top - parent.top + rect.height / 2 - 78 });
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [anchors[step], step]);
  return <div className={`guided-tour guided-tour--step-${step + 1}`} style={position} role="dialog" aria-label={`Guided tour step ${step + 1}`}><h2>{content.title}</h2><p>{content.description}</p><div className="guided-tour__navigation"><span>{step + 1} of 4</span><button type="button" onClick={onSkip}>SKIP TOUR</button><button type="button" onClick={onNext}>{step === 3 ? "DONE" : "NEXT"}</button></div></div>;
}
function MusicWidget({ position, playing, volume, onVolumeChange, onToggle, onPointerDown, onPointerMove, onPointerUp }: { position: Position; playing: boolean; volume: number; onVolumeChange: (value: number) => void; onToggle: () => void; onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void; onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void; onPointerUp: () => void }) {
  return <div className="music-widget draggable-control" style={{ left: `${position.x}%`, top: `${position.y}%` }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
    <button className="music-play" type="button" aria-label={playing ? "Pause music" : "Play music"} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onToggle(); }}>{playing ? "Ⅱ" : <Play size={9} fill="currentColor" />}</button>
    <img className="music-note" src={figmaMusic} alt="" />
    <span className="music-name">lo-fi</span>
    <input className="music-volume" type="range" min="0" max="1" step="0.05" value={volume} aria-label="Lo-fi volume" style={{ "--volume-progress": `${volume * 100}%` } as React.CSSProperties} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()} onChange={(event) => onVolumeChange(Number(event.target.value))} />
  </div>;
}
function TimerView({ anchorRef, position, minutes, seconds, running, phase, currentSession, totalSessions, progress, artworkTitle, onToggle, onReset, onPointerDown, onPointerMove, onPointerUp }: { anchorRef: React.RefObject<HTMLDivElement | null>; position: Position; minutes: string; seconds: string; running: boolean; phase: TimerPhase; currentSession: number; totalSessions: number; progress: number; artworkTitle: string; onToggle: () => void; onReset: () => void; onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void; onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void; onPointerUp: () => void }) {
  return <><div ref={anchorRef} className={`timer-view draggable-control ${phase === "break" ? "timer-view--break" : ""}`} style={{ left: `${position.x}%`, top: `${position.y}%` }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}><div className="timer-value">{minutes}:{seconds}</div><div className="timer-phase">{phase === "focus" ? "Focus Session" : "Break Time"} · Session {currentSession}/{totalSessions}</div><div className="timer-control" onPointerDown={(event) => event.stopPropagation()}><button className="timer-reset" type="button" aria-label="Reset timer" onClick={onReset}><TimerReset size={12} /></button><button className="timer-play" type="button" aria-label={running ? "Pause timer" : "Start timer"} onClick={onToggle}>{running ? "Ⅱ" : <Play size={11} fill="currentColor" />}</button></div></div><div className="artwork-progress"><span>{artworkTitle}</span><div className="progress-track"><div style={{ width: `${progress * 100}%` }} /></div><span>{Math.round(progress * 100)}%</span></div></>;
}
function TasksView({ tasks, draft, onDraftChange, onToggle, onDelete, onAdd, onClose }: { tasks: Task[]; draft: string; onDraftChange: (value: string) => void; onToggle: (id: number) => void; onDelete: (id: number) => void; onAdd: () => void; onClose: () => void }) {
  return <Panel title="Tasks" onClose={onClose}><div className="task-list">{tasks.map((task) => <div className={`task-row ${task.done ? "task-row--done" : ""}`} key={task.id}><button className="task-toggle" type="button" onClick={() => onToggle(task.id)}><span className="task-check">{task.done && <Check size={11} />}</span><span>{task.label}</span></button><button className="task-delete" type="button" aria-label={`Delete ${task.label}`} onClick={() => onDelete(task.id)}>×</button></div>)}</div><form className="new-task-form" onSubmit={(event) => { event.preventDefault(); onAdd(); }}><input value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="new task" aria-label="New task" /><button type="submit" aria-label="Add task"><Plus size={12} /></button></form></Panel>;
}
function GalleryView({ selectedArtwork, onSelect, onClose }: { selectedArtwork: number; onSelect: (index: number) => void; onClose: () => void }) {
  return <Panel title="Galería" className="gallery-panel" onClose={onClose}><div className="gallery-grid">{artworks.map((artwork, index) => <button className={`gallery-item ${selectedArtwork === index ? "gallery-item--selected" : ""}`} type="button" key={artwork.title} onClick={() => onSelect(index)}><img src={artwork.src} alt={artwork.title} /><span>{artwork.title}</span></button>)}</div></Panel>;
}
function SettingsView({ focus, breakTime, sessions, onFocusChange, onBreakChange, onSessionsChange, musicVolume, onMusicVolumeChange, darkMode, onThemeChange, onClose }: { focus: number; breakTime: number; sessions: number; onFocusChange: (value: number) => void; onBreakChange: (value: number) => void; onSessionsChange: (value: number) => void; musicVolume: number; onMusicVolumeChange: (value: number) => void; darkMode: boolean; onThemeChange: (value: boolean) => void; onClose: () => void }) {
  const [sound, setSound] = useState(true);
  const [artworkIndex, setArtworkIndex] = useState(0);
  const artwork = artworks[artworkIndex];
  return <Panel title="Settings" className="settings-panel" onClose={onClose}><div className="settings-content"><p className="settings-label">Time controls:</p><SettingStepper label="Focus time" value={`${focus} min`} min={1} max={120} onChange={onFocusChange} /><SettingStepper label="Break" value={`${breakTime} min`} min={1} max={60} onChange={onBreakChange} /><SettingStepper label="Sessions" value={`${sessions}`} min={1} max={12} onChange={onSessionsChange} /><div className="setting-line"><span>Lo-fi volume</span><input className="volume-slider" type="range" min="0" max="1" step="0.05" value={musicVolume} aria-label="Lo-fi volume" onChange={(event) => onMusicVolumeChange(Number(event.target.value))} /></div><div className="setting-line"><span>Sound on completion</span><button className={`switch ${sound ? "switch--on" : ""}`} type="button" aria-label="Toggle completion sound" onClick={() => setSound((current) => !current)}><span /></button></div><p className="settings-label">Appearance:</p><div className="appearance"><button className={`appearance-option ${!darkMode ? "appearance-option--active" : ""}`} type="button" onClick={() => onThemeChange(false)}>☼&nbsp; Light</button><button className={`appearance-option ${darkMode ? "appearance-option--active" : ""}`} type="button" onClick={() => onThemeChange(true)}>☾&nbsp; Dark</button></div><p className="settings-label">Artwork:</p><button className="artwork-setting" type="button" onClick={() => setArtworkIndex((current) => (current + 1) % artworks.length)}><span>{artwork.title}<small>Click to change artwork</small></span><span>›</span></button></div></Panel>;
}
function SettingStepper({ label, value, min, max, onChange }: { label: string; value: string; min: number; max: number; onChange: (value: number) => void }) {
  const numericValue = Number.parseInt(value, 10);
  const step = label === "Sessions" ? 1 : 5;
  return <div className="setting-line"><span>{label}</span><span className="stepper"><button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, numericValue - step))}>‹</button><strong>{value}</strong><button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, numericValue + step))}>›</button></span></div>;
}
function Panel({ title, children, className = "", onClose }: { title: string; children: React.ReactNode; className?: string; onClose: () => void }) {
  return <section className={`floating-panel ${className}`}><div className="panel-header"><h1>{title}</h1><button type="button" aria-label="Close panel" onClick={onClose}><img src={figmaClose} alt="" /></button></div>{children}</section>;
}
