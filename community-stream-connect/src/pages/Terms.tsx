import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-12">{t("terms.title")}</h1>

          <div className="space-y-10">
            <div className="rounded-2xl border border-border p-8 bg-card">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">{t("terms.termsTitle")}</h2>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
                <p>Proyecto Radio es una plataforma comunitaria de radio digital. Al utilizar nuestros servicios, aceptas los siguientes términos.</p>
                <p>Proyecto Radio is a digital community radio platform. By using our services, you agree to the following terms.</p>
                <p>Proyecto Radio est une plateforme de radio communautaire numérique. En utilisant nos services, vous acceptez les conditions suivantes.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border p-8 bg-card">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">{t("terms.privacyTitle")}</h2>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
                <p>Respetamos tu privacidad. No compartimos datos personales con terceros sin tu consentimiento.</p>
                <p>We respect your privacy. We do not share personal data with third parties without your consent.</p>
                <p>Nous respectons votre vie privée. Nous ne partageons pas vos données personnelles avec des tiers sans votre consentement.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
