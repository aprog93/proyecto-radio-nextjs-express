import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Calendar, User, Tag } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useEffect } from "react";

const BlogDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: blog, loading, error } = useApi(
    () => slug ? api.blogs.getBySlug(slug) : Promise.reject(new Error('No slug provided')),
    { autoFetch: !!slug }
  );

  useEffect(() => {
    if (!slug) {
      navigate("/blog");
    }
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" /> {t("common.back", "Volver")}
            </Link>
            <div className="rounded-lg p-8 bg-destructive/10 border border-destructive/20">
              <p className="text-destructive">
                {typeof error === 'object' && error !== null && "message" in error
                  ? (error as any).message
                  : t("common.notFound", "Contenido no encontrado")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const publishDate = new Date(blog.createdAt).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> {t("common.back", "Volver")}
          </Link>

          {blog.image && (
            <div className="mb-8 rounded-2xl overflow-hidden h-96">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">{blog.title}</h1>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {publishDate}
              </div>
              {blog.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {blog.author}
                </div>
              )}
              {blog.category && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {blog.category}
                </div>
              )}
            </div>

            {blog.excerpt && (
              <p className="text-lg text-muted-foreground italic mb-8">{blog.excerpt}</p>
            )}
          </div>

          <div className="prose prose-invert max-w-none mb-12 text-foreground">
            <div
              className="text-base leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: blog.content || "" }}
            />
          </div>

          {blog.tags && (
            <div className="flex flex-wrap gap-2 pt-8 border-t border-border">
              {blog.tags.split(",").map((tag) => (
                <span
                  key={tag.trim()}
                  className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetail;
