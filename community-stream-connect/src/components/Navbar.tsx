import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Menu, X, Globe, ShoppingCart, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.png";

const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [whoWeAreOpen, setWhoWeAreOpen] = useState(false);

  const mainLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/now-playing", label: t("nav.nowPlaying") },
    { to: "/programas", label: t("nav.programs") },
    { to: "/programacion", label: t("nav.schedule") },
    { to: "/event", label: t("nav.events") },
    { to: "/shop", label: t("nav.shop") },
    { to: "/blog", label: t("nav.blog") },
  ];

  const whoWeAreLinks = [
    { to: "/historia", label: t("nav.history") },
    { to: "/como-participar", label: t("nav.howTo") },
    { to: "/apoyanos", label: t("nav.support") },
    { to: "/about-us", label: t("nav.team") },
  ];

  const isActive = (path: string) => location.pathname === path;

  const authLink = user
    ? { to: "/portal", label: t("portal.title") }
    : { to: "/web/login", label: t("nav.login") };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <img src={logo} alt="Proyecto Radio" className="h-8 w-auto" />
          <span className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors hidden sm:inline">
            Proyecto Radio
          </span>
        </Link>

        <div className="hidden xl:flex items-center gap-0.5">
          {mainLinks.map((link) => (
            <Link key={link.to} to={link.to} className={`px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              {link.label}
            </Link>
          ))}

          <div className="relative">
            <button onClick={() => setWhoWeAreOpen(!whoWeAreOpen)} onBlur={() => setTimeout(() => setWhoWeAreOpen(false), 200)} className={`flex items-center gap-1 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${whoWeAreLinks.some((l) => isActive(l.to)) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              {t("nav.whoWeAre")}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${whoWeAreOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {whoWeAreOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute left-0 mt-1 glass rounded-lg overflow-hidden min-w-[180px] shadow-lg">
                  {whoWeAreLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setWhoWeAreOpen(false)} className={`block px-4 py-2.5 text-sm transition-colors ${isActive(link.to) ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}>
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/contactus" className={`px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/contactus") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
            {t("nav.contact")}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} onBlur={() => setTimeout(() => setLangOpen(false), 200)} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Globe className="w-4 h-4" />
              <span className="uppercase text-xs">{i18n.language.slice(0, 2)}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 mt-1 glass rounded-lg overflow-hidden min-w-[140px] shadow-lg">
                  {languages.map((lang) => (
                    <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm transition-colors ${i18n.language.startsWith(lang.code) ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}>
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/shop/cart" className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative">
            <ShoppingCart className="w-4 h-4" />
          </Link>

          <Link
            to={authLink.to}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <User className="w-3.5 h-3.5" />
            {authLink.label}
          </Link>

          <button className="xl:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="xl:hidden glass border-t border-border overflow-hidden">
            <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {mainLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  {link.label}
                </Link>
              ))}
              <div className="pl-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("nav.whoWeAre")}</div>
              {whoWeAreLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={`block px-3 py-2 pl-6 rounded-md text-sm font-medium transition-colors ${isActive(link.to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  {link.label}
                </Link>
              ))}
              <Link to="/contactus" onClick={() => setMobileOpen(false)} className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/contactus") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {t("nav.contact")}
              </Link>
              <Link to={authLink.to} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-primary">
                {authLink.label}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
