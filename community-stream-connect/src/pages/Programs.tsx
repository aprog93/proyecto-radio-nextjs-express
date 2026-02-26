import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, Filter, Radio, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { ScheduleEvent } from "@/lib/api";

const Programs = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Fetch schedule events from backend
  const { data: scheduleData, loading, error } = useApi(
    () => api.schedule.getAll(),
    { autoFetch: true }
  );

  const programs = useMemo(() => scheduleData || [], [scheduleData]);

  // Extract unique categories from programs (using title for simplicity)
  const uniqueCategories = useMemo(() => {
    // Group programs by day of week for category filtering
    const days = new Set(programs.map((p) => p.dayOfWeek));
    return Array.from(days).sort() as number[];
  }, [programs]);

  // Filter programs by search and category (day)
  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                         (p.host || "").toLowerCase().includes(search.toLowerCase());
      const matchDay = category === "all" || p.dayOfWeek === parseInt(category);
      return matchSearch && matchDay;
    });
  }, [programs, search, category]);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("programs.title")}</h1>
          <p className="text-muted-foreground mb-10">{t("programs.subtitle")}</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("programs.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <button
                onClick={() => setCategory("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {t("programs.all")}
              </button>
              {uniqueCategories.map((day) => (
                <button
                  key={day}
                  onClick={() => setCategory(day.toString())}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === day.toString() ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  {t(`common.day_${day}`, `Day ${day}`)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 mb-8 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-destructive text-sm">{typeof error === 'object' ? error.message : String(error)}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t("programs.noResults")}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((program, i) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/30 transition-colors"
                >
                  <div className="h-40 bg-secondary flex items-center justify-center overflow-hidden">
                    {program.image ? (
                      <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
                    ) : (
                      <Radio className="w-12 h-12 text-primary/30" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">{program.title}</h3>
                    <p className="text-xs text-primary font-medium mb-2">
                      {t(`common.day_${program.dayOfWeek}`, `Day ${program.dayOfWeek}`)} • {program.startTime} - {program.endTime}
                    </p>
                    {program.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{program.description}</p>
                    )}
                    {program.host && (
                      <span className="text-xs text-muted-foreground">🎙️ {program.host}</span>
                    )}
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

export default Programs;
