import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Motorizado } from '../types';

interface MotorIconProps {
  motorizado: Motorizado;
  map: L.Map | null;
}

// Crear icono personalizado que NO desaparece al hacer zoom
function createMotorDivIcon(motorizado: Motorizado): L.DivIcon {
  return L.divIcon({
    className: 'motor-icon-container',
    html: `
      <div class="motor-marker" style="border-color: ${motorizado.color};">
        <div class="motor-avatar" style="background-color: ${motorizado.color}20; border-color: ${motorizado.color};">
          <span class="motor-emoji">🏍️</span>
        </div>
        <div class="motor-label" style="background-color: ${motorizado.color};">
          <span class="motor-name">${motorizado.nombre}</span>
          <span class="motor-placa">${motorizado.placa}</span>
        </div>
        <div class="motor-speed">${Math.round(motorizado.velocidad)} km/h</div>
        <div class="motor-pulse" style="background-color: ${motorizado.color};"></div>
      </div>
    `,
    iconSize: [60, 80],
    iconAnchor: [30, 40],
    popupAnchor: [0, -40]
  });
}

export function MotorIcon({ motorizado, map }: MotorIconProps) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Crear marker si no existe
    if (!markerRef.current) {
      const icon = createMotorDivIcon(motorizado);
      markerRef.current = L.marker([motorizado.lat, motorizado.lng], { icon })
        .addTo(map);

      // Popup con información detallada (identikit)
      markerRef.current.bindPopup(`
        <div class="motor-popup">
          <div class="popup-header" style="background-color: ${motorizado.color};">
            <span class="popup-emoji">🏍️</span>
            <div>
              <h3>${motorizado.nombre} ${motorizado.apellido}</h3>
              <span class="popup-placa">${motorizado.placa}</span>
            </div>
          </div>
          <div class="popup-body">
            <div class="popup-row">
              <span class="popup-label">📱 Teléfono:</span>
              <span class="popup-value">${motorizado.telefono}</span>
            </div>
            <div class="popup-row">
              <span class="popup-label">⚡ Velocidad:</span>
              <span class="popup-value">${Math.round(motorizado.velocidad)} km/h</span>
            </div>
            <div class="popup-row">
              <span class="popup-label">📍 Coordenadas:</span>
              <span class="popup-value">${motorizado.lat.toFixed(5)}, ${motorizado.lng.toFixed(5)}</span>
            </div>
            <div class="popup-row">
              <span class="popup-label">🕐 Última actualización:</span>
              <span class="popup-value">${new Date(motorizado.ultimaActualizacion).toLocaleTimeString()}</span>
            </div>
            <div class="popup-status ${motorizado.conectado ? 'connected' : 'disconnected'}">
              ${motorizado.conectado ? '🟢 EN LÍNEA' : '🔴 DESCONECTADO'}
            </div>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'motor-popup-container'
      });
    } else {
      // Actualizar posición y icono
      markerRef.current.setLatLng([motorizado.lat, motorizado.lng]);
      markerRef.current.setIcon(createMotorDivIcon(motorizado));
    }

    return () => {
      // Cleanup solo cuando el componente se desmonta
    };
  }, [motorizado, map]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (markerRef.current && map) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [map]);

  return null;
}

// Componente que maneja TODOS los markers eficientemente
export function MotorMarkers({ motorizados, map }: { motorizados: Motorizado[]; map: L.Map | null }) {
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!map) return;

    const currentIds = new Set(motorizados.map(m => m.id));

    // Remover markers que ya no están conectados o no existen
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    // Actualizar o crear markers
    motorizados.forEach(moto => {
      if (!moto.conectado) {
        // Remover si estaba y se desconectó
        if (markersRef.current.has(moto.id)) {
          map.removeLayer(markersRef.current.get(moto.id)!);
          markersRef.current.delete(moto.id);
        }
        return;
      }

      const existingMarker = markersRef.current.get(moto.id);

      if (existingMarker) {
        // Actualizar posición
        existingMarker.setLatLng([moto.lat, moto.lng]);
        existingMarker.setIcon(createMotorDivIcon(moto));
      } else {
        // Crear nuevo marker
        const icon = createMotorDivIcon(moto);
        const marker = L.marker([moto.lat, moto.lng], { icon })
          .addTo(map);

        marker.bindPopup(`
          <div class="motor-popup">
            <div class="popup-header" style="background-color: ${moto.color};">
              <span class="popup-emoji">🏍️</span>
              <div>
                <h3>${moto.nombre} ${moto.apellido}</h3>
                <span class="popup-placa">${moto.placa}</span>
              </div>
            </div>
            <div class="popup-body">
              <div class="popup-row">
                <span class="popup-label">📱 Teléfono:</span>
                <span class="popup-value">${moto.telefono}</span>
              </div>
              <div class="popup-row">
                <span class="popup-label">⚡ Velocidad:</span>
                <span class="popup-value">${Math.round(moto.velocidad)} km/h</span>
              </div>
              <div class="popup-row">
                <span class="popup-label">📍 Coordenadas:</span>
                <span class="popup-value">${moto.lat.toFixed(5)}, ${moto.lng.toFixed(5)}</span>
              </div>
              <div class="popup-row">
                <span class="popup-label">🕐 Última actualización:</span>
                <span class="popup-value">${new Date(moto.ultimaActualizacion).toLocaleTimeString()}</span>
              </div>
              <div class="popup-status connected">
                🟢 EN LÍNEA
              </div>
            </div>
          </div>
        `, {
          maxWidth: 300,
          className: 'motor-popup-container'
        });

        markersRef.current.set(moto.id, marker);
      }
    });
  }, [motorizados, map]);

  // Cleanup
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => {
        if (map) map.removeLayer(marker);
      });
      markersRef.current.clear();
    };
  }, [map]);

  return null;
}
