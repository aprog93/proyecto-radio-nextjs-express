import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, Newspaper, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Noticia {
  id: string;
  titulo: string;
  extracto: string | null;
  imagen_url: string | null;
  publicado_en: string | null;
  slug: string;
  categoria_id: string | null;
}

interface Categoria {
  id: string;
  nombre: string;
}

const Blog = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [noticiasRes, categoriasRes] = await Promise.all([
        supabase.from("noticias").select("id, titulo, extracto, imagen_url, publicado_en, slug, categoria_id").eq("estado", "publicado").order("publicado_en", { ascending: false }),
        supabase.from("categorias").select("id, nombre"),
      ]);
      setNoticias(noticiasRes.data || []);
      setCategorias(categoriasRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = noticias.filter((a) => {
    const matchSearch = a.titulo.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || a.categoria_id === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("blog.title")}</h1>
          <p className="text-muted-foreground mb-10">{t("blog.subtitle")}</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("blog.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {t("blog.all")}
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No se encontraron noticias.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors group"
                >
                  <div className="h-44 bg-secondary flex items-center justify-center overflow-hidden">
                    {article.imagen_url ? (
                      <img src={article.imagen_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Newspaper className="w-12 h-12 text-primary/30" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1 mb-2 group-hover:text-primary transition-colors">
                      {article.titulo}
                    </h3>
                    {article.extracto && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{article.extracto}</p>
                    )}
                    {article.publicado_en && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {new Date(article.publicado_en).toLocaleDateString()}
                      </span>
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

export default Blog;
