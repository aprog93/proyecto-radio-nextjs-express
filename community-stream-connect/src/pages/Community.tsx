import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const socials = [
  { key: "joinDiscord", icon: "💬", color: "bg-[hsl(235,86%,65%)]", url: "#" },
  { key: "followIG", icon: "📸", color: "bg-[hsl(330,80%,55%)]", url: "#" },
  { key: "joinTelegram", icon: "✈️", color: "bg-[hsl(200,80%,50%)]", url: "#" },
];

const Community = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("community.title")}</h1>
          <p className="text-muted-foreground mb-12">{t("community.subtitle")}</p>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {socials.map((s, i) => (
              <motion.a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors group"
              >
                <span className="text-4xl">{s.icon}</span>
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {t(`community.${s.key}`)}
                </span>
              </motion.a>
            ))}
          </div>

          {/* Forum placeholder */}
          <div className="rounded-2xl border border-border p-8 bg-card text-center">
            <MessageCircle className="w-10 h-10 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Foro comunitario / Community forum — Próximamente</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Community;
