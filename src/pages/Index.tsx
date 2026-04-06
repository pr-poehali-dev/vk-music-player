import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  audioUrl: string;
  downloadUrl: string;
}

type Tab = "search" | "liked" | "recent";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Jamendo API ──────────────────────────────────────────────────────────────
const JAMENDO_ID = "b1a9c428";

async function searchTracks(query: string): Promise<Track[]> {
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_ID}&format=json&limit=30&search=${encodeURIComponent(query)}&audioformat=mp32&include=musicinfo&imagesize=300`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((t: Record<string, string | number>) => ({
    id: String(t.id),
    title: String(t.name),
    artist: String(t.artist_name),
    album: String(t.album_name || ""),
    duration: Number(t.duration),
    cover: String(t.image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"),
    audioUrl: String(t.audio),
    downloadUrl: String(t.audiodownload || t.audio),
  }));
}

async function getTopTracks(): Promise<Track[]> {
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_ID}&format=json&limit=20&order=popularity_total&audioformat=mp32&imagesize=300`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((t: Record<string, string | number>) => ({
    id: String(t.id),
    title: String(t.name),
    artist: String(t.artist_name),
    album: String(t.album_name || ""),
    duration: Number(t.duration),
    cover: String(t.image || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"),
    audioUrl: String(t.audio),
    downloadUrl: String(t.audiodownload || t.audio),
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Disc({ cover, playing, color }: { cover: string; playing: boolean; color: string }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      <div className="absolute rounded-full" style={{
        inset: 0,
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        animation: playing ? "pulse-glow 2s ease-in-out infinite" : "none",
      }} />
      <div className="relative rounded-full overflow-hidden flex-shrink-0"
        style={{
          width: 188, height: 188,
          animation: playing ? "spin-record 8s linear infinite" : "none",
          border: `3px solid ${color}90`,
          boxShadow: playing ? `0 0 40px ${color}60, 0 12px 40px rgba(0,0,0,0.8)` : "0 12px 40px rgba(0,0,0,0.6)",
        }}>
        <img src={cover} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"; }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white/40" />
          </div>
        </div>
        <div className="absolute inset-0 rounded-full" style={{ background: "repeating-radial-gradient(circle at center, transparent 16px, rgba(0,0,0,0.05) 17px, transparent 18px)" }} />
      </div>
    </div>
  );
}

function Bars({ playing, color }: { playing: boolean; color: string }) {
  return (
    <div className="flex items-end justify-center gap-[3px] h-8 w-full">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="rounded-full" style={{
          width: "3px", minHeight: "3px",
          height: playing ? `${15 + ((i * 43) % 85)}%` : "8%",
          background: `linear-gradient(to top, ${color}, #ec4899)`,
          animation: playing ? `wave-bar ${0.45 + (i % 5) * 0.12}s ease-in-out infinite alternate` : "none",
          animationDelay: `${i * 0.04}s`,
          opacity: playing ? 1 : 0.25,
          transition: "height 0.3s ease",
        }} />
      ))}
    </div>
  );
}

function TrackRow({
  track, active, playing, liked, onPlay, onLike, onDownload,
}: {
  track: Track; active: boolean; playing: boolean; liked: boolean;
  onPlay: () => void; onLike: () => void; onDownload: () => void;
}) {
  const COLORS = ["#a855f7", "#ec4899", "#3b82f6", "#06b6d4", "#f59e0b", "#10b981"];
  const color = COLORS[parseInt(track.id) % COLORS.length];

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${active ? "neon-border" : "hover:bg-white/5 border border-transparent"}`}
      style={active ? { background: `linear-gradient(135deg, ${color}15, transparent)` } : {}}
      onClick={onPlay}
    >
      <div className="relative flex-shrink-0">
        <img src={track.cover} alt="" className="w-11 h-11 rounded-lg object-cover"
          style={active ? { boxShadow: `0 0 14px ${color}70` } : {}}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"; }}
        />
        {active && playing ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
            <div className="flex items-end gap-[2px] h-4">
              {[0,1,2,3].map(i => <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />)}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/55 transition-all">
            <Icon name="Play" size={15} className="text-white opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate text-sm leading-tight ${active ? "text-white" : "text-white/85"}`}>{track.title}</p>
        <p className="text-xs text-white/40 truncate mt-0.5">{track.artist}</p>
      </div>

      <span className="text-xs text-white/25 flex-shrink-0 tabular-nums">{fmt(track.duration)}</span>

      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
        <button
          onClick={onLike}
          className={`p-1.5 rounded-lg transition-all ${liked ? "text-pink-400" : "text-white/30 hover:text-white/70"}`}
          style={liked ? { filter: "drop-shadow(0 0 5px rgba(236,72,153,0.9))" } : {}}
        >
          <Icon name="Heart" size={14} />
        </button>
        <a href={track.downloadUrl} download target="_blank" rel="noreferrer"
          className="p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-all"
          onClick={onDownload}
        >
          <Icon name="Download" size={14} />
        </a>
      </div>

      {liked && (
        <Icon name="Heart" size={13} className="text-pink-400 flex-shrink-0 opacity-100 group-hover:opacity-0 transition-all" style={{ filter: "drop-shadow(0 0 4px rgba(236,72,153,0.8))" }} />
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const ACCENT_COLORS = ["#a855f7", "#ec4899", "#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6"];

const Index = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("volna_liked") || "[]"); } catch { return []; }
  });
  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    try { return JSON.parse(localStorage.getItem("volna_liked_tracks") || "[]"); } catch { return []; }
  });
  const [recent, setRecent] = useState<Track[]>(() => {
    try { return JSON.parse(localStorage.getItem("volna_recent") || "[]"); } catch { return []; }
  });
  const [searched, setSearched] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const accentColor = current
    ? ACCENT_COLORS[parseInt(current.id) % ACCENT_COLORS.length]
    : "#a855f7";

  // Load top tracks on mount
  useEffect(() => {
    getTopTracks().then(setTracks);
  }, []);

  // Audio setup
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume / 100;
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => {
      if (repeat) { audio.currentTime = 0; audio.play(); }
      else nextTrack();
    });

    return () => { audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (current?.id === track.id) {
      if (playing) { audio.pause(); setPlaying(false); }
      else { audio.play(); setPlaying(true); }
      return;
    }

    setCurrent(track);
    setProgress(0);
    audio.src = track.audioUrl;
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));

    // Add to recent
    setRecent(prev => {
      const next = [track, ...prev.filter(t => t.id !== track.id)].slice(0, 30);
      localStorage.setItem("volna_recent", JSON.stringify(next));
      return next;
    });
  }, [current, playing, repeat]);

  const nextTrack = useCallback(() => {
    const list = tab === "liked" ? likedTracks : tab === "recent" ? recent : tracks;
    if (!list.length) return;
    if (shuffle) {
      playTrack(list[Math.floor(Math.random() * list.length)]);
    } else {
      const idx = current ? list.findIndex(t => t.id === current.id) : -1;
      playTrack(list[(idx + 1) % list.length]);
    }
  }, [tracks, likedTracks, recent, current, tab, shuffle, playTrack]);

  const prevTrack = useCallback(() => {
    const list = tab === "liked" ? likedTracks : tab === "recent" ? recent : tracks;
    if (!list.length) return;
    const idx = current ? list.findIndex(t => t.id === current.id) : 0;
    playTrack(list[(idx - 1 + list.length) % list.length]);
  }, [tracks, likedTracks, recent, current, tab, playTrack]);

  const seekTo = (pct: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (pct / 100) * audio.duration;
    setProgress(pct);
  };

  const toggleLike = (track: Track) => {
    if (liked.includes(track.id)) {
      const newLiked = liked.filter(id => id !== track.id);
      const newTracks = likedTracks.filter(t => t.id !== track.id);
      setLiked(newLiked);
      setLikedTracks(newTracks);
      localStorage.setItem("volna_liked", JSON.stringify(newLiked));
      localStorage.setItem("volna_liked_tracks", JSON.stringify(newTracks));
    } else {
      const newLiked = [...liked, track.id];
      const newTracks = [...likedTracks, track];
      setLiked(newLiked);
      setLikedTracks(newTracks);
      localStorage.setItem("volna_liked", JSON.stringify(newLiked));
      localStorage.setItem("volna_liked_tracks", JSON.stringify(newTracks));
    }
  };

  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const results = await searchTracks(query.trim());
    setTracks(results);
    setLoading(false);
  };

  const currentSeconds = audioRef.current ? audioRef.current.currentTime : 0;
  const totalSeconds = duration || (current?.duration ?? 0);

  const bgGradient = `
    radial-gradient(ellipse at 15% 50%, ${accentColor}20 0%, transparent 55%),
    radial-gradient(ellipse at 85% 20%, #ec489915 0%, transparent 55%),
    radial-gradient(ellipse at 50% 95%, #3b82f612 0%, transparent 55%)
  `;

  const displayTracks = tab === "liked" ? likedTracks : tab === "recent" ? recent : tracks;

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "search", label: "Поиск", icon: "Search" },
    { key: "liked", label: "Любимые", icon: "Heart" },
    { key: "recent", label: "История", icon: "Clock" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(240 15% 6%)", overflow: "hidden", position: "relative" }}>
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none transition-all duration-1000" style={{ background: bgGradient, zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: `${4 + i * 2}px`, height: `${4 + i * 2}px`,
            left: `${10 + i * 15}%`, bottom: "-20px",
            background: i % 2 === 0 ? `${accentColor}80` : "#ec489980",
            animation: `particle-float ${10 + i * 2.5}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`, filter: "blur(1px)",
          }} />
        ))}
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
            background: `linear-gradient(135deg, ${accentColor}, #ec4899)`,
            boxShadow: `0 0 20px ${accentColor}60`,
            transition: "all 0.6s ease",
          }}>
            <Icon name="Radio" size={18} className="text-white" />
          </div>
          <div>
            <span className="font-montserrat font-extrabold text-xl gradient-text tracking-tight">ВолнА</span>
            <div className="text-white/30 text-[10px] -mt-1 font-medium">Free Music Player</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #4ade80" }} />
          <span>Jamendo</span>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 px-4 pb-32 lg:pb-4 max-w-screen-xl mx-auto w-full">

        {/* LEFT: PLAYER */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="glass rounded-3xl p-5 flex flex-col items-center gap-4" style={{ minHeight: 480 }}>
            {current ? (
              <>
                <Disc cover={current.cover} playing={playing} color={accentColor} />
                <div className="text-center w-full px-1">
                  <h2 className="font-montserrat font-bold text-lg text-white truncate leading-tight">{current.title}</h2>
                  <p className="text-white/50 text-sm mt-1 truncate">{current.artist}</p>
                  {current.album && <p className="text-white/25 text-xs mt-0.5 truncate">{current.album}</p>}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
                <div className="w-28 h-28 rounded-full glass flex items-center justify-center" style={{ border: "2px dashed rgba(168,85,247,0.3)" }}>
                  <Icon name="Music2" size={40} className="text-purple-400/50" />
                </div>
                <div className="text-center">
                  <p className="text-white/40 text-sm font-medium">Ничего не играет</p>
                  <p className="text-white/20 text-xs mt-1">Найди трек и нажми ▶</p>
                </div>
              </div>
            )}

            <Bars playing={playing} color={accentColor} />

            {/* Progress */}
            <div className="w-full space-y-1">
              <input type="range" min={0} max={100} value={progress}
                onChange={e => seekTo(Number(e.target.value))}
                className="w-full progress-bar cursor-pointer"
                style={{ "--progress": `${progress}%` } as React.CSSProperties}
              />
              <div className="flex justify-between text-xs text-white/25 tabular-nums">
                <span>{fmt(currentSeconds)}</span>
                <span>{fmt(totalSeconds)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full px-1">
              <button onClick={() => setShuffle(s => !s)}
                className={`p-2 rounded-xl transition-all ${shuffle ? "text-purple-400" : "text-white/25 hover:text-white/60"}`}
                style={shuffle ? { textShadow: "0 0 12px rgba(168,85,247,0.9)" } : {}}>
                <Icon name="Shuffle" size={17} />
              </button>
              <button onClick={prevTrack} className="p-2 text-white/60 hover:text-white transition-all hover:scale-110">
                <Icon name="SkipBack" size={21} />
              </button>
              <button onClick={() => current && playTrack(current)}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, #ec4899)`,
                  boxShadow: `0 0 28px ${accentColor}80, 0 8px 24px rgba(0,0,0,0.5)`,
                  transition: "background 0.5s, box-shadow 0.5s",
                  opacity: current ? 1 : 0.4,
                }}>
                <Icon name={playing ? "Pause" : "Play"} size={24} className="text-white" />
              </button>
              <button onClick={nextTrack} className="p-2 text-white/60 hover:text-white transition-all hover:scale-110">
                <Icon name="SkipForward" size={21} />
              </button>
              <button onClick={() => setRepeat(r => !r)}
                className={`p-2 rounded-xl transition-all ${repeat ? "text-purple-400" : "text-white/25 hover:text-white/60"}`}
                style={repeat ? { textShadow: "0 0 12px rgba(168,85,247,0.9)" } : {}}>
                <Icon name="Repeat" size={17} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 w-full">
              <Icon name="Volume1" size={13} className="text-white/25 flex-shrink-0" />
              <input type="range" min={0} max={100} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="flex-1 progress-bar cursor-pointer"
                style={{ "--progress": `${volume}%` } as React.CSSProperties}
              />
              <Icon name="Volume2" size={13} className="text-white/25 flex-shrink-0" />
            </div>

            {/* Download current */}
            {current && (
              <a href={current.downloadUrl} download target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
                  border: `1px solid ${accentColor}40`,
                  color: "white",
                }}>
                <Icon name="Download" size={15} />
                Скачать трек
              </a>
            )}
          </div>
        </div>

        {/* RIGHT: TRACKS */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Tabs */}
          <div className="glass rounded-2xl p-1.5 flex gap-1">
            {TABS.map(({ key, label, icon }) => {
              const isActive = tab === key;
              return (
                <button key={key} onClick={() => setTab(key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${accentColor}35, ${accentColor}15)`,
                    color: "white",
                    boxShadow: `0 0 16px ${accentColor}30`,
                  } : { color: "rgba(255,255,255,0.35)" }}>
                  <Icon name={icon} size={13} />
                  <span>{label}</span>
                  {key === "liked" && liked.length > 0 && (
                    <span className="text-[10px] bg-pink-500/30 text-pink-300 rounded-full px-1.5 py-0.5 leading-none">{liked.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search bar (only on search tab) */}
          {tab === "search" && (
            <form onSubmit={doSearch}>
              <div className="relative">
                <Icon name="Search" size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Поиск по названию, исполнителю..."
                  className="w-full pl-10 pr-28 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={e => { e.target.style.borderColor = `${accentColor}60`; e.target.style.boxShadow = `0 0 20px ${accentColor}20`; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
                <button type="submit" disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, #ec4899)` }}>
                  {loading ? "..." : "Найти"}
                </button>
              </div>
            </form>
          )}

          {/* Track list */}
          <div className="flex-1 glass rounded-3xl p-4 overflow-y-auto scrollbar-hide" style={{ maxHeight: "calc(100vh - 280px)" }}>
            {tab === "search" && !searched && !loading && (
              <div className="pt-2 pb-4">
                <p className="text-white/35 text-xs font-medium uppercase tracking-wide mb-3 px-1">🔥 Популярное</p>
                {tracks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="flex items-end gap-[3px] h-8">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="skeleton rounded-full" style={{ width: 3, height: `${20 + ((i * 37) % 60)}%` }} />
                      ))}
                    </div>
                    <p className="text-white/25 text-sm">Загружаю топ треки...</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {tracks.map(track => (
                      <TrackRow key={track.id} track={track}
                        active={current?.id === track.id} playing={playing}
                        liked={liked.includes(track.id)}
                        onPlay={() => playTrack(track)}
                        onLike={() => toggleLike(track)}
                        onDownload={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "search" && searched && (
              <div className="space-y-0.5 animate-slide-up">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="skeleton w-11 h-11 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-3/4" />
                        <div className="skeleton h-2 w-1/2" />
                      </div>
                      <div className="skeleton h-2 w-8" />
                    </div>
                  ))
                ) : tracks.length === 0 ? (
                  <div className="text-center py-14">
                    <Icon name="SearchX" size={36} className="mx-auto mb-3 text-white/20" />
                    <p className="text-white/40 text-sm">Ничего не найдено</p>
                    <p className="text-white/20 text-xs mt-1">Попробуй другой запрос</p>
                  </div>
                ) : (
                  <>
                    <p className="text-white/30 text-xs px-1 pb-2">Найдено {tracks.length} треков</p>
                    {tracks.map(track => (
                      <TrackRow key={track.id} track={track}
                        active={current?.id === track.id} playing={playing}
                        liked={liked.includes(track.id)}
                        onPlay={() => playTrack(track)}
                        onLike={() => toggleLike(track)}
                        onDownload={() => {}}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            {tab === "liked" && (
              <div className="animate-slide-up">
                {likedTracks.length === 0 ? (
                  <div className="text-center py-14">
                    <Icon name="Heart" size={36} className="mx-auto mb-3 text-white/15" />
                    <p className="text-white/40 text-sm">Нет любимых треков</p>
                    <p className="text-white/20 text-xs mt-1">Нажми ♥ рядом с треком, чтобы добавить</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {likedTracks.map(track => (
                      <TrackRow key={track.id} track={track}
                        active={current?.id === track.id} playing={playing}
                        liked={true}
                        onPlay={() => playTrack(track)}
                        onLike={() => toggleLike(track)}
                        onDownload={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "recent" && (
              <div className="animate-slide-up">
                {recent.length === 0 ? (
                  <div className="text-center py-14">
                    <Icon name="Clock" size={36} className="mx-auto mb-3 text-white/15" />
                    <p className="text-white/40 text-sm">История пуста</p>
                    <p className="text-white/20 text-xs mt-1">Сыгранные треки будут здесь</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {recent.map(track => (
                      <TrackRow key={track.id} track={track}
                        active={current?.id === track.id} playing={playing}
                        liked={liked.includes(track.id)}
                        onPlay={() => playTrack(track)}
                        onLike={() => toggleLike(track)}
                        onDownload={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MINI PLAYER */}
      {current && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
          style={{ background: "rgba(8,6,18,0.92)", backdropFilter: "blur(40px)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {/* progress bar */}
          <div className="h-0.5 w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full transition-all duration-500"
              style={{ width: `${progress}%`, background: `linear-gradient(to right, ${accentColor}, #ec4899)` }} />
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <img src={current.cover} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              style={{ boxShadow: `0 0 12px ${accentColor}60` }}
              onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{current.title}</p>
              <p className="text-white/40 text-xs truncate">{current.artist}</p>
            </div>
            <button onClick={toggleLikeCurrent}
              className={`p-2 ${liked.includes(current.id) ? "text-pink-400" : "text-white/30"}`}>
              <Icon name="Heart" size={17} />
            </button>
            <button onClick={prevTrack} className="p-2 text-white/50">
              <Icon name="SkipBack" size={17} />
            </button>
            <button onClick={() => playTrack(current)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #ec4899)`, boxShadow: `0 0 16px ${accentColor}70` }}>
              <Icon name={playing ? "Pause" : "Play"} size={17} className="text-white" />
            </button>
            <button onClick={nextTrack} className="p-2 text-white/50">
              <Icon name="SkipForward" size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function toggleLikeCurrent() {
    if (current) toggleLike(current);
  }
};

export default Index;
