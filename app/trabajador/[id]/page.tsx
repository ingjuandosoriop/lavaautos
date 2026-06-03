'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Vehiculo, ESTADOS_PIPELINE, Trabajador } from '@/types';
import {
  obtenerPorId,
  actualizarEstado,
  obtenerProximoEstado,
  retrocederEstado,
  agregarNotaPorEstado,
  transferirVehiculo,
  obtenerTrabajadores,
  agregarFotoSalida,
  eliminarFotoSalida,
  obtenerConfig,
} from '@/lib/vehiculosService';
import { AnimacionEstado } from '@/components/AnimacionEstado';
import { NotasPorEstado } from '@/components/NotasPorEstado';
import { SelectorTrabajador } from '@/components/SelectorTrabajador';
import { CapturaFotos } from '@/components/CapturaFotos';
import { TiempoEstimado } from '@/components/TiempoEstimado';
import { reproducirSonido, estáActivadoSonido } from '@/lib/sonidos';

export default function DetalleVehiculo() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [mostrarTransferencia, setMostrarTransferencia] = useState(false);
  const [fotosEdicion, setFotosEdicion] = useState<string[]>([]);
  const [tiempos, setTiempos] = useState<Record<string, number>>({});

  useEffect(() => {
    // Cargar trabajadores y tiempos
    const trab = obtenerTrabajadores();
    setTrabajadores(trab);

    const config = obtenerConfig();
    setTiempos(config.tiempoEstimado);

    // Cargar vehículo
    const cargar = () => {
      const v = obtenerPorId(id);
      setVehiculo(v || null);
      setCargando(false);
    };

    cargar();

    // Recargar cada 2 segundos
    const intervalo = setInterval(cargar, 2000);
    return () => clearInterval(intervalo);
  }, [id]);

  const manejarAvanzarEstado = () => {
    if (!vehiculo) return;

    const proximoEstado = obtenerProximoEstado(vehiculo.estado);
    if (!proximoEstado) {
      alert('Este vehículo ya está entregado');
      return;
    }

    const actualizado = actualizarEstado(id, proximoEstado);
    if (actualizado) {
      setVehiculo(actualizado);

      // Reproducir sonido
      if (estáActivadoSonido()) {
        if (proximoEstado === 'Listo') {
          reproducirSonido('listo');
        } else {
          reproducirSonido('cambio-estado');
        }
      }
    }
  };

  const manejarRetroceso = () => {
    if (!vehiculo) return;

    const actualizado = retrocederEstado(id);
    if (actualizado) {
      setVehiculo(actualizado);
    } else {
      alert('No se puede retroceder más. Este es el estado inicial.');
    }
  };

  const manejarWhatsApp = () => {
    if (!vehiculo || !vehiculo.clienteTelefono) {
      alert('No hay teléfono registrado');
      return;
    }

    const numero = vehiculo.clienteTelefono.replace(/\D/g, '');
    const mensaje = `Hola ${vehiculo.clienteNombre}, tu vehículo ${vehiculo.placa} ya está LISTO para recoger! 🚗✨`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const manejarTransferencia = (nuevoTrabajadorId: string) => {
    if (!vehiculo) return;
    const actualizado = transferirVehiculo(id, nuevoTrabajadorId);
    if (actualizado) {
      setVehiculo(actualizado);
      setMostrarTransferencia(false);
      alert('✓ Vehículo transferido');
    }
  };

  const manejarAgregarNota = (nota: string) => {
    if (!vehiculo) return;
    const actualizado = agregarNotaPorEstado(id, nota);
    if (actualizado) {
      setVehiculo(actualizado);
    }
  };

  const manejarGuardarFotosSalida = () => {
    if (!vehiculo || fotosEdicion.length === 0) {
      alert('Agrega al menos una foto');
      return;
    }

    const actualizado = agregarFotoSalida(id, fotosEdicion);
    if (actualizado) {
      setVehiculo(actualizado);
      setFotosEdicion([]);
      alert('✓ Fotos de salida guardadas');
    }
  };

  const manejarEliminarFotoSalida = (indice: number) => {
    if (!vehiculo) return;
    const actualizado = eliminarFotoSalida(id, indice);
    if (actualizado) {
      setVehiculo(actualizado);
    }
  };

  const manejarLiberar = () => {
    if (!vehiculo) return;

    if (vehiculo.estado !== 'Listo') {
      alert('El vehículo debe estar "Listo" para liberarlo');
      return;
    }

    const confirmado = confirm(
      `¿Liberar vehículo ${vehiculo.placa} para entrega?`
    );

    if (confirmado) {
      const actualizado = actualizarEstado(id, 'Entregado');
      if (actualizado) {
        setVehiculo(actualizado);

        // Reproducir sonido de entrega
        if (estáActivadoSonido()) {
          reproducirSonido('entregado');
        }

        setTimeout(() => router.push('/'), 1500);
      }
    }
  };

  const obtenerColorEstado = (estado: string) => {
    const colores: Record<string, string> = {
      'Recibido': 'bg-blue-500',
      'Lavando': 'bg-cyan-500',
      'Enjuagando': 'bg-sky-500',
      'Secando': 'bg-amber-500',
      'Encerando': 'bg-purple-500',
      'Listo': 'bg-green-500',
    };
    return colores[estado] || 'bg-gray-500';
  };

  const obtenerPorcentajeProgreso = () => {
    if (!vehiculo) return 0;
    const indice = ESTADOS_PIPELINE.indexOf(vehiculo.estado);
    return ((indice + 1) / ESTADOS_PIPELINE.length) * 100;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="bg-red-500 text-white p-4">
          <h1 className="text-xl font-bold">Error</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Vehículo no encontrado</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const proximoEstado = obtenerProximoEstado(vehiculo.estado);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex items-center gap-3 shadow-lg">
        <button
          onClick={() => router.push('/')}
          className="text-2xl hover:opacity-80"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold">{vehiculo.placa}</h1>
          <p className="text-sm opacity-90">{vehiculo.clienteNombre}</p>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Progreso */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800">Progreso</h3>
            <span className="text-sm text-gray-600">{Math.round(obtenerPorcentajeProgreso())}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${obtenerColorEstado(vehiculo.estado)} transition-all duration-500`}
              style={{ width: `${obtenerPorcentajeProgreso()}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 gap-1 text-xs font-semibold">
            {ESTADOS_PIPELINE.slice(0, -1).map((e) => (
              <span
                key={e}
                className={`flex-1 text-center py-1 rounded ${
                  ESTADOS_PIPELINE.indexOf(vehiculo.estado) >= ESTADOS_PIPELINE.indexOf(e)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {e.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Estado actual con animación */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center">
          <AnimacionEstado estado={vehiculo.estado} size="large" />
        </div>

        {/* Tiempo estimado */}
        {tiempos && Object.keys(tiempos).length > 0 && (
          <TiempoEstimado
            servicio={vehiculo.servicio as any}
            creadoEn={vehiculo.creadoEn}
            tiemposConfig={tiempos as any}
          />
        )}

        {/* Información del vehículo */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-gray-800 mb-3">Información</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 text-xs">Servicio</p>
              <p className="font-semibold">{vehiculo.servicio}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Precio Pactado</p>
              <p className="font-semibold text-lg text-green-600">
                ${vehiculo.precioPactado.toLocaleString('es-CO')}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Teléfono</p>
              <p className="font-semibold">{vehiculo.clienteTelefono || 'No registrado'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Hora Ingreso</p>
              <p className="font-semibold text-xs">
                {new Date(vehiculo.creadoEn).toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Trabajador asignado y transferencia */}
        <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-purple-800">👤 Trabajador Asignado</h3>
            <button
              onClick={() => setMostrarTransferencia(!mostrarTransferencia)}
              className="text-purple-600 hover:text-purple-800 font-bold text-sm"
            >
              {mostrarTransferencia ? '✕ Cerrar' : '🔄 Transferir'}
            </button>
          </div>
          <p className="text-sm text-purple-900 font-semibold">
            {vehiculo.trabajadorAsignado
              ? trabajadores.find((t) => t.id === vehiculo.trabajadorAsignado)?.nombre || 'Desconocido'
              : 'Sin asignar'}
          </p>

          {vehiculo.trabajadoresParticipantes.length > 0 && (
            <p className="text-xs text-purple-700 mt-2">
              Han participado: {vehiculo.trabajadoresParticipantes
                .map((id) => trabajadores.find((t) => t.id === id)?.nombre)
                .filter(Boolean)
                .join(', ')}
            </p>
          )}

          {mostrarTransferencia && (
            <div className="mt-3 pt-3 border-t border-purple-200">
              <SelectorTrabajador
                trabajadores={trabajadores}
                trabajadorActual={vehiculo.trabajadorAsignado}
                onSeleccionar={manejarTransferencia}
                titulo="Transferir a:"
              />
            </div>
          )}
        </div>

        {/* Notas por estado */}
        <NotasPorEstado
          estado={vehiculo.estado}
          notasActuales={vehiculo.notasPorEstado}
          onAgregarNota={manejarAgregarNota}
        />

        {/* Notas */}
        {vehiculo.notas && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Notas:</strong> {vehiculo.notas}
            </p>
          </div>
        )}

        {/* Fotos de entrada */}
        {vehiculo.fotosEntrada.length > 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3">📸 Fotos de Entrada</h3>
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
          </div>
        )}

        {/* Fotos de salida - Solo visible cuando está LISTO */}
        {vehiculo.estado === 'Listo' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-green-800 mb-3">📷 Fotos de Salida (Después)</h3>
            <p className="text-sm text-green-700">
              Toma fotos del auto limpio para hacer la comparativa antes/después
            </p>

            {/* Captura */}
            <CapturaFotos fotos={fotosEdicion} onFotosCapturadas={setFotosEdicion} />

            {/* Vista previa de fotos nuevas */}
            {fotosEdicion.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-green-700">Nuevas fotos a guardar:</p>
                <div className="grid grid-cols-2 gap-2">
                  {fotosEdicion.map((foto, i) => (
                    <div key={i} className="relative">
                      <img
                        src={foto}
                        alt={`Nueva ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-green-400"
                      />
                      <button
                        onClick={() =>
                          setFotosEdicion(fotosEdicion.filter((_, idx) => idx !== i))
                        }
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={manejarGuardarFotosSalida}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                >
                  ✓ Guardar Fotos de Salida
                </button>
              </div>
            )}

            {/* Fotos ya guardadas */}
            {vehiculo.fotosSalida.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-green-200">
                <p className="text-xs font-semibold text-green-700">Fotos guardadas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {vehiculo.fotosSalida.map((foto, i) => (
                    <div key={i} className="relative">
                      <img
                        src={foto}
                        alt={`Salida ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                      />
                      <button
                        onClick={() => manejarEliminarFotoSalida(i)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cronología */}
        {vehiculo.historicoEstados.length > 1 && (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3">Historial</h3>
            <div className="space-y-2">
              {vehiculo.historicoEstados.map((h, i) => (
                <div key={i} className="flex justify-between text-sm border-b pb-2 last:border-b-0">
                  <span className="font-semibold text-gray-800">{h.estado}</span>
                  <span className="text-gray-600">
                    {new Date(h.fecha).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Botones de acción (fijos al fondo) */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-2">
        {/* Fila de controles de estado */}
        <div className="flex gap-2">
          {vehiculo.estado !== 'Recibido' && vehiculo.estado !== 'Entregado' && (
            <button
              onClick={manejarRetroceso}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg text-sm"
              title="Volver al estado anterior"
            >
              ← Retroceso
            </button>
          )}

          {vehiculo.estado !== 'Entregado' && proximoEstado && (
            <button
              onClick={manejarAvanzarEstado}
              className={`${vehiculo.estado === 'Recibido' ? 'w-full' : 'flex-1'} bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-sm`}
            >
              → {proximoEstado}
            </button>
          )}
        </div>

        {/* Botones especiales por estado */}
        {vehiculo.estado === 'Listo' && (
          <>
            <button
              onClick={manejarWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
            >
              💬 Notificar por WhatsApp
            </button>
            <button
              onClick={manejarLiberar}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg text-lg"
            >
              ✓ Liberar para Entrega
            </button>
          </>
        )}

        {vehiculo.estado === 'Entregado' && (
          <div className="bg-green-100 text-green-800 text-center font-bold py-3 rounded-lg">
            ✓ Entregado
          </div>
        )}
      </div>
    </div>
  );
}
