import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, Newspaper, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { SkeletonArticleCard } from "@/components/ui/skeleton";

const Blog = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch blogs from backend
  const { data: blogsData, loading, error } = useApi(
    () => api.blogs.getPublished(page, 12, categoryFilter !== "all" ? categoryFilter : undefined, search || undefined),
    { autoFetch: true, deps: [page, categoryFilter, search] }
  );

  const blogs = useMemo(() => blogsData?.blogs || [], [blogsData?.blogs]);
  const total = useMemo(() => blogsData?.total || 0, [blogsData?.total]);
  const totalPages = Math.ceil(total / 12);

  // Extract unique categories from blogs
  const categories = useMemo(() => {
    const cats = new Set<string>();
    blogs.forEach((blog) => {
      if (blog.category) cats.add(blog.category);
    });
    return Array.from(cats).sort();
  }, [blogs]);

  if (error) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold">{t("blog.error") || "Error cargando blogs"}</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setCategoryFilter("all");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {t("blog.all")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonArticleCard key={i} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t("blog.noResults") || "No se encontraron blogs."}</p>
           ) : (
             <>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {blogs.map((article, i) => (
                   <Link key={article.id} to={`/blog/${article.slug}`}>
                     <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors group cursor-pointer h-full"
                     >
                       <div className="h-44 bg-secondary flex items-center justify-center overflow-hidden">
                         {article.image ? (
                           <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                         ) : (
                           <Newspaper className="w-12 h-12 text-primary/30" />
                         )}
                       </div>
                       <div className="p-6">
                         <h3 className="font-display text-lg font-semibold text-foreground mt-1 mb-2 group-hover:text-primary transition-colors">
                           {article.title}
                         </h3>
                         {article.excerpt && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>}
                         <div className="flex items-center justify-between">
                           {article.publishedAt && (
                             <span className="flex items-center gap-1 text-xs text-muted-foreground">
                               <Clock className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString()}
                             </span>
                           )}
                           {article.viewCount && <span className="text-xs text-muted-foreground">{article.viewCount} visitas</span>}
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

export default Blog;
