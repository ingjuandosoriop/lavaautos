'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  obtenerActivos, obtenerHistorial, obtenerEstadisticas, descargarCSV,
  obtenerConfig, guardarConfig, obtenerTrabajadores, agregarTrabajador,
  obtenerResumenCalificaciones,
} from '@/lib/vehiculosService';
import { estáActivadoSonido, alternarSonidos } from '@/lib/sonidos';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { ConfiguracionLavaauto, Vehiculo, Trabajador } from '@/types';

type Tab = 'dashboard' | 'config';

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</span>
        <span>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Tab Dashboard ────────────────────────────────────────────────
type ResumenRating = ReturnType<typeof obtenerResumenCalificaciones>;

function EstrellasMini({ n, total }: { n: number; total: number }) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-4">⭐</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{n}</span>
    </div>
  );
}

function TabDashboard({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [stats, setStats] = useState({ totalHoy: 0, montoTotal: 0, vehiculosActivos: 0, vehiculosEntregados: 0, servicioMasVendido: null as string | null });
  const [activos, setActivos] = useState<Vehiculo[]>([]);
  const [entregados, setEntregados] = useState<Vehiculo[]>([]);
  const [rating, setRating] = useState<ResumenRating>({ promedio: 0, total: 0, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, recientes: [] });

  useEffect(() => {
    const cargar = () => {
      setStats(obtenerEstadisticas(1));
      setActivos(obtenerActivos());
      setEntregados(obtenerHistorial().reverse().slice(0, 10));
      setRating(obtenerResumenCalificaciones());
    };
    cargar();
    const iv = setInterval(cargar, 5000);
    return () => clearInterval(iv);
  }, []);

  const tasa = stats.totalHoy > 0 ? Math.round((stats.vehiculosEntregados / stats.totalHoy) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="💰" label="Facturado Hoy" value={`$${(stats.montoTotal / 1000).toFixed(0)}K`} color="text-green-600" />
        <StatCard icon="🚗" label="Autos Hoy"     value={stats.totalHoy}                              color="text-blue-600" />
        <StatCard icon="✅" label="Entregados"     value={stats.vehiculosEntregados} sub={`${tasa}% completitud`} color="text-emerald-600" />
        <StatCard icon="⚙️" label="En Proceso"    value={stats.vehiculosActivos}                      color="text-orange-500" />
      </div>

      {/* Progreso */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Progreso del día</span>
          <span className="text-sm font-bold text-blue-600">{tasa}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${tasa}%`, background: 'linear-gradient(90deg, #2563EB, #22C55E)' }}
          />
        </div>
      </div>

      {/* Servicio popular */}
      {stats.servicioMasVendido && (
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-xl flex-shrink-0">🏆</div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Servicio más vendido</p>
            <p className="text-sm font-bold text-gray-900">{stats.servicioMasVendido}</p>
          </div>
        </div>
      )}

      {/* Activos */}
      {activos.length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">En proceso</span>
            <span className="text-xs text-gray-400">{activos.length}</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-44 overflow-y-auto">
            {activos.map((v) => (
              <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm flex-shrink-0">🚗</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{v.placa}</p>
                  <p className="text-xs text-gray-500 truncate">{v.clienteNombre}</p>
                </div>
                <StatusBadge estado={v.estado as any} showPulse />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entregados recientes */}
      {entregados.length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">Últimos entregados</span>
            <span className="text-xs text-gray-400">{entregados.length}</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-44 overflow-y-auto">
            {entregados.map((v) => (
              <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm flex-shrink-0">✅</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{v.placa}</p>
                  <p className="text-xs text-gray-500 truncate">{v.clienteNombre} · {v.servicio}</p>
                </div>
                <span className="text-sm font-bold text-green-600">${v.precioPactado.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calificaciones */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">⭐ Calificaciones</span>
          <span className="text-xs text-gray-400">{rating.total} reseñas</span>
        </div>

        {rating.total === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-3xl mb-2">⭐</p>
            <p className="text-sm text-gray-500">Aún no hay calificaciones</p>
            <p className="text-xs text-gray-400 mt-1">Aparecerán cuando los clientes califiquen</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Promedio grande */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{rating.promedio.toFixed(1)}</p>
                <p className="text-xs text-gray-400 mt-1">de 5</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((n) => (
                  <EstrellasMini key={n} n={rating.distribucion[n] ?? 0} total={rating.total} />
                ))}
              </div>
            </div>

            {/* Estrellas visuales del promedio */}
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => {
                const llena = n <= Math.round(rating.promedio);
                return (
                  <span key={n} className={`text-xl ${llena ? '' : 'opacity-20'}`}>⭐</span>
                );
              })}
            </div>

            {/* Reseñas recientes */}
            {rating.recientes.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Últimas reseñas</p>
                {rating.recientes.map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-800">{r.placa}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span key={n} className={`text-sm ${n <= r.estrellas ? '' : 'opacity-20'}`}>⭐</span>
                        ))}
                      </div>
                    </div>
                    {r.comentario && (
                      <p className="text-xs text-gray-600 italic">"{r.comentario}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(r.fecha).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exportar */}
      <div className="bg-white rounded-2xl p-4 space-y-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <p className="text-sm font-bold text-gray-800 mb-3">Exportar datos</p>
        <button
          onClick={() => { descargarCSV(1); toast.success('CSV de hoy descargado'); }}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #0D9488, #06B6D4)' }}
        >
          📊 Hoy (CSV)
        </button>
        <button
          onClick={() => { descargarCSV(7); toast.success('CSV de la semana descargado'); }}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
        >
          📊 Esta semana (CSV)
        </button>
      </div>
    </div>
  );
}

// ─── Tab Configuración ────────────────────────────────────────────
function TabConfig({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [config, setConfig] = useState<ConfiguracionLavaauto | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [nuevoPwd, setNuevoPwd] = useState('');
  const [nuevoTrab, setNuevoTrab] = useState('');
  const [sonidos, setSonidos] = useState(false);

  useEffect(() => {
    setConfig(obtenerConfig());
    setTrabajadores(obtenerTrabajadores());
    setSonidos(estáActivadoSonido());
  }, []);

  const guardar = () => {
    if (!config) return;
    guardarConfig(config);
    toast.success('Configuración guardada');
  };

  const cambiarPwd = () => {
    if (!nuevoPwd.trim() || !config) { toast.error('Ingresa una contraseña válida'); return; }
    const c = { ...config, contrasena: nuevoPwd };
    guardarConfig(c);
    setConfig(c);
    setNuevoPwd('');
    toast.success('Contraseña cambiada');
  };

  const addTrab = () => {
    if (!nuevoTrab.trim()) { toast.error('Ingresa un nombre'); return; }
    agregarTrabajador(nuevoTrab.trim());
    setTrabajadores(obtenerTrabajadores());
    setNuevoTrab('');
    toast.success('Trabajador agregado');
  };

  const toggleSonidos = () => {
    alternarSonidos();
    setSonidos(estáActivadoSonido());
  };

  if (!config) return null;

  return (
    <div className="space-y-4">
      {/* Contraseña trabajador */}
      <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <p className="text-sm font-bold text-gray-800">🔑 Contraseña Trabajadores</p>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={nuevoPwd}
          onChange={(e) => setNuevoPwd(e.target.value)}
          className="w-full bg-gray-50 border-2 border-gray-200 p-3 rounded-2xl text-sm"
        />
        <button
          onClick={cambiarPwd}
          className="w-full py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}
        >
          Cambiar contraseña
        </button>
      </div>

      {/* Fidelización */}
      <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800">🎁 Fidelización</p>
          <button
            onClick={() => setConfig({ ...config, fidelizacion: { ...config.fidelizacion, activada: !config.fidelizacion.activada } })}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              config.fidelizacion.activada ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {config.fidelizacion.activada ? 'Activo' : 'Inactivo'}
          </button>
        </div>

        {config.fidelizacion.activada && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Lavados por descuento</label>
              <input
                type="number"
                min="1"
                value={config.fidelizacion.lavadosPorDescuento}
                onChange={(e) => setConfig({ ...config, fidelizacion: { ...config.fidelizacion, lavadosPorDescuento: parseInt(e.target.value) || 1 } })}
                className="w-full bg-gray-50 border-2 border-gray-200 p-3 rounded-2xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Porcentaje de descuento (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.fidelizacion.descuentoPorcentaje}
                onChange={(e) => setConfig({ ...config, fidelizacion: { ...config.fidelizacion, descuentoPorcentaje: parseInt(e.target.value) || 10 } })}
                className="w-full bg-gray-50 border-2 border-gray-200 p-3 rounded-2xl text-sm"
              />
            </div>
          </div>
        )}
        <button
          onClick={guardar}
          className="w-full py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
        >
          Guardar fidelización
        </button>
      </div>

      {/* Sonidos */}
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-800">🔊 Notificaciones de audio</p>
            <p className="text-xs text-gray-400 mt-0.5">Sonido al cambiar estado</p>
          </div>
          <button
            onClick={toggleSonidos}
            className={`w-12 h-6 rounded-full transition-all duration-200 relative ${
              sonidos ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                sonidos ? 'left-6' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Trabajadores */}
      <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <p className="text-sm font-bold text-gray-800">👥 Trabajadores</p>
        <div className="space-y-2 max-h-36 overflow-y-auto">
          {trabajadores.map((t) => (
            <div key={t.id} className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl">
              <span className="text-sm font-medium text-gray-800">{t.nombre}</span>
              <span className="text-xs text-gray-400">#{t.id}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Nombre del trabajador"
            value={nuevoTrab}
            onChange={(e) => setNuevoTrab(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTrab()}
            className="flex-1 bg-gray-50 border-2 border-gray-200 px-3 py-2.5 rounded-xl text-sm"
          />
          <button
            onClick={addTrab}
            className="px-4 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}
          >
            ＋
          </button>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}

// ─── Página Gerencial ─────────────────────────────────────────────
export default function Gerencial() {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const sesion = localStorage.getItem('lavaauto_sesion_dueño');
    if (!sesion) { router.push('/login'); return; }
    setVerificando(false);
  }, [router]);

  const cerrar = () => {
    localStorage.removeItem('lavaauto_sesion_dueño');
    router.push('/login');
  };

  if (verificando) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#F8FAFC' }}>
        <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F8FAFC' }}>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Header */}
      <div className="bg-white flex-shrink-0 px-4 pt-5 pb-3" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
            >
              📊
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">Gerencial</h1>
              <p className="text-xs text-gray-400">Vista privada del negocio</p>
            </div>
          </div>
          <button
            onClick={cerrar}
            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold"
          >
            Salir
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
          {([
            { key: 'dashboard', label: '📈 Dashboard' },
            { key: 'config',    label: '⚙️ Configuración' },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === 'dashboard' ? <TabDashboard toast={toast} /> : <TabConfig toast={toast} />}
      </div>
    </div>
  );
}
