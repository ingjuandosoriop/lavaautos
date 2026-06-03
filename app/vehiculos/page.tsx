'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vehiculo } from '@/types';
import { obtenerActivos, obtenerHistorial } from '@/lib/vehiculosService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BottomNav } from '@/components/ui/BottomNav';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useState, useEffect } from 'react';

type Tab = 'activos' | 'historial';

function tiempoDesde(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}

function VehicleRow({ v, showPrice = false }: { v: Vehiculo; showPrice?: boolean }) {
  const href = v.estado === 'Entregado' ? '#' : `/trabajador/${v.id}`;
  const Tag = v.estado === 'Entregado' ? 'div' : (Link as any);
  return (
    <Tag href={href}>
      <div className={`px-4 py-3 flex items-center gap-3 ${v.estado !== 'Entregado' ? 'active:bg-gray-50 cursor-pointer' : ''}`}>
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg flex-shrink-0">
          {v.estado === 'Entregado' ? '✅' : '🚗'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{v.placa}</span>
            <StatusBadge estado={v.estado as any} showPulse />
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{v.clienteNombre} · {v.servicio}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">{tiempoDesde(v.creadoEn)}</p>
          {v.estado !== 'Entregado' && <p className="text-xs text-blue-500 mt-0.5">→</p>}
        </div>
      </div>
    </Tag>
  );
}

export default function VehiculosPage() {
  const router = useRouter();
  const [activos, setActivos] = useState<Vehiculo[]>([]);
  const [historial, setHistorial] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState<Tab>('activos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const sesion = localStorage.getItem('lavaauto_sesion');
    if (!sesion) { router.push('/login'); return; }

    const cargar = () => {
      setActivos(obtenerActivos());
      setHistorial(obtenerHistorial().reverse());
      setCargando(false);
    };
    cargar();
    const iv = setInterval(cargar, 3000);
    return () => clearInterval(iv);
  }, [router]);

  const lista = useMemo(() => {
    const base = tab === 'activos' ? activos : historial;
    if (!busqueda.trim()) return base;
    const q = busqueda.toLowerCase();
    return base.filter(
      (v) =>
        v.placa.toLowerCase().includes(q) ||
        v.clienteNombre.toLowerCase().includes(q) ||
        v.clienteTelefono.includes(q)
    );
  }, [tab, activos, historial, busqueda]);

  return (
    <div className="flex flex-col h-full relative" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <div className="bg-white flex-shrink-0 px-4 pt-5 pb-3" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <h1 className="text-base font-bold text-gray-900 mb-1">Vehículos</h1>
        <p className="text-xs text-gray-400 mb-3">
          {activos.length} activos · {historial.length} en historial
        </p>

        {/* Search */}
        <div className="relative mb-3">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Buscar placa, cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-gray-100 border-0 pl-10 pr-4 py-2.5 rounded-2xl text-sm text-gray-800 placeholder-gray-400"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">×</button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
          {(['activos', 'historial'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150 capitalize ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t === 'activos' ? `Activos (${activos.length})` : `Historial (${historial.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {cargando ? (
          <div className="px-4 py-3 space-y-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
              {tab === 'activos' ? '🚗' : '📋'}
            </div>
            <p className="font-semibold text-gray-700">
              {busqueda ? 'Sin resultados' : tab === 'activos' ? 'Sin vehículos activos' : 'Sin historial'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {busqueda ? 'Prueba otro criterio' : tab === 'activos' ? 'Ingresa uno nuevo con ➕' : 'Aparecerán aquí los vehículos entregados'}
            </p>
          </div>
        ) : (
          <div className="bg-white mt-3 mx-3 rounded-2xl overflow-hidden divide-y divide-gray-50"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {lista.map((v) => (
              <VehicleRow key={v.id} v={v} />
            ))}
          </div>
        )}
        <div className="h-6" />
      </div>

      <BottomNav />

      {/* FAB — dentro del contenedor del celular */}
      <div className="absolute bottom-16 right-4 z-20">
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
