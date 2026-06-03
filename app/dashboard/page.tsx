'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerActivos, obtenerHistorial, obtenerEstadisticas, descargarCSV } from '@/lib/vehiculosService';
import { Vehiculo } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ToastContainer, useToast } from '@/components/ui/Toast';

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const toast = useToast();
  const [verificando, setVerificando] = useState(true);
  const [stats, setStats] = useState({
    totalHoy: 0, montoTotal: 0, vehiculosActivos: 0, vehiculosEntregados: 0,
    servicioMasVendido: null as string | null,
  });
  const [activos, setActivos] = useState<Vehiculo[]>([]);
  const [entregados, setEntregados] = useState<Vehiculo[]>([]);

  useEffect(() => {
    const sesion = localStorage.getItem('lavaauto_sesion_dueño');
    if (!sesion) { router.push('/login-dueno'); return; }

    const cargar = () => {
      setStats(obtenerEstadisticas(1));
      setActivos(obtenerActivos());
      setEntregados(obtenerHistorial().slice(-10).reverse());
      setVerificando(false);
    };
    cargar();
    const iv = setInterval(cargar, 5000);
    return () => clearInterval(iv);
  }, [router]);

  const cerrarSesion = () => {
    localStorage.removeItem('lavaauto_sesion_dueño');
    router.push('/login-dueno');
  };

  const handleExport = (dias: number) => {
    descargarCSV(dias);
    toast.success(`CSV descargado (${dias === 1 ? 'hoy' : 'esta semana'})`);
  };

  const tasaCompletitud = stats.totalHoy > 0
    ? Math.round((stats.vehiculosEntregados / stats.totalHoy) * 100) : 0;

  if (verificando) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#F8FAFC' }}>
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
          <p className="text-gray-500 text-sm font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F8FAFC' }}>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Header */}
      <div className="bg-white flex-shrink-0 px-4 pt-5 pb-4" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
              📊
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">Dashboard</h1>
              <p className="text-xs text-gray-400">Vista de gerente</p>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="💰" label="Facturado Hoy" value={`$${(stats.montoTotal / 1000).toFixed(0)}K`} color="text-green-600" />
          <StatCard icon="🚗" label="Autos Hoy"    value={stats.totalHoy}                               color="text-blue-600" />
          <StatCard icon="✅" label="Entregados"    value={stats.vehiculosEntregados}                    sub={`${tasaCompletitud}% completitud`} color="text-emerald-600" />
          <StatCard icon="⚙️" label="En Proceso"   value={stats.vehiculosActivos}                       color="text-orange-500" />
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Progreso del día</span>
            <span className="text-sm font-bold text-blue-600">{tasaCompletitud}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${tasaCompletitud}%`, background: 'linear-gradient(90deg, #2563EB, #22C55E)' }}
            />
          </div>
        </div>

        {/* Servicio popular */}
        {stats.servicioMasVendido && (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-xl flex-shrink-0">🏆</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Servicio más vendido</p>
              <p className="text-sm font-bold text-gray-900">{stats.servicioMasVendido}</p>
            </div>
          </div>
        )}

        {/* En proceso */}
        {activos.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">En proceso</h3>
              <span className="text-xs text-gray-400">{activos.length} vehículos</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
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

        {/* Recientes entregados */}
        {entregados.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Últimos entregados</h3>
              <span className="text-xs text-gray-400">{entregados.length} total</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
              {entregados.map((v) => (
                <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm flex-shrink-0">✅</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{v.placa}</p>
                    <p className="text-xs text-gray-500 truncate">{v.clienteNombre}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">${v.precioPactado.toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exportar */}
        <div className="bg-white rounded-2xl p-4 space-y-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Exportar datos</h3>
          <button
            onClick={() => handleExport(1)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #0D9488, #06B6D4)' }}
          >
            📊 Descargar Hoy (CSV)
          </button>
          <button
            onClick={() => handleExport(7)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
          >
            📊 Descargar Esta Semana (CSV)
          </button>
        </div>

        {/* Admin */}
        <div className="bg-white rounded-2xl p-4 space-y-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Administración</h3>
          <button
            onClick={() => router.push('/configuracion')}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
          >
            ⚙️ Configuración
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700"
          >
            → Ir al Panel de Trabajador
          </button>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
