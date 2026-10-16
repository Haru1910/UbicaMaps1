export interface Motorizado {
  id: string;
  nombre: string;
  apellido: string;
  identikit: string; // URL o emoji del avatar
  placa: string;
  telefono: string;
  lat: number;
  lng: number;
  velocidad: number;
  conectado: boolean;
  ultimaActualizacion: number;
  color: string;
}

export interface AdminUser {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin';
}

export interface UserCredentials {
  id: string;
  tipo: 'admin' | 'motorizado';
  nombre: string;
  password: string;
}

export interface LocationUpdate {
  lat: number;
  lng: number;
  velocidad: number;
  timestamp: number;
}

export type AppMode = 'admin' | 'motorizado' | 'login';
