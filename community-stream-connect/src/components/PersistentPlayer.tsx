import { useTranslation } from "react-i18next";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause, Volume2, VolumeX, Heart, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const PersistentPlayer = () => {
  const { t } = useTranslation();
  const { isPlaying, volume, nowPlaying, togglePlay, setVolume } = usePlayer();
  const [showVolume, setShowVolume] = useState(false);

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border"
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-4 gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-12 h-12 rounded-lg bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden">
            {nowPlaying.artUrl ? (
              <img src={nowPlaying.artUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Radio className="w-5 h-5 text-primary" />
            )}
            {isPlaying && (
              <div className="absolute bottom-1 right-1 flex items-end gap-[2px]">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-primary rounded-full animate-equalizer"
                    style={{ animationDelay: `${i * 0.2}s`, height: "8px" }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{nowPlaying.title}</p>
            <p className="text-xs text-muted-foreground truncate">{nowPlaying.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {nowPlaying.isLive && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
              {t("player.liveNow")}
            </span>
          )}

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button className="hidden sm:block text-muted-foreground hover:text-primary transition-colors">
            <Heart className="w-5 h-5" />
          </button>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 relative">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            {showVolume && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 accent-primary"
              />
            )}
          </div>

          {nowPlaying.listeners > 0 && (
            <span className="hidden md:block text-xs text-muted-foreground">
              {nowPlaying.listeners} {t("player.listeners")}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PersistentPlayer;
