import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import AuthScreen, { SocialUser } from "@/components/AuthScreen";
import PlayerPanel from "@/components/player/PlayerPanel";
import TabsPanel from "@/components/player/TabsPanel";
import { Track, Tab, TRACKS, VK_TRACKS, OK_TRACKS } from "@/components/player/types";

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

  const bgGradient = `radial-gradient(ellipse at 20% 50%, ${currentTrack.color}18 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, #ec489918 0%, transparent 55%),
    radial-gradient(ellipse at 50% 100%, #3b82f610 0%, transparent 55%)`;

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
        <PlayerPanel
          currentTrack={currentTrack}
          playing={playing}
          progress={progress}
          volume={volume}
          shuffle={shuffle}
          liked={liked}
          onSetProgress={setProgress}
          onSetVolume={setVolume}
          onToggleShuffle={() => setShuffle((s) => !s)}
          onPrev={prevTrack}
          onNext={nextTrack}
          onTogglePlay={() => setPlaying((p) => !p)}
          onToggleLike={toggleLike}
        />
        <TabsPanel
          tab={tab}
          currentTrack={currentTrack}
          playing={playing}
          liked={liked}
          searchQuery={searchQuery}
          filteredTracks={filteredTracks}
          user={user}
          onSetTab={setTab}
          onPlayTrack={playTrack}
          onToggleLike={toggleLike}
          onSetSearchQuery={setSearchQuery}
          onLogout={logout}
        />
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
