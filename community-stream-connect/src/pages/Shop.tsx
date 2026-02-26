import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ShoppingBag, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  descripcion: string | null;
}

const Shop = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("productos")
      .select("id, nombre, precio, imagen_url, descripcion")
      .eq("activo", true)
      .order("nombre")
      .then(({ data }) => {
        setProductos(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = productos.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("shop.title")}</h1>
          <p className="text-muted-foreground mb-10">{t("shop.subtitle")}</p>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("shop.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No hay productos disponibles.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <div className="h-48 bg-secondary flex items-center justify-center overflow-hidden">
                    {product.imagen_url ? (
                      <img src={product.imagen_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-primary/30" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">{product.nombre}</h3>
                    {product.descripcion && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.descripcion}</p>
                    )}
                    <p className="text-xl font-bold text-primary mb-4">${Number(product.precio).toFixed(2)}</p>
                    <button className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                      {t("shop.addToCart")}
                    </button>
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

export default Shop;
