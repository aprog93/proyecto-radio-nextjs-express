import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Calendar, MapPin, Users, Ticket } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const EventDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [registering, setRegistering] = useState(false);

  const { data: event, loading, error } = useApi(
    () => id ? api.events.getById(parseInt(id)) : Promise.reject(new Error('No ID provided')),
    { autoFetch: !!id }
  );

  useEffect(() => {
    if (!id) {
      navigate("/event");
    }
  }, [id, navigate]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast({
        title: t("events.loginRequired", "Inicia sesión"),
        description: t("events.loginRequiredMsg", "Debes iniciar sesión para registrarte"),
        variant: "destructive"
      });
      navigate("/web/login");
      return;
    }

    setRegistering(true);
    try {
      await api.events.register(event!.id);
      toast({
        title: t("events.registeredSuccess", "¡Registrado!"),
        description: t("events.registeredMsg", "Te has registrado al evento")
      });
    } catch (err) {
      toast({
        title: "Error",
        description: typeof err === "object" && err !== null && "message" in err
          ? (err as any).message
          : t("events.registerFailed", "No se pudo completar el registro"),
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/event" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" /> {t("common.back", "Volver")}
            </Link>
            <div className="rounded-lg p-8 bg-destructive/10 border border-destructive/20">
              <p className="text-destructive">
                {typeof error === 'object' && error !== null && "message" in error
                  ? (error as any).message
                  : t("common.notFound", "Evento no encontrado")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isFull = event.capacity && event.registrationCount >= event.capacity;

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/event" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> {t("common.back", "Volver")}
          </Link>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {event.image && (
                <div className="mb-8 rounded-2xl overflow-hidden h-96">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="mb-8">
                <h1 className="font-display text-4xl font-bold text-foreground mb-4">{event.title}</h1>

                <div className="space-y-3 text-muted-foreground mb-8">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <div>{startDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="text-sm">{startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                      <div>{event.location}</div>
                    </div>
                  )}
                </div>

                {event.description && (
                  <div className="prose prose-invert max-w-none text-foreground">
                    <div
                      className="text-base leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-6">
                {event.capacity && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">{t("events.capacity", "Capacidad")}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{event.registrationCount || 0} / {event.capacity}</span>
                        <span className="text-muted-foreground">
                          {Math.round(((event.registrationCount || 0) / event.capacity) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(((event.registrationCount || 0) / event.capacity) * 100, 100)}%`
                          }}
                        />
                      </div>
                      {isFull && (
                        <p className="text-xs text-destructive font-semibold">{t("events.full", "Evento lleno")}</p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  disabled={registering || isFull}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Ticket className="w-4 h-4" />
                  {registering
                    ? t("common.loading", "Cargando...")
                    : isFull
                    ? t("events.full", "Evento lleno")
                    : t("events.register", "Registrarse")}
                </button>

                {isAuthenticated && (
                  <button
                    onClick={() => toast({ title: "Por implementar", description: "Función de calendario aún no disponible" })}
                    className="w-full px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary/50 transition-colors"
                  >
                    {t("events.addToCalendar", "Agregar a calendario")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetail;
