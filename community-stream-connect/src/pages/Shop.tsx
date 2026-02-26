import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ShoppingBag, Search, Loader2, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";
import { api, Product as ProductType } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  product: ProductType;
  quantity: number;
}

const Shop = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [page, setPage] = useState(1);

  // Fetch products from backend
  const { data: productsData, loading, error } = useApi(
    () => api.products.getPublished(page, 12, categoryFilter !== "all" ? categoryFilter : undefined, search || undefined),
    { autoFetch: true, deps: [page, categoryFilter, search] }
  );

  const products = useMemo(() => productsData?.products || [], [productsData?.products]);
  const total = useMemo(() => productsData?.total || 0, [productsData?.total]);
  const totalPages = Math.ceil(total / 12);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((product) => {
      if (product.category) cats.add(product.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  // Calculate cart totals
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: ProductType) => {
    if (product.stock <= 0) {
      toast({ title: "Error", description: "Producto sin stock", variant: "destructive" });
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({ title: "Aviso", description: "No hay más stock disponible", variant: "destructive" });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    toast({ title: "¡Agregado!", description: `${product.name} fue agregado al carrito` });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    toast({ title: "Removido", description: "Producto removido del carrito" });
  };

  if (error) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold">{t("shop.error") || "Error cargando productos"}</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("shop.title")}</h1>
              <p className="text-muted-foreground">{t("shop.subtitle")}</p>
            </div>
            {cartItemCount > 0 && (
              <div className="text-right p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">{t("shop.cart") || "Carrito"}</p>
                <p className="text-2xl font-bold text-primary">${cartTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{cartItemCount} artículos</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("shop.searchPlaceholder")}
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
                {t("shop.all")}
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
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t("shop.noResults") || "No hay productos disponibles."}</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, i) => {
                  const cartItem = cart.find((item) => item.product.id === product.id);
                  const inCart = cartItem ? cartItem.quantity : 0;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors flex flex-col"
                    >
                      <div className="h-48 bg-secondary flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-12 h-12 text-primary/30" />
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="font-display text-lg font-semibold text-foreground mb-2">{product.name}</h3>
                        {product.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{product.description}</p>}

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <p className="text-xl font-bold text-primary">{product.price.toFixed(2)}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                            {product.stock > 0 ? `${product.stock} en stock` : "Sin stock"}
                          </span>
                        </div>

                        {inCart > 0 ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRemoveFromCart(product.id)}
                              className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors text-sm font-semibold"
                            >
                              Remover
                            </button>
                            <div className="flex items-center justify-center bg-primary/10 px-3 rounded-lg min-w-[60px]">
                              <span className="text-primary font-bold">{inCart}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                            className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t("shop.addToCart")}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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

export default Shop;

