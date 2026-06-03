'use client';

import { useState } from 'react';

interface NotasPorEstadoProps {
  estado: string;
  notasActuales: Record<string, string>;
  onAgregarNota: (nota: string) => void;
}

export function NotasPorEstado({ estado, notasActuales, onAgregarNota }: NotasPorEstadoProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nota, setNota] = useState(notasActuales[estado] || '');

  const manejarGuardar = () => {
    onAgregarNota(nota);
    setMostrarFormulario(false);
  };

  const notaActual = notasActuales[estado];

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-700 mb-1">📝 Nota para: {estado}</p>
          {notaActual ? (
            <p className="text-sm text-blue-900 italic">"{notaActual}"</p>
          ) : (
            <p className="text-xs text-blue-600">Sin notas en este estado</p>
          )}
        </div>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="text-blue-600 hover:text-blue-800 font-bold text-lg"
        >
          ✏️
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mt-3 space-y-2 pt-3 border-t border-blue-200">
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder={`Ej: Se encontró rayón adicional, cliente pidió encerado extra...`}
            className="w-full border-2 border-blue-300 p-2 rounded-lg text-sm"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={manejarGuardar}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm"
            >
              ✓ Guardar
            </button>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg text-sm"
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
