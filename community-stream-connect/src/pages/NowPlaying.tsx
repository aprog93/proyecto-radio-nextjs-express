import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, Radio, Users, Music, Clock } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { Progress } from "@/components/ui/progress";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const NowPlaying = () => {
  const { t } = useTranslation();
  const { isPlaying, nowPlaying, togglePlay, songHistory, playingNext } = usePlayer();

  const progressPercent = nowPlaying.duration > 0
    ? Math.min((nowPlaying.elapsed / nowPlaying.duration) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Album art */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-10 rounded-3xl bg-secondary flex items-center justify-center overflow-hidden" style={{ boxShadow: "var(--shadow-glow)" }}>
            {nowPlaying.artUrl ? (
              <img src={nowPlaying.artUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Radio className="w-20 h-20 text-primary/40" />
            )}
            {isPlaying && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full animate-equalizer"
                    style={{ animationDelay: `${i * 0.15}s`, height: "12px" }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Live badge */}
          {nowPlaying.isLive && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-slow" />
              <span className="text-sm font-semibold text-primary">{t("player.liveNow")}</span>
            </div>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            {nowPlaying.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-1">{nowPlaying.artist}</p>
          {nowPlaying.album && (
            <p className="text-sm text-muted-foreground/70 mb-6">{nowPlaying.album}</p>
          )}

          {/* Progress bar */}
          {nowPlaying.duration > 0 && (
            <div className="mb-8 px-4">
              <Progress value={progressPercent} className="h-1.5 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(nowPlaying.elapsed)}</span>
                <span>{formatTime(nowPlaying.duration)}</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <Heart className="w-7 h-7" />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity glow"
            >
              {isPlaying ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              ) : (
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>

          {/* Listeners */}
          <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm">{nowPlaying.listeners} {t("player.listeners")}</span>
          </div>
        </motion.div>

        {/* Playing Next */}
        {playingNext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Music className="w-4 h-4" />
              {t("nowPlaying.nextUp", "A continuación")}
            </h2>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border">
              {playingNext.song.art && (
                <img src={playingNext.song.art} alt="" className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{playingNext.song.title}</p>
                <p className="text-xs text-muted-foreground truncate">{playingNext.song.artist}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Song History */}
        {songHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 mb-24"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("nowPlaying.history", "Historial reciente")}
            </h2>
            <div className="space-y-2">
              {songHistory.map((item) => (
                <div
                  key={item.sh_id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50"
                >
                  {item.song.art && (
                    <img src={item.song.art} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{item.song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.song.artist}</p>
                  </div>
                  <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                    {formatTime(item.duration)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NowPlaying;
