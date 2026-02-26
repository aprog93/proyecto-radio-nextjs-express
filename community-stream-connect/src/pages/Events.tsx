import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type EventoEstado = Database["public"]["Enums"]["evento_estado"];

interface Evento {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  ubicacion: string | null;
  estado: EventoEstado;
  imagen_url: string | null;
}

const statusBadge: Record<EventoEstado, { label: string; cls: string }> = {
  proximo: { label: "Próximo", cls: "bg-primary/10 text-primary" },
  en_vivo: { label: "En vivo", cls: "bg-destructive/10 text-destructive" },
  finalizado: { label: "Finalizado", cls: "bg-muted text-muted-foreground" },
  cancelado: { label: "Cancelado", cls: "bg-muted text-muted-foreground" },
};

const Events = () => {
  const { t } = useTranslation();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("eventos")
      .select("id, titulo, descripcion, fecha_inicio, ubicacion, estado, imagen_url")
      .order("fecha_inicio", { ascending: true })
      .then(({ data }) => {
        setEventos(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("events.title")}</h1>
          <p className="text-muted-foreground mb-10">{t("events.subtitle")}</p>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : eventos.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No hay eventos disponibles.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {eventos.map((event, i) => {
                const badge = statusBadge[event.estado];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    <div className="h-40 bg-secondary flex items-center justify-center overflow-hidden">
                      {event.imagen_url ? (
                        <img src={event.imagen_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Calendar className="w-12 h-12 text-primary/30" />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">{event.titulo}</h3>
                      {event.descripcion && (
                        <p className="text-sm text-muted-foreground mb-4">{event.descripcion}</p>
                      )}
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.fecha_inicio).toLocaleDateString()}</span>
                        {event.ubicacion && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.ubicacion}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Events;
