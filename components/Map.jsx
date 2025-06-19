'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = ({ stops, positions, height = 400 }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(stop => [stop.lat, stop.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stops]);

  const getStopIcon = (stopOrder) => {
    return L.divIcon({
      className: 'custom-stop-icon',
      html: `<div class="stop-marker">${stopOrder}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const getBusIcon = () => {
    return L.divIcon({
      className: 'custom-bus-icon',
      html: '<div class="bus-marker">🚌</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <MapContainer
        center={[33.5731, -7.5898]} // Default center (Casablanca)
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Draw route line */}
        {stops.length > 1 && (
          <Polyline
            positions={stops.map(stop => [stop.lat, stop.lng])}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
          />
        )}

        {/* Add stop markers */}
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={getStopIcon(stop.stopOrder)}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{stop.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Ordre: {stop.stopOrder}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Add bus position marker */}
        {positions.length > 0 && (
          <Marker
            position={[positions[positions.length - 1].lat, positions[positions.length - 1].lng]}
            icon={getBusIcon()}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">Position du bus</h3>
                <p className="text-sm text-muted-foreground">
                  Dernière mise à jour: {positions[positions.length - 1].timestamp}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <style jsx global>{`
        .stop-marker {
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .bus-marker {
          font-size: 24px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .leaflet-popup-content {
          margin: 8px 12px;
        }

        .leaflet-popup-content h3 {
          margin: 0;
          font-size: 14px;
        }

        .leaflet-popup-content p {
          margin: 4px 0 0;
        }
      `}</style>
    </div>
  );
};

export default Map; 