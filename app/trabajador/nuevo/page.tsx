'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { CapturaFotos } from '@/components/CapturaFotos';
import { AnimacionEstado } from '@/components/AnimacionEstado';
import { SelectorTrabajador } from '@/components/SelectorTrabajador';
import { HistorialPlaca } from '@/components/HistorialPlaca';
import {
  crearVehiculo,
  obtenerPrecioServicio,
  obtenerTrabajadores,
  obtenerHistorialPorPlaca,
  calcularDescuentoPorFidelizacion,
} from '@/lib/vehiculosService';
import { TipoServicio, SERVICIOS_CATALOGO, Trabajador } from '@/types';

const SERVICIOS: TipoServicio[] = ['Lavado Sencillo', 'Lavado Premium', 'Lavado de Motor'];

export default function NuevoVehiculo() {
  const router = useRouter();
  const [fotos, setFotos] = useState<string[]>([]);
  const [placa, setPlaca] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [servicio, setServicio] = useState<TipoServicio>('Lavado Sencillo');
  const [precioPactado, setPrecioPactado] = useState(obtenerPrecioServicio('Lavado Sencillo'));
  const [notas, setNotas] = useState('');
  const [trabajadorAsignado, setTrabajadorAsignado] = useState('');
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [linkGenerado, setLinkGenerado] = useState<{ enlace: string; token: string } | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [descuentoInfo, setDescuentoInfo] = useState<any>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Cargar trabajadores
  useEffect(() => {
    const trab = obtenerTrabajadores();
    setTrabajadores(trab);
  }, []);

  const manejarCambioServicio = (nuevoServicio: TipoServicio) => {
    setServicio(nuevoServicio);
    setPrecioPactado(obtenerPrecioServicio(nuevoServicio));
  };

  const manejarCambioPlaca = (nueva: string) => {
    setPlaca(nueva.toUpperCase());
    if (nueva.trim().length >= 2) {
      // Cargar historial y fidelización
      const hist = obtenerHistorialPorPlaca(nueva.toUpperCase());
      const desc = calcularDescuentoPorFidelizacion(nueva.toUpperCase());
      setHistorial(hist);
      setDescuentoInfo(desc);
    } else {
      setHistorial([]);
      setDescuentoInfo(null);
    }
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!placa.trim() || !clienteNombre.trim() || fotos.length === 0) {
      alert('Por favor completa: placa, nombre del cliente y al menos una foto');
      return;
    }

    setGuardando(true);

    try {
      const nuevo = crearVehiculo({
        placa,
        clienteNombre,
        clienteTelefono,
        servicio,
        precioPactado,
        notas,
        fotosEntrada: fotos,
        trabajadorAsignado,
      });

      // Mostrar pantalla de éxito con el link
      setLinkGenerado({
        enlace: `${window.location.origin}/seguimiento/${nuevo.tokenSeguimiento}`,
        token: nuevo.tokenSeguimiento,
      });
    } catch (error) {
      console.error(error);
      alert('Error al guardar. Intenta de nuevo.');
      setGuardando(false);
    }
  };

  // Pantalla de éxito
  if (linkGenerado) {
    const copiarAlPortapapeles = () => {
      navigator.clipboard.writeText(linkGenerado.enlace);
      alert('✅ Enlace copiado al portapapeles');
    };

    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-green-50 to-emerald-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={() => router.push('/')}
            className="text-2xl hover:opacity-80"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">✅ ¡Vehículo Registrado!</h1>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center space-y-6">
          {/* Animación de éxito */}
          <div className="flex justify-center">
            <AnimacionEstado estado="Recibido" size="large" />
          </div>

          {/* Información */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">{placa}</h2>
            <p className="text-lg text-gray-700">{clienteNombre}</p>
            <p className="text-sm text-gray-600">{servicio}</p>
          </div>

          {/* Código QR */}
          <div className="bg-white rounded-xl p-6 w-full shadow-md flex flex-col items-center space-y-3">
            <p className="text-sm font-semibold text-gray-700">Código QR del Cliente</p>
            <div
              ref={qrRef}
              className="bg-white p-3 rounded-lg border-2 border-gray-200"
            >
              <QRCodeSVG
                value={linkGenerado.enlace}
                level="H"
                size={200}
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-600 text-center">
              Imprime este código en el recibo para que el cliente lo escanee
            </p>
            <button
              onClick={() => {
                if (qrRef.current) {
                  const svg = qrRef.current.querySelector('svg') as SVGSVGElement;
                  if (svg) {
                    const serializer = new XMLSerializer();
                    const svgString = serializer.serializeToString(svg);
                    const blob = new Blob([svgString], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `QR_${placa}.svg`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }
                }
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg text-sm"
            >
              ⬇️ Descargar QR
            </button>
          </div>

          {/* Link del cliente */}
          <div className="bg-white rounded-xl p-4 w-full space-y-3 shadow-md">
            <p className="text-sm font-semibold text-gray-700 text-center">Enlace para el Cliente</p>
            <div className="bg-gray-100 rounded-lg p-3 break-all text-xs text-gray-800 font-mono text-center">
              {linkGenerado.enlace}
            </div>
            <button
              onClick={copiarAlPortapapeles}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
            >
              📋 Copiar Enlace
            </button>
            <a
              href={linkGenerado.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg text-center"
            >
              👁️ Ver Vista del Cliente
            </a>
          </div>

          {/* Token */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 w-full text-center">
            <p className="text-xs text-blue-700">
              <strong>ID de seguimiento:</strong> <code className="font-mono">{linkGenerado.token}</code>
            </p>
          </div>
        </div>

        {/* Botones finales */}
        <div className="p-4 bg-white border-t border-gray-200 space-y-2">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg"
          >
            ✓ Volver al Panel
          </button>
          <button
            onClick={() => {
              setLinkGenerado(null);
              setFotos([]);
              setPlaca('');
              setClienteNombre('');
              setClienteTelefono('');
              setServicio('Lavado Sencillo');
              setPrecioPactado(obtenerPrecioServicio('Lavado Sencillo'));
              setNotas('');
            }}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl text-lg"
          >
            ➕ Ingresar Otro Vehículo
          </button>
        </div>
      </div>
    );
  }

  // Formulario
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 flex items-center gap-3 shadow-lg">
        <button
          onClick={() => router.push('/')}
          className="text-2xl hover:opacity-80"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">Ingresar Vehículo</h1>
      </div>

      {/* Formulario */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Fotos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Fotos de Entrada *</label>
          <CapturaFotos fotos={fotos} onFotosCapturadas={setFotos} />
        </div>

        {/* Placa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Placa *</label>
          <input
            type="text"
            placeholder="ej: ABC123"
            value={placa}
            onChange={(e) => manejarCambioPlaca(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg"
            required
          />
        </div>

        {/* Historial por placa */}
        {placa.trim().length >= 2 && (
          <HistorialPlaca placa={placa} historial={historial} descuentoInfo={descuentoInfo} />
        )}

        {/* Nombre del cliente */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Cliente *</label>
          <input
            type="text"
            placeholder="ej: Juan Pérez"
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg"
            required
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono (WhatsApp)</label>
          <input
            type="tel"
            placeholder="ej: 3001234567"
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg"
          />
        </div>

        {/* Trabajador */}
        {trabajadores.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Trabajador Asignado</label>
            <SelectorTrabajador
              trabajadores={trabajadores}
              trabajadorActual={trabajadorAsignado}
              onSeleccionar={setTrabajadorAsignado}
              titulo="¿Quién atiende este auto?"
            />
          </div>
        )}

        {/* Servicio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Servicio *</label>
          <div className="space-y-2">
            {SERVICIOS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => manejarCambioServicio(s)}
                className={`w-full p-3 rounded-lg font-semibold text-left transition-all ${
                  servicio === s
                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                    : 'bg-gray-100 text-gray-800 border-2 border-gray-300'
                }`}
              >
                {s} - ${SERVICIOS_CATALOGO[s].toLocaleString('es-CO')}
              </button>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Pactado *</label>
          <input
            type="number"
            value={precioPactado}
            onChange={(e) => setPrecioPactado(parseInt(e.target.value) || 0)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            ${precioPactado.toLocaleString('es-CO')}
          </p>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Notas (opcional)</label>
          <textarea
            placeholder="ej: El cliente menciona un rayón en la puerta trasera"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-lg"
            rows={3}
          />
        </div>

        {/* Espacio para el botón */}
        <div className="h-4" />
      </div>

      {/* Botón guardar (fijo al fondo) */}
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          type="button"
          onClick={manejarGuardar}
          disabled={guardando}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl text-lg"
        >
          {guardando ? '⏳ Guardando...' : '✓ Guardar Vehículo'}
        </button>
      </div>
    </div>
  );
}
