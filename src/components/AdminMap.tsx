import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Motorizado } from '../types';
import { MotorMarkers } from './MotorIcon';
import { subscribeToMotorizados, getCentroCiudad, startSimulation, stopSimulation } from '../services/dataService';

interface AdminMapProps {
  adminName: string;
  onLogout: () => void;
}

export function AdminMap({ adminName, onLogout }: AdminMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [motorizados, setMotorizados] = useState<Motorizado[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [filter, setFilter] = useState<'all' | 'connected' | 'disconnected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const centro = getCentroCiudad();

    const map = L.map(mapRef.current, {
      center: [centro.lat, centro.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: true
    });

    // Tile layer de OpenStreetMap (GRATIS, sin API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Iniciar simulación de datos
    startSimulation();

    return () => {
      stopSimulation();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Suscribirse a actualizaciones en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToMotorizados((data) => {
      setMotorizados(data);
    });
    return unsubscribe;
  }, []);

  // Filtrar motorizados
  const filteredMotorizados = motorizados.filter(moto => {
    const matchesFilter = filter === 'all' ||
      (filter === 'connected' && moto.conectado) ||
      (filter === 'disconnected' && !moto.conectado);

    const matchesSearch = searchTerm === '' ||
      moto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.placa.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const connectedCount = motorizados.filter(m => m.conectado).length;
  const disconnectedCount = motorizados.filter(m => !m.conectado).length;

  // Centrar en un motorizado
  const focusOnMotor = (moto: Motorizado) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([moto.lat, moto.lng], 17, { animate: true });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <i className="fas fa-bars text-white"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">MotoTrack</h1>
              <p className="text-gray-400 text-xs">Panel de Administrador</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-400 font-semibold">{connectedCount}</span>
            <span className="text-gray-400 text-sm">en línea</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-400 rounded-full"></span>
            <span className="text-red-400 font-semibold">{disconnectedCount}</span>
            <span className="text-gray-400 text-sm">offline</span>
          </div>
          <div className="text-gray-400 text-sm">
            <i className="fas fa-clock mr-1"></i>
            Actualización: 2s
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{adminName}</p>
            <p className="text-gray-400 text-xs">Administrador</p>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
          >
            <i className="fas fa-sign-out-alt mr-1"></i>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 absolute lg:relative z-40 w-80 h-full bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="Buscar por nombre o placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                Todos ({motorizados.length})
              </button>
              <button
                onClick={() => setFilter('connected')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'connected' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                En línea ({connectedCount})
              </button>
              <button
                onClick={() => setFilter('disconnected')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'disconnected' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                Offline ({disconnectedCount})
              </button>
            </div>
          </div>

          {/* Lista de motorizados */}
          <div className="flex-1 overflow-y-auto">
            {filteredMotorizados.map(moto => (
              <div
                key={moto.id}
                onClick={() => focusOnMotor(moto)}
                className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                  !moto.conectado ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${moto.color}20`, border: `2px solid ${moto.color}` }}
                  >
                    🏍️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {moto.nombre} {moto.apellido}
                    </p>
                    <p className="text-gray-400 text-xs">{moto.placa}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-mono" style={{ color: moto.color }}>
                      {Math.round(moto.velocidad)} km/h
                    </p>
                    <span className={`inline-block w-2 h-2 rounded-full ${moto.conectado ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Mapa */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full"></div>

          {/* Overlay de información del mapa */}
          <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-xl p-3 border border-gray-700 z-[1000]">
            <p className="text-white text-sm font-medium">
              🏍️ {filteredMotorizados.filter(m => m.conectado).length} motorizados visibles
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Los iconos permanecen visibles sin importar el zoom
            </p>
          </div>

          {/* Controles de zoom personalizados */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-plus"></i>
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-minus"></i>
            </button>
            <button
              onClick={() => {
                const centro = getCentroCiudad();
                mapInstanceRef.current?.setView([centro.lat, centro.lng], 14);
              }}
              className="w-10 h-10 bg-indigo-600 border border-indigo-500 rounded-lg text-white hover:bg-indigo-500 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-crosshairs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Renderizar markers */}
      {mapReady && mapInstanceRef.current && (
        <MotorMarkers motorizados={filteredMotorizados} map={mapInstanceRef.current} />
      )}
    </div>
  );
}
