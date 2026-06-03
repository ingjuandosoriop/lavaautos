'use client';

import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

export default function ReportesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <div className="bg-white flex-shrink-0 px-4 pt-5 pb-4" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <h1 className="text-base font-bold text-gray-900">Reportes</h1>
        <p className="text-xs text-gray-400">Estadísticas del negocio</p>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Ícono */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6"
          style={{ background: 'linear-gradient(135deg, #F3E8FF, #DBEAFE)' }}
        >
          🔐
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Acceso Gerencial
        </h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Los reportes y estadísticas del negocio son exclusivos para el dueño o gerente del lavadero.
        </p>

        {/* Botón de acceso */}
        <button
          onClick={() => router.push('/login-dueno')}
          className="w-full py-4 rounded-2xl text-base font-bold text-white mb-3"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
        >
          Acceder como Dueño
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full py-3 rounded-2xl text-sm font-semibold bg-white text-gray-600 border border-gray-200"
        >
          ← Volver al inicio
        </button>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-2xl w-full text-left">
          <p className="text-xs font-bold text-blue-800 mb-2">📊 Los reportes incluyen:</p>
          <ul className="space-y-1">
            {['Ventas del día y semana', 'Ingresos totales', 'Servicio más vendido', 'Exportación de datos (CSV)'].map((item) => (
              <li key={item} className="text-xs text-blue-700 flex items-center gap-1.5">
                <span className="text-blue-400">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
