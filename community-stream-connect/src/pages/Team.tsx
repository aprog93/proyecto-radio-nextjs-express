import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, MessageSquare } from "lucide-react";

const teamSections = [
  {
    key: "direction",
    members: [
      { name: "[Pendiente]", role: "Director/a General", bio: "Líder visionario de Proyecto Radio.", avatar: "" },
    ],
  },
  {
    key: "hosts",
    members: [
      { name: "[Pendiente]", role: "Locutor/a", bio: "Voz principal de la programación matutina.", avatar: "" },
      { name: "[Pendiente]", role: "Locutor/a", bio: "Conductor del espacio deportivo.", avatar: "" },
    ],
  },
  {
    key: "tech",
    members: [
      { name: "[Pendiente]", role: "Técnico de sonido", bio: "Responsable de la calidad de transmisión.", avatar: "" },
    ],
  },
  {
    key: "volunteers",
    members: [
      { name: "[Pendiente]", role: "Voluntario/a", bio: "Colaborador comunitario.", avatar: "" },
    ],
  },
];

const Team = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("team.title")}</h1>
          <p className="text-muted-foreground mb-12">{t("team.subtitle")}</p>

          {/* Director message */}
          <div className="rounded-2xl border border-primary/30 p-8 bg-card glow mb-12">
            <MessageSquare className="w-8 h-8 text-primary mb-4" />
            <p className="text-foreground/90 leading-relaxed italic">{t("team.directorMessage")}</p>
            <p className="text-sm text-muted-foreground mt-4">— {t("team.directorName")}</p>
          </div>

          {/* Team sections */}
          {teamSections.map((section, si) => (
            <div key={section.key} className="mb-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                {t(`team.section_${section.key}`)}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.members.map((member, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-border p-6 bg-card text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary/30" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{member.name}</h3>
                    <p className="text-xs text-primary font-medium mt-1">{member.role}</p>
                    <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Team;
