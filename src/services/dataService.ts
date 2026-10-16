import { Motorizado, LocationUpdate } from '../types';

// ============================================================
// MODO DEMO - Simula Firebase Realtime Database
// Cuando tengas las credenciales de Firebase, reemplaza este
// archivo con la conexión real a Firebase.
// ============================================================

// Datos demo de motorizados (simulados alrededor de una ciudad)
const CIUDAD_CENTRO = { lat: 4.711, lng: -74.0721 }; // Bogotá como ejemplo

const NOMBRES = [
  'Carlos', 'Miguel', 'Andrés', 'Luis', 'Jorge',
  'Pedro', 'Juan', 'Diego', 'Roberto', 'Fernando',
  'Alejandro', 'Ricardo', 'Daniel', 'Oscar', 'Raúl',
  'Manuel', 'Antonio', 'Francisco', 'Eduardo', 'Héctor',
  'Pablo', 'Sergio', 'Mario', 'Víctor', 'Ramón',
  'Gabriel', 'Tomás', 'Martín', 'Adrián', 'Iván',
  'Felipe', 'Gustavo', 'Hugo', 'Rubén', 'Alfredo',
  'Enrique', 'Arturo', 'Rodrigo', 'Emilio', 'Rafael'
];

const APELLIDOS = [
  'García', 'Rodríguez', 'Martínez', 'López', 'González',
  'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres',
  'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes',
  'Morales', 'Ortiz', 'Gutiérrez', 'Chávez', 'Ramos'
];

const COLORES = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F1948A', '#82E0AA', '#F8C471', '#AED6F1', '#D7BDE2',
  '#A3E4D7', '#FAD7A0', '#A9CCE3', '#D5DBDB', '#F9E79F'
];

const PLACAS_PREFIX = ['MOT', 'MTO', 'MTD'];

function generarMotorizadosDemo(): Motorizado[] {
  const motorizados: Motorizado[] = [];

  for (let i = 0; i < 40; i++) {
    const nombre = NOMBRES[i % NOMBRES.length];
    const apellido = APELLIDOS[i % APELLIDOS.length];
    const color = COLORES[i % COLORES.length];
    const prefix = PLACAS_PREFIX[i % PLACAS_PREFIX.length];

    // Distribuir alrededor del centro de la ciudad
    const angle = (i / 40) * Math.PI * 2;
    const radius = 0.005 + Math.random() * 0.015; // Entre 500m y 2km del centro

    motorizados.push({
      id: `moto_${i + 1}`,
      nombre: nombre,
      apellido: apellido,
      identikit: `🏍️`,
      placa: `${prefix}-${String(100 + i).padStart(3, '0')}`,
      telefono: `+57 3${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      lat: CIUDAD_CENTRO.lat + Math.cos(angle) * radius + (Math.random() - 0.5) * 0.003,
      lng: CIUDAD_CENTRO.lng + Math.sin(angle) * radius + (Math.random() - 0.5) * 0.003,
      velocidad: Math.floor(Math.random() * 60),
      conectado: Math.random() > 0.15, // 85% conectados
      ultimaActualizacion: Date.now(),
      color: color
    });
  }

  return motorizados;
}

// Listener simulado
type Listener = (motorizados: Motorizado[]) => void;
let listeners: Listener[] = [];
let motorizadosData: Motorizado[] = generarMotorizadosDemo();

// Simular movimiento cada 2 segundos
function simularMovimiento() {
  motorizadosData = motorizadosData.map(moto => {
    if (!moto.conectado) return moto;

    // Simular movimiento realista
    const speedFactor = moto.velocidad / 100000; // Convertir a grados
    const direction = Math.random() * Math.PI * 2;

    return {
      ...moto,
      lat: moto.lat + Math.cos(direction) * speedFactor * (0.5 + Math.random()),
      lng: moto.lng + Math.sin(direction) * speedFactor * (0.5 + Math.random()),
      velocidad: Math.max(0, Math.min(80, moto.velocidad + (Math.random() - 0.5) * 10)),
      ultimaActualizacion: Date.now()
    };
  });

  // Notificar a todos los listeners
  listeners.forEach(listener => listener([...motorizadosData]));
}

// Iniciar simulación
let simulationInterval: ReturnType<typeof setInterval> | null = null;

export function startSimulation() {
  if (simulationInterval) return;
  simulationInterval = setInterval(simularMovimiento, 2000); // Cada 2 segundos
}

export function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

export function getMotorizados(): Motorizado[] {
  return [...motorizadosData];
}

export function subscribeToMotorizados(listener: Listener): () => void {
  listeners.push(listener);
  // Enviar datos iniciales
  listener([...motorizadosData]);

  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function toggleConnection(motoId: string, conectado: boolean) {
  motorizadosData = motorizadosData.map(m =>
    m.id === motoId ? { ...m, conectado, ultimaActualizacion: Date.now() } : m
  );
  listeners.forEach(listener => listener([...motorizadosData]));
}

export function updateLocation(motoId: string, update: LocationUpdate) {
  motorizadosData = motorizadosData.map(m =>
    m.id === motoId ? {
      ...m,
      lat: update.lat,
      lng: update.lng,
      velocidad: update.velocidad,
      ultimaActualizacion: update.timestamp
    } : m
  );
  listeners.forEach(listener => listener([...motorizadosData]));
}

export function getCentroCiudad() {
  return CIUDAD_CENTRO;
}

// Credenciales demo
export const DEMO_CREDENTIALS = {
  admins: [
    { id: 'admin_1', nombre: 'Haru (Admin 1)', email: 'haru@mototrack.com', password: 'admin123' },
    { id: 'admin_2', nombre: 'Admin 2', email: 'admin2@mototrack.com', password: 'admin123' },
    { id: 'admin_3', nombre: 'Admin 3', email: 'admin3@mototrack.com', password: 'admin123' },
  ],
  motorizados: Array.from({ length: 40 }, (_, i) => ({
    id: `moto_${i + 1}`,
    nombre: `${NOMBRES[i % NOMBRES.length]} ${APELLIDOS[i % APELLIDOS.length]}`,
    password: `moto${String(i + 1).padStart(3, '0')}`
  }))
}
