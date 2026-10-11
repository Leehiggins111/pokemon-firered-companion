// @ts-nocheck
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { earlyLocations as locations } from '../data/earlySlice';
import type { Location } from '../data/gameData';
import { useEffect } from 'react';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  currentLocation: string;
  onSelectLocation: (id: string) => void;
  wikiMode: boolean;
  progressLevel: number; // based on badges/story
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 8);
  }, [center, map]);
  return null;
}

export default function MapView({ currentLocation, onSelectLocation, wikiMode, progressLevel }: MapViewProps) {
  const visibleLocations = locations.filter(loc => wikiMode || loc.spoilerLevel <= progressLevel);
  const current = locations.find(l => l.id === currentLocation) || locations[0];
  const connections = visibleLocations.flatMap(loc =>
    loc.connections
      .map(connId => locations.find(l => l.id === connId))
      .filter((conn): conn is Location => !!conn && (wikiMode || conn.spoilerLevel <= progressLevel))
      .map(conn => [[loc.lat, loc.lng], [conn.lat, conn.lng]] as [number, number][])
  );

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={[current.lat, current.lng]} zoom={8} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={[current.lat, current.lng]} />
        {connections.map((line, i) => (
          <Polyline key={i} positions={line} color="#e3350d" weight={3} opacity={0.7} />
        ))}
        {visibleLocations.map(loc => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            eventHandlers={{ click: () => onSelectLocation(loc.id) }}
          >
            <Popup>
              <strong>{loc.name}</strong><br />
              {loc.region} • {loc.type}<br />
              {loc.description}<br />
              {loc.trainers.length > 0 && <span>Trainers: {loc.trainers.length}<br /></span>}
              {loc.encounters.length > 0 && <span>Wild: {loc.encounters.join(', ')}</span>}
              <br />
              <button onClick={() => onSelectLocation(loc.id)}>Set as Current</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#9aa0a6' }}>
        Zoomable interactive map with real connections. Locations filtered by Adventure Mode progress. Schematic coordinates for Kanto/Sevii layout.
      </p>
    </div>
  );
}
