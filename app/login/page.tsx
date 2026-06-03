'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verificarContrasena, verificarContrasenaDueño } from '@/lib/vehiculosService';

type Vista = 'landing' | 'trabajador' | 'gerente';

export default function Login() {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>('landing');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  const volver = () => {
    setVista('landing');
    setContrasena('');
    setError('');
    setCargando(false);
    setMostrar(false);
  };

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    await new Promise((r) => setTimeout(r, 400));

    if (vista === 'trabajador') {
      if (verificarContrasena(contrasena)) {
        localStorage.setItem('lavaauto_sesion', 'autenticado');
        router.push('/');
      } else {
        setError('Contraseña incorrecta');
        setContrasena('');
        setCargando(false);
      }
    } else {
      if (verificarContrasenaDueño(contrasena)) {
        localStorage.setItem('lavaauto_sesion_dueño', 'autenticado');
        router.push('/gerencial');
      } else {
        setError('Contraseña incorrecta');
        setContrasena('');
        setCargando(false);
      }
    }
  };

  // ── LANDING ──────────────────────────────────────────────
  if (vista === 'landing') {
    return (
      <div
        className="flex flex-col h-full"
        style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 60%, #0F172A 100%)' }}
      >
        {/* Branding */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-5 border border-white/10"
            style={{ background: 'linear-gradient(135deg, #2563EB22, #06B6D422)' }}
          >
            🚗
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Lavaautos</h1>
          <p className="text-blue-300 text-sm mb-12">Sistema de gestión operativa</p>

          {/* Roles */}
          <div className="w-full space-y-3">
            <p className="text-xs text-white/40 text-center uppercase tracking-widest mb-4">
              Selecciona tu rol
            </p>

            {/* Trabajador */}
            <button
              onClick={() => setVista('trabajador')}
              className="w-full flex items-center gap-4 bg-white/8 hover:bg-white/12 border border-white/10 rounded-2xl p-4 text-left transition-all duration-150 active:scale-98"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}
              >
                🧼
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base">Soy Trabajador</p>
                <p className="text-blue-300 text-xs mt-0.5">Recibir y gestionar vehículos</p>
              </div>
              <span className="text-white/40 text-xl">›</span>
            </button>

            {/* Gerente */}
            <button
              onClick={() => setVista('gerente')}
              className="w-full flex items-center gap-4 border border-white/10 rounded-2xl p-4 text-left transition-all duration-150 active:scale-98"
              style={{ background: 'rgba(124,58,237,0.15)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
              >
                📊
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base">Soy Gerente</p>
                <p className="text-purple-300 text-xs mt-0.5">Dashboard, reportes y configuración</p>
              </div>
              <span className="text-white/40 text-xl">›</span>
            </button>
          </div>
        </div>

        <div className="p-4 text-center">
          <p className="text-xs text-white/20">Lavaautos v1.0</p>
        </div>
      </div>
    );
  }

  // ── FORMULARIO ────────────────────────────────────────────
  const esTrabajador = vista === 'trabajador';
  const gradiente = esTrabajador
    ? 'linear-gradient(160deg, #1D4ED8 0%, #0F172A 100%)'
    : 'linear-gradient(160deg, #6D28D9 0%, #0F172A 100%)';
  const accentGrad = esTrabajador
    ? 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)'
    : 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)';
  const btnShadow = esTrabajador
    ? '0 4px 16px rgba(37,99,235,0.35)'
    : '0 4px 16px rgba(124,58,237,0.35)';
  const hintColor = esTrabajador ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700';
  const hintBadge = esTrabajador ? 'bg-blue-100' : 'bg-purple-100';
  const demoPin = esTrabajador ? '1234' : '5678';
  const icono = esTrabajador ? '🧼' : '📊';
  const titulo = esTrabajador ? 'Panel de Trabajador' : 'Panel Gerencial';

  return (
    <div className="flex flex-col h-full" style={{ background: gradiente }}>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div
          className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-5 border border-white/20"
        >
          <span className="text-4xl">{icono}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Lavaautos</h1>
        <p className="text-blue-200 text-sm mb-8 font-medium">{titulo}</p>

        {/* Card */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {esTrabajador ? 'Acceso Trabajador 👷' : 'Acceso Gerente 🔐'}
          </h2>
          <p className="text-sm text-gray-500 mb-5">Ingresa tu contraseña para continuar</p>

          <form onSubmit={manejarLogin} className="space-y-4">
            <div className="relative">
              <input
                type={mostrar ? 'text' : 'password'}
                placeholder="Contraseña"
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
                <span>⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando || !contrasena}
              className="w-full text-white font-bold py-4 rounded-2xl text-base transition-all duration-200"
              style={{
                background: cargando || !contrasena ? '#94A3B8' : accentGrad,
                boxShadow: cargando || !contrasena ? 'none' : btnShadow,
              }}
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : 'Entrar →'}
            </button>
          </form>

          {/* Demo hint */}
          <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${hintColor}`}>
            <span className="text-sm">💡</span>
            <p className="text-xs">
              <span className="font-bold">Demo:</span>{' '}
              <code className={`px-1.5 py-0.5 rounded font-mono ${hintBadge}`}>{demoPin}</code>
            </p>
          </div>

          {/* Volver */}
          <button
            onClick={volver}
            className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
          >
            ← Cambiar de rol
          </button>
        </div>
      </div>
    </div>
  );
}
