'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vehiculo } from '@/types';
import { obtenerActivos } from '@/lib/vehiculosService';
import { AnimacionEstado } from '@/components/AnimacionEstado';

export default function TrabajadorDashboard() {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    // Verificar sesión
    const sesion = localStorage.getItem('lavaauto_sesion');
    if (!sesion) {
      router.push('/login');
      return;
    }

    // Cargar vehículos activos
    const cargar = () => {
      const activos = obtenerActivos();
      setVehiculos(activos);
      setCargando(false);
    };

    cargar();

    // Recargar cada 2 segundos
    const intervalo = setInterval(cargar, 2000);
    return () => clearInterval(intervalo);
  }, [router]);

  const cerrarSesion = () => {
    localStorage.removeItem('lavaauto_sesion');
    router.push('/login');
  };

  // Filtrar vehículos por búsqueda
  const vehiculosFiltrados = vehiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.clienteTelefono.includes(busqueda)
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-bold">🚗 Lavaautos</h1>
          <p className="text-xs opacity-90">Panel de Trabajador</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          title="Ver dashboard del dueño"
          className="text-2xl hover:opacity-80"
        >
          📊
        </button>
      </div>

      {/* Búsqueda */}
      <div className="p-4 bg-gradient-to-b from-blue-50 to-white border-b border-gray-200">
        <input
          type="text"
          placeholder="🔍 Buscar por placa, cliente o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border-2 border-gray-300 p-3 rounded-lg text-sm"
        />
        {busqueda && (
          <p className="text-xs text-gray-600 mt-2">
            Encontrados: {vehiculosFiltrados.length} de {vehiculos.length}
          </p>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cargando ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : vehiculosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">
              {busqueda ? '❌ No se encontraron vehículos' : 'ℹ️ No hay vehículos activos'}
            </p>
            <p className="text-sm mt-2">
              {busqueda ? 'Intenta otro criterio de búsqueda' : 'Ingresa uno nuevo para comenzar'}
            </p>
          </div>
        ) : (
          vehiculosFiltrados.map((v) => (
            <Link key={v.id} href={`/trabajador/${v.id}`}>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-800">{v.placa}</p>
                    <p className="text-sm text-gray-600">{v.clienteNombre}</p>
                  </div>
                  <div className="w-12 h-12 flex-shrink-0 text-blue-500">
                    <AnimacionEstado estado={v.estado} size="small" />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{v.servicio}</span>
                  <span>${v.precioPactado.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Botones finales */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-2">
        <Link href="/trabajador/nuevo">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg">
            ➕ Ingresar Vehículo
          </button>
        </Link>
        <button
          onClick={cerrarSesion}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg text-sm"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
