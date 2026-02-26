import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Users, Globe, Sparkles, ChevronLeft, ChevronRight, BookOpen, Palette, Landmark, Sprout, PartyPopper, Leaf, Radio, Calendar, ArrowRight } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import heroImage from "@/assets/hero-radio.jpg";
import { useState, useEffect, useCallback } from "react";

/* ── Hero slides ── */
const useHeroSlides = () => {
  const { t } = useTranslation();
  return [
    { title: t("hero.title"), subtitle: t("hero.subtitle"), desc: t("hero.description"), cta: t("nav.contact"), ctaLink: "/contactus" },
    { title: t("home.latestNews"), subtitle: t("blog.subtitle"), desc: t("blog.subtitle"), cta: t("home.viewAll"), ctaLink: "/blog" },
    { title: t("home.featuredPrograms"), subtitle: t("programs.subtitle"), desc: t("programs.subtitle"), cta: t("home.viewAll"), ctaLink: "/programas" },
  ];
};

/* ── Programs data ── */
const programsPreview = [
  { id: "termometro", name: "El Termómetro", format: "Encuesta callejera y sondeo de opinión radiofónico", meta: "Diagnosticar democráticamente las prioridades de la comunidad", schedule: "Lun-Mié 10:00-11:00" },
  { id: "sin-filtro", name: "Sin Filtro", format: "Panel de jóvenes con agenda libre", meta: "Plataforma auténtica para que la juventud hable de lo que le importa", schedule: "Jue 16:00-17:30" },
  { id: "deporte-total", name: "Deporte Total", format: "Narración deportiva local", meta: "Celebrar el deporte como espacio de cohesión social", schedule: "Sáb-Dom 14:00-16:00" },
];

const Home = () => {
  const { t } = useTranslation();
  const { togglePlay, isPlaying } = usePlayer();

  /* ── Carousel state ── */
  const slides = useHeroSlides();
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  /* ── Thematic axes ── */
  const axes = [
    { icon: BookOpen, key: "education" },
    { icon: Palette, key: "culture" },
    { icon: Landmark, key: "citizen" },
    { icon: Sprout, key: "youth" },
    { icon: PartyPopper, key: "festivals" },
    { icon: Leaf, key: "environment" },
  ];

  return (
    <div>
      {/* ═══ HERO CAROUSEL ═══ */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img src={heroImage} alt="Proyecto Radio" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

        <motion.div
          key={current}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-4 max-w-3xl"
        >
          <h1 className="font-display text-5xl md:text-7xl font-bold text-gradient mb-4">
            {slides[current].title}
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 font-light mb-3">
            {slides[current].subtitle}
          </p>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {slides[current].desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {current === 0 ? (
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow"
              >
                <Play className="w-5 h-5" />
                {isPlaying ? "⏸" : t("hero.listenNow")}
              </button>
            ) : null}
            <Link
              to={slides[current].ctaLink}
              className="flex items-center gap-2 px-8 py-3 rounded-full border border-border text-foreground hover:bg-secondary transition-colors"
            >
              {slides[current].cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Carousel controls */}
        <button onClick={prev} className="absolute left-4 z-20 p-2 rounded-full bg-background/50 text-foreground hover:bg-background/80 transition-colors" aria-label="Previous slide">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={next} className="absolute right-4 z-20 p-2 rounded-full bg-background/50 text-foreground hover:bg-background/80 transition-colors" aria-label="Next slide">
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-foreground/30"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ═══ FEATURED PROGRAMS ═══ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground">{t("home.featuredPrograms")}</h2>
            <Link to="/programas" className="text-sm text-primary hover:underline flex items-center gap-1">
              {t("home.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {programsPreview.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/30 transition-colors"
              >
                <div className="h-36 bg-secondary flex items-center justify-center">
                  <Radio className="w-12 h-12 text-primary/30" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{p.name}</h3>
                  <p className="text-xs text-primary font-medium mb-2">{p.format}</p>
                  <p className="text-sm text-muted-foreground mb-3">{p.meta}</p>
                  <span className="text-xs text-muted-foreground">🕐 {p.schedule}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THEMATIC AXES ═══ */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-14">
            {t("home.thematicAxes")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {axes.map((axis, i) => (
              <motion.div
                key={axis.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-secondary/50 border border-border"
              >
                <axis.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  {t(`home.axis_${axis.key}`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`home.axis_${axis.key}Items`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LATEST NEWS (placeholder) ═══ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground">{t("home.latestNews")}</h2>
            <Link to="/blog" className="text-sm text-primary hover:underline flex items-center gap-1">
              {t("home.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="h-40 bg-secondary flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="p-6">
                  <span className="text-xs text-primary font-medium">{t("blog.subtitle")}</span>
                  <h3 className="font-display text-base font-semibold text-foreground mt-1 mb-2">
                    Noticia de ejemplo #{n}
                  </h3>
                  <p className="text-sm text-muted-foreground">Contenido próximamente cuando se conecte el CMS.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ UPCOMING EVENTS (placeholder) ═══ */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground">{t("home.upcomingEvents")}</h2>
            <Link to="/event" className="text-sm text-primary hover:underline flex items-center gap-1">
              {t("home.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-border bg-secondary/30 overflow-hidden">
                <div className="h-36 bg-secondary flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="p-6">
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium mb-2">
                    {t("events.upcoming")}
                  </span>
                  <h3 className="font-display text-base font-semibold text-foreground mb-2">
                    Evento comunitario #{n}
                  </h3>
                  <p className="text-sm text-muted-foreground">Próximamente con datos reales.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLOSING ═══ */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("home.closingMessage")}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow"
              >
                <Play className="w-5 h-5" />
                {isPlaying ? "⏸" : t("hero.listenNow")}
              </button>
              <Link
                to="/como-participar"
                className="flex items-center gap-2 px-8 py-3 rounded-full border border-border text-foreground hover:bg-secondary transition-colors"
              >
                {t("nav.howTo")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
