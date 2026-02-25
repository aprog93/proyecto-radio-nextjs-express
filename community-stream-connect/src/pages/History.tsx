import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";

const timelineEvents = [
  { year: "2024", title: "La idea nace", description: "Un grupo de vecinos sueña con una radio que una a la comunidad." },
  { year: "2025", title: "Primeras transmisiones", description: "Emisiones piloto en línea con voluntarios apasionados." },
  { year: "2026", title: "Lanzamiento oficial", description: "Proyecto Radio sale al aire con programación trilingüe completa." },
];

const History = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("history.title")}</h1>
          <p className="text-muted-foreground mb-12">{t("history.subtitle")}</p>

          {/* Narrative */}
          <div className="rounded-2xl border border-border p-8 bg-card mb-12">
            <p className="text-muted-foreground leading-relaxed">{t("history.narrative")}</p>
          </div>

          {/* Timeline */}
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">{t("history.timelineTitle")}</h2>
          <div className="relative pl-8 border-l-2 border-primary/30 space-y-10 mb-12">
            {timelineEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="absolute -left-[2.55rem] top-0 w-5 h-5 rounded-full bg-primary border-4 border-background" />
                <span className="text-xs font-bold text-primary">{event.year}</span>
                <h3 className="font-display text-lg font-semibold text-foreground mt-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Mission, Vision, Values */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: t("history.mission"), desc: t("history.missionDesc") },
              { icon: Eye, title: t("history.vision"), desc: t("history.visionDesc") },
              { icon: Heart, title: t("history.values"), desc: t("history.valuesDesc") },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border p-6 bg-card text-center"
              >
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
