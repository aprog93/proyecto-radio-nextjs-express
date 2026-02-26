import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Send, Mic } from "lucide-react";
import { useState } from "react";

const Participate = () => {
  const { t } = useTranslation();
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will integrate with AzuraCast request API
    setSong(""); setArtist(""); setMessage("");
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("participate.title")}</h1>
          <p className="text-muted-foreground mb-12">{t("participate.subtitle")}</p>

          {/* Song request form */}
          <div className="rounded-2xl border border-border p-8 bg-card mb-12">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              {t("participate.requestSong")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t("participate.songTitle")}
                value={song}
                onChange={(e) => setSong(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                maxLength={200}
              />
              <input
                type="text"
                placeholder={t("participate.artist")}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                maxLength={200}
              />
              <textarea
                placeholder={t("participate.message")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
                {t("participate.send")}
              </button>
            </form>
          </div>

          {/* Podcasts placeholder */}
          <div className="rounded-2xl border border-border p-8 bg-card">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              {t("participate.podcasts")}
            </h2>
            <p className="text-muted-foreground text-sm">Próximamente / Coming soon / Bientôt disponible</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Participate;
