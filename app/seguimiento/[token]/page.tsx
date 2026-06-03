'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Vehiculo, ESTADOS_PIPELINE } from '@/types';
import { obtenerPorToken } from '@/lib/vehiculosService';
import { AnimacionEstado } from '@/components/AnimacionEstado';

export default function SeguimientoCliente() {
  const params = useParams();
  const token = params.token as string;

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);

  useEffect(() => {
    const cargar = () => {
      const v = obtenerPorToken(token);
      if (!v) {
        setNoEncontrado(true);
      } else {
        setVehiculo(v);
      }
      setCargando(false);
    };

    cargar();

    // Recargar cada 2 segundos (tiempo real)
    const intervalo = setInterval(cargar, 2000);
    return () => clearInterval(intervalo);
  }, [token]);

  const obtenerColorEstado = (estado: string) => {
    const colores: Record<string, string> = {
      'Recibido': 'from-blue-400 to-blue-600',
      'Lavando': 'from-cyan-400 to-cyan-600',
      'Enjuagando': 'from-sky-400 to-sky-600',
      'Secando': 'from-amber-400 to-amber-600',
      'Encerando': 'from-purple-400 to-purple-600',
      'Listo': 'from-green-400 to-green-600',
      'Entregado': 'from-emerald-400 to-emerald-600',
    };
    return colores[estado] || 'from-gray-400 to-gray-600';
  };

  const obtenerPorcentajeProgreso = () => {
    if (!vehiculo) return 0;
    const indice = ESTADOS_PIPELINE.indexOf(vehiculo.estado);
    if (indice === -1) return 100; // Entregado
    return ((indice + 1) / ESTADOS_PIPELINE.length) * 100;
  };

  const obtenerEmojiEstado = (estado: string) => {
    const emojis: Record<string, string> = {
      'Recibido': '📋',
      'Lavando': '🚿',
      'Enjuagando': '💦',
      'Secando': '💨',
      'Encerando': '✨',
      'Listo': '✅',
      'Entregado': '🎉',
    };
    return emojis[estado] || '🚗';
  };

  if (cargando) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-cyan-50 items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚗</div>
          <p className="text-gray-600 font-semibold">Cargando tu vehículo...</p>
        </div>
      </div>
    );
  }

  if (noEncontrado || !vehiculo) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-red-50 to-pink-50">
        <div className="bg-red-500 text-white p-6 text-center">
          <h1 className="text-2xl font-bold">⚠️ No Encontrado</h1>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">Este enlace no es válido o ha expirado.</p>
            <p className="text-sm text-gray-600">Contacta al lavadero para obtener un nuevo enlace.</p>
          </div>
        </div>
      </div>
    );
  }

  const porcentaje = obtenerPorcentajeProgreso();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-cyan-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 text-center shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-2">🚗 Tu Vehículo</h1>
        <p className="text-xl font-bold text-blue-100">{vehiculo.placa}</p>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-4 space-y-6 pb-8">
        {/* Card principal: Estado actual con animación */}
        <div className={`bg-gradient-to-br ${obtenerColorEstado(vehiculo.estado)} rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center min-h-48`}>
          <div className="text-white">
            <AnimacionEstado estado={vehiculo.estado} size="large" />
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Progreso</h3>
            <span className="text-sm font-semibold text-cyan-600">{Math.round(porcentaje)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          {/* Mini timeline */}
          <div className="flex justify-between mt-4 gap-1">
            {ESTADOS_PIPELINE.map((e, idx) => {
              const estadoActualIdx = ESTADOS_PIPELINE.indexOf(vehiculo.estado);
              const isCompleted = idx <= estadoActualIdx;
              return (
                <div
                  key={e}
                  className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {e.split(' ')[0].slice(0, 2)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline visual */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-gray-800 mb-4">Historial</h3>
          <div className="space-y-4">
            {vehiculo.historicoEstados.map((h, i) => {
              const esUltimo = i === vehiculo.historicoEstados.length - 1;
              return (
                <div key={i} className="flex gap-4">
                  {/* Línea vertical */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${esUltimo ? 'bg-blue-600' : 'bg-gray-400'} ring-4 ${esUltimo ? 'ring-blue-200' : 'ring-gray-200'}`} />
                    {!esUltimo && <div className="w-1 h-12 bg-gray-300 my-2" />}
                  </div>
                  {/* Contenido */}
                  <div className="flex-1 pt-1">
                    <p className="font-bold text-gray-800">{h.estado}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(h.fecha).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Información del vehículo */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-bold text-gray-800 mb-4">Información</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-600">Cliente</span>
              <span className="font-semibold">{vehiculo.clienteNombre}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-600">Servicio</span>
              <span className="font-semibold">{vehiculo.servicio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Precio</span>
              <span className="font-bold text-lg text-green-600">
                ${vehiculo.precioPactado.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>

        {/* Comparativa antes/después */}
        {vehiculo.fotosEntrada.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-bold text-gray-800 mb-4">📸 Tu Vehículo</h3>

            {vehiculo.fotosSalida.length > 0 ? (
              // Mostrar comparativa lado a lado
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Entrada */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2 text-center">
                      ❌ Antes (Entrada)
                    </p>
                    <div className="grid gap-2">
                      {vehiculo.fotosEntrada.map((foto, i) => (
                        <img
                          key={i}
                          src={foto}
                          alt={`Antes ${i + 1}`}
                          className="w-full h-28 object-cover rounded-lg border-2 border-gray-300"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Salida */}
                  <div>
                    <p className="text-xs font-semibold text-green-600 mb-2 text-center">
                      ✅ Después (Salida)
                    </p>
                    <div className="grid gap-2">
                      {vehiculo.fotosSalida.map((foto, i) => (
                        <img
                          key={i}
                          src={foto}
                          alt={`Después ${i + 1}`}
                          className="w-full h-28 object-cover rounded-lg border-2 border-green-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-600 pt-2 border-t">
                  Puedes comparar antes y después del lavado
                </p>
              </div>
            ) : (
              // Solo entrada (salida aún no disponible)
              <div className="space-y-3">
                <p className="text-xs text-gray-600 text-center">
                  Fotos de cómo ingresó tu vehículo
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {vehiculo.fotosEntrada.map((foto, i) => (
                    <img
                      key={i}
                      src={foto}
                      alt={`Entrada ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-xs text-blue-700">
                    Las fotos de salida se mostrarán cuando esté listo
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado final */}
        {vehiculo.estado === 'Entregado' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-green-700">✅ ¡Gracias por tu confianza!</p>
            <p className="text-sm text-green-600 mt-2">Tu vehículo ha sido entregado exitosamente.</p>
          </div>
        )}

        {vehiculo.estado === 'Listo' && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-blue-700">🎉 ¡Tu vehículo está listo!</p>
            <p className="text-sm text-blue-600 mt-2">Acércate al lavadero para recogerlo.</p>
            {vehiculo.clienteTelefono && (
              <a
                href={`https://wa.me/${vehiculo.clienteTelefono.replace(/\D/g, '')}?text=Hola,%20mi%20vehículo%20${vehiculo.placa}%20está%20listo%20para%20recoger.`}
                className="inline-block mt-3 bg-green-600 text-white font-bold px-4 py-2 rounded-lg"
              >
                💬 Contáctanos por WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
