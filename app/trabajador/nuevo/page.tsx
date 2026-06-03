'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { CapturaFotos } from '@/components/CapturaFotos';
import { SelectorTrabajador } from '@/components/SelectorTrabajador';
import { HistorialPlaca } from '@/components/HistorialPlaca';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import {
  crearVehiculo,
  obtenerPrecioServicio,
  obtenerTrabajadores,
  obtenerHistorialPorPlaca,
  calcularDescuentoPorFidelizacion,
} from '@/lib/vehiculosService';
import { TipoServicio, SERVICIOS_CATALOGO, Trabajador } from '@/types';

const SERVICIOS: TipoServicio[] = ['Lavado Sencillo', 'Lavado Premium', 'Encerado', 'Lavado de Motor'];

const SERVICIO_ICONS: Record<string, string> = {
  'Lavado Sencillo': '🧼',
  'Lavado Premium': '✨',
  'Encerado': '💎',
  'Lavado de Motor': '⚙️',
};

export default function NuevoVehiculo() {
  const router = useRouter();
  const toast = useToast();
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

  useEffect(() => {
    setTrabajadores(obtenerTrabajadores());
  }, []);

  const manejarCambioServicio = (s: TipoServicio) => {
    setServicio(s);
    setPrecioPactado(obtenerPrecioServicio(s));
  };

  const manejarCambioPlaca = (val: string) => {
    const upper = val.toUpperCase();
    setPlaca(upper);
    if (upper.trim().length >= 2) {
      setHistorial(obtenerHistorialPorPlaca(upper));
      setDescuentoInfo(calcularDescuentoPorFidelizacion(upper));
    } else {
      setHistorial([]);
      setDescuentoInfo(null);
    }
  };

  const manejarGuardar = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!placa.trim()) { toast.error('Ingresa la placa del vehículo'); return; }
    if (!clienteNombre.trim()) { toast.error('Ingresa el nombre del cliente'); return; }
    if (fotos.length === 0) { toast.error('Toma al menos una foto de entrada'); return; }

    setGuardando(true);

    try {
      const nuevo = crearVehiculo({
        placa, clienteNombre, clienteTelefono, servicio, precioPactado, notas,
        fotosEntrada: fotos, trabajadorAsignado,
      });
      setLinkGenerado({
        enlace: `${window.location.origin}/seguimiento/${nuevo.tokenSeguimiento}`,
        token: nuevo.tokenSeguimiento,
      });
      toast.success('Vehículo registrado correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar. Intenta de nuevo.');
      setGuardando(false);
    }
  };

  const copiar = () => {
    if (!linkGenerado) return;
    navigator.clipboard.writeText(linkGenerado.enlace);
    toast.success('Link copiado al portapapeles');
  };

  // — PANTALLA DE ÉXITO —
  if (linkGenerado) {
    return (
      <div className="flex flex-col h-full" style={{ background: '#F8FAFC' }}>
        <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

        {/* Header */}
        <div className="bg-white flex-shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
          style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
          <button onClick={() => router.push('/')} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-base">
            ←
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Vehículo Registrado</h1>
            <p className="text-xs text-green-600 font-semibold">✓ Todo listo</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Resumen */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">✅</div>
              <div>
                <p className="text-lg font-bold text-gray-900">{placa}</p>
                <p className="text-sm text-gray-500">{clienteNombre} · {servicio}</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-green-700">${precioPactado.toLocaleString('es-CO')} COP</p>
            </div>
          </div>

          {/* QR */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-bold text-gray-800 text-center mb-3">Código QR del Cliente</p>
            <div ref={qrRef} className="flex justify-center">
              <div className="p-3 bg-white rounded-2xl border-2 border-gray-100">
                <QRCodeSVG value={linkGenerado.enlace} size={180} level="H" includeMargin={true} />
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              El cliente escanea este código para ver el estado en tiempo real
            </p>
          </div>

          {/* Link */}
          <div className="bg-white rounded-2xl p-4 space-y-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-bold text-gray-800 mb-2">Enlace de seguimiento</p>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs font-mono text-blue-600 break-all">{linkGenerado.enlace}</p>
            </div>
            <button
              onClick={copiar}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}
            >
              📋 Copiar Link
            </button>
            <a
              href={linkGenerado.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 text-center"
            >
              👁️ Ver Vista del Cliente
            </a>
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 rounded-2xl text-base font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
              ✓ Volver al Panel
            </button>
            <button
              onClick={() => {
                setLinkGenerado(null); setFotos([]); setPlaca(''); setClienteNombre('');
                setClienteTelefono(''); setServicio('Lavado Sencillo');
                setPrecioPactado(obtenerPrecioServicio('Lavado Sencillo')); setNotas('');
              }}
              className="w-full py-3 rounded-2xl text-sm font-semibold bg-white text-gray-600 border border-gray-200"
            >
              ➕ Ingresar Otro Vehículo
            </button>
          </div>
          <div className="h-4" />
        </div>
      </div>
    );
  }

  // — FORMULARIO —
  return (
    <div className="flex flex-col h-full" style={{ background: '#F8FAFC' }}>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Header */}
      <div className="bg-white flex-shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <button onClick={() => router.push('/')} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-base">
          ←
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">Ingresar Vehículo</h1>
          <p className="text-xs text-gray-400">Completa todos los campos</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-6">

        {/* Fotos */}
        <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">📷</span>
            <p className="text-sm font-bold text-gray-800">Fotos de entrada <span className="text-red-400">*</span></p>
          </div>
          <CapturaFotos fotos={fotos} onFotosCapturadas={setFotos} />
        </div>

        {/* Datos del vehículo */}
        <div className="bg-white rounded-2xl p-4 space-y-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🚗</span>
            <p className="text-sm font-bold text-gray-800">Datos del vehículo</p>
          </div>

          {/* Placa */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Placa <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="ej: ABC123"
              value={placa}
              onChange={(e) => manejarCambioPlaca(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 p-3.5 rounded-2xl text-gray-900 font-bold tracking-widest text-lg uppercase"
              maxLength={8}
            />
          </div>

          {placa.trim().length >= 2 && (
            <HistorialPlaca placa={placa} historial={historial} descuentoInfo={descuentoInfo} />
          )}

          {/* Nombre */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Nombre del cliente <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="ej: Juan Pérez"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 p-3.5 rounded-2xl text-gray-900"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              WhatsApp (opcional)
            </label>
            <input
              type="tel"
              placeholder="ej: 3001234567"
              value={clienteTelefono}
              onChange={(e) => setClienteTelefono(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 p-3.5 rounded-2xl text-gray-900"
            />
          </div>
        </div>

        {/* Servicio */}
        <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🧼</span>
            <p className="text-sm font-bold text-gray-800">Servicio <span className="text-red-400">*</span></p>
          </div>
          <div className="space-y-2">
            {SERVICIOS.map((s) => {
              const active = servicio === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => manejarCambioServicio(s)}
                  className={`w-full p-3.5 rounded-2xl font-semibold text-left flex items-center justify-between transition-all duration-150 ${
                    active
                      ? 'border-2 border-blue-500 text-blue-700'
                      : 'border-2 border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200'
                  }`}
                  style={active ? { background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' } : {}}
                >
                  <span className="flex items-center gap-2">
                    <span>{SERVICIO_ICONS[s] ?? '🧼'}</span>
                    <span className="text-sm">{s}</span>
                  </span>
                  <span className={`text-sm font-bold ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                    ${SERVICIOS_CATALOGO[s].toLocaleString('es-CO')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Precio */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Precio pactado (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">$</span>
              <input
                type="number"
                value={precioPactado}
                onChange={(e) => setPrecioPactado(parseInt(e.target.value) || 0)}
                className="w-full bg-gray-50 border-2 border-gray-200 pl-8 pr-4 py-3.5 rounded-2xl text-gray-900 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Trabajador */}
        {trabajadores.length > 0 && (
          <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">👤</span>
              <p className="text-sm font-bold text-gray-800">Trabajador asignado</p>
            </div>
            <SelectorTrabajador
              trabajadores={trabajadores}
              trabajadorActual={trabajadorAsignado}
              onSeleccionar={setTrabajadorAsignado}
              titulo=""
            />
          </div>
        )}

        {/* Notas */}
        <div className="bg-white rounded-2xl p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">📝</span>
            <p className="text-sm font-bold text-gray-800">Notas (opcional)</p>
          </div>
          <textarea
            placeholder="ej: Cliente menciona rayón en la puerta trasera..."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-200 p-3.5 rounded-2xl text-gray-900 text-sm resize-none"
            rows={3}
          />
        </div>

        <div className="h-4" />
      </div>

      {/* Botón guardar fijo */}
      <div className="flex-shrink-0 px-4 py-4 bg-white" style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.06)' }}>
        <button
          type="button"
          onClick={manejarGuardar}
          disabled={guardando}
          className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all duration-200"
          style={{
            background: guardando
              ? '#94A3B8'
              : 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
            boxShadow: guardando ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
          }}
        >
          {guardando ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
              </svg>
              Registrando...
            </span>
          ) : '✓ Registrar Vehículo'}
        </button>
      </div>
    </div>
  );
}
