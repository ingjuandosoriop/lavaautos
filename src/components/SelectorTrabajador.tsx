'use client';

import { Trabajador } from '@/types';

interface SelectorTrabajadorProps {
  trabajadores: Trabajador[];
  trabajadorActual?: string;
  onSeleccionar: (trabajadorId: string) => void;
  titulo?: string;
}

export function SelectorTrabajador({
  trabajadores,
  trabajadorActual,
  onSeleccionar,
  titulo = 'Selecciona un trabajador',
}: SelectorTrabajadorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">{titulo}</p>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {trabajadores.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSeleccionar(t.id)}
            className={`w-full p-3 rounded-lg font-semibold text-left transition-all ${
              trabajadorActual === t.id
                ? 'bg-blue-600 text-white border-2 border-blue-600'
                : 'bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-blue-400'
            }`}
          >
            👤 {t.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
