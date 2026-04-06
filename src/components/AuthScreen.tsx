import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/9005ba7d-a6c6-42fa-ba96-80a44f1068f1";

export interface SocialUser {
  id: string;
  name: string;
  avatar: string;
  provider: "vk" | "ok";
  token: string;
}

interface Props {
  onAuth: (user: SocialUser) => void;
}

export default function AuthScreen({ onAuth }: Props) {
  const [loading, setLoading] = useState<"vk" | "ok" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback (when redirected back with ?code=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const provider = params.get("provider") as "vk" | "ok" | null;

    if (code && provider) {
      setLoading(provider);
      const redirectUri = `${window.location.origin}${window.location.pathname}?provider=${provider}`;
      handleCallback(provider, code, redirectUri);
    }
  }, []);

  async function handleCallback(provider: "vk" | "ok", code: string, redirectUri: string) {
    try {
      const action = provider === "vk" ? "vk_callback" : "ok_callback";
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, code, redirect_uri: redirectUri }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Ошибка авторизации");

      // Get user info
      const userAction = provider === "vk" ? "vk_user" : "ok_user";
      const userRes = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: userAction,
          token: data.token,
          user_id: data.user_id || "",
        }),
      });
      const userData = await userRes.json();
      if (!userData.ok) throw new Error(userData.error || "Ошибка получения профиля");

      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);

      onAuth({ ...userData, token: data.token });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setLoading(null);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

  async function loginWith(provider: "vk" | "ok") {
    setLoading(provider);
    setError(null);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}?provider=${provider}`;
      const action = provider === "vk" ? "get_vk_url" : "get_ok_url";
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, redirect_uri: redirectUri }),
      });
      const data = await res.json();
      if (!data.ok || !data.url) throw new Error(data.error || "Не удалось получить ссылку");
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setLoading(null);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "hsl(240 15% 6%)" }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "600px", height: "600px",
          left: "-200px", top: "-200px",
          background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "500px", height: "500px",
          right: "-150px", bottom: "-150px",
          background: "radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "300px", height: "300px",
          left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${3 + (i % 4)}px`,
            height: `${3 + (i % 4)}px`,
            left: `${8 + i * 9}%`,
            bottom: "-10px",
            background: i % 2 === 0 ? "rgba(168,85,247,0.6)" : "rgba(236,72,153,0.6)",
            animation: `particle-float ${8 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-3xl p-8 flex flex-col items-center gap-8 animate-slide-up"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(40px)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              boxShadow: "0 0 40px rgba(168,85,247,0.5)",
            }}
          >
            <Icon name="Music2" size={32} className="text-white" />
          </div>
          <div className="text-center">
            <h1
              className="font-montserrat font-extrabold text-3xl tracking-tight"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ВолнА
            </h1>
            <p className="text-white/40 text-sm mt-1">Музыкальный плеер</p>
          </div>
        </div>

        {/* Divider with text */}
        <div className="w-full">
          <p className="text-center text-white/60 text-sm font-medium mb-6">
            Войди, чтобы слушать музыку
          </p>

          {/* Visualizer decoration */}
          <div className="flex items-end justify-center gap-[3px] h-8 mb-6 opacity-40">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: "3px",
                  height: `${15 + ((i * 37 + 13) % 70)}%`,
                  background: "linear-gradient(to top, #a855f7, #ec4899)",
                  animation: `wave-bar ${0.5 + (i % 5) * 0.15}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* VK Button */}
          <button
            onClick={() => loginWith("vk")}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading === "vk"
                ? "rgba(0,119,255,0.3)"
                : "linear-gradient(135deg, #0077ff, #005cc5)",
              boxShadow: loading === "vk" ? "none" : "0 0 30px rgba(0,119,255,0.35), 0 8px 20px rgba(0,0,0,0.3)",
              border: "1px solid rgba(0,119,255,0.4)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              {loading === "vk" ? (
                <div
                  className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                  style={{ animation: "spin-record 0.8s linear infinite" }}
                />
              ) : (
                <span className="font-bold text-sm">ВК</span>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">Войти через ВКонтакте</div>
              <div className="text-xs text-white/60">Доступ к музыке VK</div>
            </div>
            {loading !== "vk" && (
              <Icon name="ArrowRight" size={16} className="text-white/60" />
            )}
          </button>

          {/* OK Button */}
          <button
            onClick={() => loginWith("ok")}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading === "ok"
                ? "rgba(247,147,30,0.3)"
                : "linear-gradient(135deg, #f7931e, #d4790a)",
              boxShadow: loading === "ok" ? "none" : "0 0 30px rgba(247,147,30,0.35), 0 8px 20px rgba(0,0,0,0.3)",
              border: "1px solid rgba(247,147,30,0.4)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              {loading === "ok" ? (
                <div
                  className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                  style={{ animation: "spin-record 0.8s linear infinite" }}
                />
              ) : (
                <span className="font-bold text-sm">ОК</span>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">Войти через Одноклассники</div>
              <div className="text-xs text-white/60">Доступ к музыке OK</div>
            </div>
            {loading !== "ok" && (
              <Icon name="ArrowRight" size={16} className="text-white/60" />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <Icon name="AlertCircle" size={16} className="text-red-400 flex-shrink-0" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Footer note */}
        <p className="text-white/20 text-xs text-center leading-relaxed">
          Авторизуясь, ты даёшь разрешение на доступ<br />к своей музыкальной библиотеке
        </p>
      </div>
    </div>
  );
}
