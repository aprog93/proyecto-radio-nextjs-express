import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, Filter, Radio, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Programa {
  id: string;
  nombre: string;
  conductor: string | null;
  descripcion: string | null;
  categoria: string | null;
  imagen_url: string | null;
  horario: any;
}

const Programs = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("programas")
      .select("id, nombre, conductor, descripcion, categoria, imagen_url, horario")
      .eq("activo", true)
      .order("nombre")
      .then(({ data }) => {
        setProgramas(data || []);
        setLoading(false);
      });
  }, []);

  const uniqueCategories = [...new Set(programas.map((p) => p.categoria).filter(Boolean))] as string[];

  const filtered = programas.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || (p.conductor || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.categoria === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("programs.title")}</h1>
          <p className="text-muted-foreground mb-10">{t("programs.subtitle")}</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("programs.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <button
                onClick={() => setCategory("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {t("programs.all")}
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  {t(`programs.cat_${cat}`, cat)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t("programs.noResults")}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((program, i) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/30 transition-colors"
                >
                  <div className="h-40 bg-secondary flex items-center justify-center overflow-hidden">
                    {program.imagen_url ? (
                      <img src={program.imagen_url} alt={program.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Radio className="w-12 h-12 text-primary/30" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">{program.nombre}</h3>
                    {program.categoria && (
                      <p className="text-xs text-primary font-medium mb-2">{t(`programs.cat_${program.categoria}`, program.categoria)}</p>
                    )}
                    {program.descripcion && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{program.descripcion}</p>
                    )}
                    {program.conductor && (
                      <span className="text-xs text-muted-foreground">🎙️ {program.conductor}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Programs;
