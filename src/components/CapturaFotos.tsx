'use client';

import { useRef, useEffect } from 'react';

interface CapturafotosProps {
  fotos: string[];
  onFotosCapturadas: (fotos: string[]) => void;
}

export function CapturaFotos({ fotos, onFotosCapturadas }: CapturafotosProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const manejarCaptura = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.currentTarget.files;
    if (archivos) {
      Array.from(archivos).forEach((archivo) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Actualizar fotos de forma asíncrona para evitar setState durante render
          onFotosCapturadas([...fotos, base64]);
        };
        reader.readAsDataURL(archivo);
      });
      // Limpiar input para permitir capturar la misma foto nuevamente
      e.currentTarget.value = '';
    }
  };

  const borrarFoto = (indice: number) => {
    const nuevas = fotos.filter((_, i) => i !== indice);
    onFotosCapturadas(nuevas);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg"
        onClick={() => inputRef.current?.click()}
      >
        📷 Capturar Foto {fotos.length > 0 ? `(${fotos.length})` : ''}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={manejarCaptura}
        className="hidden"
      />

      {/* Galería de fotos capturadas */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {fotos.map((foto, i) => (
            <div key={i} className="relative">
              <img
                src={foto}
                alt={`Foto ${i + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => borrarFoto(i)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
