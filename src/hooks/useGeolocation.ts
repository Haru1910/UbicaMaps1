import { useState, useEffect, useRef, useCallback } from 'react';

interface UseGeolocationOptions {
  updateInterval?: number; // en milisegundos
  enabled?: boolean;
}

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  velocidad: number;
  precision: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { updateInterval = 2000, enabled = true } = options;

  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    velocidad: 0,
    precision: null,
    error: null,
    loading: true
  });

  const lastPosition = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const watchId = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentPosition = useRef<{ lat: number; lng: number } | null>(null);

  const calculateSpeed = useCallback((lat: number, lng: number): number => {
    if (!lastPosition.current) {
      lastPosition.current = { lat, lng, time: Date.now() };
      return 0;
    }

    const now = Date.now();
    const timeDiff = (now - lastPosition.current.time) / 1000; // segundos

    if (timeDiff < 0.5) return lastPosition.current ? 0 : 0;

    // Calcular distancia usando fórmula de Haversine
    const R = 6371000; // Radio de la tierra en metros
    const dLat = (lat - lastPosition.current.lat) * Math.PI / 180;
    const dLng = (lng - lastPosition.current.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lastPosition.current.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // en metros

    const speedMs = distance / timeDiff; // m/s
    const speedKmh = speedMs * 3.6; // km/h

    lastPosition.current = { lat, lng, time: now };
    return Math.round(speedKmh);
  }, []);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: !navigator.geolocation ? 'Geolocalización no soportada' : 'Deshabilitado'
      }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      currentPosition.current = { lat: latitude, lng: longitude };
      const velocidad = calculateSpeed(latitude, longitude);

      setState({
        lat: latitude,
        lng: longitude,
        velocidad,
        precision: accuracy,
        error: null,
        loading: false
      });
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMsg = 'Error desconocido';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = 'Permiso de ubicación denegado';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = 'Ubicación no disponible';
          break;
        case error.TIMEOUT:
          errorMsg = 'Tiempo de espera agotado';
          break;
      }
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
    };

    // Watch position con alta precisión
    watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    });

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, calculateSpeed]);

  const getCurrentLocation = useCallback((): { lat: number; lng: number; velocidad: number; timestamp: number } | null => {
    if (!currentPosition.current) return null;
    return {
      lat: currentPosition.current.lat,
      lng: currentPosition.current.lng,
      velocidad: state.velocidad,
      timestamp: Date.now()
    };
  }, [state.velocidad]);

  return {
    ...state,
    getCurrentLocation
  };
}
