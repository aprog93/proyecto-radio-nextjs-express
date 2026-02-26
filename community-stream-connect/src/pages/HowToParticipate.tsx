import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Phone, Mic, GraduationCap, Radio, Send, HelpCircle } from "lucide-react";
import { useState } from "react";

const steps = [
  { icon: Phone, key: "step1" },
  { icon: Mic, key: "step2" },
  { icon: GraduationCap, key: "step3" },
  { icon: Radio, key: "step4" },
];

const participationTypes = [
  "locutor",
  "productor",
  "colaborador",
  "voluntario",
  "tecnico",
];

const HowToParticipate = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", type: "", experience: "", proposal: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will connect to backend
    setFormData({ name: "", email: "", phone: "", type: "", experience: "", proposal: "" });
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("howTo.title")}</h1>
          <p className="text-muted-foreground mb-12">{t("howTo.subtitle")}</p>

          {/* Intro */}
          <div className="rounded-2xl border border-border p-8 bg-card mb-12 text-center">
            <p className="text-lg text-foreground/90 leading-relaxed">{t("howTo.intro")}</p>
          </div>

          {/* Stepper */}
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">{t("howTo.processTitle")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border p-6 bg-card text-center relative"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {i + 1}
                </div>
                <step.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-display text-sm font-semibold text-foreground mb-1">
                  {t(`howTo.${step.key}Title`)}
                </h3>
                <p className="text-xs text-muted-foreground">{t(`howTo.${step.key}Desc`)}</p>
              </motion.div>
            ))}
          </div>

          {/* Application Form */}
          <div className="rounded-2xl border border-border p-8 bg-card mb-12">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">{t("howTo.formTitle")}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text" required placeholder={t("howTo.name")} value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="email" required placeholder={t("howTo.email")} value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="tel" placeholder={t("howTo.phone")} value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <select
                  required value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">{t("howTo.selectType")}</option>
                  {participationTypes.map((type) => (
                    <option key={type} value={type}>{t(`howTo.type_${type}`, type)}</option>
                  ))}
                </select>
              </div>
              <input
                type="text" placeholder={t("howTo.experience")} value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <textarea
                placeholder={t("howTo.proposal")} rows={4} value={formData.proposal}
                onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4" /> {t("howTo.submit")}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="rounded-2xl border border-border p-8 bg-card">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" /> {t("howTo.faqTitle")}
            </h2>
            <p className="text-muted-foreground text-sm">{t("howTo.faqPlaceholder")}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowToParticipate;
