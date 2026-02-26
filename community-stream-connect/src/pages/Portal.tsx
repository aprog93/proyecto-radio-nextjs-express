import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, ShoppingBag, Calendar, Heart, Settings, LogOut, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";

const portalSections = [
  { key: "orders", icon: ShoppingBag, to: "#" },
  { key: "events", icon: Calendar, to: "#" },
  { key: "favorites", icon: Heart, to: "#" },
  { key: "settings", icon: Settings, to: "/portal/settings" },
];

const Portal = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch user profile from backend
  const { data: profileData, loading: profileLoading, error: profileError } = useApi(
    () => api.users.getProfile(),
    { autoFetch: isAuthenticated }
  );

  const profile = profileData?.profile;
  const userData = profileData?.user;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/web/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : user?.displayName || user?.email;

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
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary/40" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-semibold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {profile && (
                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                  {profile.phone && <p>📱 {profile.phone}</p>}
                  {profile.city && <p>📍 {profile.city}, {profile.country || ""}</p>}
                </div>
              )}
            </div>
            <Link
              to="/portal/settings"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t("portal.editProfile") || "Editar perfil"}
            </Link>
          </div>

          {profileError && (
            <div className="p-4 mb-8 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-destructive text-sm">{profileError.message}</p>
            </div>
          )}

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

