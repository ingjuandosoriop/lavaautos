'use client';

import { Vehiculo } from '@/types';

interface HistorialPlacaProps {
  placa: string;
  historial: Vehiculo[];
  descuentoInfo?: {
    tieneDescuento: boolean;
    lavadosActuales: number;
    lavadosPorDescuento: number;
    descuentoPorcentaje: number;
    proximoDescuentoEn: number;
  };
}

export function HistorialPlaca({ placa, historial, descuentoInfo }: HistorialPlacaProps) {
  if (historial.length === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>ℹ️ Primera vez:</strong> No hay historial de lavados para {placa}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">📜 Historial de {placa}</h3>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {historial.length} lavados
        </span>
      </div>

      {/* Fidelización */}
      {descuentoInfo && (
        <div
          className={`rounded-lg p-3 ${
            descuentoInfo.tieneDescuento
              ? 'bg-green-50 border-l-4 border-green-500'
              : 'bg-amber-50 border-l-4 border-amber-500'
          }`}
        >
          {descuentoInfo.tieneDescuento ? (
            <p className="text-sm text-green-800 font-semibold">
              🎉 <strong>¡Descuento disponible!</strong> {descuentoInfo.descuentoPorcentaje}% en el próximo
              lavado
            </p>
          ) : (
            <p className="text-sm text-amber-800">
              🔜 <strong>{descuentoInfo.proximoDescuentoEn} lavado(s) más</strong> para conseguir{' '}
              {descuentoInfo.descuentoPorcentaje}% de descuento
            </p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            ({descuentoInfo.lavadosActuales} de {descuentoInfo.lavadosPorDescuento} lavados)
          </p>
        </div>
      )}

      {/* Lista de lavados */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {historial.map((v, i) => (
          <div
            key={v.id}
            className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400 flex justify-between items-start"
          >
            <div>
              <p className="font-semibold text-gray-800">#{historial.length - i}</p>
              <p className="text-xs text-gray-600">{v.servicio}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                ${v.precioPactado.toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(v.creadoEn).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
