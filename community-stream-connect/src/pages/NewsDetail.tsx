import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Calendar, Eye } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useEffect } from "react";

const NewsDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: article, loading, error } = useApi(
    () => id ? api.news.getById(parseInt(id)) : Promise.reject(new Error('No ID provided')),
    { autoFetch: !!id }
  );

  useEffect(() => {
    if (!id) {
      navigate("/news");
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" /> {t("common.back", "Volver")}
            </Link>
            <div className="rounded-lg p-8 bg-destructive/10 border border-destructive/20">
              <p className="text-destructive">
                {typeof error === 'object' && error !== null && "message" in error
                  ? (error as any).message
                  : t("common.notFound", "Noticia no encontrada")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const publishDate = new Date(article.createdAt).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> {t("common.back", "Volver")}
          </Link>

          {article.image && (
            <div className="mb-8 rounded-2xl overflow-hidden h-96">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">{article.title}</h1>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {publishDate}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {article.viewCount || 0} {t("common.views", "vistas")}
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-12 text-foreground">
            <div
              className="text-base leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />
          </div>

          {article.expiresAt && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
              {t("news.expiresAt", "Esta noticia expira el")} {new Date(article.expiresAt).toLocaleDateString()}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsDetail;
