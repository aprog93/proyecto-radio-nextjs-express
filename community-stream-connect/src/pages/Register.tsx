import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Radio, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const { t } = useTranslation();
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/portal", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.name);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      toast({ title: "¡Cuenta creada!", description: "Revisa tu email para confirmar tu cuenta." });
      navigate("/web/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Radio className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl font-bold text-foreground">{t("auth.registerTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("auth.registerSubtitle")}</p>
        </div>

        <div className="rounded-2xl border border-border p-8 bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" required placeholder={t("auth.name")} value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="email" required placeholder={t("auth.email")} value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="password" required placeholder={t("auth.password")} value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="password" required placeholder={t("auth.confirmPassword")} value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {t("auth.register")}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth.hasAccount")}{" "}
            <Link to="/web/login" className="text-primary hover:underline">{t("auth.loginLink")}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
