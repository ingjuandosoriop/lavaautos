'use client';

import { EstadoVehiculo } from '@/types';

interface AnimacionEstadoProps {
  estado: EstadoVehiculo;
  size?: 'small' | 'large';
}

const animaciones: Record<EstadoVehiculo, { svg: string; label: string }> = {
  'Recibido': {
    label: 'Recibido',
    svg: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Auto -->
        <rect x="20" y="50" width="60" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="30" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="70" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <!-- Checkmark -->
        <g transform="translate(35, 20)">
          <circle cx="15" cy="15" r="12" fill="currentColor" opacity="0.1"/>
          <path d="M 8 15 L 12 19 L 22 9" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <style>
          svg { animation: pulse 2s ease-in-out infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        </style>
      </svg>
    `,
  },
  'Lavando': {
    label: 'Lavando',
    svg: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Auto -->
        <rect x="20" y="50" width="60" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="30" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="70" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <!-- Agua (gotitas animadas) -->
        <g class="agua">
          <circle cx="35" cy="30" r="3" fill="currentColor" opacity="0.7"/>
          <circle cx="50" cy="25" r="3" fill="currentColor" opacity="0.7"/>
          <circle cx="65" cy="30" r="3" fill="currentColor" opacity="0.7"/>
          <circle cx="42" cy="35" r="3" fill="currentColor" opacity="0.7"/>
          <circle cx="58" cy="35" r="3" fill="currentColor" opacity="0.7"/>
        </g>
        <style>
          .agua { animation: caida 1.5s ease-in infinite; }
          @keyframes caida {
            0% { transform: translateY(-10px); opacity: 0; }
            10% { opacity: 0.7; }
            90% { opacity: 0.7; }
            100% { transform: translateY(30px); opacity: 0; }
          }
        </style>
      </svg>
    `,
  },
  'Enjuagando': {
    label: 'Enjuagando',
    svg: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Auto -->
        <rect x="20" y="50" width="60" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="30" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="70" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <!-- Flujo de agua horizontal -->
        <g class="flujo">
          <path d="M 10 40 Q 15 35 25 40" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M 10 50 Q 15 45 25 50" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M 10 60 Q 15 55 25 60" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M 75 40 Q 85 35 95 40" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M 75 50 Q 85 45 95 50" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M 75 60 Q 85 55 95 60" stroke="currentColor" stroke-width="2" fill="none"/>
        </g>
        <style>
          .flujo { animation: fluir 1.5s ease-in-out infinite; }
          @keyframes fluir {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        </style>
      </svg>
    `,
  },
  'Secando': {
    label: 'Secando',
    svg: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Auto -->
        <rect x="20" y="50" width="60" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="30" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="70" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <!-- Aire (líneas onduladas) -->
        <g class="aire">
          <path d="M 15 35 Q 20 30 25 35 T 35 35" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M 65 35 Q 70 30 75 35 T 85 35" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M 15 45 Q 20 40 25 45 T 35 45" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M 65 45 Q 70 40 75 45 T 85 45" stroke="currentColor" stroke-width="2" fill="none"/>
        </g>
        <style>
          .aire { animation: soplar 1.5s ease-in-out infinite; }
          @keyframes soplar {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        </style>
      </svg>
    `,
  },
  'Listo': {
    label: 'Listo',
    svg: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Auto -->
        <rect x="20" y="50" width="60" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="30" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="70" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <!-- Checkmark grande -->
        <g class="check">
          <circle cx="50" cy="25" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M 45 25 L 50 30 L 60 20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <style>
          .check { animation: latir 1.5s ease-in-out infinite; }
          @keyframes latir {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        </style>
      </svg>
    `,
  },
  'Entregado': {
    label: 'Entregado',
    svg: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Auto -->
        <rect x="20" y="50" width="60" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="30" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="70" cy="75" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <!-- Confeti animado -->
        <g class="confeti">
          <line x1="25" y1="15" x2="30" y2="25" stroke="currentColor" stroke-width="2"/>
          <line x1="50" y1="10" x2="50" y2="25" stroke="currentColor" stroke-width="2"/>
          <line x1="75" y1="15" x2="70" y2="25" stroke="currentColor" stroke-width="2"/>
          <line x1="35" y1="20" x2="40" y2="30" stroke="currentColor" stroke-width="2"/>
          <line x1="65" y1="20" x2="60" y2="30" stroke="currentColor" stroke-width="2"/>
        </g>
        <style>
          .confeti { animation: celebrar 1s ease-in-out infinite; }
          @keyframes celebrar {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        </style>
      </svg>
    `,
  },
};

export function AnimacionEstado({ estado, size = 'large' }: AnimacionEstadoProps) {
  const animacion = animaciones[estado];
  const sizeClass = size === 'small' ? 'w-12 h-12' : 'w-32 h-32';
  const colorClass = estado === 'Listo' || estado === 'Entregado' ? 'text-green-500' : 'text-blue-500';

  return (
    <div className={`flex flex-col items-center gap-2`}>
      <div className={`${sizeClass} ${colorClass}`}>
        <div dangerouslySetInnerHTML={{ __html: animacion.svg }} />
      </div>
      {size === 'large' && <p className="text-sm font-semibold text-gray-700">{animacion.label}</p>}
    </div>
  );
}
