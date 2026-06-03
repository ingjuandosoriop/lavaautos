'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verificarContrasenaDueño } from '@/lib/vehiculosService';

export default function LoginDueño() {
  const router = useRouter();
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const manejarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verificarContrasenaDueño(contrasena)) {
      // Guardar sesión de dueño en localStorage
      localStorage.setItem('lavaauto_sesion_dueño', 'autenticado');
      router.push('/dashboard');
    } else {
      setError('❌ Contraseña incorrecta');
      setContrasena('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-blue-50 justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👔</div>
          <h1 className="text-3xl font-bold text-gray-800">Lavaautos</h1>
          <p className="text-sm text-gray-600 mt-2">Panel del Dueño/Gerente</p>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña del Dueño
            </label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
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
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl text-lg"
          >
            Acceder
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-2 text-center">
          <p className="text-xs text-gray-600">
            ¿Eres trabajador?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-bold">
              Ir al login del trabajador
            </a>
          </p>
          <p className="text-xs text-gray-600 pt-2 border-t border-gray-200">
            <strong>Demo:</strong> contraseña = <code className="font-mono">5678</code>
          </p>
        </div>
      </div>
    </div>
  );
}
