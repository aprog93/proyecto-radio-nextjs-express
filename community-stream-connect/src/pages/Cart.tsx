import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

const Cart = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("shop.cartTitle")}</h1>
          <p className="text-muted-foreground mb-10">{t("shop.cartSubtitle")}</p>

          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{t("shop.cartEmpty")}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
