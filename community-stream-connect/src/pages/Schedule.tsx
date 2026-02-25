import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useState } from "react";

const days = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
const dayLabelsEs: Record<string, string> = { lun: "Lunes", mar: "Martes", mie: "Miércoles", jue: "Jueves", vie: "Viernes", sab: "Sábado", dom: "Domingo" };

type Slot = { start: string; end: string; program: string; host: string; category: string; days: string[] };

const slots: Slot[] = [
  { start: "06:00", end: "09:00", program: "Bonjour le Monde", host: "Marie L.", category: "cultura", days: ["lun", "mar", "mie", "jue", "vie"] },
  { start: "09:00", end: "10:00", program: "Morning Vibes", host: "James K.", category: "musica", days: ["lun", "mar", "mie", "jue", "vie"] },
  { start: "10:00", end: "11:00", program: "El Termómetro", host: "Equipo VdR", category: "opinion", days: ["lun", "mie"] },
  { start: "11:00", end: "12:00", program: "Rincón Educativo", host: "Laura P.", category: "educacion", days: ["lun", "mar", "mie", "jue", "vie"] },
  { start: "12:00", end: "14:00", program: "Ritmo Latino", host: "Carlos M.", category: "musica", days: ["lun", "mar", "mie", "jue", "vie"] },
  { start: "14:00", end: "16:00", program: "Deporte Total", host: "Equipo Deportivo", category: "deportes", days: ["sab", "dom"] },
  { start: "16:00", end: "17:30", program: "Sin Filtro", host: "Panel Juvenil", category: "juventud", days: ["jue"] },
  { start: "16:00", end: "18:00", program: "Community Talk", host: "Sarah P.", category: "comunidad", days: ["lun", "mar", "mie", "vie"] },
  { start: "18:00", end: "20:00", program: "Noches de Jazz", host: "Luis R.", category: "musica", days: ["lun", "mar", "mie", "jue", "vie"] },
  { start: "20:00", end: "22:00", program: "Soirée Électro", host: "DJ Neon", category: "musica", days: ["vie", "sab"] },
  { start: "22:00", end: "00:00", program: "Late Night Chill", host: "Alex T.", category: "musica", days: ["lun", "mar", "mie", "jue", "vie", "sab"] },
];

const categoryColors: Record<string, string> = {
  cultura: "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300",
  musica: "bg-violet-500/20 border-violet-500/40 text-violet-700 dark:text-violet-300",
  opinion: "bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300",
  educacion: "bg-sky-500/20 border-sky-500/40 text-sky-700 dark:text-sky-300",
  deportes: "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  juventud: "bg-pink-500/20 border-pink-500/40 text-pink-700 dark:text-pink-300",
  comunidad: "bg-teal-500/20 border-teal-500/40 text-teal-700 dark:text-teal-300",
};

const isNow = (start: string, end: string) => {
  const now = new Date();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= sh * 60 + sm && mins < (eh === 0 ? 24 * 60 : eh * 60 + em);
};

const todayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1; // Mon=0 ... Sun=6
};

const Schedule = () => {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(days[todayIndex()]);

  const daySlots = slots.filter((s) => s.days.includes(selectedDay)).sort((a, b) => a.start.localeCompare(b.start));
  const isToday = selectedDay === days[todayIndex()];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("schedule.title")}</h1>
          <p className="text-muted-foreground mb-10">{t("schedule.subtitle")}</p>

          {/* Day tabs */}
          <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedDay === day
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {dayLabelsEs[day]}
                {day === days[todayIndex()] && (
                  <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Time slots */}
          <div className="space-y-3">
            {daySlots.map((slot, i) => {
              const live = isToday && isNow(slot.start, slot.end);
              return (
                <motion.div
                  key={`${slot.program}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-stretch rounded-xl border overflow-hidden transition-colors ${
                    live ? "border-primary ring-1 ring-primary/30" : "border-border"
                  }`}
                >
                  {/* Time column */}
                  <div className={`flex flex-col items-center justify-center px-4 py-4 min-w-[90px] ${live ? "bg-primary/10" : "bg-secondary/50"}`}>
                    <span className="text-sm font-mono font-semibold text-foreground">{slot.start}</span>
                    <span className="text-xs text-muted-foreground">{slot.end}</span>
                  </div>

                  {/* Program info */}
                  <div className="flex-1 p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-base font-semibold text-foreground">{slot.program}</h3>
                        {live && (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {t("player.liveNow")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">🎙️ {slot.host}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${categoryColors[slot.category] || "bg-secondary text-secondary-foreground"}`}>
                      {slot.category}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {daySlots.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No hay programas programados para este día.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Schedule;
