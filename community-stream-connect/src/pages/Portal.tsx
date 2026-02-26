import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, ShoppingBag, Calendar, Heart, Settings, LogOut, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const portalSections = [
  { key: "orders", icon: ShoppingBag, to: "#" },
  { key: "events", icon: Calendar, to: "#" },
  { key: "favorites", icon: Heart, to: "#" },
  { key: "settings", icon: Settings, to: "/portal/settings" },
];

const Portal = () => {
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/web/login", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">{t("portal.title")}</h1>
              <p className="text-muted-foreground mt-1">{t("portal.subtitle")}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
            >
              <LogOut className="w-4 h-4" /> {t("portal.logout")}
            </button>
          </div>

          <div className="rounded-2xl border border-border p-8 bg-card mb-8 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary/40" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                {profile?.display_name || user.email}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {portalSections.map((section, i) => (
              <motion.div key={section.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={section.to} className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors group">
                  <section.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{t(`portal.${section.key}`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`portal.${section.key}Desc`)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Portal;
