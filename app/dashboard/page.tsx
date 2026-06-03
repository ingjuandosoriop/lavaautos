'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerActivos, obtenerHistorial, obtenerEstadisticas, descargarCSV } from '@/lib/vehiculosService';
import { Vehiculo } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalHoy: 0,
    montoTotal: 0,
    vehiculosActivos: 0,
    vehiculosEntregados: 0,
    servicioMasVendido: null as string | null,
  });
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const verificarSesion = () => {
      const sesionDueño = localStorage.getItem('lavaauto_sesion_dueño');
      if (!sesionDueño) {
        router.push('/login-dueno');
        return;
      }

      // Si pasa la verificación, cargar datos
      const cargar = () => {
        const estadisticas = obtenerEstadisticas(1);
        setStats(estadisticas);
        setVerificando(false); // Marcar que ya verificó
      };

      cargar();
      const intervalo = setInterval(cargar, 5000); // Actualizar cada 5 segundos

      return () => clearInterval(intervalo);
    };

    verificarSesion();
  }, [router]);

  const activos = obtenerActivos();
  const entregados = obtenerHistorial();

  const cerrarSesion = () => {
    localStorage.removeItem('lavaauto_sesion_dueño');
    router.push('/login-dueno');
  };

  const tasaCompletitud = stats.totalHoy > 0
    ? Math.round((stats.vehiculosEntregados / stats.totalHoy) * 100)
    : 0;

  // Mostrar loading mientras verifica sesión
  if (verificando) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-gray-600 font-semibold">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-bold">📊 Dashboard</h1>
          <p className="text-xs opacity-90">Gerente/Dueño</p>
        </div>
        <button
          onClick={cerrarSesion}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold"
        >
          🚪 Salir
        </button>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* KPIs principales */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total de autos hoy */}
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
            <p className="text-xs text-gray-600 font-semibold">Autos Hoy</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalHoy}</p>
            <p className="text-xs text-gray-500 mt-1">registrados</p>
          </div>

          {/* Monto total */}
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <p className="text-xs text-gray-600 font-semibold">Facturado Hoy</p>
            <p className="text-2xl font-bold text-green-600">
              ${(stats.montoTotal / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-gray-500 mt-1">COP</p>
          </div>

          {/* Activos */}
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
            <p className="text-xs text-gray-600 font-semibold">En Proceso</p>
            <p className="text-3xl font-bold text-orange-600">{stats.vehiculosActivos}</p>
            <p className="text-xs text-gray-500 mt-1">siendo atendidos</p>
          </div>

          {/* Entregados */}
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-emerald-500">
            <p className="text-xs text-gray-600 font-semibold">Entregados</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.vehiculosEntregados}</p>
            <p className="text-xs text-gray-500 mt-1">{tasaCompletitud}% completitud</p>
          </div>
        </div>

        {/* Progreso visual */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <p className="text-sm font-semibold text-gray-800 mb-2">Progreso del Día</p>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${tasaCompletitud}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">{tasaCompletitud}% de autos completados</p>
        </div>

        {/* Servicio más vendido */}
        {stats.servicioMasVendido && (
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 shadow-md border-l-4 border-cyan-500">
            <p className="text-xs text-cyan-700 font-semibold">Servicio Popular</p>
            <p className="text-xl font-bold text-cyan-600 mt-1">{stats.servicioMasVendido}</p>
            <p className="text-xs text-cyan-600 mt-1">el más solicitado hoy</p>
          </div>
        )}

        {/* Autos en proceso */}
        {activos.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              🚗 En Proceso ({activos.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activos.map((v) => (
                <div
                  key={v.id}
                  className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-gray-800">{v.placa}</p>
                    <p className="text-xs text-gray-600">{v.clienteNombre}</p>
                  </div>
                  <span className="text-xs font-semibold bg-orange-200 text-orange-800 px-2 py-1 rounded">
                    {v.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Últimos entregados */}
        {entregados.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              ✅ Entregados Hoy ({entregados.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {entregados.slice(-5).map((v) => (
                <div
                  key={v.id}
                  className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-gray-800">{v.placa}</p>
                    <p className="text-xs text-gray-600">{v.clienteNombre}</p>
                  </div>
                  <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-1 rounded">
                    ${v.precioPactado.toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exportar datos */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-bold text-gray-800 mb-3">📥 Exportar Datos</h3>
          <div className="space-y-2">
            <button
              onClick={() => descargarCSV(1)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg text-sm"
            >
              📊 Descargar de Hoy (CSV)
            </button>
            <button
              onClick={() => descargarCSV(7)}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg text-sm"
            >
              📊 Descargar Esta Semana (CSV)
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Exporta placa, cliente, servicio, precio, estado y más
          </p>
        </div>

        {/* Configuración rápida */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-2">
          <h3 className="font-bold text-blue-800 mb-3">⚙️ Administración</h3>
          <button
            onClick={() => router.push('/configuracion')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
          >
            ⚙️ Configuración (Contraseña, Fidelización, Trabajadores)
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            ➡️ Ir al Panel de Trabajador
          </button>
        </div>
      </div>
    </div>
  );
}
