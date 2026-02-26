import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, Newspaper, Clock, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";

const News = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch news from backend
  const { data: newsData, loading, error } = useApi(
    () => api.news.getPublished(page, 12, search || undefined),
    { autoFetch: true, deps: [page, search] }
  );

  const newsList = useMemo(() => newsData?.news || [], [newsData?.news]);
  const total = useMemo(() => newsData?.total || 0, [newsData?.total]);
  const totalPages = Math.ceil(total / 12);

  if (error) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold">{t("news.error") || "Error cargando noticias"}</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("news.title")}</h1>
          <p className="text-muted-foreground mb-10">{t("news.subtitle")}</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("news.searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : newsList.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t("news.noResults") || "No se encontraron noticias."}</p>
          ) : (
            <>
              <div className="space-y-6">
                {newsList.map((article, i) => (
                  <Link key={article.id} to={`/news/${article.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors group cursor-pointer flex flex-col sm:flex-row"
                    >
                      <div className="h-48 sm:h-auto sm:w-48 flex-shrink-0 bg-secondary flex items-center justify-center overflow-hidden">
                        {article.image ? (
                          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                        ) : (
                          <Newspaper className="w-12 h-12 text-primary/30" />
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                          {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                          {article.viewCount && <span className="text-xs text-muted-foreground">{article.viewCount} vistas</span>}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-50 hover:opacity-80 transition-opacity"
                  >
                    {t("common.previous") || "Anterior"}
                  </button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-50 hover:opacity-80 transition-opacity"
                  >
                    {t("common.next") || "Siguiente"}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default News;
