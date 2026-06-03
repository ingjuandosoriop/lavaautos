// Tipos principales de la app

export type EstadoVehiculo =
  | 'Recibido'
  | 'Lavando'
  | 'Enjuagando'
  | 'Secando'
  | 'Listo'
  | 'Entregado';

export type TipoServicio = 'Lavado Sencillo' | 'Lavado Premium' | 'Encerado' | 'Lavado de Motor';

export interface Vehiculo {
  id: string;
  placa: string;
  clienteNombre: string;
  clienteTelefono: string;
  servicio: TipoServicio;
  precioPactado: number;
  estado: EstadoVehiculo;
  notas: string;
  notasPorEstado: Record<string, string>; // Notas agregadas en cada cambio de estado
  tokenSeguimiento: string;
  fotosEntrada: string[]; // URLs base64 o rutas
  fotosSalida: string[];
  creadoEn: string; // ISO date
  actualizadoEn: string;
  entregadoEn?: string;
  historicoEstados: HistorialEstado[];
  trabajadorAsignado?: string; // Quién lo lavó/atiende
  trabajadoresParticipantes: string[]; // Todos los que lo tocaron
  clasificacionCliente?: number; // 1-5 estrellas
  esclavo?: boolean; // Enlazado a otro vehículo (mismo cliente, mismo día)
}

export interface HistorialEstado {
  estado: EstadoVehiculo;
  fecha: string; // ISO date
}

export const SERVICIOS_CATALOGO: Record<TipoServicio, number> = {
  'Lavado Sencillo': 25000,
  'Lavado Premium': 45000,
  'Encerado': 35000,
  'Lavado de Motor': 50000,
};

export const ESTADOS_PIPELINE: EstadoVehiculo[] = [
  'Recibido',
  'Lavando',
  'Enjuagando',
  'Secando',
  'Listo',
  'Entregado',
];

export interface Trabajador {
  id: string;
  nombre: string;
}

export interface ConfiguracionLavaauto {
  contrasena: string; // Trabajador
  contrasenaDueño: string; // Dueño/Gerente
  tiempoEstimado: Record<TipoServicio, number>; // en minutos
  fidelizacion: {
    activada: boolean;
    lavadosPorDescuento: number; // ej: 5
    descuentoPorcentaje: number; // ej: 30
  };
}

export const CONFIG_DEFAULT: ConfiguracionLavaauto = {
  contrasena: '1234', // Trabajador
  contrasenaDueño: '5678', // Dueño
  tiempoEstimado: {
    'Lavado Sencillo': 20,
    'Lavado Premium': 40,
    'Encerado': 25,
    'Lavado de Motor': 30,
  },
  fidelizacion: {
    activada: true,
    lavadosPorDescuento: 5,
    descuentoPorcentaje: 30,
  },
};
