'use client';

import { useState, useEffect } from 'react';
import { TipoServicio } from '@/types';

interface TiempoEstimadoProps {
  servicio: TipoServicio;
  creadoEn: string;
  tiemposConfig: Record<TipoServicio, number>;
}

export function TiempoEstimado({ servicio, creadoEn, tiemposConfig }: TiempoEstimadoProps) {
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);

  useEffect(() => {
    const actualizar = () => {
      const ahora = new Date();
      const inicio = new Date(creadoEn);
      const minutos = Math.floor((ahora.getTime() - inicio.getTime()) / 60000);
      const tiempoEstimado = tiemposConfig[servicio] || 30;
      const restante = Math.max(0, tiempoEstimado - minutos);

      setTiempoTranscurrido(minutos);
      setTiempoRestante(restante);
    };

    actualizar();
    const intervalo = setInterval(actualizar, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(intervalo);
  }, [servicio, creadoEn, tiemposConfig]);

  const tiempoEstimado = tiemposConfig[servicio] || 30;
  const porcentaje = Math.min(100, (tiempoTranscurrido / tiempoEstimado) * 100);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">⏱️ Tiempo Estimado</h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          tiempoRestante > 5 ? 'bg-blue-100 text-blue-800' :
          tiempoRestante > 0 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {tiempoRestante > 0 ? `~${tiempoRestante} min` : '✓ Listo'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Transcurrido: {tiempoTranscurrido} min</span>
          <span>Total: {tiempoEstimado} min</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              tiempoRestante > 5 ? 'bg-blue-500' :
              tiempoRestante > 0 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center">
        {tiempoRestante > 0
          ? `Falta aproximadamente ${tiempoRestante} minuto${tiempoRestante !== 1 ? 's' : ''}`
          : 'El tiempo estimado ha transcurrido'
        }
      </p>
    </div>
  );
}
