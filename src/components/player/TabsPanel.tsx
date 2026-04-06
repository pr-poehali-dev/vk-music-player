import Icon from "@/components/ui/icon";
import { Track, Tab, TRACKS, VK_TRACKS, OK_TRACKS, PLAYLISTS, formatTime } from "./types";
import { SocialUser } from "@/components/AuthScreen";

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

interface TabsPanelProps {
  tab: Tab;
  currentTrack: Track;
  playing: boolean;
  liked: number[];
  searchQuery: string;
  filteredTracks: Track[];
  user: SocialUser;
  onSetTab: (t: Tab) => void;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (id: number) => void;
  onSetSearchQuery: (q: string) => void;
  onLogout: () => void;
}

export default function TabsPanel({
  tab,
  currentTrack,
  playing,
  liked,
  searchQuery,
  filteredTracks,
  user,
  onSetTab,
  onPlayTrack,
  onToggleLike,
  onSetSearchQuery,
  onLogout,
}: TabsPanelProps) {
  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "home", label: "Главная", icon: "Home" },
    { key: "search", label: "Поиск", icon: "Search" },
    { key: "library", label: "Библиотека", icon: "Library" },
    { key: "vk", label: "ВКонтакте", icon: "Users" },
    { key: "ok", label: "Одноклас.", icon: "Star" },
  ];

  return (
    <div className="flex-1 flex flex-col gap-3 min-w-0">
      <div className="glass rounded-2xl p-1.5 flex gap-1">
        {TABS.map(({ key, label, icon }) => {
          const isActive = tab === key;
          const tabColor = key === "vk" ? "#0077ff" : key === "ok" ? "#f7931e" : currentTrack.color;
          return (
            <button
              key={key}
              onClick={() => onSetTab(key)}
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
                    onClick={() => onPlayTrack(track)}
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
                onChange={(e) => onSetSearchQuery(e.target.value)}
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
                <TrackCard key={track.id} track={track} active={currentTrack.id === track.id} playing={playing} onClick={() => onPlayTrack(track)} />
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
                    <TrackCard track={track} active={currentTrack.id === track.id} playing={playing} onClick={() => onPlayTrack(track)} />
                  </div>
                  <button
                    onClick={() => onToggleLike(track.id)}
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
                  <TrackCard key={track.id} track={track} active={currentTrack.id === track.id} playing={playing} onClick={() => onPlayTrack(track)} />
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
                <button onClick={onLogout} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105" style={{ background: "#0077ff", boxShadow: "0 0 20px #0077ff50" }}>
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
                  <TrackCard key={track.id} track={track} active={currentTrack.id === track.id} playing={playing} onClick={() => onPlayTrack(track)} />
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
                <button onClick={onLogout} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105" style={{ background: "#f7931e", boxShadow: "0 0 20px #f7931e50" }}>
                  Сменить аккаунт
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
