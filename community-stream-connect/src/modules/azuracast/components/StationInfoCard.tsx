/**
 * StationInfoCard Component
 * Displays station metadata and live statistics
 */

import { Radio, Users, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Station, StationInfo, NowPlaying } from '@/modules/azuracast';

export interface StationInfoCardProps {
  station: Station | null;
  stationInfo: StationInfo | null;
  nowPlaying: NowPlaying | null;
}

export const StationInfoCard: React.FC<StationInfoCardProps> = ({
  station,
  stationInfo,
  nowPlaying,
}) => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Users,
      label: t('station.listeners'),
      value: nowPlaying?.listeners.total || stationInfo?.listeners || 0,
    },
    {
      icon: Clock,
      label: t('station.uptime'),
      value: stationInfo?.uptime
        ? `${Math.floor(stationInfo.uptime / 3600)}h`
        : '-',
    },
    {
      icon: Zap,
      label: 'Status',
      value: stationInfo?.isOnline ? 'Online' : 'Offline',
      color: stationInfo?.isOnline ? 'text-green-500' : 'text-red-500',
    },
  ];

  if (!station) {
    return (
      <div className="rounded-2xl bg-secondary/50 border border-border p-6 text-center">
        <p className="text-muted-foreground">{t('station.notFound')}</p>
      </div>
    );
  }

  return (
    <motion.div
      data-testid="station-info-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Radio className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-1">{station.name}</h2>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {station.description || 'Community Radio Station'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg bg-background/50 p-3 text-center"
            >
              <Icon className={`w-5 h-5 mx-auto mb-2 text-primary ${stat.color || ''}`} />
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Stream URLs */}
      {station.listenUrl && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            {t('station.streamUrl')}
          </p>
          <code className="block text-xs bg-background/50 p-3 rounded-lg text-primary break-all">
            {station.listenUrl}
          </code>
        </div>
      )}
    </motion.div>
  );
};
