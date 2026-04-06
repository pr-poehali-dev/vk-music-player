import Icon from "@/components/ui/icon";
import { Track, formatTime } from "./types";

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

interface PlayerPanelProps {
  currentTrack: Track;
  playing: boolean;
  progress: number;
  volume: number;
  shuffle: boolean;
  liked: number[];
  onSetProgress: (v: number) => void;
  onSetVolume: (v: number) => void;
  onToggleShuffle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onToggleLike: (id: number) => void;
}

export default function PlayerPanel({
  currentTrack,
  playing,
  progress,
  volume,
  shuffle,
  liked,
  onSetProgress,
  onSetVolume,
  onToggleShuffle,
  onPrev,
  onNext,
  onTogglePlay,
  onToggleLike,
}: PlayerPanelProps) {
  const currentSeconds = Math.floor((progress / 100) * currentTrack.duration);

  return (
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
            onChange={(e) => onSetProgress(Number(e.target.value))}
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
            onClick={onToggleShuffle}
            className={`p-2 rounded-xl transition-all ${shuffle ? "text-purple-400" : "text-white/25 hover:text-white/60"}`}
            style={shuffle ? { textShadow: "0 0 12px rgba(168,85,247,0.9)" } : {}}
          >
            <Icon name="Shuffle" size={18} />
          </button>
          <button onClick={onPrev} className="p-2 text-white/60 hover:text-white transition-all hover:scale-110">
            <Icon name="SkipBack" size={22} />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${currentTrack.color}, #ec4899)`,
              boxShadow: `0 0 30px ${currentTrack.color}80, 0 8px 24px rgba(0,0,0,0.5)`,
              transition: "background 0.5s, box-shadow 0.5s",
            }}
          >
            <Icon name={playing ? "Pause" : "Play"} size={24} className="text-white" />
          </button>
          <button onClick={onNext} className="p-2 text-white/60 hover:text-white transition-all hover:scale-110">
            <Icon name="SkipForward" size={22} />
          </button>
          <button
            onClick={() => onToggleLike(currentTrack.id)}
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
            onChange={(e) => onSetVolume(Number(e.target.value))}
            className="flex-1 progress-bar cursor-pointer"
            style={{ "--progress": `${volume}%` } as React.CSSProperties}
          />
          <Icon name="Volume2" size={14} className="text-white/25 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
