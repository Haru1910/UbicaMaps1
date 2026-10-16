import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { toggleConnection, updateLocation } from '../services/dataService';

interface MotorizadoViewProps {
  motoId: string;
  motoName: string;
  onLogout: () => void;
}

export function MotorizadoView({ motoId, motoName, onLogout }: MotorizadoViewProps) {
  const [conectado, setConectado] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  const { lat, lng, velocidad, precision, error, loading } = useGeolocation({
    updateInterval: 2000,
    enabled: conectado
  });

  // Enviar ubicación cada 2 segundos
  useEffect(() => {
    if (!conectado || lat === null || lng === null) return;

    const interval = setInterval(() => {
      updateLocation(motoId, {
        lat,
        lng,
        velocidad,
        timestamp: Date.now()
      });
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [conectado, lat, lng, velocidad, motoId]);

  // Toggle conexión
  const handleToggleConnection = useCallback(() => {
    const newState = !conectado;
    setConectado(newState);
    toggleConnection(motoId, newState);
  }, [conectado, motoId]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-xl">
              🏍️
            </div>
            <div>
              <h1 className="text-white font-bold">MotoTrack</h1>
              <p className="text-gray-400 text-xs">{motoName}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            <i className="fas fa-sign-out-alt mr-1"></i>
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full space-y-8">

          {/* Status Card */}
          <div className={`rounded-3xl p-8 text-center border-2 transition-all duration-500 ${
            conectado
              ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
              : 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20'
          }`}>
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl mb-4 ${
              conectado ? 'bg-green-500/20 animate-pulse' : 'bg-red-500/20'
            }`}>
              {conectado ? '🟢' : '🔴'}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${conectado ? 'text-green-400' : 'text-red-400'}`}>
              {conectado ? 'CONECTADO' : 'DESCONECTADO'}
            </h2>
            <p className="text-gray-400 text-sm">
              {conectado
                ? 'Tu ubicación se está enviando cada 2 segundos'
                : 'No se está enviando tu ubicación'}
            </p>
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleToggleConnection}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform active:scale-95 ${
              conectado
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
            }`}
          >
            {conectado ? (
              <span>
                <i className="fas fa-power-off mr-2"></i>
                DESCONECTAR
              </span>
            ) : (
              <span>
                <i className="fas fa-power-off mr-2"></i>
                CONECTAR
              </span>
            )}
          </button>

          {/* Info Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-info-circle text-indigo-400"></i>
              Estado de conexión
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Ubicación GPS:</span>
                <span className={`text-sm font-medium ${lat ? 'text-green-400' : 'text-yellow-400'}`}>
                  {loading ? 'Obteniendo...' : lat ? 'Activa ✓' : 'No disponible'}
                </span>
              </div>

              {lat && lng && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Coordenadas:</span>
                    <span className="text-white text-sm font-mono">
                      {lat.toFixed(5)}, {lng.toFixed(5)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Velocidad:</span>
                    <span className="text-white text-sm font-medium">
                      {velocidad} km/h
                    </span>
                  </div>
                </>
              )}

              {precision && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Precisión:</span>
                  <span className={`text-sm ${precision < 20 ? 'text-green-400' : precision < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    ±{Math.round(precision)}m
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Última actualización:</span>
                <span className="text-white text-sm">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Datos enviados:</span>
                <span className="text-indigo-400 text-sm font-mono">
                  {updateCount} paquetes
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Frecuencia:</span>
                <span className="text-white text-sm">
                  Cada 2 segundos
                </span>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Asegúrate de haber otorgado permisos de ubicación a la aplicación.
              </p>
            </div>
          )}

          {/* Nota */}
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
            <p className="text-indigo-300 text-sm flex items-start gap-2">
              <i className="fas fa-shield-alt mt-0.5"></i>
              <span>
                Tu ubicación solo es visible para los administradores.
                Cuando termines tu jornada, presiona DESCONECTAR.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 px-4 py-3">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-500 text-xs">
            MotoTrack v1.0 • Actualización cada 2s • {conectado ? '🟢 En línea' : '🔴 Offline'}
          </p>
        </div>
      </footer>
    </div>
  );
}
