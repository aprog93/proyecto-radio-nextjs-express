import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ShoppingCart, Package, DollarSign } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api, Product } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const { data: product, loading, error } = useApi(
    () => id ? api.products.getById(parseInt(id)) : Promise.reject(new Error('No ID provided')),
    { autoFetch: !!id }
  );

  useEffect(() => {
    if (!id) {
      navigate("/shop");
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (quantity < 1) {
      toast({
        title: "Error",
        description: t("shop.invalidQuantity", "Cantidad no válida"),
        variant: "destructive"
      });
      return;
    }

    // Retrieve existing cart from localStorage
    const cartJson = localStorage.getItem('shopping_cart');
    const cart = cartJson ? JSON.parse(cartJson) : [];

    // Add or update product in cart
    const existingItem = cart.find((item: any) => item.product.id === product!.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product: product!, quantity });
    }

    // Save to localStorage
    localStorage.setItem('shopping_cart', JSON.stringify(cart));

    toast({
      title: t("shop.addedToCart", "¡Agregado al carrito!"),
      description: `${quantity} x ${product!.name}`
    });

    // Reset quantity
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" /> {t("common.back", "Volver")}
            </Link>
            <div className="rounded-lg p-8 bg-destructive/10 border border-destructive/20">
              <p className="text-destructive">
                {typeof error === 'object' && error !== null && "message" in error
                  ? (error as any).message
                  : t("common.notFound", "Producto no encontrado")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const maxQuantity = Math.min(quantity + product.stock - 1, product.stock);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> {t("common.back", "Volver")}
          </Link>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div>
              {product.image ? (
                <div className="rounded-2xl overflow-hidden h-96 md:h-full">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="rounded-2xl bg-secondary h-96 md:h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-primary/20" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-8">
                <h1 className="font-display text-4xl font-bold text-foreground mb-2">{product.name}</h1>
                {product.category && (
                  <p className="text-sm text-primary font-semibold mb-4">{product.category}</p>
                )}

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-display text-3xl font-bold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>

                {product.description && (
                  <div className="text-foreground leading-relaxed space-y-3 mb-8">
                    <div
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </div>
                )}
              </div>

              {/* Stock Info */}
              <div className="mb-8 p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {t("shop.stock", "Disponible")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isOutOfStock
                    ? t("shop.outOfStock", "Sin stock")
                    : `${product.stock} ${t("shop.units", "unidades disponibles")}`}
                </p>
              </div>

              {/* Add to Cart Section */}
              {!isOutOfStock && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t("shop.quantity", "Cantidad")}
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-border hover:bg-secondary transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-16 px-3 py-2 rounded-lg bg-secondary border border-border text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 rounded-lg border border-border hover:bg-secondary transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4 bg-card">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">{t("shop.subtotal", "Subtotal")}</span>
                      <span className="font-semibold text-foreground">${(product.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t("shop.addToCart", "Agregar al carrito")}
                  </button>

                  <Link
                    to="/shop/cart"
                    className="w-full flex items-center justify-center px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary/50 transition-colors"
                  >
                    {t("shop.viewCart", "Ver carrito")}
                  </Link>
                </div>
              )}

              {isOutOfStock && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-destructive font-semibold">{t("shop.outOfStock", "Sin stock")}</p>
                  <p className="text-sm text-destructive/80">{t("shop.checkBackLater", "Vuelve más tarde")}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
