import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileSettings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("es");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, bio, preferred_language")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setBio(data.bio || "");
          setPreferredLanguage(data.preferred_language || "es");
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio,
        preferred_language: preferredLanguage,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("profileSettings.saved", "Perfil actualizado") });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("profileSettings.back", "Volver al portal")}
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t("profileSettings.title", "Configuración")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t("profileSettings.subtitle", "Edita tu perfil y preferencias")}
          </p>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("profileSettings.displayName", "Nombre")}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("profileSettings.bio", "Bio")}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("profileSettings.language", "Idioma preferido")}
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div className="pt-2">
              <Link
                to="/reset-password"
                className="text-sm text-primary hover:underline"
              >
                {t("profileSettings.changePassword", "Cambiar contraseña")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t("profileSettings.save", "Guardar cambios")}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettings;
