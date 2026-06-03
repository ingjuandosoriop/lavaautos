'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verificarContrasenaDueño } from '@/lib/vehiculosService';

export default function LoginDueno() {
  const router = useRouter();
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    await new Promise((r) => setTimeout(r, 400));
    if (verificarContrasenaDueño(contrasena)) {
      localStorage.setItem('lavaauto_sesion_dueño', 'autenticado');
      router.push('/dashboard');
    } else {
      setError('Contraseña incorrecta. Intenta de nuevo.');
      setContrasena('');
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(160deg, #6D28D9 0%, #0F172A 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 border border-white/20">
          <span className="text-4xl">📊</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Gerencial</h1>
        <p className="text-purple-200 text-sm mb-8 font-medium">Acceso exclusivo para dueños</p>

        <div className="w-full bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Acceso de Dueño 🔐</h2>
          <p className="text-sm text-gray-500 mb-5">Solo personal autorizado</p>

          <form onSubmit={manejarLogin} className="space-y-4">
            <div className="relative">
              <input
                type={mostrar ? 'text' : 'password'}
                placeholder="Contraseña gerencial"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full border-2 border-gray-200 bg-gray-50 p-4 rounded-2xl text-gray-900 font-semibold tracking-widest pr-12 text-lg"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setMostrar(!mostrar)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
              >
                {mostrar ? '🙈' : '👁️'}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
                <span>⚠️</span><span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando || !contrasena}
              className="w-full text-white font-bold py-4 rounded-2xl text-base transition-all duration-200"
              style={{
                background: cargando || !contrasena ? '#94A3B8' : 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                boxShadow: cargando || !contrasena ? 'none' : '0 4px 16px rgba(124,58,237,0.35)'
              }}
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                  Verificando...
                </span>
              ) : 'Acceder →'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-purple-50 rounded-xl flex items-center gap-2">
            <span className="text-purple-500 text-sm">💡</span>
            <p className="text-xs text-purple-700">
              <span className="font-bold">Demo dueño:</span>{' '}
              <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono">5678</code>
            </p>
          </div>
          <div className="mt-3 text-center">
            <a href="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
              ← Volver al acceso de trabajador
            </a>
          </div>
        </div>
      </div>
      <div className="p-4 text-center">
        <p className="text-xs text-purple-300/60">Lavaautos v1.0 • Solo gerentes autorizados</p>
      </div>
    </div>
  );
}
