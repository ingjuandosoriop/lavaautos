'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verificarContrasena } from '@/lib/vehiculosService';

export default function Login() {
  const router = useRouter();
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const manejarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verificarContrasena(contrasena)) {
      // Guardar sesión en localStorage
      localStorage.setItem('lavaauto_sesion', 'autenticado');
      router.push('/');
    } else {
      setError('❌ Contraseña incorrecta');
      setContrasena('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-cyan-50 justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-3xl font-bold text-gray-800">Lavaautos</h1>
          <p className="text-sm text-gray-600 mt-2">Panel de Trabajador</p>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingresa la contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="w-full border-2 border-gray-300 p-4 rounded-lg text-lg font-bold tracking-widest"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 rounded-lg text-center font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-4 rounded-xl text-lg"
          >
            Acceder
          </button>
        </form>

        {/* Ayuda */}
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              <strong>Demo Trabajador:</strong> <code className="font-mono">1234</code>
            </p>
          </div>
          <p className="text-xs text-gray-600 text-center">
            ¿Eres dueño/gerente?{' '}
            <a href="/login-dueno" className="text-purple-600 hover:text-purple-700 font-bold">
              Acceso Dueño
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
