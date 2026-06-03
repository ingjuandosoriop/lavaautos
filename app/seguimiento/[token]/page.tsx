'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Vehiculo, ESTADOS_PIPELINE } from '@/types';
import { obtenerPorToken, guardarCalificacion } from '@/lib/vehiculosService';

// ─── Estrella ───────────────────────────────────────────────────
function Estrella({ llena, hover, onClick, onHover, onLeave, size = 'lg' }: {
  llena: boolean; hover: boolean;
  onClick: () => void; onHover: () => void; onLeave: () => void;
  size?: 'sm' | 'lg';
}) {
  const sz = size === 'lg' ? 'text-4xl' : 'text-xl';
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onTouchStart={onHover}
      className={`${sz} select-none ${llena || hover ? '' : 'opacity-30'}`}
    >
      ⭐
    </button>
  );
}

// ─── Rating widget ───────────────────────────────────────────────
function RatingWidget({ onSubmit }: { onSubmit: (estrellas: number, comentario: string) => void }) {
  const [seleccion, setSeleccion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const LABELS: Record<number, string> = {
    1: '😞 Muy malo', 2: '😕 Regular', 3: '😐 Aceptable',
    4: '😊 Bueno', 5: '🤩 ¡Excelente!',
  };

  const activo = hover || seleccion;

  const handleSubmit = async () => {
    if (!seleccion) return;
    setEnviando(true);
    await new Promise((r) => setTimeout(r, 500));
    onSubmit(seleccion, comentario);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg text-center space-y-5">
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">¿Cómo fue tu experiencia?</p>
        <p className="text-sm text-gray-500">Tu opinión nos ayuda a mejorar</p>
      </div>

      {/* Estrellas */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Estrella
            key={n}
            llena={n <= seleccion}
            hover={n <= hover}
            onClick={() => setSeleccion(n)}
            onHover={() => setHover(n)}
            onLeave={() => setHover(0)}
          />
        ))}
      </div>

      {/* Label */}
      <div className="h-6">
        {activo > 0 && (
          <p className="text-base font-semibold text-blue-600 animate-fade-in">
            {LABELS[activo]}
          </p>
        )}
      </div>

      {/* Comentario */}
      {seleccion > 0 && (
        <div className="text-left">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
            Comentario (opcional)
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Cuéntanos qué te pareció el servicio..."
            rows={3}
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 resize-none"
          />
        </div>
      )}

      {/* Botón */}
      <button
        onClick={handleSubmit}
        disabled={!seleccion || enviando}
        className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all duration-200"
        style={{
          background: !seleccion || enviando
            ? '#CBD5E1'
            : 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
          boxShadow: !seleccion || enviando ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
        }}
      >
        {enviando ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
            </svg>
            Enviando...
          </span>
        ) : 'Enviar calificación'}
      </button>
    </div>
  );
}

// ─── Rating ya enviado ───────────────────────────────────────────
function RatingMostrado({ estrellas, comentario }: { estrellas: number; comentario?: string }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-lg text-center space-y-3">
      <p className="text-lg font-bold text-gray-900">Tu calificación</p>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`text-2xl ${n <= estrellas ? '' : 'opacity-20'}`}>⭐</span>
        ))}
      </div>
      <p className="text-sm font-semibold text-blue-600">{estrellas}/5 estrellas</p>
      {comentario && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-left">
          <p className="text-sm text-gray-700 italic">"{comentario}"</p>
        </div>
      )}
      <p className="text-xs text-gray-400">¡Gracias por tu opinión! 🙏</p>
    </div>
  );
}

// ─── Timeline step ───────────────────────────────────────────────
function TimelineStep({ estado, fecha, isActive, isLast }: {
  estado: string; fecha: string; isActive: boolean; isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1 ring-4 transition-all ${
          isActive
            ? 'bg-blue-500 ring-blue-100 scale-125'
            : 'bg-gray-300 ring-gray-100'
        }`} />
        {!isLast && <div className="w-0.5 h-10 bg-gray-200 my-1" />}
      </div>
      <div className="flex-1 pb-3">
        <p className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{estado}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────
export default function SeguimientoCliente() {
  const params = useParams();
  const token = params.token as string;

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [calificado, setCalificado] = useState(false);

  useEffect(() => {
    const cargar = () => {
      const v = obtenerPorToken(token);
      if (!v) { setNoEncontrado(true); }
      else { setVehiculo(v); }
      setCargando(false);
    };
    cargar();
    const iv = setInterval(cargar, 2000);
    return () => clearInterval(iv);
  }, [token]);

  const manejarCalificacion = (estrellas: number, comentario: string) => {
    if (!vehiculo) return;
    guardarCalificacion(vehiculo.id, estrellas, comentario);
    setVehiculo((prev) => prev
      ? { ...prev, clasificacionCliente: estrellas, comentarioCliente: comentario || undefined }
      : prev
    );
    setCalificado(true);
  };

  // ── Cargando ──
  if (cargando) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ background: 'linear-gradient(160deg, #EFF6FF, #E0F2FE)' }}>
        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
        </svg>
        <p className="text-blue-600 font-semibold text-sm">Cargando tu vehículo...</p>
      </div>
    );
  }

  // ── No encontrado ──
  if (noEncontrado || !vehiculo) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center" style={{ background: '#F8FAFC' }}>
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Enlace no válido</h1>
        <p className="text-sm text-gray-500">Este enlace no existe o ha expirado. Contacta al lavadero.</p>
      </div>
    );
  }

  const entregado = vehiculo.estado === 'Entregado';
  const listo = vehiculo.estado === 'Listo';
  const yaCalificado = vehiculo.clasificacionCliente != null;

  const estadoConfig: Record<string, { bg: string; icon: string; label: string }> = {
    Recibido:   { bg: 'linear-gradient(135deg,#FCD34D,#F59E0B)', icon: '📋', label: 'Recibido' },
    Lavando:    { bg: 'linear-gradient(135deg,#60A5FA,#2563EB)', icon: '🧼', label: 'Lavando' },
    Enjuagando: { bg: 'linear-gradient(135deg,#38BDF8,#0369A1)', icon: '💦', label: 'Enjuagando' },
    Secando:    { bg: 'linear-gradient(135deg,#FDE68A,#D97706)', icon: '💨', label: 'Secando' },
    Encerando:  { bg: 'linear-gradient(135deg,#C4B5FD,#7C3AED)', icon: '✨', label: 'Encerando' },
    Listo:      { bg: 'linear-gradient(135deg,#34D399,#059669)', icon: '✅', label: '¡Listo para recoger!' },
    Entregado:  { bg: 'linear-gradient(135deg,#6EE7B7,#10B981)', icon: '🎉', label: 'Entregado' },
  };

  const cfg = estadoConfig[vehiculo.estado] ?? estadoConfig['Recibido'];
  const idx = ESTADOS_PIPELINE.indexOf(vehiculo.estado);
  const pct = entregado ? 100 : Math.round(((idx + 1) / ESTADOS_PIPELINE.length) * 100);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-8 pb-6 text-white text-center"
        style={{ background: cfg.bg }}
      >
        <div className="text-6xl mb-3">{cfg.icon}</div>
        <p className="text-2xl font-bold mb-1">{cfg.label}</p>
        <p className="text-white/80 text-base font-semibold">{vehiculo.placa}</p>
        <p className="text-white/60 text-sm mt-0.5">{vehiculo.clienteNombre}</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-8">

        {/* Barra progreso */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-800">Progreso</span>
            <span className="text-sm font-bold text-blue-600">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: cfg.bg }}
            />
          </div>
          {/* Mini pasos */}
          <div className="flex gap-1.5 mt-3">
            {ESTADOS_PIPELINE.map((e, i) => {
              const done = idx >= i;
              const current = idx === i;
              return (
                <div
                  key={e}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    done ? 'opacity-100' : 'bg-gray-200'
                  } ${current ? 'scale-y-150' : ''}`}
                  style={done ? { background: cfg.bg } : {}}
                />
              );
            })}
          </div>
        </div>

        {/* Info servicio */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Servicio</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{vehiculo.servicio}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Precio</p>
              <p className="text-base font-bold text-green-600 mt-0.5">
                ${vehiculo.precioPactado.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>

        {/* Banner Listo para recoger */}
        {listo && (
          <div
            className="rounded-2xl p-5 text-white text-center"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}
          >
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-xl font-bold">¡Tu vehículo está listo!</p>
            <p className="text-sm text-green-100 mt-1">Acércate al lavadero para recogerlo</p>
          </div>
        )}

        {/* Fotos antes/después */}
        {vehiculo.fotosEntrada.length > 0 && (
          <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-bold text-gray-800">📸 Fotos del vehículo</p>
            {vehiculo.fotosSalida.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400 text-center mb-2">Antes</p>
                  {vehiculo.fotosEntrada.map((f, i) => (
                    <img key={i} src={f} className="w-full h-28 object-cover rounded-xl mb-2" alt="" />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-500 text-center mb-2">Después ✨</p>
                  {vehiculo.fotosSalida.map((f, i) => (
                    <img key={i} src={f} className="w-full h-28 object-cover rounded-xl mb-2 ring-2 ring-green-300" alt="" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {vehiculo.fotosEntrada.map((f, i) => (
                  <img key={i} src={f} className="w-full h-28 object-cover rounded-xl" alt="" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold text-gray-800 mb-4">Historial de estados</p>
          {vehiculo.historicoEstados.map((h, i) => (
            <TimelineStep
              key={i}
              estado={h.estado}
              fecha={h.fecha}
              isActive={i === vehiculo.historicoEstados.length - 1}
              isLast={i === vehiculo.historicoEstados.length - 1}
            />
          ))}
        </div>

        {/* CALIFICACIÓN — solo después de Entregado */}
        {entregado && (
          yaCalificado ? (
            <RatingMostrado
              estrellas={vehiculo.clasificacionCliente!}
              comentario={vehiculo.comentarioCliente}
            />
          ) : (
            <RatingWidget onSubmit={manejarCalificacion} />
          )
        )}

        {/* Agradecimiento final */}
        {entregado && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-400">¡Gracias por usar Lavaautos! 🚗✨</p>
          </div>
        )}
      </div>
    </div>
  );
}
