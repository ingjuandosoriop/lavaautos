'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  obtenerConfig,
  guardarConfig,
  obtenerTrabajadores,
  agregarTrabajador,
  verificarContrasena,
} from '@/lib/vehiculosService';
import { estáActivadoSonido, alternarSonidos } from '@/lib/sonidos';
import { ConfiguracionLavaauto } from '@/types';

export default function Configuracion() {
  const router = useRouter();
  const [config, setConfig] = useState<ConfiguracionLavaauto | null>(null);
  const [contrasena, setContrasena] = useState('');
  const [nuevaTrabajador, setNuevaTrabajador] = useState('');
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [autenticado, setAutenticado] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [verificando, setVerificando] = useState(true);
  const [sonicosActivados, setSonicosActivados] = useState(false);

  useEffect(() => {
    // Verificar sesión de dueño (NO sesión de trabajador)
    const sesionDueño = localStorage.getItem('lavaauto_sesion_dueño');
    if (!sesionDueño) {
      router.push('/login-dueno');
      return;
    }

    cargarDatos();
    setSonicosActivados(estáActivadoSonido());
    setVerificando(false); // Terminar verificación
  }, [router]);

  const cargarDatos = () => {
    const cfg = obtenerConfig();
    setConfig(cfg);
    const trab = obtenerTrabajadores();
    setTrabajadores(trab);
  };

  const manejarGuardarConfig = () => {
    if (!config) return;
    guardarConfig(config);
    alert('✓ Configuración guardada');
  };

  const manejarAgregarTrabajador = () => {
    if (!nuevaTrabajador.trim()) {
      alert('Ingresa un nombre');
      return;
    }
    agregarTrabajador(nuevaTrabajador);
    setNuevaTrabajador('');
    cargarDatos();
    alert('✓ Trabajador agregado');
  };

  const manejarAlternarSonidos = () => {
    alternarSonidos();
    setSonicosActivados(!sonicosActivados);
  };

  const manejarCambiarContrasena = () => {
    if (!contrasena || !passwordInput) {
      alert('Ingresa la nueva contraseña');
      return;
    }

    if (!config) return;

    const nuevaConfig = { ...config, contrasena: passwordInput };
    guardarConfig(nuevaConfig);
    setConfig(nuevaConfig);
    setPasswordInput('');
    alert('✓ Contraseña cambiada');
  };

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

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex items-center justify-between shadow-lg">
        <h1 className="text-xl font-bold">⚙️ Configuración</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-2xl hover:opacity-80"
        >
          ←
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* Contraseña */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-gray-800">🔐 Contraseña</h3>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Nueva Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa nueva contraseña"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full border-2 border-gray-300 p-3 rounded-lg"
            />
          </div>
          <button
            onClick={manejarCambiarContrasena}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
          >
            ✓ Cambiar Contraseña
          </button>
        </div>

        {/* Fidelización */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-gray-800">🎁 Programa de Fidelización</h3>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Estado</label>
            <button
              onClick={() => {
                const newConfig = { ...config, fidelizacion: { ...config.fidelizacion, activada: !config.fidelizacion.activada } };
                setConfig(newConfig);
              }}
              className={`w-full p-3 rounded-lg font-bold text-center ${
                config.fidelizacion.activada
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-800'
              }`}
            >
              {config.fidelizacion.activada ? '✓ Activado' : '✕ Desactivado'}
            </button>
          </div>

          {config.fidelizacion.activada && (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Lavados por Descuento
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.fidelizacion.lavadosPorDescuento}
                  onChange={(e) => {
                    const newConfig = {
                      ...config,
                      fidelizacion: {
                        ...config.fidelizacion,
                        lavadosPorDescuento: parseInt(e.target.value) || 1,
                      },
                    };
                    setConfig(newConfig);
                  }}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg"
                />
                <p className="text-xs text-gray-600 mt-1">
                  El cliente obtiene descuento después de cada {config.fidelizacion.lavadosPorDescuento} lavados
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Porcentaje de Descuento (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.fidelizacion.descuentoPorcentaje}
                  onChange={(e) => {
                    const newConfig = {
                      ...config,
                      fidelizacion: {
                        ...config.fidelizacion,
                        descuentoPorcentaje: parseInt(e.target.value) || 10,
                      },
                    };
                    setConfig(newConfig);
                  }}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Ejemplo: {config.fidelizacion.descuentoPorcentaje}% de descuento por cada {config.fidelizacion.lavadosPorDescuento} lavados
                </p>
              </div>
            </>
          )}

          <button
            onClick={manejarGuardarConfig}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
          >
            ✓ Guardar Fidelización
          </button>
        </div>

        {/* Notificaciones */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-gray-800">🔊 Notificaciones de Audio</h3>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Estado</label>
            <button
              onClick={manejarAlternarSonidos}
              className={`w-full p-3 rounded-lg font-bold text-center ${
                sonicosActivados
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-800'
              }`}
            >
              {sonicosActivados ? '🔊 Activado' : '🔇 Desactivado'}
            </button>
            <p className="text-xs text-gray-600 mt-2">
              Recibe notificaciones de audio cuando cambia el estado del vehículo
            </p>
          </div>
        </div>

        {/* Trabajadores */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-gray-800">👥 Trabajadores</h3>

          <div className="space-y-2">
            {trabajadores.map((t) => (
              <div
                key={t.id}
                className="bg-gray-100 p-3 rounded-lg flex justify-between items-center"
              >
                <p className="font-semibold">{t.nombre}</p>
                <p className="text-xs text-gray-600">ID: {t.id}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200 space-y-2">
            <label className="block text-sm text-gray-700">Agregar Trabajador</label>
            <input
              type="text"
              placeholder="Nombre del trabajador"
              value={nuevaTrabajador}
              onChange={(e) => setNuevaTrabajador(e.target.value)}
              className="w-full border-2 border-gray-300 p-3 rounded-lg"
            />
            <button
              onClick={manejarAgregarTrabajador}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
            >
              ➕ Agregar
            </button>
          </div>
        </div>

        {/* Información */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Consejo:</strong> Los cambios de configuración afectan solo a nuevos vehículos
            ingresados. Los vehículos actuales mantienen su precio original.
          </p>
        </div>
      </div>
    </div>
  );
}
