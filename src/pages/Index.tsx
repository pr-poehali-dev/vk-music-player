import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import AuthScreen, { SocialUser } from "@/components/AuthScreen";

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  color: string;
}

type Tab = "home" | "search" | "library" | "vk" | "ok";

const TRACKS: Track[] = [
  { id: 1, title: "Neon Dreams", artist: "Synthwave Artist", album: "Electric Night", duration: 213, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop", color: "#a855f7" },
  { id: 2, title: "Midnight Drive", artist: "Lo-Fi Chill", album: "City Lights", duration: 187, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop", color: "#ec4899" },
  { id: 3, title: "Purple Haze", artist: "Electric Vibes", album: "Deep Space", duration: 245, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop", color: "#3b82f6" },
  { id: 4, title: "Solar Wind", artist: "Cosmic Beat", album: "Orbit", duration: 198, cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop", color: "#06b6d4" },
  { id: 5, title: "Pulse & Flow", artist: "Neon Jungle", album: "Frequency", duration: 231, cover: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop", color: "#f59e0b" },
  { id: 6, title: "Interstellar", artist: "Galaxy Sound", album: "Universe", duration: 267, cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop", color: "#10b981" },
];

const VK_TRACKS: Track[] = [
  { id: 101, title: "Моя Игра", artist: "ТНВК", album: "ВКонтакте Hits", duration: 204, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&q=80", color: "#0077ff" },
  { id: 102, title: "Тает лёд", artist: "Элджей", album: "VK Music", duration: 223, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&q=80", color: "#0077ff" },
  { id: 103, title: "Все танцуют локтями", artist: "Рем Дигга", album: "Top VK", duration: 195, cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop&q=80", color: "#0077ff" },
];

const OK_TRACKS: Track[] = [
  { id: 201, title: "Лирика", artist: "Скриптонит", album: "ОК Музыка", duration: 218, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop&q=80", color: "#f7931e" },
  { id: 202, title: "Краснодар", artist: "Markul", album: "OK Top", duration: 241, cover: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop&q=80", color: "#f7931e" },
  { id: 203, title: "Огонь", artist: "Грибы", album: "OK Classics", duration: 199, cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop&q=80", color: "#f7931e" },
];

const PLAYLISTS = [
  { id: 1, name: "Любимые", count: 24, color: "#a855f7" },
  { id: 2, name: "В машину", count: 18, color: "#ec4899" },
  { id: 3, name: "Для работы", count: 32, color: "#3b82f6" },
  { id: 4, name: "Вечеринка", count: 41, color: "#f59e0b" },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Visualizer({ playing, color }: { playing: boolean; color: string }) {
  return (
    <div className="flex items-end justify-center gap-[3px] h-10 w-full">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: "3px",
            minHeight: "4px",
            height: playing ? `${20 + ((i * 37) % 80)}%` : "10%",
            background: `linear-gradient(to top, ${color}, #ec4899)`,
            animation: playing ? `wave-bar ${0.5 + (i % 5) * 0.15}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.05}s`,
            opacity: playing ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

function MiniViz({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4].map((_, i) => (
        <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

function SpinningDisc({ track, playing }: { track: Track; playing: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      <div
        className="absolute rounded-full"
        style={{
          width: "220px", height: "220px",
          background: `radial-gradient(circle, ${track.color}30 0%, transparent 70%)`,
          animation: playing ? "pulse-glow 2s ease-in-out infinite" : "none",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "210px", height: "210px",
          border: `1px solid ${track.color}40`,
          animation: playing ? "rotate-slow 10s linear infinite" : "none",
        }}
      />
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: "190px", height: "190px",
          animation: playing ? "spin-record 6s linear infinite" : "none",
          border: `3px solid ${track.color}80`,
          boxShadow: playing
            ? `0 0 40px ${track.color}70, 0 16px 40px rgba(0,0,0,0.7)`
            : "0 16px 40px rgba(0,0,0,0.5)",
        }}
      >
        <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/80 border border-white/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white/50" />
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "repeating-radial-gradient(circle at center, transparent 18px, rgba(0,0,0,0.04) 19px, transparent 20px)" }}
        />
      </div>
    </div>
  );
}

function TrackCard({ track, active, playing, onClick }: { track: Track; active: boolean; playing: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group
        ${active ? "neon-border" : "hover:bg-white/5 border border-transparent"}`}
      style={active ? { background: `linear-gradient(135deg, ${track.color}15, transparent)` } : {}}
    >
      <div className="relative flex-shrink-0">
        <img
          src={track.cover}
          alt={track.title}
          className="w-12 h-12 rounded-lg object-cover"
          style={active ? { boxShadow: `0 0 16px ${track.color}60` } : {}}
        />
        {active && playing && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
            <MiniViz active={true} />
          </div>
        )}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/50 transition-all">
            <Icon name="Play" size={16} className="text-white opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate text-sm ${active ? "text-white" : "text-white/80"}`}>{track.title}</p>
        <p className="text-xs text-white/40 truncate">{track.artist}</p>
      </div>
      <span className="text-xs text-white/30 flex-shrink-0">{formatTime(track.duration)}</span>
    </button>
  );
}

const Index = () => {
  const [user, setUser] = useState<SocialUser | null>(() => {
    try {
      const saved = localStorage.getItem("volna_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [tab, setTab] = useState<Tab>("home");
  const [liked, setLiked] = useState<number[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleAuth(u: SocialUser) {
    localStorage.setItem("volna_user", JSON.stringify(u));
    setUser(u);
    if (u.provider === "vk") setTab("vk");
    if (u.provider === "ok") setTab("ok");
  }

  function logout() {
    localStorage.removeItem("volna_user");
    setUser(null);
    setPlaying(false);
  }

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { setPlaying(false); return 0; }
          return Math.min(p + 100 / currentTrack.duration / 2, 100);
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, currentTrack]);

  const getAllTracks = useCallback(() => {
    const extra = user
      ? (user.provider === "vk" ? VK_TRACKS : OK_TRACKS)
      : [];
    return [...TRACKS, ...extra];
  }, [user]);

  const playTrack = useCallback((track: Track) => {
    if (currentTrack.id === track.id) {
      setPlaying((p) => !p);
    } else {
      setCurrentTrack(track);
      setProgress(0);
      setPlaying(true);
    }
  }, [currentTrack]);

  const prevTrack = () => {
    const all = getAllTracks();
    const idx = all.findIndex((t) => t.id === currentTrack.id);
    const prev = all[(idx - 1 + all.length) % all.length];
    setCurrentTrack(prev); setProgress(0); setPlaying(true);
  };

  const nextTrack = () => {
    const all = getAllTracks();
    const idx = all.findIndex((t) => t.id === currentTrack.id);
    const next = all[(idx + 1) % all.length];
    setCurrentTrack(next); setProgress(0); setPlaying(true);
  };

  const toggleLike = (id: number) => {
    setLiked((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const filteredTracks = getAllTracks().filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSeconds = Math.floor((progress / 100) * currentTrack.duration);
  const bgGradient = `radial-gradient(ellipse at 20% 50%, ${currentTrack.color}18 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, #ec489918 0%, transparent 55%),
    radial-gradient(ellipse at 50% 100%, #3b82f610 0%, transparent 55%)`;

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "home", label: "Главная", icon: "Home" },
    { key: "search", label: "Поиск", icon: "Search" },
    { key: "library", label: "Библиотека", icon: "Library" },
    { key: "vk", label: "ВКонтакте", icon: "Users" },
    { key: "ok", label: "Одноклас.", icon: "Star" },
  ];

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(240 15% 6%)", position: "relative", overflow: "hidden" }}>
      <div className="fixed inset-0 pointer-events-none transition-all duration-1000" style={{ background: bgGradient, zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: `${4 + i * 2}px`, height: `${4 + i * 2}px`,
            left: `${8 + i * 11}%`, bottom: "-20px",
            background: i % 2 === 0 ? `${currentTrack.color}70` : "#ec489970",
            animation: `particle-float ${9 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`, filter: "blur(1px)",
          }} />
        ))}
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${currentTrack.color}, #ec4899)`, boxShadow: `0 0 20px ${currentTrack.color}60`, transition: "all 0.5s" }}
          >
            <Icon name="Music2" size={18} className="text-white" />
          </div>
          <span className="font-montserrat font-extrabold text-xl gradient-text tracking-tight">ВолнА</span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 glass rounded-full px-3 py-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: user.provider === "vk" ? "#0077ff" : "#f7931e",
                boxShadow: user.provider === "vk" ? "0 0 6px #0077ff" : "0 0 6px #f7931e",
              }}
            />
            <span className="text-white/70 text-xs font-medium">{user.name}</span>
          </div>
          <div
            className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer group"
            style={{ border: `2px solid ${user.provider === "vk" ? "#0077ff80" : "#f7931e80"}` }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: user.provider === "vk" ? "#0077ff" : "#f7931e" }}>
                <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="p-2 text-white/25 hover:text-white/60 transition-all rounded-xl hover:bg-white/5"
            title="Выйти"
          >
            <Icon name="LogOut" size={16} />
          </button>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 px-4 pb-24 lg:pb-4 max-w-screen-xl mx-auto w-full">

        {/* LEFT: NOW PLAYING */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="glass rounded-3xl p-5 flex flex-col items-center gap-5" style={{ minHeight: "520px" }}>
            <SpinningDisc track={currentTrack} playing={playing} />
            <div className="text-center w-full">
              <h2 className="font-montserrat font-bold text-xl text-white truncate">{currentTrack.title}</h2>
              <p className="text-white/50 text-sm mt-1">{currentTrack.artist}</p>
              <p className="text-white/25 text-xs mt-0.5">{currentTrack.album}</p>
            </div>
            <Visualizer playing={playing} color={currentTrack.color} />
            <div className="w-full space-y-1.5">
              <input
                type="range" min={0} max={100} value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full progress-bar cursor-pointer"
                style={{ "--progress": `${progress}%` } as React.CSSProperties}
              />
              <div className="flex justify-between text-xs text-white/25">
                <span>{formatTime(currentSeconds)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between w-full px-1">
              <button
                onClick={() => setShuffle((s) => !s)}
                className={`p-2 rounded-xl transition-all ${shuffle ? "text-purple-400" : "text-white/25 hover:text-white/60"}`}
                style={shuffle ? { textShadow: "0 0 12px rgba(168,85,247,0.9)" } : {}}
              >
                <Icon name="Shuffle" size={18} />
              </button>
              <button onClick={prevTrack} className="p-2 text-white/60 hover:text-white transition-all hover:scale-110">
                <Icon name="SkipBack" size={22} />
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${currentTrack.color}, #ec4899)`,
                  boxShadow: `0 0 30px ${currentTrack.color}80, 0 8px 24px rgba(0,0,0,0.5)`,
                  transition: "background 0.5s, box-shadow 0.5s",
                }}
              >
                <Icon name={playing ? "Pause" : "Play"} size={24} className="text-white" />
              </button>
              <button onClick={nextTrack} className="p-2 text-white/60 hover:text-white transition-all hover:scale-110">
                <Icon name="SkipForward" size={22} />
              </button>
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className={`p-2 rounded-xl transition-all ${liked.includes(currentTrack.id) ? "text-pink-400" : "text-white/25 hover:text-white/60"}`}
                style={liked.includes(currentTrack.id) ? { filter: "drop-shadow(0 0 8px rgba(236,72,153,0.9))" } : {}}
              >
                <Icon name="Heart" size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 w-full">
              <Icon name="Volume1" size={14} className="text-white/25 flex-shrink-0" />
              <input
                type="range" min={0} max={100} value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 progress-bar cursor-pointer"
                style={{ "--progress": `${volume}%` } as React.CSSProperties}
              />
              <Icon name="Volume2" size={14} className="text-white/25 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* RIGHT: TABS */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="glass rounded-2xl p-1.5 flex gap-1">
            {TABS.map(({ key, label, icon }) => {
              const isActive = tab === key;
              const tabColor = key === "vk" ? "#0077ff" : key === "ok" ? "#f7931e" : currentTrack.color;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${tabColor}35, ${tabColor}15)`,
                    color: "white",
                    boxShadow: `0 0 18px ${tabColor}35`,
                  } : { color: "rgba(255,255,255,0.35)" }}
                >
                  <Icon name={icon} size={13} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 glass rounded-3xl p-5 overflow-y-auto scrollbar-hide" style={{ maxHeight: "calc(100vh - 240px)" }}>

            {tab === "home" && (
              <div className="space-y-6 animate-slide-up">
                <div>
                  <h3 className="font-montserrat font-bold text-base text-white mb-3">Рекомендации</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TRACKS.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => playTrack(track)}
                        className="relative rounded-2xl overflow-hidden group transition-all hover:scale-[1.03] text-left"
                        style={{ aspectRatio: "1" }}
                      >
                        <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        {currentTrack.id === track.id && playing && (
                          <div className="absolute top-2 right-2 flex items-end gap-[2px] h-5">
                            {[1, 2, 3, 4].map((_, i) => (
                              <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                          </div>
                        )}
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          style={{ background: `${track.color}25` }}
                        >
                          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: track.color, boxShadow: `0 0 20px ${track.color}80` }}>
                            <Icon name={currentTrack.id === track.id && playing ? "Pause" : "Play"} size={18} className="text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white font-semibold text-sm truncate">{track.title}</p>
                          <p className="text-white/55 text-xs truncate">{track.artist}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-base text-white mb-3">Плейлисты</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PLAYLISTS.map((pl) => (
                      <div key={pl.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${pl.color}50, ${pl.color}15)`, border: `1px solid ${pl.color}40` }}>
                          <Icon name="Music" size={16} style={{ color: pl.color }} />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{pl.name}</p>
                          <p className="text-white/35 text-xs">{pl.count} треков</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "search" && (
              <div className="space-y-4 animate-slide-up">
                <div className="relative">
                  <Icon name="Search" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Поиск треков и исполнителей..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={(e) => { e.target.style.borderColor = `${currentTrack.color}60`; e.target.style.boxShadow = `0 0 20px ${currentTrack.color}20`; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <div className="space-y-1">
                  {filteredTracks.length === 0 ? (
                    <div className="text-center py-12 text-white/30">
                      <Icon name="SearchX" size={36} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Ничего не найдено</p>
                    </div>
                  ) : filteredTracks.map((track) => (
                    <TrackCard key={track.id} track={track} active={currentTrack.id === track.id} playing={playing} onClick={() => playTrack(track)} />
                  ))}
                </div>
              </div>
            )}

            {tab === "library" && (
              <div className="space-y-4 animate-slide-up">
                <div className="flex items-center justify-between">
                  <h3 className="font-montserrat font-bold text-base text-white">Моя библиотека</h3>
                  <span className="text-white/30 text-xs">{TRACKS.length} треков</span>
                </div>
                <div className="space-y-1">
                  {TRACKS.map((track) => (
                    <div key={track.id} className="flex items-center gap-1">
                      <div className="flex-1 min-w-0">
                        <TrackCard track={track} active={currentTrack.id === track.id} playing={playing} onClick={() => playTrack(track)} />
                      </div>
                      <button
                        onClick={() => toggleLike(track.id)}
                        className={`p-2 transition-all flex-shrink-0 ${liked.includes(track.id) ? "text-pink-400" : "text-white/20 hover:text-white/50"}`}
                        style={liked.includes(track.id) ? { filter: "drop-shadow(0 0 6px rgba(236,72,153,0.8))" } : {}}
                      >
                        <Icon name="Heart" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "vk" && (
              <div className="space-y-4 animate-slide-up">
                {user.provider === "vk" ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 8px #4ade80" }} />
                      <span className="text-green-400 text-sm font-medium">ВКонтакте подключён как {user.name}</span>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #0077ff15, transparent)", border: "1px solid #0077ff25" }}>
                      <div className="flex items-center gap-3">
                        {user.avatar && <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" style={{ border: "2px solid #0077ff60" }} />}
                        <div>
                          <p className="text-white font-semibold text-sm">{user.name}</p>
                          <p className="text-white/40 text-xs">ВКонтакте</p>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-white/40 text-xs font-medium uppercase tracking-wide">Популярное ВКонтакте</h4>
                    {VK_TRACKS.map((track) => (
                      <TrackCard key={track.id} track={track} active={currentTrack.id === track.id} playing={playing} onClick={() => playTrack(track)} />
                    ))}
                  </>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "#0077ff15", border: "1px solid #0077ff25" }}>
                      <span className="text-3xl">🎵</span>
                    </div>
                    <div>
                      <p className="text-white/60 font-medium">Ты авторизован через Одноклассники</p>
                      <p className="text-white/30 text-sm mt-1">Для доступа к VK Music выйди и войди через ВКонтакте</p>
                    </div>
                    <button onClick={logout} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105" style={{ background: "#0077ff", boxShadow: "0 0 20px #0077ff50" }}>
                      Сменить аккаунт
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "ok" && (
              <div className="space-y-4 animate-slide-up">
                {user.provider === "ok" ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 8px #4ade80" }} />
                      <span className="text-green-400 text-sm font-medium">Одноклассники подключены как {user.name}</span>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #f7931e15, transparent)", border: "1px solid #f7931e25" }}>
                      <div className="flex items-center gap-3">
                        {user.avatar && <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" style={{ border: "2px solid #f7931e60" }} />}
                        <div>
                          <p className="text-white font-semibold text-sm">{user.name}</p>
                          <p className="text-white/40 text-xs">Одноклассники</p>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-white/40 text-xs font-medium uppercase tracking-wide">Популярное в Одноклассниках</h4>
                    {OK_TRACKS.map((track) => (
                      <TrackCard key={track.id} track={track} active={currentTrack.id === track.id} playing={playing} onClick={() => playTrack(track)} />
                    ))}
                  </>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "#f7931e15", border: "1px solid #f7931e25" }}>
                      <span className="text-3xl">🎶</span>
                    </div>
                    <div>
                      <p className="text-white/60 font-medium">Ты авторизован через ВКонтакте</p>
                      <p className="text-white/30 text-sm mt-1">Для доступа к OK Music выйди и войди через Одноклассники</p>
                    </div>
                    <button onClick={logout} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105" style={{ background: "#f7931e", boxShadow: "0 0 20px #f7931e50" }}>
                      Сменить аккаунт
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM PLAYER */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(10,8,20,0.85)", backdropFilter: "blur(40px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <img src={currentTrack.cover} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" style={{ boxShadow: `0 0 12px ${currentTrack.color}60` }} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{currentTrack.title}</p>
          <p className="text-white/40 text-xs truncate">{currentTrack.artist}</p>
        </div>
        <button onClick={prevTrack} className="p-2 text-white/50 hover:text-white transition-all">
          <Icon name="SkipBack" size={17} />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: `linear-gradient(135deg, ${currentTrack.color}, #ec4899)`, boxShadow: `0 0 18px ${currentTrack.color}70` }}
        >
          <Icon name={playing ? "Pause" : "Play"} size={17} className="text-white" />
        </button>
        <button onClick={nextTrack} className="p-2 text-white/50 hover:text-white transition-all">
          <Icon name="SkipForward" size={17} />
        </button>
      </div>
    </div>
  );
};

export default Index;
