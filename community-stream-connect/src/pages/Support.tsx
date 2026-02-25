import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, CreditCard, Bitcoin, Users, Share2, Megaphone, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const amounts = [5, 10, 25, 50];

const tiers = [
  { key: "listener", icon: "🎧", min: 5 },
  { key: "collaborator", icon: "🤝", min: 10 },
  { key: "patron", icon: "⭐", min: 25 },
  { key: "founder", icon: "🏆", min: 50 },
];

const Support = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [donated, setDonated] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleDonate = async (method: string) => {
    if (!finalAmount || finalAmount <= 0) {
      toast({ title: "Error", description: "Selecciona un monto válido", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("donaciones").insert({
      monto: finalAmount,
      mensaje: mensaje || null,
      anonimo,
      user_id: user?.id || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDonated(true);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-14">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("support.title")}</h1>
            <p className="text-muted-foreground">{t("support.subtitle")}</p>
          </div>

          {/* Donation Widget */}
          <div className="rounded-2xl border border-border p-8 bg-card mb-10">
            {donated ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <h2 className="font-display text-2xl font-bold text-foreground">{t("donate.thankYou")}</h2>
                <p className="text-muted-foreground">Tu donación de ${finalAmount.toFixed(2)} ha sido registrada.</p>
                <button onClick={() => setDonated(false)} className="text-sm text-primary hover:underline">
                  Hacer otra donación
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">{t("support.chooseAmount")}</h2>

                <div className="flex flex-wrap gap-3 mb-4">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        selectedAmount === amount && !customAmount
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    placeholder={t("support.customAmount")}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-32"
                  />
                </div>

                {/* Message */}
                <textarea
                  placeholder="Mensaje (opcional)"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-4"
                />

                {/* Anonymous toggle */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setAnonimo(!anonimo)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${anonimo ? "bg-primary" : "bg-secondary border border-border"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${anonimo ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm text-muted-foreground">Donación anónima</span>
                </div>

                {/* Payment methods */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { key: "paypal", icon: <CreditCard className="w-6 h-6" /> },
                    { key: "stripe", icon: <CreditCard className="w-6 h-6" /> },
                    { key: "crypto", icon: <Bitcoin className="w-6 h-6" /> },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => handleDonate(m.key)}
                      disabled={saving}
                      className="flex flex-col items-center gap-2 p-6 rounded-xl border border-border bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer group disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : (
                        <div className="text-primary group-hover:scale-110 transition-transform">{m.icon}</div>
                      )}
                      <span className="text-sm font-semibold text-foreground">{t(`support.${m.key}`)}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tiers */}
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">{t("support.tiersTitle")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border p-6 bg-card text-center"
              >
                <span className="text-3xl mb-3 block">{tier.icon}</span>
                <h3 className="font-display text-sm font-semibold text-foreground mb-1">{t(`support.tier_${tier.key}`)}</h3>
                <p className="text-xs text-muted-foreground">{t("support.from")} ${tier.min}/mo</p>
              </motion.div>
            ))}
          </div>

          {/* Other ways */}
          <div className="rounded-2xl border border-border p-8 bg-card">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">{t("support.otherWays")}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Users, key: "volunteer" },
                { icon: Share2, key: "share" },
                { icon: Megaphone, key: "advertise" },
              ].map((item) => (
                <div key={item.key} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{t(`support.other_${item.key}`)}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t(`support.other_${item.key}Desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;
