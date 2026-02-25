import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Send, MapPin, Phone, Mail, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";

const subjects = ["general", "programs", "advertising", "technical", "other"];

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("contact.title")}</h1>
          <p className="text-muted-foreground mb-12">{t("contact.subtitle")}</p>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 rounded-2xl border border-border p-8 bg-card">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text" required placeholder={t("contact.name")} value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="email" required placeholder={t("contact.email")} value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="tel" placeholder={t("contact.phone")} value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <select
                    required value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">{t("contact.selectSubject")}</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>{t(`contact.subject_${s}`)}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  required placeholder={t("contact.message")} rows={5} value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                  <Send className="w-4 h-4" /> {t("contact.send")}
                </button>
              </form>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-border p-6 bg-card">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-xs text-muted-foreground italic">{t("contact.pendingNote")}</p>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>[Pendiente — dirección real próximamente]</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>[Pendiente — teléfono real próximamente]</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>[Pendiente — email real próximamente]</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>[Pendiente — horarios de atención]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
