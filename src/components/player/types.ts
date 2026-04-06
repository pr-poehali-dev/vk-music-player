export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  color: string;
}

export type Tab = "home" | "search" | "library" | "vk" | "ok";

export const TRACKS: Track[] = [
  { id: 1, title: "Neon Dreams", artist: "Synthwave Artist", album: "Electric Night", duration: 213, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop", color: "#a855f7" },
  { id: 2, title: "Midnight Drive", artist: "Lo-Fi Chill", album: "City Lights", duration: 187, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop", color: "#ec4899" },
  { id: 3, title: "Purple Haze", artist: "Electric Vibes", album: "Deep Space", duration: 245, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop", color: "#3b82f6" },
  { id: 4, title: "Solar Wind", artist: "Cosmic Beat", album: "Orbit", duration: 198, cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop", color: "#06b6d4" },
  { id: 5, title: "Pulse & Flow", artist: "Neon Jungle", album: "Frequency", duration: 231, cover: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop", color: "#f59e0b" },
  { id: 6, title: "Interstellar", artist: "Galaxy Sound", album: "Universe", duration: 267, cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop", color: "#10b981" },
];

export const VK_TRACKS: Track[] = [
  { id: 101, title: "Моя Игра", artist: "ТНВК", album: "ВКонтакте Hits", duration: 204, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&q=80", color: "#0077ff" },
  { id: 102, title: "Тает лёд", artist: "Элджей", album: "VK Music", duration: 223, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&q=80", color: "#0077ff" },
  { id: 103, title: "Все танцуют локтями", artist: "Рем Дигга", album: "Top VK", duration: 195, cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop&q=80", color: "#0077ff" },
];

export const OK_TRACKS: Track[] = [
  { id: 201, title: "Лирика", artist: "Скриптонит", album: "ОК Музыка", duration: 218, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop&q=80", color: "#f7931e" },
  { id: 202, title: "Краснодар", artist: "Markul", album: "OK Top", duration: 241, cover: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop&q=80", color: "#f7931e" },
  { id: 203, title: "Огонь", artist: "Грибы", album: "OK Classics", duration: 199, cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop&q=80", color: "#f7931e" },
];

export const PLAYLISTS = [
  { id: 1, name: "Любимые", count: 24, color: "#a855f7" },
  { id: 2, name: "В машину", count: 18, color: "#ec4899" },
  { id: 3, name: "Для работы", count: 32, color: "#3b82f6" },
  { id: 4, name: "Вечеринка", count: 41, color: "#f59e0b" },
];

export function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
