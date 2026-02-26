import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Radio, Loader2, KeyRound, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Check if this is a recovery flow (user clicked email link)
  const [isRecovery, setIsRecovery] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    // Check URL hash for recovery token
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Error", description: t("resetPassword.minLength", "La contraseña debe tener al menos 6 caracteres"), variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: t("resetPassword.mismatch", "Las contraseñas no coinciden"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setUpdated(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Radio className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl font-bold text-foreground">
            {isRecovery
              ? t("resetPassword.newPasswordTitle", "Nueva contraseña")
              : t("resetPassword.title", "Recuperar contraseña")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRecovery
              ? t("resetPassword.newPasswordSubtitle", "Ingresa tu nueva contraseña")
              : t("resetPassword.subtitle", "Te enviaremos un enlace para restablecer tu contraseña")}
          </p>
        </div>

        <div className="rounded-2xl border border-border p-8 bg-card">
          {updated ? (
            <div className="text-center space-y-4">
              <KeyRound className="w-12 h-12 text-primary mx-auto" />
              <p className="text-foreground font-medium">{t("resetPassword.updated", "¡Contraseña actualizada!")}</p>
              <Link to="/portal" className="inline-block px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                {t("resetPassword.goToPortal", "Ir al portal")}
              </Link>
            </div>
          ) : sent ? (
            <div className="text-center space-y-4">
              <Mail className="w-12 h-12 text-primary mx-auto" />
              <p className="text-foreground font-medium">{t("resetPassword.sent", "¡Enlace enviado!")}</p>
              <p className="text-sm text-muted-foreground">{t("resetPassword.checkEmail", "Revisa tu correo electrónico para continuar.")}</p>
            </div>
          ) : isRecovery ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <input
                type="password" required placeholder={t("resetPassword.newPassword", "Nueva contraseña")}
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="password" required placeholder={t("resetPassword.confirmNew", "Confirmar contraseña")}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {t("resetPassword.update", "Actualizar contraseña")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <input
                type="email" required placeholder={t("auth.email")}
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {t("resetPassword.send", "Enviar enlace")}
              </button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/web/login" className="text-primary hover:underline">{t("resetPassword.backToLogin", "Volver a iniciar sesión")}</Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
