'use client';

import { EstadoVehiculo } from '@/types';

const CONFIG: Record<EstadoVehiculo, { label: string; dot: string; bg: string; text: string }> = {
  Recibido:   { label: 'Pendiente',  dot: 'bg-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-700' },
  Lavando:    { label: 'Lavando',    dot: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700' },
  Enjuagando: { label: 'Enjuagando', dot: 'bg-sky-500',     bg: 'bg-sky-50',     text: 'text-sky-700' },
  Secando:    { label: 'Secando',    dot: 'bg-yellow-500',  bg: 'bg-yellow-50',  text: 'text-yellow-700' },
  Listo:      { label: 'Listo para recoger', dot: 'bg-green-500',   bg: 'bg-green-50',   text: 'text-green-700' },
  Entregado:  { label: 'Entregado',         dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

interface Props {
  estado: EstadoVehiculo;
  showPulse?: boolean;
}

export function StatusBadge({ estado, showPulse }: Props) {
  const cfg = CONFIG[estado];
  const isActive = estado === 'Lavando' || estado === 'Enjuagando' || estado === 'Secando';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${showPulse && isActive ? 'pulse-dot' : ''}`} />
      {cfg.label}
    </span>
  );
}
