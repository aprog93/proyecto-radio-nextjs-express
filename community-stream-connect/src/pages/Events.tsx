import { SkeletonArticleCard } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api, Event as EventType } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Events = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [registeredEvents, setRegisteredEvents] = useState<Set<number>>(new Set());
  const [loadingRegister, setLoadingRegister] = useState<Set<number>>(new Set());

  // Fetch events from backend (upcoming events)
  const { data: eventsData, loading, error } = useApi(
    () => api.events.getPublished(1, 50, undefined, true),
    { autoFetch: true }
  );

  const events = eventsData?.events || [];

  const handleRegister = async (eventId: number) => {
    if (!isAuthenticated) {
      toast({ title: "Error", description: "Debes iniciar sesión para registrarte", variant: "destructive" });
      return;
    }

    setLoadingRegister((prev) => new Set(prev).add(eventId));
    try {
      await api.events.register(eventId);
      setRegisteredEvents((prev) => new Set(prev).add(eventId));
      toast({ title: "¡Éxito!", description: "Te has registrado al evento" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrarse";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoadingRegister((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold">{t("events.error") || "Error cargando eventos"}</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">{t("events.title")}</h1>
          <p className="text-muted-foreground mb-10">{t("events.subtitle")}</p>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t("events.noResults") || "No hay eventos disponibles."}</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event, i) => {
                const isRegistered = registeredEvents.has(event.id);
                const isLoading = loadingRegister.has(event.id);
                const spotsLeft = event.capacity ? event.capacity - event.registered : undefined;
                const isFull = spotsLeft !== undefined && spotsLeft <= 0;

                return (
                  <Link key={event.id} to={`/event/${event.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors flex flex-col h-full"
                    >
                    <div className="h-40 bg-secondary flex items-center justify-center overflow-hidden">
                      {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <Calendar className="w-12 h-12 text-primary/30" />
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">{event.title}</h3>
                      {event.description && <p className="text-sm text-muted-foreground mb-4 flex-1">{event.description}</p>}

                      <div className="flex flex-col gap-2 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.location}
                          </span>
                        )}
                        {event.capacity && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {event.registered}/{event.capacity} registrados
                          </span>
                        )}
                      </div>

                      {isAuthenticated && (
                        <button
                          onClick={() => handleRegister(event.id)}
                          disabled={isLoading || isFull || isRegistered}
                          className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                            isRegistered
                              ? "bg-green-500/10 text-green-600 cursor-default"
                              : isFull
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:opacity-90"
                          } disabled:opacity-50`}
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {t("common.loading") || "Cargando..."}
                            </span>
                          ) : isRegistered ? (
                            t("events.registered") || "Registrado"
                          ) : isFull ? (
                            t("events.full") || "Evento lleno"
                          ) : (
                            t("events.register") || "Registrarse"
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                  </Link>
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

