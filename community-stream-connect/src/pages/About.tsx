import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Target, Eye, Users, Mail } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-12">{t("about.title")}</h1>

          <div className="space-y-10">
            <div className="rounded-2xl border border-border p-8 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">{t("about.mission")}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t("about.missionDesc")}</p>
            </div>

            <div className="rounded-2xl border border-border p-8 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">{t("about.vision")}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t("about.visionDesc")}</p>
            </div>

            <div className="rounded-2xl border border-border p-8 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">{t("about.team")}</h2>
              </div>
              <p className="text-muted-foreground">Próximamente / Coming soon / Bientôt</p>
            </div>

            <div className="rounded-2xl border border-primary/30 p-8 bg-card glow">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">{t("about.volunteer")}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t("about.volunteerDesc")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
