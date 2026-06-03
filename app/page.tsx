'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vehiculo } from '@/types';
import { obtenerActivos } from '@/lib/vehiculosService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BottomNav } from '@/components/ui/BottomNav';
import { SkeletonCard } from '@/components/ui/Skeleton';

type Filtro = 'Todos' | 'Recibido' | 'Lavando' | 'Listo';

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'Todos',    label: 'Todos' },
  { key: 'Recibido', label: 'Pendientes' },
  { key: 'Lavando',  label: 'Lavando' },
  { key: 'Listo',    label: 'Listos' },
];

const TIEMPO_ESTADOS: Record<string, string> = {
  Recibido: '⏳', Lavando: '🧼', Enjuagando: '💦', Secando: '💨',
  Encerando: '✨', Listo: '✅', Entregado: '🎉',
};

function tiempoDesde(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function VehicleCard({ v, index }: { v: Vehiculo; index: number }) {
  return (
    <Link href={`/trabajador/${v.id}`}>
      <div
        className="bg-white rounded-2xl p-4 card-hover animate-card cursor-pointer"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          animationDelay: `${index * 40}ms`
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}>
            {TIEMPO_ESTADOS[v.estado] ?? '🚗'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base font-bold text-gray-900 tracking-wide">{v.placa}</span>
              <StatusBadge estado={v.estado as any} showPulse />
            </div>
            <p className="text-sm text-gray-500 truncate">{v.clienteNombre}</p>
          </div>

          {/* Tiempo */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">⏱ {tiempoDesde(v.creadoEn)}</p>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-500">{v.servicio}</span>
          <span className="text-sm font-bold text-gray-800">
            ${v.precioPactado.toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MetricCard({ icon, label, value, color }: {
  icon: string; label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 flex-1"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function TrabajadorDashboard() {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('Todos');
  const [showFAB, setShowFAB] = useState(false);

  useEffect(() => {
    const sesion = localStorage.getItem('lavaauto_sesion');
    if (!sesion) { router.push('/login'); return; }

    const cargar = () => {
      setVehiculos(obtenerActivos());
      setCargando(false);
    };
    cargar();
    const iv = setInterval(cargar, 2000);
    setTimeout(() => setShowFAB(true), 300);
    return () => clearInterval(iv);
  }, [router]);

  const vehiculosFiltrados = useMemo(() => {
    let list = vehiculos;
    if (filtro !== 'Todos') {
      list = list.filter((v) => v.estado === filtro);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(
        (v) =>
          v.placa.toLowerCase().includes(q) ||
          v.clienteNombre.toLowerCase().includes(q) ||
          v.clienteTelefono.includes(q)
      );
    }
    return list;
  }, [vehiculos, filtro, busqueda]);

  const enProceso = vehiculos.filter((v) => !['Recibido', 'Listo', 'Entregado'].includes(v.estado)).length;

  return (
    <div className="flex flex-col h-full relative" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <div className="bg-white flex-shrink-0 px-4 pt-5 pb-4" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}>
              🚗
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">Lavaautos</h1>
              <p className="text-xs text-gray-400">Panel de Operaciones</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('lavaauto_sesion'); router.push('/login'); }}
            className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-base"
            title="Cerrar sesión"
          >
            🚪
          </button>
        </div>

        {/* Greeting */}
        <div className="mb-3">
          <p className="text-xl font-bold text-gray-900">
            Hola 👋
          </p>
          <p className="text-sm text-gray-500">
            {cargando ? 'Cargando...' : `${vehiculos.length} vehículos activos · ${enProceso} en proceso`}
          </p>
        </div>

        {/* Indicadores operativos (sin dinero) */}
        {!cargando && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-amber-50 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {vehiculos.filter(v => v.estado === 'Recibido').length}
              </p>
              <p className="text-xs text-amber-700 font-medium mt-0.5">Pendientes</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{enProceso}</p>
              <p className="text-xs text-blue-700 font-medium mt-0.5">En proceso</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {vehiculos.filter(v => v.estado === 'Listo').length}
              </p>
              <p className="text-xs text-green-700 font-medium mt-0.5">Listos</p>
            </div>
          </div>
        )}
      </div>

      {/* Search + Filtros */}
      <div className="px-4 py-3 flex-shrink-0 bg-white">
        {/* Search */}
        <div className="relative mb-3">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
          <input
            type="text"
            placeholder="Buscar placa, cliente o teléfono"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-gray-100 border-0 pl-10 pr-4 py-3 rounded-2xl text-sm text-gray-800 placeholder-gray-400 font-medium"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {FILTROS.map((f) => {
            const active = filtro === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #2563EB, #06B6D4)' } : {}}
              >
                {f.label}
                {f.key !== 'Todos' && (
                  <span className={`ml-1.5 ${active ? 'text-blue-100' : 'text-gray-400'}`}>
                    {vehiculos.filter((v) => v.estado === f.key).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-6">
        {cargando ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : vehiculosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
              {busqueda ? '🔍' : '🚗'}
            </div>
            <p className="font-semibold text-gray-700">
              {busqueda ? 'Sin resultados' : 'Sin vehículos activos'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {busqueda ? 'Prueba otro criterio' : 'Presiona ➕ para ingresar uno'}
            </p>
          </div>
        ) : (
          vehiculosFiltrados.map((v, i) => (
            <VehicleCard key={v.id} v={v} index={i} />
          ))
        )}
        {/* Spacer para FAB */}
        <div className="h-4" />
      </div>

      <BottomNav />

      {/* FAB — dentro del contenedor del celular */}
      <div
        className={`absolute bottom-16 right-4 z-20 transition-all duration-300 pointer-events-auto ${
          showFAB ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
        }`}
      >
        <Link href="/trabajador/nuevo">
          <button
            className="w-14 h-14 rounded-2xl text-white text-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
              boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            }}
          >
            ＋
          </button>
        </Link>
      </div>
    </div>
  );
}
