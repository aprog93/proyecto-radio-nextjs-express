import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Radio, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { t } = useTranslation();
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/portal", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      navigate("/portal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Radio className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl font-bold text-foreground">{t("auth.loginTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("auth.loginSubtitle")}</p>
        </div>

        <div className="rounded-2xl border border-border p-8 bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email" required placeholder={t("auth.email")} value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="password" required placeholder={t("auth.password")} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" />
                {t("auth.rememberMe")}
              </label>
              <Link to="/reset-password" className="text-sm text-primary hover:underline">{t("auth.forgotPassword")}</Link>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {t("auth.login")}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-primary hover:underline">{t("auth.registerLink")}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
