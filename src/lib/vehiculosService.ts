import {
  Vehiculo,
  EstadoVehiculo,
  HistorialEstado,
  SERVICIOS_CATALOGO,
  ESTADOS_PIPELINE,
  TipoServicio,
  Trabajador,
  ConfiguracionLavaauto,
  CONFIG_DEFAULT,
} from '@/types';

// Generador de token aleatorio para seguimiento
function generarToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Guardar en localStorage
function guardar(vehiculos: Vehiculo[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vehiculos_lavaautos', JSON.stringify(vehiculos));
  }
}

// Cargar desde localStorage
function cargar(): Vehiculo[] {
  if (typeof window !== 'undefined') {
    const datos = localStorage.getItem('vehiculos_lavaautos');
    return datos ? JSON.parse(datos) : [];
  }
  return [];
}

// Obtener todos los vehículos activos (no entregados)
export function obtenerActivos(): Vehiculo[] {
  return cargar().filter((v) => v.estado !== 'Entregado');
}

// Obtener historial (entregados)
export function obtenerHistorial(): Vehiculo[] {
  return cargar().filter((v) => v.estado === 'Entregado');
}

// Obtener historial por placa
export function obtenerHistorialPorPlaca(placa: string): Vehiculo[] {
  const placaNormalizada = placa.toUpperCase();
  return cargar()
    .filter((v) => v.placa === placaNormalizada && v.estado === 'Entregado')
    .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
}

// Calcular lavados de una placa
export function contarLavadosPorPlaca(placa: string): number {
  return obtenerHistorialPorPlaca(placa).length;
}

// ===== EXPORTAR DATOS =====
export function exportarACSV(dias: number = 1): string {
  const ahora = new Date();
  const hace = new Date(ahora.getTime() - dias * 24 * 60 * 60 * 1000);

  const todos = cargar();
  const filtrados = todos.filter((v) => new Date(v.creadoEn) >= hace);

  // Headers
  const headers = [
    'Fecha',
    'Hora',
    'Placa',
    'Cliente',
    'Teléfono',
    'Servicio',
    'Precio',
    'Estado',
    'Trabajador',
    'Tiempo Ingreso',
  ];

  // Rows
  const rows = filtrados.map((v) => [
    new Date(v.creadoEn).toLocaleDateString('es-CO'),
    new Date(v.creadoEn).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    v.placa,
    v.clienteNombre,
    v.clienteTelefono || '-',
    v.servicio,
    v.precioPactado.toLocaleString('es-CO'),
    v.estado,
    v.trabajadorAsignado ? 'Asignado' : 'Sin asignar',
    v.creadoEn,
  ]);

  // Combinar headers y rows
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === 'string' && cell.includes(',')
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        )
        .join(',')
    ),
  ].join('\n');

  return csv;
}

export function descargarCSV(dias: number = 1): void {
  const csv = exportarACSV(dias);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const ahora = new Date();
  const fecha = ahora.toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `lavaautos_${fecha}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Obtener descuento por fidelización
export function calcularDescuentoPorFidelizacion(placa: string): {
  tieneDescuento: boolean;
  lavadosActuales: number;
  lavadosPorDescuento: number;
  descuentoPorcentaje: number;
  proximoDescuentoEn: number;
} {
  const config = obtenerConfig();
  if (!config.fidelizacion.activada) {
    return {
      tieneDescuento: false,
      lavadosActuales: 0,
      lavadosPorDescuento: config.fidelizacion.lavadosPorDescuento,
      descuentoPorcentaje: config.fidelizacion.descuentoPorcentaje,
      proximoDescuentoEn: config.fidelizacion.lavadosPorDescuento,
    };
  }

  const lavados = contarLavadosPorPlaca(placa);
  const lavadosPorDescuento = config.fidelizacion.lavadosPorDescuento;
  const descuentosPorUso = Math.floor(lavados / lavadosPorDescuento);
  const lavadosHastaProximoDescuento = lavadosPorDescuento - (lavados % lavadosPorDescuento);

  return {
    tieneDescuento: descuentosPorUso > 0,
    lavadosActuales: lavados,
    lavadosPorDescuento: lavadosPorDescuento,
    descuentoPorcentaje: config.fidelizacion.descuentoPorcentaje,
    proximoDescuentoEn: lavadosHastaProximoDescuento,
  };
}

// Crear nuevo vehículo
export function crearVehiculo(datos: {
  placa: string;
  clienteNombre: string;
  clienteTelefono: string;
  servicio: TipoServicio;
  precioPactado: number;
  notas: string;
  fotosEntrada: string[];
  trabajadorAsignado?: string;
}): Vehiculo {
  const ahora = new Date().toISOString();
  const nuevo: Vehiculo = {
    id: Math.random().toString(36).substring(2, 9),
    placa: datos.placa.toUpperCase(),
    clienteNombre: datos.clienteNombre,
    clienteTelefono: datos.clienteTelefono,
    servicio: datos.servicio,
    precioPactado: datos.precioPactado,
    estado: 'Recibido',
    notas: datos.notas,
    notasPorEstado: {},
    tokenSeguimiento: generarToken(),
    fotosEntrada: datos.fotosEntrada,
    fotosSalida: [],
    creadoEn: ahora,
    actualizadoEn: ahora,
    entregadoEn: undefined,
    historicoEstados: [
      {
        estado: 'Recibido',
        fecha: ahora,
      },
    ],
    trabajadorAsignado: datos.trabajadorAsignado,
    trabajadoresParticipantes: datos.trabajadorAsignado ? [datos.trabajadorAsignado] : [],
  };

  const todos = cargar();
  todos.push(nuevo);
  guardar(todos);
  return nuevo;
}

// Obtener vehículo por ID
export function obtenerPorId(id: string): Vehiculo | undefined {
  return cargar().find((v) => v.id === id);
}

// Obtener vehículo por token (para el cliente)
export function obtenerPorToken(token: string): Vehiculo | undefined {
  return cargar().find((v) => v.tokenSeguimiento === token);
}

// Actualizar estado
export function actualizarEstado(id: string, nuevoEstado: EstadoVehiculo): Vehiculo | null {
  const todos = cargar();
  const vehiculo = todos.find((v) => v.id === id);

  if (!vehiculo) return null;

  const ahora = new Date().toISOString();
  vehiculo.estado = nuevoEstado;
  vehiculo.actualizadoEn = ahora;
  vehiculo.historicoEstados.push({
    estado: nuevoEstado,
    fecha: ahora,
  });

  if (nuevoEstado === 'Entregado') {
    vehiculo.entregadoEn = ahora;
  }

  guardar(todos);
  return vehiculo;
}

// Agregar fotos de salida
export function agregarFotoSalida(id: string, fotosBase64: string[]): Vehiculo | null {
  const todos = cargar();
  const vehiculo = todos.find((v) => v.id === id);

  if (!vehiculo) return null;

  vehiculo.fotosSalida.push(...fotosBase64);
  vehiculo.actualizadoEn = new Date().toISOString();
  guardar(todos);
  return vehiculo;
}

export function eliminarFotoSalida(id: string, indice: number): Vehiculo | null {
  const todos = cargar();
  const vehiculo = todos.find((v) => v.id === id);

  if (!vehiculo) return null;

  vehiculo.fotosSalida = vehiculo.fotosSalida.filter((_, i) => i !== indice);
  vehiculo.actualizadoEn = new Date().toISOString();
  guardar(todos);
  return vehiculo;
}

// Calcular próximo estado
export function obtenerProximoEstado(estadoActual: EstadoVehiculo): EstadoVehiculo | null {
  const indice = ESTADOS_PIPELINE.indexOf(estadoActual);
  if (indice === -1 || indice === ESTADOS_PIPELINE.length - 1) {
    return null;
  }
  return ESTADOS_PIPELINE[indice + 1];
}

// Retroceder a estado anterior
export function retrocederEstado(id: string): Vehiculo | null {
  const todos = cargar();
  const vehiculo = todos.find((v) => v.id === id);

  if (!vehiculo) return null;

  const indice = ESTADOS_PIPELINE.indexOf(vehiculo.estado);
  if (indice <= 0) {
    // No se puede retroceder más
    return null;
  }

  const estadoAnterior = ESTADOS_PIPELINE[indice - 1];
  const ahora = new Date().toISOString();

  vehiculo.estado = estadoAnterior;
  vehiculo.actualizadoEn = ahora;
  vehiculo.historicoEstados.push({
    estado: estadoAnterior,
    fecha: ahora,
  });

  guardar(todos);
  return vehiculo;
}

// Obtener precio automático según servicio
export function obtenerPrecioServicio(servicio: TipoServicio): number {
  return SERVICIOS_CATALOGO[servicio];
}

// ===== NOTAS Y TRABAJADORES =====
export function agregarNotaPorEstado(id: string, nota: string): Vehiculo | null {
  const todos = cargar();
  const vehiculo = todos.find((v) => v.id === id);

  if (!vehiculo) return null;

  vehiculo.notasPorEstado[vehiculo.estado] = nota;
  vehiculo.actualizadoEn = new Date().toISOString();
  guardar(todos);
  return vehiculo;
}

export function asignarTrabajador(id: string, trabajadorId: string, trabajadorNombre: string): Vehiculo | null {
  const todos = cargar();
  const vehiculo = todos.find((v) => v.id === id);

  if (!vehiculo) return null;

  vehiculo.trabajadorAsignado = trabajadorId;
  if (!vehiculo.trabajadoresParticipantes.includes(trabajadorId)) {
    vehiculo.trabajadoresParticipantes.push(trabajadorId);
  }
  vehiculo.actualizadoEn = new Date().toISOString();
  guardar(todos);
  return vehiculo;
}

export function transferirVehiculo(id: string, nuevoTrabajadorId: string): Vehiculo | null {
  const todos = cargar();
  const vehiculo = todos.find((v) => v.id === id);

  if (!vehiculo) return null;

  vehiculo.trabajadorAsignado = nuevoTrabajadorId;
  if (!vehiculo.trabajadoresParticipantes.includes(nuevoTrabajadorId)) {
    vehiculo.trabajadoresParticipantes.push(nuevoTrabajadorId);
  }
  vehiculo.actualizadoEn = new Date().toISOString();
  guardar(todos);
  return vehiculo;
}

// ===== CONFIGURACIÓN =====
export function obtenerConfig(): ConfiguracionLavaauto {
  if (typeof window !== 'undefined') {
    const datos = localStorage.getItem('lavaauto_config');
    return datos ? JSON.parse(datos) : CONFIG_DEFAULT;
  }
  return CONFIG_DEFAULT;
}

export function guardarConfig(config: ConfiguracionLavaauto): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lavaauto_config', JSON.stringify(config));
  }
}

// ===== AUTENTICACIÓN =====
export function verificarContrasena(contrasena: string): boolean {
  const config = obtenerConfig();
  return contrasena === config.contrasena;
}

export function verificarContrasenaDueño(contrasena: string): boolean {
  const config = obtenerConfig();
  return contrasena === config.contrasenaDueño;
}

// ===== TRABAJADORES =====
export function obtenerTrabajadores(): Trabajador[] {
  if (typeof window !== 'undefined') {
    const datos = localStorage.getItem('lavaauto_trabajadores');
    if (!datos) {
      // Crear trabajadores por defecto
      const defecto: Trabajador[] = [
        { id: '1', nombre: 'Trabajador 1' },
        { id: '2', nombre: 'Trabajador 2' },
        { id: '3', nombre: 'Trabajador 3' },
      ];
      localStorage.setItem('lavaauto_trabajadores', JSON.stringify(defecto));
      return defecto;
    }
    return JSON.parse(datos);
  }
  return [];
}

export function agregarTrabajador(nombre: string): Trabajador {
  const trabajadores = obtenerTrabajadores();
  const nuevo: Trabajador = {
    id: Date.now().toString(),
    nombre,
  };
  trabajadores.push(nuevo);
  if (typeof window !== 'undefined') {
    localStorage.setItem('lavaauto_trabajadores', JSON.stringify(trabajadores));
  }
  return nuevo;
}

// ===== ESTADÍSTICAS =====
export function obtenerEstadisticas(dias: number = 1): {
  totalHoy: number;
  montoTotal: number;
  vehiculosActivos: number;
  vehiculosEntregados: number;
  servicioMasVendido: TipoServicio | null;
} {
  const ahora = new Date();
  const hace = new Date(ahora.getTime() - dias * 24 * 60 * 60 * 1000);

  const todos = cargar();
  const filtrados = todos.filter((v) => new Date(v.creadoEn) >= hace);

  const activos = filtrados.filter((v) => v.estado !== 'Entregado');
  const entregados = filtrados.filter((v) => v.estado === 'Entregado');

  const montoTotal = filtrados.reduce((sum, v) => sum + v.precioPactado, 0);

  const servicios = filtrados.reduce(
    (acc, v) => {
      acc[v.servicio] = (acc[v.servicio] || 0) + 1;
      return acc;
    },
    {} as Record<TipoServicio, number>
  );

  const servicioMasVendido = Object.entries(servicios).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    totalHoy: filtrados.length,
    montoTotal,
    vehiculosActivos: activos.length,
    vehiculosEntregados: entregados.length,
    servicioMasVendido: servicioMasVendido as TipoServicio | null,
  };
}
