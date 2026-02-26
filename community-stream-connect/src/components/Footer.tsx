import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t, i18n } = useTranslation();

  const quickLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/programas", label: t("nav.programs") },
    { to: "/programacion", label: t("nav.schedule") },
    { to: "/blog", label: t("nav.blog") },
  ];

  const aboutLinks = [
    { to: "/historia", label: t("nav.history") },
    { to: "/about-us", label: t("nav.team") },
    { to: "/apoyanos", label: t("nav.support") },
    { to: "/como-participar", label: t("nav.howTo") },
  ];

  const socials = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "X / Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="border-t border-border bg-card pb-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Logo + slogan + RRSS */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={logo} alt="Proyecto Radio" className="h-8 w-auto" />
              <span className="font-display font-bold text-foreground">Proyecto Radio</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">{t("footer.slogan")}</p>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label={s.label}>
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick nav */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">{t("footer.quickNav")}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: About */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">{t("nav.whoWeAre")}</h3>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">{t("nav.contact")}</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="italic">[Pendiente — datos reales próximamente]</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Proyecto Radio. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-2 text-xs">
            {["es", "en", "fr"].map((lang) => (
              <button
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`uppercase transition-colors ${
                  i18n.language.startsWith(lang) ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {t("nav.terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
